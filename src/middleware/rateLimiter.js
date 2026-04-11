// src/middleware/rateLimiter.js

import rateLimit from "express-rate-limit";

/**
 * Chat rate limiter — applied to POST /api/chat and POST /api/lead.
 * Default: 30 requests per 60 seconds per IP.
 */
export const chatLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || "30", 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many messages. Please slow down and try again in a minute.",
  },
});

/**
 * Admin rate limiter — stricter, for admin API endpoints.
 * 60 requests per 5 minutes per IP.
 */
export const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Admin rate limit exceeded." },
});
