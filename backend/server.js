import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import mechanicRoutes from "./routes/mechanicRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));


app.use("/api/auth", authRoutes);
app.use("/api/mechanic", mechanicRoutes);
app.use("/api/services", serviceRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("SteadyFast API running");
});

app.listen(PORT, () =>
  console.log(`Server running on ${process.env.PORT}`)
);

app.get("/health", (req, res) => {
  res.json({ status: "ok" })
});
