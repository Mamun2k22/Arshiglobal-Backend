// model/Job.js
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },   // e.g. Serbia
    category: { type: String, required: true, trim: true },  // e.g. Factory, Construction
    salary: { type: String, trim: true },                    // e.g. "800-1000 EUR"
    accommodation: { type: String, trim: true },             // e.g. "Yes / Provided"
    food: { type: String, trim: true },                      // e.g. "Yes / Provided"
    description: { type: String, trim: true },
    requirements: [{ type: String, trim: true }],
    benefits: [{ type: String, trim: true }],

    // meta
    isActive: { type: Boolean, default: true },
    applyLink: { type: String, trim: true },                 // optional
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
  },
  { timestamps: true }
);

// helpful indexes for search/filter
jobSchema.index({ title: "text", country: "text", category: "text", description: "text" });

export default mongoose.model("Job", jobSchema);
