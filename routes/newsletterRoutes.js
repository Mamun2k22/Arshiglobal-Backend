// routes/newsletterRoutes.js
import express from "express";
import {
  subscribeNewsletter,
  getNewsletterSubscribers,
  deleteSubscriber,
} from "../controller/newsletterController.js";

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
router.post("/subscribe", subscribeNewsletter);

// admin
router.get("/", getNewsletterSubscribers);
router.delete("/:id", deleteSubscriber);

export default router;
