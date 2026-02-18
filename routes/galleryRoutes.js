import express from "express";
import Gallery from "../model/gallery.model.js";
import { uploadMemory } from "../middleware/uploadMemory.js";
import { uploadToImgbb } from "../utils/uploadToImgbb.js";

const router = express.Router();

// guards (আপনার existing middleware থাকলে সেটা use করবেন)
const requireAuth = (req, res, next) => (req.isAuthenticated?.() ? next() : res.status(401).json({ message: "Unauthorized" }));
const requireAdmin = (req, res, next) =>
  req.user && (req.user.role === "admin" || req.user.role === "superadmin")
    ? next()
    : res.status(403).json({ message: "Forbidden" });

// ✅ Public: list gallery
router.get("/", async (req, res) => {
  const items = await Gallery.find({ isActive: true }).sort({ createdAt: -1 });
  res.json({ items });
});

// ✅ Admin: list all
router.get("/admin", async (req, res) => {
  const items = await Gallery.find({}).sort({ createdAt: -1 });
  res.json({ items });
});

// ✅ Admin: upload + create
router.post(
  "/admin",
  uploadMemory.array("images", 10),
  async (req, res) => {
    if (!req.files?.length) return res.status(400).json({ message: "No images provided" });

    const { title, caption } = req.body || {};

    const uploads = await Promise.all(
      req.files.map((f) => uploadToImgbb(f.buffer, f.originalname, process.env.IMGBB_API_KEY))
    );

    const docs = await Gallery.insertMany(
      uploads.map((u, idx) => ({
        title: title ? `${title}${req.files.length > 1 ? ` #${idx + 1}` : ""}` : undefined,
        caption,
        imageUrl: u.url, // or u.display_url
        deleteUrl: u.delete_url,
        isActive: true,
      }))
    );

    res.json({ ok: true, items: docs });
  }
);

// ✅ Admin: toggle active
router.patch("/admin/:id", async (req, res) => {
  const updated = await Gallery.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
});

// ✅ Admin: delete
router.delete("/admin/:id", async (req, res) => {
  const deleted = await Gallery.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Not found" });
  res.json({ ok: true });
});

export default router;
