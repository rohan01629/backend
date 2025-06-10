const express = require("express");
const {
  registerController,
  loginController,
  currentUserController,
} = require("../controllers/authController");
const authMiddelware = require("../middlewares/authMiddelware");

const router = express.Router();

// REGISTER || POST
router.post("/register", registerController);  // Call the registerController

// LOGIN || POST
router.post("/login", loginController);  // Call the loginController

// GET CURRENT USER || GET
router.get("/current-user", authMiddelware, currentUserController);  // Apply authMiddelware to protect this route

module.exports = router;
