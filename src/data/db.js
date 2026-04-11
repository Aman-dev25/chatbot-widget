// src/data/db.js
// Manages the MongoDB connection lifecycle.
// Called once at startup; Mongoose handles reconnects automatically.

import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/chatbot";

  try {
    await mongoose.connect(uri, {
      // These options silence deprecation warnings in Mongoose 8+
      serverSelectionTimeoutMS: 5000, // fail fast if Mongo isn't reachable
    });

    isConnected = true;
    console.log("🍃 MongoDB connected:", mongoose.connection.host);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.error("   Hint: Is MongoDB running? Check MONGODB_URI in .env");
    // Exit so the process manager (PM2, Railway, etc.) can restart cleanly
    process.exit(1);
  }
}

// Graceful shutdown — close connection when Node exits
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🍃 MongoDB disconnected on app termination");
  process.exit(0);
});
