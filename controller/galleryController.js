// controller/galleryController.js
import Gallery from "../model/gallery.model.js";

// GET /api/gallery?active=&page=&limit=
export const getGallery = async (req, res, next) => {
  try {
    const { active, page = 1, limit = 60 } = req.query;

    const q = {};
    if (active === "true") q.isActive = true;
    else if (active === "false") q.isActive = false;
    else q.isActive = true;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 60, 1), 200);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Gallery.find(q).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limitNum),
      Gallery.countDocuments(q),
    ]);

    res.json({
      items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/gallery/:id
export const getGalleryById = async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Gallery item not found" });
    if (!item.isActive) return res.status(404).json({ message: "Gallery item not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// ADMIN: POST /api/gallery
export const createGallery = async (req, res, next) => {
  try {
    const { title, imageUrl, caption, isActive, order } = req.body;
    if (!imageUrl) return res.status(400).json({ message: "imageUrl is required" });

    const item = await Gallery.create({
      title,
      imageUrl,
      caption,
      isActive: typeof isActive === "boolean" ? isActive : true,
      order: typeof order === "number" ? order : 0,
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// ADMIN: PUT /api/gallery/:id
export const updateGallery = async (req, res, next) => {
  try {
    const updated = await Gallery.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Gallery item not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// ADMIN: DELETE /api/gallery/:id
export const deleteGallery = async (req, res, next) => {
  try {
    const deleted = await Gallery.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Gallery item not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ADMIN: PATCH /api/gallery/:id/toggle
export const toggleGalleryActive = async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Gallery item not found" });

    item.isActive = !item.isActive;
    await item.save();

    res.json(item);
  } catch (err) {
    next(err);
  }
};
