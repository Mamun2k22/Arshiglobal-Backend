// routes/adminStatsRoutes.js
import express from "express";
import { getAdminStats } from "../controller/adminStatsController.js";
import { protect, ensureAdmin } from "../middleware/protect.js";

const router = express.Router();

// GET /api/admin/stats
router.get("/admin/stats",  getAdminStats);

export default router;
