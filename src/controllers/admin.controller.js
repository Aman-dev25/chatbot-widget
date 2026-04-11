// src/controllers/admin.controller.js
// Handles admin API requests — listing and inspecting conversations.

import {
  listConversations,
  getConversation,
  deleteConversation,
} from "../services/history.service.js";

/**
 * GET /api/admin/conversations
 * Query params: ?page=1&limit=20
 * Returns paginated list of all conversations.
 */
export const getAllConversations = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));

    const result = await listConversations({ page, limit });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("Admin getAllConversations error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch conversations." });
  }
};

/**
 * GET /api/admin/conversations/:userId
 * Returns the full message history for a specific user.
 */
export const getOneConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const conversation = await getConversation(userId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }

    res.json({ success: true, conversation });
  } catch (err) {
    console.error("Admin getOneConversation error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch conversation." });
  }
};

/**
 * DELETE /api/admin/conversations/:userId
 * Permanently deletes a user's conversation history.
 */
export const removeConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    await deleteConversation(userId);
    res.json({ success: true, message: `Conversation for ${userId} deleted.` });
  } catch (err) {
    console.error("Admin removeConversation error:", err);
    res.status(500).json({ success: false, message: "Failed to delete conversation." });
  }
};

/**
 * GET /api/admin/stats
 * Returns high-level usage stats.
 */
export const getStats = async (req, res) => {
  try {
    const { total, conversations } = await listConversations({ page: 1, limit: 1000 });

    const totalMessages = conversations.reduce((sum, c) => sum + (c.messageCount || 0), 0);
    const withLeads = conversations.filter((c) => c.lead?.email).length;

    res.json({
      success: true,
      stats: {
        totalConversations: total,
        totalMessages,
        leadsCollected: withLeads,
        mode: process.env.USE_OPENAI === "true" ? "openai" : "mock",
        mongodb: process.env.USE_MONGODB === "true",
      },
    });
  } catch (err) {
    console.error("Admin getStats error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch stats." });
  }
};
