// src/app.js — Phase 2 Express app

import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import chatRoutes from "./routes/chat.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { buildCorsOptions, corsErrorHandler } from "./middleware/domainRestriction.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Trust proxy headers so rate limiter gets the real IP behind nginx/Railway/etc.
app.set("trust proxy", 1);

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors(buildCorsOptions()));
app.use(express.json());
app.use(express.static(join(__dirname, "../public")));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api", chatRoutes);
app.use("/api/admin", adminRoutes);

// ── CORS error handler (must come after routes) ───────────────────────────
app.use(corsErrorHandler);

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ success: false, message: "Internal server error" });
});

export default app;
