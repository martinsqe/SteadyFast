import Stripe from "stripe";
import Razorpay from "razorpay";
import axios from "axios";
import crypto from "crypto";
import ServiceRequest from "../models/ServiceRequest.js";
import { dispatchToMechanics } from "../utils/dispatchMechanics.js";
import { audit, getIp } from "../middleware/paymentSecurity.js";

// ── Fee constants ─────────────────────────────────────────────────────────────
const PLATFORM_FEE_USD   = 1;          // $1 (for Stripe / cash display)
const PLATFORM_FEE_CENTS = 100;        // 100 cents  → Stripe uses smallest unit
const PLATFORM_FEE_INR   = 100;        // ₹100       → reasonable INR equivalent of $1
const PLATFORM_FEE_PAISE = 10000;      // 10 000 paise = ₹100 → Razorpay smallest unit

// ── Provider clients ──────────────────────────────────────────────────────────
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id:     process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

// Returns true only if the secret has been set to a real value (not a placeholder)
function isValidRazorpayWebhookSecret() {
  const s = process.env.RAZORPAY_WEBHOOK_SECRET;
  return s && !s.startsWith("YOUR_") && s.length > 10;
}

// ── M-Pesa helpers ────────────────────────────────────────────────────────────
async function getMpesaToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");
  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return res.data.access_token;
}

async function initiateSTKPush(phone, amount, requestId) {
  const token = await getMpesaToken();
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  const password = Buffer.from(
    `${process.env.MPESA_BUSINESS_SHORT_CODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString("base64");
  const normalized = phone.replace(/\D/g, "").replace(/^0/, "254").replace(/^\+/, "");
  const res = await axios.post(
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    {
      BusinessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE,
      Password:          password,
      Timestamp:         timestamp,
      TransactionType:   "CustomerPayBillOnline",
      Amount:            amount,
      PartyA:            normalized,
      PartyB:            process.env.MPESA_BUSINESS_SHORT_CODE,
      PhoneNumber:       normalized,
      CallBackURL:       `${process.env.MPESA_CALLBACK_URL}/api/payments/mpesa/callback`,
      AccountReference:  `SF-${requestId.toString().slice(-6)}`,
      TransactionDesc:   "SteadyFast Platform Fee",
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

// ── INITIATE: create pending service request + payment intent ─────────────────
export const initiatePayment = async (req, res) => {
  try {
    const { vehicleType, problem, details, price, platformFeeMethod, location } = req.body;

    if (!platformFeeMethod) {
      return res.status(400).json({ success: false, message: "Payment method required" });
    }

    const providerMap = { card: "stripe", mpesa: "mpesa", upi: "razorpay", cash: "cash" };

    const requestData = {
      client:           req.user.id,
      vehicleType,
      problem,
      details,
      price,
      platformFee:      PLATFORM_FEE_USD,
      platformFeeMethod,
      paymentProvider:  providerMap[platformFeeMethod] || "cash",
      status:           "payment_pending",
    };

    if (location?.coordinates) requestData.location = location;

    const serviceRequest = await ServiceRequest.create(requestData);
    const requestId = serviceRequest._id;

    const commonAudit = {
      requestId,
      clientId:       req.user.id,
      ip:             getIp(req),
      userAgent:      req.headers["user-agent"],
      idempotencyKey: req.idempotencyKey,
      amount:         PLATFORM_FEE_USD,
      currency:       "USD",
    };

    // ── Cash: auto-confirm immediately ────────────────────────────────────────
    if (platformFeeMethod === "cash") {
      const io = req.app.get("io");
      const { notifiedMechanics } = await dispatchToMechanics(requestId, io);
      await ServiceRequest.findByIdAndUpdate(requestId, {
        platformFeeStatus: "paid",
        platformFeePaidAt: new Date(),
      });
      await audit({ ...commonAudit, event: "confirmed", provider: "cash", severity: "info" });
      return res.status(201).json({ success: true, requestId, provider: "cash", notifiedMechanics });
    }

    // ── Stripe (Card) ─────────────────────────────────────────────────────────
    if (platformFeeMethod === "card") {
      if (!stripe) return res.status(500).json({ success: false, message: "Stripe not configured" });

      const paymentIntent = await stripe.paymentIntents.create({
        amount:      PLATFORM_FEE_CENTS,
        currency:    "usd",
        metadata:    { requestId: requestId.toString() },
        description: `SteadyFast platform fee — ${problem}`,
      });

      await ServiceRequest.findByIdAndUpdate(requestId, { paymentIntentId: paymentIntent.id });
      await audit({ ...commonAudit, event: "initiated", provider: "stripe", providerRef: paymentIntent.id, severity: "info" });

      return res.json({
        success:      true,
        requestId,
        provider:     "stripe",
        clientSecret: paymentIntent.client_secret,
      });
    }

    // ── M-Pesa STK Push ───────────────────────────────────────────────────────
    if (platformFeeMethod === "mpesa") {
      const { mpesaPhone } = req.body;
      if (!mpesaPhone) return res.status(400).json({ success: false, message: "M-Pesa phone required" });

      const stkData = await initiateSTKPush(mpesaPhone, PLATFORM_FEE_USD, requestId);
      await ServiceRequest.findByIdAndUpdate(requestId, { paymentIntentId: stkData.CheckoutRequestID });
      await audit({ ...commonAudit, event: "initiated", provider: "mpesa", providerRef: stkData.CheckoutRequestID, severity: "info" });

      return res.json({
        success:           true,
        requestId,
        provider:          "mpesa",
        checkoutRequestId: stkData.CheckoutRequestID,
        merchantRequestId: stkData.MerchantRequestID,
      });
    }

    // ── Razorpay (UPI) ────────────────────────────────────────────────────────
    if (platformFeeMethod === "upi") {
      if (!razorpay) return res.status(500).json({ success: false, message: "Razorpay not configured" });

      const order = await razorpay.orders.create({
        amount:   PLATFORM_FEE_PAISE,            // ₹100 in paise
        currency: "INR",
        receipt:  requestId.toString().slice(-12),
        notes: {
          requestId:    requestId.toString(),
          platformFee:  `₹${PLATFORM_FEE_INR}`,
          service:      problem,
        },
      });

      await ServiceRequest.findByIdAndUpdate(requestId, { paymentIntentId: order.id });
      await audit({
        ...commonAudit,
        event:       "initiated",
        provider:    "razorpay",
        providerRef: order.id,
        currency:    "INR",
        amount:      PLATFORM_FEE_INR,
        severity:    "info",
      });

      return res.json({
        success:   true,
        requestId,
        provider:  "razorpay",
        orderId:   order.id,
        amount:    order.amount,          // paise — let Razorpay SDK handle display
        currency:  order.currency,
        keyId:     process.env.RAZORPAY_KEY_ID,
        // Prefill data so the checkout form shows the user's details
        prefill: {
          name:    req.user.name    || "",
          email:   req.user.email   || "",
          contact: req.user.phone   || "",
        },
      });
    }

    return res.status(400).json({ success: false, message: "Unknown payment method" });

  } catch (err) {
    console.error("initiatePayment error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── STRIPE WEBHOOK ────────────────────────────────────────────────────────────
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const requestId = pi.metadata?.requestId;
    if (!requestId) return res.json({ received: true });

    try {
      await ServiceRequest.findByIdAndUpdate(requestId, {
        platformFeeStatus: "paid",
        platformFeePaidAt: new Date(),
      });
      const io = req.app.get("io");
      await dispatchToMechanics(requestId, io);
      await audit({
        event:       "confirmed",
        provider:    "stripe",
        providerRef: pi.id,
        requestId,
        amount:      pi.amount / 100,
        currency:    pi.currency?.toUpperCase(),
        ip:          getIp(req),
        severity:    "info",
      });
      console.log(`✅ Stripe payment confirmed — request ${requestId} dispatched`);
    } catch (err) {
      await audit({ event: "failed", provider: "stripe", providerRef: pi.id, requestId, ip: getIp(req), severity: "warn", metadata: { error: err.message } });
      console.error("Dispatch after Stripe payment failed:", err);
    }
  }

  res.json({ received: true });
};

// ── M-PESA CALLBACK ───────────────────────────────────────────────────────────
export const mpesaCallback = async (req, res) => {
  try {
    const body = req.body?.Body?.stkCallback;
    if (!body) return res.json({ ResultCode: 0, ResultDesc: "Accepted" });

    const resultCode        = body.ResultCode;
    const checkoutRequestId = body.CheckoutRequestID;

    if (resultCode === 0) {
      const request = await ServiceRequest.findOne({ paymentIntentId: checkoutRequestId });
      if (request && request.status === "payment_pending") {
        await ServiceRequest.findByIdAndUpdate(request._id, {
          platformFeeStatus: "paid",
          platformFeePaidAt: new Date(),
        });
        const io = req.app.get("io");
        await dispatchToMechanics(request._id, io);
        await audit({ event: "confirmed", provider: "mpesa", providerRef: checkoutRequestId, requestId: request._id, ip: getIp(req), severity: "info" });
        console.log(`✅ M-Pesa confirmed — request ${request._id} dispatched`);
      }
    } else {
      const request = await ServiceRequest.findOne({ paymentIntentId: checkoutRequestId });
      if (request) {
        await ServiceRequest.findByIdAndUpdate(request._id, { status: "cancelled" });
        const io = req.app.get("io");
        if (io) io.to(`client:${request.client}`).emit("payment:failed", { requestId: request._id });
        await audit({ event: "failed", provider: "mpesa", providerRef: checkoutRequestId, requestId: request._id, ip: getIp(req), severity: "warn", metadata: { resultCode } });
      }
      console.warn(`⚠️ M-Pesa payment failed (ResultCode ${resultCode}) for ${checkoutRequestId}`);
    }

    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("M-Pesa callback error:", err);
    res.json({ ResultCode: 0, ResultDesc: "Accepted" }); // always ack M-Pesa
  }
};

// ── RAZORPAY WEBHOOK ──────────────────────────────────────────────────────────
export const razorpayWebhook = async (req, res) => {
  // Only verify signature when a real webhook secret is configured
  if (isValidRazorpayWebhookSecret()) {
    const signature = req.headers["x-razorpay-signature"];
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSig) {
      console.warn("Razorpay webhook: invalid signature — rejected");
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } else if (process.env.NODE_ENV === "production") {
    // Block webhook if secret is not properly configured in production
    console.error("Razorpay webhook: RAZORPAY_WEBHOOK_SECRET not set — rejecting in production");
    return res.status(500).json({ success: false, message: "Webhook secret not configured" });
  }

  let event;
  try {
    event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ success: false, message: "Invalid JSON body" });
  }

  if (event.event === "payment.captured") {
    const orderId   = event.payload?.payment?.entity?.order_id;
    const paymentId = event.payload?.payment?.entity?.id;
    if (!orderId) return res.json({ received: true });

    try {
      const request = await ServiceRequest.findOne({ paymentIntentId: orderId });
      if (request && request.status === "payment_pending") {
        await ServiceRequest.findByIdAndUpdate(request._id, {
          platformFeeStatus: "paid",
          platformFeePaidAt: new Date(),
        });
        const io = req.app.get("io");
        await dispatchToMechanics(request._id, io);
        await audit({
          event:       "confirmed",
          provider:    "razorpay",
          providerRef: paymentId || orderId,
          requestId:   request._id,
          ip:          getIp(req),
          severity:    "info",
        });
        console.log(`✅ Razorpay webhook confirmed — request ${request._id} dispatched`);
      }
    } catch (err) {
      await audit({ event: "failed", provider: "razorpay", providerRef: orderId, ip: getIp(req), severity: "warn", metadata: { error: err.message } });
      console.error("Dispatch after Razorpay webhook failed:", err);
    }
  }

  res.json({ received: true });
};

// ── RAZORPAY CLIENT-SIDE VERIFY (primary path for UPI payments) ───────────────
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, requestId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !requestId) {
      return res.status(400).json({ success: false, message: "Missing required payment fields" });
    }

    // HMAC-SHA256 signature verification using key_secret
    const body        = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (razorpaySignature !== expectedSig) {
      await audit({
        requestId,
        event:       "tamper_detected",
        provider:    "razorpay",
        providerRef: razorpayPaymentId,
        ip:          getIp(req),
        severity:    "critical",
        metadata:    { reason: "signature_mismatch" },
      });
      return res.status(400).json({ success: false, message: "Payment verification failed — invalid signature" });
    }

    // Check the service request is still in payment_pending state (prevent replay)
    const existing = await ServiceRequest.findById(requestId).select("status platformFeeStatus");
    if (!existing) {
      return res.status(404).json({ success: false, message: "Service request not found" });
    }
    if (existing.platformFeeStatus === "paid") {
      // Already confirmed — idempotent success
      return res.json({ success: true, notifiedMechanics: 0, idempotent: true });
    }

    // Mark fee as paid and dispatch
    await ServiceRequest.findByIdAndUpdate(requestId, {
      platformFeeStatus: "paid",
      platformFeePaidAt: new Date(),
    });

    const io = req.app.get("io");
    const { notifiedMechanics } = await dispatchToMechanics(requestId, io);

    await audit({
      requestId,
      clientId:    req.user?.id,
      event:       "confirmed",
      provider:    "razorpay",
      providerRef: razorpayPaymentId,
      amount:      PLATFORM_FEE_INR,
      currency:    "INR",
      ip:          getIp(req),
      userAgent:   req.headers["user-agent"],
      severity:    "info",
      metadata:    { orderId: razorpayOrderId },
    });

    console.log(`✅ Razorpay payment verified — request ${requestId} dispatched to ${notifiedMechanics} mechanics`);

    res.json({ success: true, notifiedMechanics });
  } catch (err) {
    console.error("Razorpay verify error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POLL: client polls for payment confirmation ───────────────────────────────
export const checkPaymentStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await ServiceRequest.findById(requestId).select("status platformFeeStatus");
    if (!request) return res.status(404).json({ success: false, message: "Not found" });

    res.json({
      success: true,
      status:  request.status,
      paid:    request.platformFeeStatus === "paid",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
