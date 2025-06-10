const inventoryModel = require("../models/inventoryModel");
const mongoose = require("mongoose");

// Controller to fetch blood group details
const bloodGroupDetailsContoller = async (req, res) => {
  try {
    const bloodGroups = ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"];
    const bloodGroupData = [];
    
    // Check if the user is an admin
    const isAdmin = req.user.role === "admin";
    // If not an admin, use the organization ID; else, admins will see all data
    const organisation = !isAdmin
      ? new mongoose.Types.ObjectId(req.user.userId)
      : null;

    await Promise.all(
      bloodGroups.map(async (bloodGroup) => {
        const matchIn = {
          bloodGroup,
          inventoryType: "in", // For donations (inbound)
        };
        const matchOut = {
          bloodGroup,
          inventoryType: "out", // For usage (outbound)
        };

        // If not an admin, filter by the user's organisation
        if (!isAdmin) {
          matchIn.organisation = organisation;
          matchOut.organisation = organisation;
        }

        // Aggregate total inbound donations
        const totalIn = await inventoryModel.aggregate([
          { $match: matchIn },
          { $group: { _id: null, total: { $sum: "$quantity" } } },
        ]);

        // Aggregate total outbound usage
        const totalOut = await inventoryModel.aggregate([
          { $match: matchOut },
          { $group: { _id: null, total: { $sum: "$quantity" } } },
        ]);

        // Calculate the available blood (total in - total out)
        const availableBlood =
          (totalIn.length > 0 ? totalIn[0].total : 0) -
          (totalOut.length > 0 ? totalOut[0].total : 0);

        // Push the result to the bloodGroupData array
        bloodGroupData.push({
          bloodGroup,
          totalIn: totalIn.length > 0 ? totalIn[0].total : 0,
          totalOut: totalOut.length > 0 ? totalOut[0].total : 0,
          availableBlood,
        });
      })
    );

    return res.status(200).json({
      success: true,
      message: "Blood Group Data Fetched Successfully",
      bloodGroupData,
    });
  } catch (error) {
    console.log("Error in blood group analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Error in Blood Group Data Analytics API",
      error: error.message,
    });
  }
};

// Controller to fetch recent blood transactions (inventory)
const getRecentInventory = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const filter = isAdmin
      ? {} // No filter: get all inventory
      : { organisation: new mongoose.Types.ObjectId(req.user.userId) };

    console.log("Filter for inventory query:", filter); // Log the filter

    const inventoryData = await inventoryModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(10);

    console.log("Inventory data:", inventoryData); // Log the result

    return res.status(200).json({
      success: true,
      message: "Recent Inventory Fetched Successfully",
      inventory: inventoryData,
    });
  } catch (error) {
    console.log("Error in fetching recent inventory:", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching recent inventory data",
      error: error.message,
    });
  }
};


module.exports = { bloodGroupDetailsContoller, getRecentInventory };
