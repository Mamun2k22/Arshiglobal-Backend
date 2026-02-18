// controller/faqController.js
import Faq from "../model/Faq.js";

// GET /api/faqs?active=
export const getFaqs = async (req, res, next) => {
  try {
    const { active } = req.query;

    const q = {};
    if (active === "true") q.isActive = true;
    else if (active === "false") q.isActive = false;
    else q.isActive = true;

    const items = await Faq.find(q).sort({ order: 1, createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

// GET /api/faqs/:id
export const getFaqById = async (req, res, next) => {
  try {
    const item = await Faq.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "FAQ not found" });
    if (!item.isActive) return res.status(404).json({ message: "FAQ not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// ADMIN: POST /api/faqs
export const createFaq = async (req, res, next) => {
  try {
    const { question, answer, order, isActive } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ message: "question and answer are required" });
    }

    const item = await Faq.create({
      question,
      answer,
      order: typeof order === "number" ? order : 0,
      isActive: typeof isActive === "boolean" ? isActive : true,
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// ADMIN: PUT /api/faqs/:id
export const updateFaq = async (req, res, next) => {
  try {
    const updated = await Faq.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "FAQ not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// ADMIN: DELETE /api/faqs/:id
export const deleteFaq = async (req, res, next) => {
  try {
    const deleted = await Faq.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "FAQ not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ADMIN: PATCH /api/faqs/:id/toggle
export const toggleFaqActive = async (req, res, next) => {
  try {
    const item = await Faq.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "FAQ not found" });

    item.isActive = !item.isActive;
    await item.save();

    res.json(item);
  } catch (err) {
    next(err);
  }
};
