const JWT = require("jsonwebtoken");
const User = require('../models/userModel');
module.exports = async (req, res, next) => {
  try {
    // Log to see if token is being passed correctly
    console.log("Authorization Header:", req.headers["authorization"]);

    // Get token from the Authorization header
    const token = req.headers["authorization"]?.split(" ")[1]; // Safe check for token
    
    if (!token) {
      return res.status(401).send({
        success: false,
        message: "No token provided",
      });
    }

    // Verify token
    JWT.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        return res.status(401).send({
          success: false,
          message: "Auth Failed",
        });
      } else {
        // Log the decoded token to verify userId
        console.log("Decoded Token:", decode);

        // Attach user info to the request object for further use in controllers
        req.user = { userId: decode.userId };
        next(); // Proceed to the next middleware/controller
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message: "Auth Failed",
      error,
    });

  }
  
};
