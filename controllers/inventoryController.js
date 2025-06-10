const mongoose = require("mongoose");
const inventoryModel = require("../models/inventoryModel");
const userModel = require("../models/userModel");

// CREATE INVENTORY
const createInventoryController = async (req, res) => {
  try {
    const { email, inventoryType, bloodGroup, quantity, organisation: orgId } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({ success: false, message: "User Not Found" });
    }

    const organisation = new mongoose.Types.ObjectId(orgId);

    if (inventoryType === "out") {
      const requestedBloodGroup = bloodGroup;
      const requestedQuantity = quantity;

      // Calculate total "in" blood
      const totalIn = (await inventoryModel.aggregate([
        { $match: { organisation, inventoryType: "in", bloodGroup: requestedBloodGroup } },
        { $group: { _id: null, total: { $sum: "$quantity" } } }
      ]))[0]?.total || 0;

      // Calculate total "out" blood
      const totalOut = (await inventoryModel.aggregate([
        { $match: { organisation, inventoryType: "out", bloodGroup: requestedBloodGroup } },
        { $group: { _id: null, total: { $sum: "$quantity" } } }
      ]))[0]?.total || 0;

      const availableStock = totalIn - totalOut;

      if (availableStock < requestedQuantity) {
        return res.status(400).send({
          success: false,
          message: `Insufficient stock: Only ${availableStock}ml of ${requestedBloodGroup.toUpperCase()} is available.`,
        });
      }

      // Add hospital ID
      req.body.hospital = user._id;
    } else {
      // Add donor ID
      req.body.donar = user._id;
    }

    // Save the inventory entry
    const inventory = new inventoryModel(req.body);
    await inventory.save();

    return res.status(201).send({
      success: true,
      message: "New blood inventory record created successfully.",
    });
  } catch (error) {
    console.error("Create Inventory Error:", error);
    return res.status(500).send({
      success: false,
      message: "Server Error: Could not create inventory",
      error: error.message,
    });
  }
};


// GET ALL BLOOD RECORDS
const getInventoryController = async (req, res) => {
  try {
    const inventory = await inventoryModel
      .find({ organisation: req.body.userId })
      .populate("donar")
      .populate("hospital")
      .sort({ createdAt: -1 });

    return res.status(200).send({ success: true, message: "Get all records successfully", inventory });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, message: "Error In Get All Inventory", error });
  }
};

// GET HOSPITAL BLOOD RECORDS
const getInventoryHospitalController = async (req, res) => {
  try {
    const inventory = await inventoryModel
      .find(req.body.filters)
      .populate("donar")
      .populate("hospital")
      .populate("organisation")
      .sort({ createdAt: -1 });

    return res.status(200).send({ success: true, message: "Get hospital consumer records successfully", inventory });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, message: "Error In Get Consumer Inventory", error });
  }
};

// GET RECENT BLOOD RECORDS
const getRecentInventoryController = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";

    const filter = isAdmin
      ? {} // Admins see all records
      : { organisation: new mongoose.Types.ObjectId(req.user.userId) };

    const inventory = await inventoryModel
      .find(filter)
      .populate("organisation", "email") // Populate email for display
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).send({
      success: true,
      message: "Recent Inventory Data",
      inventory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Recent Inventory API",
      error,
    });
  }
};




// ✅ GET DONORS (Corrected)
const getDonorsController = async (req, res) => {
  try {
    const organisation = req.body.userId;
    const donorIds = await inventoryModel.distinct("donar", { organisation });
    const donors = await userModel.find({ _id: { $in: donorIds } });

    return res.status(200).send({ success: true, message: "Donor Record Fetched Successfully", donors });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, message: "Error in Donor records", error });
  }
};

// GET HOSPITAL RECORDS
const getHospitalController = async (req, res) => {
  try {
    const organisation = req.body.userId;
    const hospitalIds = await inventoryModel.distinct("hospital", { organisation });
    const hospitals = await userModel.find({ _id: { $in: hospitalIds } });

    return res.status(200).send({ success: true, message: "Hospitals Data Fetched Successfully", hospitals });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, message: "Error In Get Hospital API", error });
  }
};

// GET ORGANISATION RECORDS
const getOrganisationController = async (req, res) => {
  try {
    const donor = req.body.userId;
    const orgIds = await inventoryModel.distinct("organisation", { donar: donor });
    const organisations = await userModel.find({ _id: { $in: orgIds } });

    return res.status(200).send({ success: true, message: "Organisation Data Fetched Successfully", organisations });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, message: "Error In Organisation API", error });
  }
};

// GET ORGANISATION FOR HOSPITAL
const getOrganisationForHospitalController = async (req, res) => {
  try {
    const hospital = req.body.userId;
    const orgIds = await inventoryModel.distinct("organisation", { hospital });
    const organisations = await userModel.find({ _id: { $in: orgIds } });

    return res.status(200).send({ success: true, message: "Hospital Organisation Data Fetched Successfully", organisations });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, message: "Error In Hospital Organisation API", error });
  }
};


module.exports = {
  createInventoryController,
  getInventoryController,
  getDonorsController, // ✅ Export correctly
  getHospitalController,
  getOrganisationController,
  getOrganisationForHospitalController,
  getInventoryHospitalController,
  getRecentInventoryController,
};
