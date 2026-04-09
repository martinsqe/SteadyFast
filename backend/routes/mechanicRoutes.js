import express from "express";
import {
  getMechanicProfile,
  updateMechanicProfile,
  getMechanicJobs,
  getMechanicEarnings,
  getMyReviews,
  getMyClients
} from "../controllers/mechanicController.js";
import { protect } from "../middleware/authMiddleware.js";
import { mechanicOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All routes are mechanic-only
router.get("/profile", protect, mechanicOnly, getMechanicProfile);
router.put("/profile", protect, mechanicOnly, updateMechanicProfile);
router.get("/jobs", protect, mechanicOnly, getMechanicJobs);
router.get("/earnings", protect, mechanicOnly, getMechanicEarnings);
router.get("/reviews", protect, mechanicOnly, getMyReviews);
router.get("/clients", protect, mechanicOnly, getMyClients);

export default router;
