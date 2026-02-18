// controller/contactController.js
import ContactMessage from "../model/ContactMessage.js";

// PUBLIC: POST /api/contact
export const sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({ message: "name and message are required" });
    }

    const saved = await ContactMessage.create({ name, email, phone, message });
    res.status(201).json({ message: "Message received", data: saved });
  } catch (err) {
    next(err);
  }
};

// ADMIN: GET /api/contact?read=
export const getContactMessages = async (req, res, next) => {
  try {
    const { read } = req.query;

    const q = {};
    if (read === "true") q.isRead = true;
    if (read === "false") q.isRead = false;

    const items = await ContactMessage.find(q).sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

// ADMIN: PATCH /api/contact/:id/read
export const markContactRead = async (req, res, next) => {
  try {
    const updated = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { $set: { isRead: true } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Message not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// ADMIN: DELETE /api/contact/:id
export const deleteContactMessage = async (req, res, next) => {
  try {
    const deleted = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Message not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    next(err);
  }
};
