// src/middleware/adminAuth.js
// Simple Bearer token authentication for admin routes.
// Set ADMIN_TOKEN in .env to a long random string.
//
// Usage: curl -H "Authorization: Bearer your_token" http://localhost:5000/api/admin/conversations

export function adminAuth(req, res, next) {
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken || adminToken === "changeme_use_a_long_random_string") {
    console.warn("⚠️  ADMIN_TOKEN is not set or is using the default value. Admin routes are disabled.");
    return res.status(503).json({
      success: false,
      message: "Admin panel is not configured. Set ADMIN_TOKEN in your .env file.",
    });
  }

  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token || token !== adminToken) {
    return res.status(401).json({ success: false, message: "Unauthorized. Invalid or missing admin token." });
  }

  next();
}
