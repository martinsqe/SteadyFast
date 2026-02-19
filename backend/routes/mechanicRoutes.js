import express from "express";
import { 
  getMechanicProfile, 
  updateMechanicProfile,
  getMechanicJobs,
  getMechanicEarnings 
} from "../controllers/mechanicController.js";
import { protect } from "../middleware/authMiddleware.js";
import { mechanicOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All routes are mechanic-only
router.get("/profile", protect, mechanicOnly, getMechanicProfile);
router.put("/profile", protect, mechanicOnly, updateMechanicProfile);
router.get("/jobs", protect, mechanicOnly, getMechanicJobs);
router.get("/earnings", protect, mechanicOnly, getMechanicEarnings);

export default router;
