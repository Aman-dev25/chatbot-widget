// src/middleware/domainRestriction.js
// Restricts which websites can embed and use the widget API.
// Controlled entirely via ALLOWED_ORIGINS in .env — no code changes needed.
//
// When ALLOWED_ORIGINS is blank, all origins are allowed (open/dev mode).
// In production, set ALLOWED_ORIGINS=https://mysite.com,https://www.mysite.com

/**
 * Builds a dynamic CORS options object based on the ALLOWED_ORIGINS env var.
 * Used by the cors() middleware in app.js.
 */
export function buildCorsOptions() {
  const raw = process.env.ALLOWED_ORIGINS || "";

  // Parse comma-separated origins, trim whitespace, remove empties
  const allowed = raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  if (allowed.length === 0) {
    // No restriction — allow everything (development default)
    return { origin: "*" };
  }

  return {
    origin: (origin, callback) => {
      // Allow server-to-server requests (no Origin header) — e.g. curl, health checks
      if (!origin) return callback(null, true);

      if (allowed.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked: ${origin}`);
        callback(new Error(`Origin ${origin} is not allowed.`));
      }
    },
    credentials: true,
  };
}

/**
 * Express error handler for CORS rejections.
 * Must be added after routes in app.js.
 */
export function corsErrorHandler(err, req, res, next) {
  if (err.message && err.message.includes("not allowed")) {
    return res.status(403).json({ success: false, message: err.message });
  }
  next(err);
}
