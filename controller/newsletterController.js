// controller/newsletterController.js
import NewsletterSubscriber from "../model/NewsletterSubscriber.js";

// PUBLIC: POST /api/newsletter/subscribe
export const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "email is required" });

    const normalized = String(email).toLowerCase().trim();

    const exists = await NewsletterSubscriber.findOne({ email: normalized });
    if (exists) return res.status(200).json({ message: "Already subscribed" });

    const saved = await NewsletterSubscriber.create({ email: normalized });
    res.status(201).json({ message: "Subscribed", data: saved });
  } catch (err) {
    // handle duplicate key just in case
    if (err?.code === 11000) return res.status(200).json({ message: "Already subscribed" });
    next(err);
  }
};

// ADMIN: GET /api/newsletter
export const getNewsletterSubscribers = async (req, res, next) => {
  try {
    const items = await NewsletterSubscriber.find({}).sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

// ADMIN: DELETE /api/newsletter/:id
export const deleteSubscriber = async (req, res, next) => {
  try {
    const deleted = await NewsletterSubscriber.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Subscriber not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    next(err);
  }
};
