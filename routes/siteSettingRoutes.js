// routes/siteSettingRoutes.js
import express from "express";
import {
  getSiteSettings,
  createSiteSettings,
  updateSiteSettings,
} from "../controller/siteSettingController.js";

const router = express.Router();

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Unauthorized" });
};

const requireAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "superadmin")) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden (admin only)" });
};

// public
router.get("/", getSiteSettings);

// admin
router.post("/", requireAuth, requireAdmin, createSiteSettings);
router.put("/:id", requireAuth, requireAdmin, updateSiteSettings);

export default router;
