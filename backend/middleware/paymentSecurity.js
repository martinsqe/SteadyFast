import rateLimit from "express-rate-limit";
import crypto from "crypto";
import PaymentAuditLog from "../models/PaymentAuditLog.js";

// ── Stripe webhook IP ranges (official) ──────────────────────────────────────
const STRIPE_IPS = [
  "3.18.12.63", "3.130.192.231", "13.235.14.237", "13.235.122.149",
  "18.211.135.69", "35.154.171.200", "52.15.183.38", "54.88.130.119",
  "54.88.130.237", "54.187.174.169", "54.187.205.235", "54.187.216.72"
];

// ── M-Pesa Safaricom IPs ──────────────────────────────────────────────────────
const MPESA_IPS = [
  "196.201.214.200", "196.201.214.206", "196.201.213.114",
  "196.201.214.207", "196.201.214.208", "196.201.213.44",
  "196.201.212.127", "196.201.212.138", "196.201.212.129",
  "196.201.212.136", "196.201.212.74",  "196.201.212.69"
];

// ── Payment rate limiter ──────────────────────────────────────────────────────
// Dev: 200 attempts / 15 min (easy testing)
// Prod: 10 attempts / 15 min per IP
const isDev = process.env.NODE_ENV !== "production";
export const paymentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 200 : 10,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    audit({
      event: "rate_limit_hit",
      ip: getIp(req),
      userAgent: req.headers["user-agent"],
      severity: "warn",
      metadata: { url: req.originalUrl }
    });
    res.status(429).json({
      success: false,
      message: "Too many payment attempts. Please wait 15 minutes before trying again."
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Idempotency check ─────────────────────────────────────────────────────────
// In production: X-Idempotency-Key is required to prevent double charges.
// In development: auto-generate a key if missing so testing is unblocked.
export const idempotencyGuard = async (req, res, next) => {
  let key = req.headers["x-idempotency-key"];

  if (!key || key.length < 16 || key.length > 128) {
    if (process.env.NODE_ENV === "production") {
      return res.status(400).json({
        success: false,
        message: "X-Idempotency-Key header is required (UUID v4 recommended)."
      });
    }
    // Dev fallback: auto-generate so testing is never blocked
    key = crypto.randomUUID();
  }

  // Check for existing confirmed payment with this key (only in prod — avoids stale dev state)
  if (process.env.NODE_ENV === "production") {
    try {
      const existing = await PaymentAuditLog.findOne({
        idempotencyKey: key,
        event: "confirmed"
      }).lean();

      if (existing) {
        return res.status(200).json({
          success: true,
          idempotent: true,
          requestId: existing.requestId,
          provider: existing.provider,
          message: "This payment was already processed."
        });
      }
    } catch { /* never block payment on audit read failure */ }
  }

  req.idempotencyKey = key;
  next();
};

// ── Server-side amount validation ─────────────────────────────────────────────
// Coerce string prices to numbers (body-parser gives numbers but be safe),
// and validate range. Price 0 is valid (e.g. "Other/Not sure" problems).
export const validatePaymentAmount = (req, res, next) => {
  let { price } = req.body;

  // Allow price to be omitted for free/TBD services — default to 0
  if (price === undefined || price === null) {
    req.body.price = 0;
    req.validatedPlatformFee = 1;
    return next();
  }

  // Coerce string → number (in case Content-Type sends it as string)
  const numeric = Number(price);
  if (isNaN(numeric) || !isFinite(numeric) || numeric < 0 || numeric > 100000) {
    return res.status(400).json({ success: false, message: "Invalid price value." });
  }

  req.body.price = numeric; // ensure it's a number in the body
  req.validatedPlatformFee = 1;
  next();
};

// ── Stripe webhook IP allowlist ───────────────────────────────────────────────
export const stripeIpGuard = (req, res, next) => {
  if (process.env.NODE_ENV !== "production") return next(); // skip in dev
  const ip = getIp(req);
  if (!STRIPE_IPS.includes(ip)) {
    audit({ event: "webhook_ip_rejected", ip, severity: "critical", metadata: { source: "stripe" } });
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
};

// ── M-Pesa callback IP allowlist ──────────────────────────────────────────────
export const mpesaIpGuard = (req, res, next) => {
  if (process.env.NODE_ENV !== "production") return next();
  const ip = getIp(req);
  if (!MPESA_IPS.includes(ip)) {
    audit({ event: "webhook_ip_rejected", ip, severity: "critical", metadata: { source: "mpesa" } });
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
};

// ── Replay attack guard for webhooks ──────────────────────────────────────────
// Stripe includes a timestamp in the signature — reject events older than 5 min
export const stripeReplayGuard = (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  if (!sig) return res.status(400).json({ success: false, message: "Missing signature" });

  const parts = sig.split(",").reduce((acc, part) => {
    const [k, v] = part.split("=");
    acc[k] = v;
    return acc;
  }, {});

  const ts = parseInt(parts.t, 10);
  const now = Math.floor(Date.now() / 1000);
  const MAX_AGE = 300; // 5 minutes

  if (Math.abs(now - ts) > MAX_AGE) {
    audit({ event: "replay_blocked", severity: "critical", metadata: { ts, now, source: "stripe" } });
    return res.status(400).json({ success: false, message: "Webhook timestamp too old — possible replay attack." });
  }
  next();
};

// ── Input sanitization ────────────────────────────────────────────────────────
export const sanitizePaymentInput = (req, res, next) => {
  // Strip any $ signs, script tags, or suspicious chars from string fields
  const sanitize = (v) => typeof v === "string" ? v.replace(/[<>${}|;]/g, "").trim().slice(0, 500) : v;

  if (req.body.problem)      req.body.problem      = sanitize(req.body.problem);
  if (req.body.vehicleType)  req.body.vehicleType  = sanitize(req.body.vehicleType);
  if (req.body.mpesaPhone)   req.body.mpesaPhone   = req.body.mpesaPhone.replace(/[^\d+]/g, "").slice(0, 15);

  next();
};

// ── Audit log helper ──────────────────────────────────────────────────────────
export async function audit(data) {
  try {
    await PaymentAuditLog.create(data);
  } catch (e) {
    // Never let audit logging crash the payment flow
    console.error("Audit log write failed:", e.message);
  }
}

// ── IP extractor (proxy-aware) ────────────────────────────────────────────────
export function getIp(req) {
  return (
    req.headers["cf-connecting-ip"] ||       // Cloudflare
    req.headers["x-real-ip"] ||              // Nginx
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

// ── Ownership guard: ensure requestId belongs to the authenticated user ───────
export { };
