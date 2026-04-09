import ChatMessage from "../models/ChatMessage.js";
import ServiceRequest from "../models/ServiceRequest.js";
import path from "path";

// ── GET /api/chat/:jobId — load history (last 100 msgs) ──────────────────────
export const getChatHistory = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Verify the requesting user is the client or mechanic of this job
    const job = await ServiceRequest.findById(jobId).select("client mechanic").lean();
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const uid = req.user.id.toString();
    const isParticipant =
      job.client?.toString() === uid ||
      job.mechanic?.toString() === uid ||
      req.user.role === "admin";

    if (!isParticipant) return res.status(403).json({ success: false, message: "Not authorized" });

    const messages = await ChatMessage.find({ jobId })
      .sort({ timestamp: 1 })
      .limit(100)
      .lean();

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/chat/upload-image — upload chat image, return URL ───────────────
export const uploadChatImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No image uploaded" });

    const imageUrl = `/uploads/chat/${req.file.filename}`;
    res.json({ success: true, imageUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
