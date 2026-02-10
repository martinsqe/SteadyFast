import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { createRequest, getClientRequests, getAvailableRequests, acceptRequest } from "../controllers/serviceController.js";

const router = express.Router();

router.post("/", protect, createRequest);
router.get("/client", protect, getClientRequests);
router.get("/available", protect, authorizeRoles("mechanic", "admin"), getAvailableRequests);
router.put("/:id/accept", protect, authorizeRoles("mechanic"), acceptRequest);

export default router;
