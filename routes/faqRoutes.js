// routes/faqRoutes.js
import express from "express";
import {
  getFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
  toggleFaqActive,
} from "../controller/faqController.js";

const router = express.Router();

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Unauthorized" });
};

const requireAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "superadmin")) return next();
  return res.status(403).json({ message: "Forbidden (admin only)" });
};

// public
router.get("/", getFaqs);
router.get("/:id", getFaqById);

// admin
router.post("/",  createFaq);
router.put("/:id",  updateFaq);
router.delete("/:id",  deleteFaq);
router.patch("/:id/toggle", toggleFaqActive);

export default router;
