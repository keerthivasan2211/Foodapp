const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const MONGO_URI =
  "mongodb+srv://keerthivasan903:vasan2282@cluster0.wjnau.mongodb.net/foodApp?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
    },
    response: { type: String, default: null },
    responseTime: { type: Date, default: null },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

const admin = { id: 0, name: "Admin" };

// ✅ User Login
app.post("/api/login", async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ phone });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Get All Users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Get a User's Response
app.get("/api/users/response/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ response: user.response || null });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Submit a Response
app.post("/api/users/response", async (req, res) => {
  try {
    const { userId, response } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const currentTime = Date.now();
    if (user.response && currentTime - new Date(user.responseTime).getTime() < 24 * 60 * 60 * 1000) {
      return res.status(400).json({ message: "You have already responded within the last 24 hours." });
    }

    user.response = response;
    user.responseTime = new Date();
    await user.save();

    res.json({ message: "Response saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving response" });
  }
});

// ✅ Get Admin Dashboard Data
app.get("/api/admin", async (req, res) => {
  try {
    const users = await User.find();
    const iAmInCount = users.filter((user) => user.response === "I Am In").length;

    res.json({ users, iAmInCount });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Add a User (Admin Only)
app.post("/api/admin/add-user", async (req, res) => {
  try {
    const { adminId, name, phone } = req.body;

    if (adminId !== admin.id) {
      return res.status(403).json({ message: "You do not have permission to add users." });
    }
    if (!name || !phone) {
      return res.status(400).json({ message: "User name and phone number are required." });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        message: "Phone number already exists.",
        existingUser,
      });
    }

    const newUser = new User({ name, phone });
    await newUser.save();

    res.status(201).json({ message: `User ${name} added successfully.` });
  } catch (error) {
    res.status(500).json({ message: "Error adding user" });
  }
});

// ✅ Reset User Response (Admin Only)
app.post("/api/admin/reset-response", async (req, res) => {
  try {
    const { adminId, userId } = req.body;

    if (adminId !== admin.id) return res.status(403).json({ message: "You do not have permission to reset responses." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.response = null;
    user.responseTime = null;
    await user.save();

    res.json({ message: "User response reset successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error resetting response" });
  }
});

// ✅ Delete a User (Admin Only)
app.delete("/api/admin/delete-user/:userId", async (req, res) => {
  try {
    const { adminId } = req.body;
    const { userId } = req.params;

    if (adminId !== admin.id) return res.status(403).json({ message: "You do not have permission to delete users." });

    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: `User ${user.name} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

// ✅ Schedule Reset Task Without Cron (Every Day at 10:01:20 PM)
const scheduleResetTask = () => {
  const now = new Date();
  const targetTime = new Date();

  targetTime.setHours(22, 1, 20, 0); // 10:01:20 PM (24-hour format)

  // If time has already passed today, schedule for tomorrow
  if (now > targetTime) {
    targetTime.setDate(targetTime.getDate() + 1);
  }

  const timeUntilExecution = targetTime - now; // Calculate delay in milliseconds

  console.log(`Next reset task scheduled at: ${targetTime}`);

  setTimeout(async () => {
    try {
      await User.updateMany({}, { response: null, responseTime: null });
      console.log("✅ All user responses reset successfully at 10:01:20 PM.");
    } catch (error) {
      console.error("❌ Error resetting user responses:", error);
    }

    // Re-schedule for the next day
    scheduleResetTask();
  }, timeUntilExecution);
};

// Start the scheduler
scheduleResetTask();

// ✅ Start the Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
