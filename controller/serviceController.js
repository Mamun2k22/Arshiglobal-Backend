// controller/serviceController.js
import Service from "../model/service.model.js";

// GET /api/services?search=&active=&page=&limit=
export const getServices = async (req, res, next) => {
  try {
    const { search = "", active, page = 1, limit = 50 } = req.query;

    const q = {};

    // default only active (like jobs)
    if (active === "true") q.isActive = true;
    else if (active === "false") q.isActive = false;
    else q.isActive = true;

    if (search?.trim()) {
      q.$or = [
        { title: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Service.find(q)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Service.countDocuments(q),
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

// GET /api/services/:id
export const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    if (!service.isActive) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (err) {
    next(err);
  }
};

// ADMIN: POST /api/services
export const createService = async (req, res, next) => {
  try {
    const { title, shortDescription, description, image, icon, isActive, order } = req.body;

    if (!title) return res.status(400).json({ message: "title is required" });

    const service = await Service.create({
      title,
      shortDescription,
      description,
      image,
      icon,
      isActive: typeof isActive === "boolean" ? isActive : true,
      order: typeof order === "number" ? order : 0,
    });

    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
};

// ADMIN: PUT /api/services/:id
export const updateService = async (req, res, next) => {
  try {
    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Service not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// ADMIN: DELETE /api/services/:id
export const deleteService = async (req, res, next) => {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Service not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ADMIN: PATCH /api/services/:id/toggle
export const toggleServiceActive = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    service.isActive = !service.isActive;
    await service.save();

    res.json(service);
  } catch (err) {
    next(err);
  }
};
