import express from "express";
import {
    getMechanicStats,
    getMechanicClients,
    getMechanicReviews,
    getMechanicJobs,
    getMechanicRevenue
} from "../controllers/mechanicController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All routes are protected and for mechanics only
router.use(protect);
router.use(authorizeRoles("mechanic"));

router.get("/stats", getMechanicStats);
router.get("/clients", getMechanicClients);
router.get("/reviews", getMechanicReviews);
router.get("/jobs", getMechanicJobs);
router.get("/revenue", getMechanicRevenue);

export default router;
