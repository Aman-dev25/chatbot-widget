// src/controllers/chat.controller.js
// Handles request validation and response formatting.
// Delegates business logic to the chat service.

import { getReply } from "../services/chat.service.js";
import { validateChatRequest } from "../utils/validators.js";

/**
 * GET /api/health
 * Returns server status. Useful for uptime checks and deployment verification.
 */
export const healthCheck = (req, res) => {
  res.json({ success: true, message: "Server is running" });
};

/**
 * POST /api/chat
 * Body: { userId: string, message: string }
 * Returns: { success, reply, userId, mode }
 */
export const sendMessage = async (req, res) => {
  // 1. Validate the incoming request body
  const { valid, error } = validateChatRequest(req.body);
  if (!valid) {
    return res.status(400).json({ success: false, message: error });
  }

  const { userId, message } = req.body;

  try {
    // 2. Get a reply from the AI service (mock or OpenAI)
    const { reply, mode } = await getReply(userId, message);

    // 3. Return the structured response
    res.json({ success: true, reply, userId, mode });
  } catch (err) {
    console.error("Chat controller error:", err.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};
