// src/routes/chat.routes.js

import { Router } from "express";
import { healthCheck, sendMessage } from "../controllers/chat.controller.js";
import { captureLead } from "../controllers/lead.controller.js";
import { chatLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// GET /api/health
router.get("/health", healthCheck);

// POST /api/chat — rate limited
router.post("/chat", chatLimiter, sendMessage);

// POST /api/lead — lead capture before first message
router.post("/lead", chatLimiter, captureLead);

export default router;
