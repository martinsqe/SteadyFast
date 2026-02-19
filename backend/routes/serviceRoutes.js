import express from "express";
import {
  createServiceRequest,
  getServiceRequests,
  getClientServiceRequests,
  acceptJob,
  updateJobStatus,
  getAvailableJobs,
  getMechanicActiveJobs,
  getClientActiveJob,
  updateMechanicLocation,
  processPayment
} from "../controllers/serviceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { mechanicOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Client routes
router.post("/", protect, createServiceRequest);
router.get("/my-requests", protect, getClientServiceRequests);
router.get("/my-active-job", protect, getClientActiveJob);

// Mechanic routes
router.get("/available", protect, mechanicOnly, getAvailableJobs);
router.get("/my-active", protect, mechanicOnly, getMechanicActiveJobs);
router.post("/:jobId/accept", protect, mechanicOnly, acceptJob);
router.patch("/:jobId/status", protect, mechanicOnly, updateJobStatus);
router.post("/location", protect, mechanicOnly, updateMechanicLocation);
router.post("/:jobId/pay", protect, processPayment);

// Admin routes
router.get("/all", protect, getServiceRequests);

export default router;