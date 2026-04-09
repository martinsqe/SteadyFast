import mongoose from "mongoose";

const paymentAuditLogSchema = new mongoose.Schema({
  requestId:    { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest" },
  clientId:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  event:        { type: String, required: true }, // initiated | confirmed | failed | replay_blocked | tamper_detected | webhook_received
  provider:     { type: String, enum: ["stripe", "mpesa", "razorpay", "cash", "system"] },
  amount:       { type: Number },
  currency:     { type: String, default: "USD" },
  providerRef:  { type: String },              // paymentIntentId, checkoutRequestId, orderId
  idempotencyKey: { type: String },
  ip:           { type: String },
  userAgent:    { type: String },
  metadata:     { type: Object },
  severity:     { type: String, enum: ["info", "warn", "critical"], default: "info" },
}, { timestamps: true });

paymentAuditLogSchema.index({ requestId: 1 });
paymentAuditLogSchema.index({ clientId: 1 });
paymentAuditLogSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
paymentAuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 }); // 1 year retention

export default mongoose.model("PaymentAuditLog", paymentAuditLogSchema);
