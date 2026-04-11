// src/utils/validators.js
// Input validation helpers to keep controllers clean.

/**
 * Validates the body of a POST /api/chat request.
 * @param {object} body - req.body
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateChatRequest(body) {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object." };
  }

  const { userId, message } = body;

  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    return { valid: false, error: "userId is required and must be a non-empty string." };
  }

  if (!message || typeof message !== "string" || message.trim() === "") {
    return { valid: false, error: "message is required and must be a non-empty string." };
  }

  if (message.length > 2000) {
    return { valid: false, error: "message must be 2000 characters or fewer." };
  }

  return { valid: true };
}
