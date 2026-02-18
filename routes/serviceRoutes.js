// routes/serviceRoutes.js
import express from "express";
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  toggleServiceActive,
} from "../controller/serviceController.js";

const router = express.Router();

// auth helpers (passport session based)
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

// Public
router.get("/", getServices);
router.get("/:id", getServiceById);

// Admin (optional now; Compass import করলেও চলবে)
router.post("/",  createService);
router.put("/:id",  updateService);
router.delete("/:id",  deleteService);
router.patch("/:id/toggle",  toggleServiceActive);

export default router;
