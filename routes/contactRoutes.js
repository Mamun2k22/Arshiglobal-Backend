import express from "express";
import ContactMessage from "../model/ContactMessage.js";

const router = express.Router();

// ✅ guards (আপনার existing middleware থাকলে সেটাই use করবেন)
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Unauthorized" });
};
const requireAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "superadmin")) return next();
  return res.status(403).json({ message: "Forbidden" });
};

// ✅ Public: submit contact/apply message
router.post("/contact", async (req, res) => {
  const { name, email, phone, message, jobId, jobTitle, jobCountry, source } = req.body || {};

  if (!name || !message) {
    return res.status(400).json({ message: "Name and message are required" });
  }

  const created = await ContactMessage.create({
    name,
    email,
    phone,
    message,
    jobId: jobId || undefined,
    jobTitle,
    jobCountry,
    source: source || (jobId || jobTitle ? "apply" : "contact"),
  });

  res.json({ ok: true, item: created });
});

// ✅ Admin: list inbox (search/read filter + pagination)
router.get("/admin/messages", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(100, Math.max(5, parseInt(req.query.limit || "20", 10)));

  const search = String(req.query.search || "").trim();
  const isRead = req.query.isRead; // "true" | "false" | undefined

  const filter = {};
  if (isRead === "true") filter.isRead = true;
  if (isRead === "false") filter.isRead = false;

  if (search) {
    filter.$or = [
      { name: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
      { phone: new RegExp(search, "i") },
      { message: new RegExp(search, "i") },
      { jobTitle: new RegExp(search, "i") },
      { jobCountry: new RegExp(search, "i") },
    ];
  }

  const [items, total] = await Promise.all([
    ContactMessage.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    ContactMessage.countDocuments(filter),
  ]);

  res.json({ items, pagination: { page, limit, total } });
});

// ✅ Admin: mark read/unread
router.patch("/admin/messages/:id", async (req, res) => {
  const { isRead } = req.body || {};
  const updated = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { $set: { isRead: !!isRead } },
    { new: true }
  );
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
});

// ✅ Admin: delete
router.delete("/admin/messages/:id", async (req, res) => {
  const deleted = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Not found" });
  res.json({ ok: true });
});

export default router;
