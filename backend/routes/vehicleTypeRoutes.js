import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
  getPublicVehicleTypes,
  getAllVehicleTypes,
  createVehicleType,
  updateVehicleType,
  deleteVehicleType
} from "../controllers/vehicleTypeController.js";

const router = express.Router();

// Ensure upload directory exists
const uploadDir = "uploads/vehicle-icons";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `vehicle-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Public
router.get("/", getPublicVehicleTypes);

// Admin
router.get("/all", protect, authorize("admin"), getAllVehicleTypes);
router.post("/", protect, authorize("admin"), upload.single("icon"), createVehicleType);
router.put("/:id", protect, authorize("admin"), upload.single("icon"), updateVehicleType);
router.delete("/:id", protect, authorize("admin"), deleteVehicleType);

export default router;
