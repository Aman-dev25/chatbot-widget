// server.js — Entry point

import "dotenv/config";
import app from "./src/app.js";
import { connectDB } from "./src/data/db.js";

const PORT = process.env.PORT || 5000;

async function start() {
  // Only connect to MongoDB if explicitly enabled
  if (process.env.USE_MONGODB === "true") {
    await connectDB();
  }

  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`   AI mode : ${process.env.USE_OPENAI === "true" ? "🤖 OpenAI" : "🧪 Mock"}`);
    console.log(`   Storage : ${process.env.USE_MONGODB === "true" ? "🍃 MongoDB" : "💾 In-memory"}`);
    console.log(`   Health  : http://localhost:${PORT}/api/health`);
    console.log(`   Test UI : http://localhost:${PORT}/test.html`);
  });
}

start();
