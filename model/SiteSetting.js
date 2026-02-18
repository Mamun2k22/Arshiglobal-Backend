// model/SiteSetting.js
import mongoose from "mongoose";

const siteSettingSchema = new mongoose.Schema(
  {
    // 🌐 Basic Info
    siteName: { type: String, trim: true },
    logo: { type: String, trim: true }, // ImgBB URL
    favicon: { type: String, trim: true },

    // 📞 Contact Info
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true }, // number only
    email: { type: String, trim: true },
    address: { type: String, trim: true },

    // 📝 About Page Content
    aboutTitle: { type: String, trim: true },
    aboutContent: { type: String }, // long text (no trim)

    // 🧾 Services Intro (optional but useful)
    servicesIntro: { type: String },

    // 🌍 Countries (optional simple array)
    destinations: [{ type: String }],

    // 📌 Footer
    footerText: { type: String, trim: true },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("SiteSetting", siteSettingSchema);
