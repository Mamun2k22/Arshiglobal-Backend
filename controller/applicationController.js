// import Application from "../model/Application.js";

// export const listApplications = async (req, res) => {
//   try {
//     const limit = Math.min(parseInt(req.query.limit || "8", 10), 50);

//     const items = await Application.find({})
//       .sort({ createdAt: -1 })
//       .limit(limit)
//       .lean();

//     res.json({ items });
//   } catch (err) {
//     console.error("listApplications error:", err);
//     res.status(500).json({ message: "Failed to load applications" });
//   }
// };

import Application from "../model/Application.js";

/* =============================
   Apply to job (public)
============================= */

export const applyToJob = async (req, res) => {
  try {
    const {
      job,
      fullName,
      email,
      phone,
      passportNumber,
      education,
      experience,
      message,
      cvUrl,
    } = req.body;

    if (!job || !fullName || !email) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const application = await Application.create({
      job,
      applicant: req.user?._id || null,
      fullName,
      email,
      phone,
      passportNumber,
      education,
      experience,
      message,
      cvUrl,
    });

    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: "Application failed" });
  }
};

/* =============================
   Admin - Get all applications
============================= */

export const getAllApplications = async (req, res) => {
  try {
    const apps = await Application.find()
      .populate("job", "title country")
      .sort({ createdAt: -1 });

    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

/* =============================
   Admin - Update status
============================= */

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Not found" });

    if (status) app.status = status;
    if (adminNote !== undefined) app.adminNote = adminNote;

    await app.save();

    res.json(app);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

/* =============================
   Dashboard Stats
============================= */

export const getApplicationStats = async (req, res) => {
  try {
    const total = await Application.countDocuments();
    const pending = await Application.countDocuments({ status: "pending" });
    const approved = await Application.countDocuments({ status: "approved" });
    const rejected = await Application.countDocuments({ status: "rejected" });

    res.json({
      total,
      pending,
      approved,
      rejected,
    });
  } catch (err) {
    res.status(500).json({ message: "Stats failed" });
  }
};
