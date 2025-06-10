const express = require("express");
const authMiddelware = require("../middlewares/authMiddelware");
const {
  bloodGroupDetailsContoller,getRecentInventory,
} = require("../controllers/analyticsController");

const router = express.Router();

//routes

//GET BLOOD DATA
router.get("/bloodGroups-data", authMiddelware, bloodGroupDetailsContoller);

// Route to get recent blood inventory transactions
router.get("/get-recent-inventory", authMiddelware, getRecentInventory);


module.exports = router;
