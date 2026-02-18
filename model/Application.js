import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // guest apply করলে null থাকতে পারে
    },

    // Manual applicant data (guest support)
    fullName: { type: String, trim: true, required: true },
    email: { type: String, trim: true, required: true },
    phone: { type: String, trim: true },

    passportNumber: { type: String, trim: true },
    education: { type: String, trim: true },
    experience: { type: String, trim: true },

    message: { type: String, trim: true },

    cvUrl: { type: String, trim: true }, // optional (image/PDF future)

    status: {
      type: String,
      enum: ["pending", "reviewing", "approved", "rejected"],
      default: "pending",
    },

    adminNote: { type: String, trim: true },

  },
  { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);
