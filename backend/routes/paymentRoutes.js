import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  initiatePayment,
  stripeWebhook,
  mpesaCallback,
  razorpayWebhook,
  verifyRazorpayPayment,
  checkPaymentStatus
} from "../controllers/paymentController.js";
import {
  paymentRateLimit,
  idempotencyGuard,
  validatePaymentAmount,
  sanitizePaymentInput,
  stripeIpGuard,
  stripeReplayGuard,
  mpesaIpGuard,
} from "../middleware/paymentSecurity.js";

const router = express.Router();

// Client — initiate payment + create pending request
router.post(
  "/initiate",
  protect,
  paymentRateLimit,
  sanitizePaymentInput,
  validatePaymentAmount,
  idempotencyGuard,
  initiatePayment
);

// Client — verify Razorpay payment (called after checkout success)
router.post("/razorpay/verify", protect, verifyRazorpayPayment);

// Client — poll payment status
router.get("/status/:requestId", protect, checkPaymentStatus);

// Webhooks — raw body needed for signature verification
// (express.raw middleware applied in server.js for these routes)
router.post("/stripe/webhook",   stripeIpGuard, stripeReplayGuard, stripeWebhook);
router.post("/mpesa/callback",   mpesaIpGuard, mpesaCallback);
router.post("/razorpay/webhook", razorpayWebhook);

export default router;
