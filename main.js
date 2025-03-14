const express = require("express");
const cron = require("node-cron");

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 3000;

// Health Check Route (To keep Render service alive)
app.get("/health", (req, res) => {
  res.send("✅ Server is running...");
});

// Cron Job - Runs at 12:34 PM
cron.schedule("36 12 * * *", () => {
  console.log("✅ Cron job executed successfully at 12:34 PM.");
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
