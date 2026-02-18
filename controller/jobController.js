// controller/jobController.js
import Job from "../model/Job.model.js";

// GET /api/jobs?search=&country=&category=&page=&limit=&active=
export const getJobs = async (req, res, next) => {
  try {
    const {
      search = "",
      country,
      category,
      active,
      page = 1,
      limit = 12,
    } = req.query;

    const q = {};

    // active filter (default: show only active if not explicitly asked)
    if (active === "true") q.isActive = true;
    else if (active === "false") q.isActive = false;
    else q.isActive = true;

    if (country) q.country = { $regex: country, $options: "i" };
    if (category) q.category = { $regex: category, $options: "i" };

    if (search?.trim()) {
      q.$or = [
        { title: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Job.find(q).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Job.countDocuments(q),
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

// GET /api/jobs/:id
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (!job.isActive) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    next(err);
  }
};

// ADMIN: POST /api/jobs
export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      country,
      category,
      salary,
      accommodation,
      food,
      description,
      requirements,
      benefits,
      isActive,
      applyLink,
    } = req.body;

    if (!title || !country || !category) {
      return res.status(400).json({ message: "title, country, category are required" });
    }

    const job = await Job.create({
      title,
      country,
      category,
      salary,
      accommodation,
      food,
      description,
      requirements: Array.isArray(requirements) ? requirements : [],
      benefits: Array.isArray(benefits) ? benefits : [],
      isActive: typeof isActive === "boolean" ? isActive : true,
      applyLink,
      createdBy: req.user?._id,
    });

    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
};

// ADMIN: PUT /api/jobs/:id
export const updateJob = async (req, res, next) => {
  try {
    const updated = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Job not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// ADMIN: DELETE /api/jobs/:id
export const deleteJob = async (req, res, next) => {
  try {
    const deleted = await Job.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ADMIN: PATCH /api/jobs/:id/toggle
export const toggleJobActive = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.isActive = !job.isActive;
    await job.save();

    res.json(job);
  } catch (err) {
    next(err);
  }
};
