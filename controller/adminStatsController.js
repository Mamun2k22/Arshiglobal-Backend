// controller/adminStatsController.js
import mongoose from "mongoose";

// ✅ safe model getter (model না থাকলে error না দিয়ে null দিবে)
const getModel = (name) => {
  try {
    return mongoose.model(name);
  } catch {
    return null;
  }
};

export const getAdminStats = async (_req, res) => {
  try {
    const Job = getModel("Job");
    const User = getModel("User");
    const Application = getModel("Application");
    const Contact = getModel("ContactMessage");
    const Newsletter = getModel("Newsletter");

    const [
      jobs,
      users,
      applications,
      pending,
      approved,
      rejected,
      contacts,
      newsletter,
    ] = await Promise.all([
      Job ? Job.countDocuments() : 0,
      User ? User.countDocuments() : 0,
      Application ? Application.countDocuments() : 0,
      Application ? Application.countDocuments({ status: "pending" }) : 0,
      Application ? Application.countDocuments({ status: "approved" }) : 0,
      Application ? Application.countDocuments({ status: "rejected" }) : 0,
      Contact ? Contact.countDocuments() : 0,
      Newsletter ? Newsletter.countDocuments() : 0,
    ]);

    return res.json({
      jobs,
      users,
      applications,
      pending,
      approved,
      rejected,
      contacts,
      newsletter,
    });
  } catch (err) {
    console.error("getAdminStats error:", err);
    return res.status(500).json({ message: "Failed to load admin stats" });
  }
};
