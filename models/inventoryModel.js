const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    inventoryType: {
      type: String,
      required: [true, "inventory type require"],
      enum: ["in", "out"],
    },
    bloodGroup: {
      type: String,
      required: [true, "blood group is require"],
      enum: ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"],
    },
    quantity: {
      type: Number,
      required: [true, "blood quantity is require"],  // fixed typo here as well
    },
    email: {
      type: String,
      required: [true, "Donar Email is Required"],
    },
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",  // <-- Fixed here
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",  // <-- Fixed here
      required: function () {
        return this.inventoryType === "out";
      },
    },
    donar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",  // <-- Fixed here
      required: function () {
        return this.inventoryType === "in";
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);
