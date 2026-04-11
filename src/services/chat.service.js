// src/services/chat.service.js  (Phase 2 — updated)
// Central orchestrator: routes to mock or OpenAI, delegates history to history.service.

import { getMockReply } from "./mock.service.js";
import { getOpenAIReply } from "./openai.service.js";
import { getHistory, addMessage } from "./history.service.js";

/**
 * Main entry point called by the controller.
 * @param {string} userId
 * @param {string} message
 * @param {object} meta - optional metadata (origin URL, etc.)
 * @returns {{ reply: string, mode: "mock" | "openai" }}
 */
export async function getReply(userId, message, meta = {}) {
  const useOpenAI = process.env.USE_OPENAI === "true";

  // Persist user message
  await addMessage(userId, "user", message, meta);

  let reply;
  let mode;

  if (useOpenAI) {
    const history = await getHistory(userId);
    reply = await getOpenAIReply(history);
    mode = "openai";
  } else {
    reply = getMockReply(message);
    mode = "mock";
  }

  // Persist bot reply
  await addMessage(userId, "assistant", reply);

  return { reply, mode };
}
