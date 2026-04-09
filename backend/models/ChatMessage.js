import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  jobId:      { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest", required: true, index: true },
  senderId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderName: { type: String, required: true },
  type:       { type: String, enum: ["text", "image"], default: "text" },
  message:    { type: String, default: "" },   // text content or image caption
  imageUrl:   { type: String },                // set when type === "image"
  timestamp:  { type: Date, default: Date.now },
});

// Compound index for fast history fetch sorted by time
chatMessageSchema.index({ jobId: 1, timestamp: 1 });
// Auto-delete messages after 30 days
chatMessageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export default mongoose.model("ChatMessage", chatMessageSchema);
