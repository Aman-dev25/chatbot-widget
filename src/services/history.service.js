// src/services/history.service.js
// Unified conversation history layer.
// Reads USE_MONGODB from env and transparently uses either:
//   - In-memory Map (Phase 1, no database needed)
//   - MongoDB via Mongoose (Phase 2, persistent across restarts)
//
// All callers (chat.service.js, admin routes) use only THIS file.

import Conversation from "../models/Conversation.js";

const USE_MONGO = () => process.env.USE_MONGODB === "true";
const MAX_HISTORY = 20;

// ── In-memory fallback (used when USE_MONGODB=false) ─────────────────────────
const memoryStore = new Map(); // { userId => [{ role, content }, ...] }

// ─────────────────────────────────────────────────────────────────────────────
// GET history
// ─────────────────────────────────────────────────────────────────────────────

export async function getHistory(userId) {
  if (USE_MONGO()) {
    const doc = await Conversation.findOne({ userId });
    return doc ? doc.messages : [];
  }

  return memoryStore.get(userId) || [];
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD message
// ─────────────────────────────────────────────────────────────────────────────

export async function addMessage(userId, role, content, meta = {}) {
  if (USE_MONGO()) {
    const update = {
      $push: {
        messages: {
          $each: [{ role, content }],
          $slice: -MAX_HISTORY, // Keep only latest MAX_HISTORY messages
        },
      },
      $set: { lastActiveAt: new Date() },
      $setOnInsert: { userId },
    };

    if (meta.origin) update.$set.origin = meta.origin;

    await Conversation.findOneAndUpdate({ userId }, update, {
      upsert: true,
      new: true,
    });
  } else {
    if (!memoryStore.has(userId)) memoryStore.set(userId, []);
    const history = memoryStore.get(userId);
    history.push({ role, content });
    if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVE lead (name + email captured before first message)
// ─────────────────────────────────────────────────────────────────────────────

export async function saveLead(userId, { name, email }) {
  if (USE_MONGO()) {
    await Conversation.findOneAndUpdate(
      { userId },
      {
        $set: { lead: { name, email, capturedAt: new Date() } },
        $setOnInsert: { userId },
      },
      { upsert: true }
    );
  }
  // In-memory mode: leads aren't persisted (they live in the widget JS only)
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: list all conversations (MongoDB only)
// ─────────────────────────────────────────────────────────────────────────────

export async function listConversations({ page = 1, limit = 20 } = {}) {
  if (!USE_MONGO()) {
    // Return a summary of the in-memory store for the admin panel
    const entries = [...memoryStore.entries()].map(([userId, messages]) => ({
      userId,
      messageCount: messages.length,
      lastActiveAt: null,
      lead: null,
      createdAt: null,
    }));
    return { conversations: entries, total: entries.length, page: 1, pages: 1 };
  }

  const skip = (page - 1) * limit;
  const [conversations, total] = await Promise.all([
    Conversation.find({})
      .sort({ lastActiveAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("userId messageCount lead origin lastActiveAt createdAt")
      .lean(),
    Conversation.countDocuments(),
  ]);

  return { conversations, total, page, pages: Math.ceil(total / limit) };
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: get single conversation with full messages
// ─────────────────────────────────────────────────────────────────────────────

export async function getConversation(userId) {
  if (!USE_MONGO()) {
    return {
      userId,
      messages: memoryStore.get(userId) || [],
      lead: null,
      createdAt: null,
    };
  }
  return Conversation.findOne({ userId }).lean();
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: delete a conversation
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteConversation(userId) {
  if (USE_MONGO()) {
    await Conversation.deleteOne({ userId });
  } else {
    memoryStore.delete(userId);
  }
}
