import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import mechanicRoutes from "./routes/mechanicRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import vehicleTypeRoutes from "./routes/vehicleTypeRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import ChatMessage from "./models/ChatMessage.js";

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173", "http://127.0.0.1:5173",
      "http://localhost:5174", "http://127.0.0.1:5174",
      "http://localhost:4173", "http://127.0.0.1:4173",
    ],
    credentials: true
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" })
});

// Early Request Logger
app.use((req, res, next) => {
  console.log(`📡 [HTTP] ${req.method} ${req.url}`);
  next();
});

app.use(helmet({
  contentSecurityPolicy: false,                          // managed by frontend
  crossOriginResourcePolicy: { policy: "cross-origin" }, // allow static assets to load cross-origin
  crossOriginEmbedderPolicy: false,                      // don't block cross-origin resources (breaks Socket.IO in some browsers)
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }, // allow Razorpay / payment popups
}));

app.use(cors({
  origin: [
    "http://localhost:5173", "http://127.0.0.1:5173",  // vite dev
    "http://localhost:5174", "http://127.0.0.1:5174",  // vite dev alt port
    "http://localhost:4173", "http://127.0.0.1:4173",  // vite preview (PWA testing)
  ],
  credentials: true
}));

// Raw body for webhook signature verification (must come before express.json)
app.use("/api/payments/stripe/webhook", express.raw({ type: "application/json" }));
app.use("/api/payments/razorpay/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

// Strip $ operator keys from request bodies to prevent NoSQL injection
// allowDots:true keeps nested paths (e.g. details.brand) intact
app.use(mongoSanitize({ allowDots: true }));
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use("/uploads", express.static("uploads"));

// Make io accessible to routes
app.set('io', io);

app.use("/api/auth", authRoutes);
app.use("/api/mechanic", mechanicRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vehicles", vehicleTypeRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/contact", contactRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("SteadyFast API running");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" })
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  // Mechanic joins their room based on user ID
  socket.on("mechanic:join", (mechanicId) => {
    socket.join(`mechanic:${mechanicId}`);
    console.log(`🔧 Mechanic ${mechanicId} joined their room`);
  });

  // Client joins their room
  socket.on("client:join", (clientId) => {
    socket.join(`client:${clientId}`);
    console.log(`👤 Client ${clientId} joined their room`);

    // Check room size for debugging
    const room = io.sockets.adapter.rooms.get(`client:${clientId}`);
    console.log(`🏠 Room client:${clientId} now has ${room ? room.size : 0} members`);
  });

  // Mechanic location update
  socket.on("mechanic:location", ({ mechanicId, location, jobId }) => {
    // Broadcast to the client tracking this job
    io.to(`job:${jobId}`).emit("mechanic:location:update", { location });
    console.log(`📍 Mechanic ${mechanicId} location updated for job ${jobId}`);
  });

  // Join job tracking room
  socket.on("job:track", (jobId) => {
    socket.join(`job:${jobId}`);
    console.log(`👁️ User joined tracking room for job ${jobId}`);
  });

  // Real-time chat between client and mechanic
  socket.on("chat:send", async ({ jobId, message, senderName, senderId, type, imageUrl }) => {
    const timestamp = new Date().toISOString();
    const payload = { jobId, message: message || "", senderName, senderId, type: type || "text", imageUrl, timestamp };

    // Persist to DB (fire-and-forget, never blocks socket)
    ChatMessage.create({
      jobId, senderId, senderName,
      type: type || "text",
      message: message || "",
      imageUrl,
      timestamp: new Date(timestamp),
    }).catch(e => console.error("Chat persist error:", e.message));

    // Broadcast to everyone in the job room EXCEPT the sender
    socket.to(`job:${jobId}`).emit("chat:message", payload);
    console.log(`💬 Chat [${type || "text"}] in job:${jobId} from ${senderName}`);
  });

  // Typing indicator — lightweight, no DB write
  socket.on("chat:typing", ({ jobId, senderName, isTyping }) => {
    socket.to(`job:${jobId}`).emit("chat:typing", { senderName, isTyping });
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

// Global error handlers
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("🌊 Unhandled Rejection at:", promise, "reason:", reason);
});