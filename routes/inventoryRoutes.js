const express = require("express");
const authMiddelware = require("../middlewares/authMiddelware");
const {
  createInventoryController,
  getInventoryController,
  getDonorsController,
  getHospitalController,
  getOrganisationController,
  getOrganisationForHospitalController,
  getInventoryHospitalController,
  getRecentInventoryController,
} = require("../controllers/inventoryController");

const router = express.Router();

// ROUTES

// ADD INVENTORY || POST
router.post("/create-inventory", authMiddelware, createInventoryController);

// GET ALL BLOOD RECORDS
router.get("/get-inventory", authMiddelware, getInventoryController);

// GET RECENT BLOOD RECORDS
router.get("/get-recent-inventory", authMiddelware, getRecentInventoryController);

// GET HOSPITAL BLOOD RECORDS
router.post("/get-inventory-hospital", authMiddelware, getInventoryHospitalController);

// GET DONOR RECORDS
router.get("/get-donors", authMiddelware, getDonorsController); // ✅ corrected spelling from "donars" to "donors"

// GET HOSPITAL RECORDS
router.get("/get-hospitals", authMiddelware, getHospitalController);

// GET ORGANISATION RECORDS
router.get("/get-organisation", authMiddelware, getOrganisationController); // ✅ spelling: organisation

// GET ORGANISATION RECORDS FOR HOSPITAL
router.get(
  "/get-organisation-for-hospital",
  authMiddelware,
  getOrganisationForHospitalController
);

module.exports = router;
