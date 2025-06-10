const userModel = require("../models/userModel");

module.exports = async (req, res, next) => {
  try {
    // Check if userId is available
    if (!req.user?.userId) {
      return res.status(400).send({
        success: false,
        message: "User ID is missing",
      });
    }

    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Check admin role
    if (user?.role !== "admin") {
      return res.status(403).send({
        success: false,
        message: "Access denied, admin privileges required",
      });
    } else {
      next(); // User is an admin, proceed to the next middleware/controller
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Auth Failed, ADMIN API",
      error,
    });
  }
};
