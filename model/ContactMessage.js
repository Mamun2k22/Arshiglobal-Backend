import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    message: { type: String, trim: true, required: true },

    // Job Apply Meta (Option-1)
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    jobTitle: { type: String, trim: true },
    jobCountry: { type: String, trim: true },

    source: { type: String, trim: true, default: "contact" }, // "apply" | "contact"
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("ContactMessage", contactMessageSchema);
