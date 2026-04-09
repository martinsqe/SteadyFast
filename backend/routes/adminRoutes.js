import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { getMechanicsIncome, getMechanicDetails, getPlatformFeePayments } from "../controllers/adminController.js";

const router = express.Router();

// Report routes
router.get("/reports/mechanics", protect, authorize("admin"), getMechanicsIncome);
router.get("/reports/mechanics/:id", protect, authorize("admin"), getMechanicDetails);
router.get("/reports/platform-fees", protect, authorize("admin"), getPlatformFeePayments);

export default router;
