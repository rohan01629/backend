// models/organInventoryModel.js

const mongoose = require('mongoose');

const organInventorySchema = new mongoose.Schema({
  organType: {
    type: String,
    required: true,
  },
  bloodGroup: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  hospital: {
    type: String,  // Changed from ObjectId to String for hospital name
  },
  inOrOut: {
    type: String,
    enum: ['in', 'out'],
    required: true,
  },
  donorReceiverName: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  medicalDocumentUrl: {
    type: String,
  },
  identityProofUrl: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('OrganInventory', organInventorySchema);
