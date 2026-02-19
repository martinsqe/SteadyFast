import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import mechanicRoutes from "./routes/mechanicRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Make io accessible to routes
app.set('io', io);

app.use("/api/auth", authRoutes);
app.use("/api/mechanic", mechanicRoutes);
app.use("/api/services", serviceRoutes);

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