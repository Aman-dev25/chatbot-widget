// src/controllers/lead.controller.js
// Handles lead capture submissions before the first chat message.

import { saveLead } from "../services/history.service.js";

/**
 * POST /api/lead
 * Body: { userId, name, email }
 * Called by the widget when lead capture is enabled.
 */
export const captureLead = async (req, res) => {
  const { userId, name, email } = req.body || {};

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ success: false, message: "userId is required." });
  }
  if (!name || typeof name !== "string" || name.trim().length < 1) {
    return res.status(400).json({ success: false, message: "name is required." });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: "A valid email is required." });
  }

  try {
    await saveLead(userId, { name: name.trim(), email: email.trim().toLowerCase() });
    res.json({ success: true, message: "Lead captured. Welcome!" });
  } catch (err) {
    console.error("Lead capture error:", err);
    res.status(500).json({ success: false, message: "Failed to save your details. Please try again." });
  }
};
