// model/NewsletterSubscriber.js
import mongoose from "mongoose";

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model("NewsletterSubscriber", newsletterSubscriberSchema);
