import express from "express";
import { registerUser, loginUser, getAllUsers, updateProfile, getMechanics, assignMechanic, adminUpdateUser, adminDeleteUser, getUserStats } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly, clientOnly, mechanicOnly } from "../middleware/roleMiddleware.js";

import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/profile", protect, upload.single("image"), updateProfile);

// Get all users (Admin only)
router.get("/users", protect, adminOnly, getAllUsers);
router.put("/users/:id", protect, adminOnly, adminUpdateUser);
router.delete("/users/:id", protect, adminOnly, adminDeleteUser);

// Mechanic selection for clients
router.get("/mechanics", protect, getMechanics);
router.post("/assign-mechanic", protect, clientOnly, assignMechanic);
router.get("/stats", protect, adminOnly, getUserStats);

router.get("/admin", protect, adminOnly, (req, res) => {
  res.json({ message: "Admin dashboard" });
});

router.get("/client", protect, clientOnly, (req, res) => {
  res.json({ message: "Client dashboard" });
});

router.get("/mechanic", protect, mechanicOnly, (req, res) => {
  res.json({ message: "Mechanic dashboard" });
});

export default router;
