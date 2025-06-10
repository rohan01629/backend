// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/userModel"); // adjust path as needed

// GET /api/v1/users?role=donar
router.get("/", async (req, res) => {
  try {
    const role = req.query.role;
    const filter = role ? { role } : {};

    const users = await User.find(filter).select("-password"); // exclude passwords
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error("Error fetching users by role:", err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

module.exports = router;
