// src/services/openai.service.js
// Handles all OpenAI API communication.
// This file is fully prepared — just set USE_OPENAI=true and add your API key.

import OpenAI from "openai";

// Lazily initialise the client so the app doesn't crash in mock mode
// even if OPENAI_API_KEY is not set.
let openaiClient = null;

function getClient() {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY is not set. Add it to .env and set USE_OPENAI=true."
      );
    }
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

// System prompt — customise this to give your bot a persona and instructions.
const SYSTEM_PROMPT = `You are a helpful, friendly, and professional customer support assistant.
- Keep replies concise (2–4 sentences unless more detail is needed).
- Be warm and approachable.
- If you don't know something, say so honestly and offer alternatives.
- Never make up information about pricing, policies, or features.`;

/**
 * Sends the full conversation history to OpenAI and returns the assistant reply.
 * @param {Array<{role: string, content: string}>} history - Full conversation history
 * @returns {Promise<string>} - The assistant's text reply
 */
export async function getOpenAIReply(history) {
  const client = getClient();
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history, // history already contains role+content pairs
  ];

  const completion = await client.chat.completions.create({
    model,
    messages,
    max_tokens: 512,
    temperature: 0.7,
  });

  const reply = completion.choices[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error("OpenAI returned an empty response.");
  }

  return reply;
}
