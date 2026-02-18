// controller/siteSettingController.js
import SiteSetting from "../model/SiteSetting.js";

// PUBLIC: GET /api/site-settings
export const getSiteSettings = async (req, res, next) => {
  try {
    const setting = await SiteSetting.findOne({ isActive: true }).sort({ createdAt: -1 });
    res.json(setting || {});
  } catch (err) {
    next(err);
  }
};

// ADMIN: POST /api/site-settings (create once)
export const createSiteSettings = async (req, res, next) => {
  try {
    const exists = await SiteSetting.findOne();
    if (exists) {
      return res.status(400).json({ message: "Settings already exist. Use update instead." });
    }

    const created = await SiteSetting.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

// ADMIN: PUT /api/site-settings/:id
export const updateSiteSettings = async (req, res, next) => {
  try {
    const updated = await SiteSetting.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Settings not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
