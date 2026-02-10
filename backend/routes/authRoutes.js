import express from "express";
import { registerUser, loginUser, getAllUsers, updateProfile, getMechanics, assignMechanic, adminUpdateUser, adminDeleteUser, getUserStats } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

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
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.put("/users/:id", protect, authorizeRoles("admin"), adminUpdateUser);
router.delete("/users/:id", protect, authorizeRoles("admin"), adminDeleteUser);

// Mechanic selection for clients
router.get("/mechanics", protect, getMechanics);
router.post("/assign-mechanic", protect, authorizeRoles("client"), assignMechanic);
router.get("/stats", protect, authorizeRoles("admin"), getUserStats);


router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Admin dashboard" });
});

router.get("/client", protect, authorizeRoles("client"), (req, res) => {
  res.json({ message: "Client dashboard" });
});

router.get("/mechanic", protect, authorizeRoles("mechanic"), (req, res) => {
  res.json({ message: "Mechanic dashboard" });
});

export default router;
