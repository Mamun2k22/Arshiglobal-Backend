// model/Service.js
import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, trim: true },
    description: { type: String, trim: true }, // long details
    image: { type: String, trim: true },       // "/uploads/xxx.jpg" or external URL
    icon: { type: String, trim: true },        // optional (icon name / url)
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

serviceSchema.index({ title: "text", shortDescription: "text", description: "text" });

export default mongoose.model("Service", serviceSchema);
