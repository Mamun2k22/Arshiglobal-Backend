import express from "express";
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  toggleJobActive,
} from "../controller/jobController.js";

const router = express.Router();

// auth helpers
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
router.get("/", getJobs);
router.get("/:id", getJobById);

// admin
router.post("/", requireAuth, requireAdmin, createJob);
router.put("/:id", requireAuth, requireAdmin, updateJob);
router.delete("/:id", requireAuth, requireAdmin, deleteJob);
router.patch("/:id/toggle", requireAuth, requireAdmin, toggleJobActive);

export default router;
