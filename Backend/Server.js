const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cron = require("node-cron");

dotenv.config();
const app = express();

// ✅ Allow only specific frontend domains
const corsOptions = {
  origin: [
    "https://foodapp-frontend-pbxh.onrender.com",
    "https://foodapp-admin-qxth.onrender.com"
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors()); // Handle preflight requests


// ✅ Handle Preflight Requests (Important!)

app.use(bodyParser.json());

// ✅ MongoDB Connection
const MONGO_URI =
  "mongodb+srv://keerthivasan903:vasan2282@cluster0.wjnau.mongodb.net/foodApp?retryWrites=true&w=majority";
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ User Schema & Model
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true, match: [/^\d{10}$/, "Phone number must be exactly 10 digits"] },
    response: { type: String, default: null },
    responseTime: { type: Date, default: null },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// ✅ Admin Data
const admin = { id: 0, name: "Admin" };

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

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

    if (parseInt(adminId) !== admin.id) {
      return res.status(403).json({ message: "You do not have permission to add users." });
    }
    if (!name || !phone) {
      return res.status(400).json({ message: "User name and phone number are required." });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "Phone number already exists.", existingUser });
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

    if (parseInt(adminId) !== admin.id) return res.status(403).json({ message: "You do not have permission to reset responses." });

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

    if (parseInt(adminId) !== admin.id) return res.status(403).json({ message: "You do not have permission to delete users." });

    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: `User ${user.name} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

// ✅ Cron Job to Reset Responses Every Day at 10:45 AM (Server Time)
cron.schedule("45 10 * * *", async () => {
  try {
    await User.updateMany({}, { response: null, responseTime: null });
    console.log("✅ All user responses reset successfully.");
  } catch (error) {
    console.error("❌ Error resetting user responses:", error);
  }
});

app.post("/api/admin/reset-all-to-not", async (req, res) => {
  try {
    const { adminId } = req.body;

    if (parseInt(adminId) !== admin.id) {
      return res.status(403).json({ message: "You do not have permission to reset all responses." });
    }

    await User.updateMany({}, { response: "I Am Not", responseTime: new Date() });

    res.json({ message: 'All user responses have been set to "I Am Not".' });
  } catch (error) {
    res.status(500).json({ message: "Error resetting all responses" });
  }
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
