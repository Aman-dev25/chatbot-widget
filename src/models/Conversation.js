// src/models/Conversation.js
// MongoDB schema for persisting chat history per user.
// Each document represents one user's full conversation.

import mongoose from "mongoose";

// Individual message schema (embedded inside Conversation)
const MessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 4000,
    },
  },
  { _id: false, timestamps: false }
);

// Lead info captured before the first message
const LeadSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    capturedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Main conversation document — one per userId
const ConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
    lead: {
      type: LeadSchema,
      default: null,
    },
    // Tracks which page/site the widget was on
    origin: { type: String, default: "" },
    // Total message count (denormalised for quick admin queries)
    messageCount: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true } // adds createdAt + updatedAt
);

// Keep messages array capped at 20 items before save
ConversationSchema.pre("save", function (next) {
  const MAX = 20;
  if (this.messages.length > MAX) {
    this.messages = this.messages.slice(-MAX);
  }
  this.messageCount = this.messages.length;
  this.lastActiveAt = new Date();
  next();
});

export default mongoose.model("Conversation", ConversationSchema);
