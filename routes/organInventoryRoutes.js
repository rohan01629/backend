const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const OrganInventory = require('../models/OrganInventoryModel');
const multer = require('multer');

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images (jpg, png) and PDFs are allowed'));
  },
});

console.log('Organ Inventory Routes Loaded');

// ADD ORGAN (IN or OUT)
router.post(
  '/add-organ',
  upload.fields([
    { name: 'medicalDocument', maxCount: 1 },
    { name: 'identityProof', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        organType,
        bloodGroup,
        quantity,
        donor,
        hospital,
        inOrOut,
        donorReceiverName,
        age,
        email,
        phone,
      } = req.body;

      // Validate required fields
      const missingFields = [];
      if (!organType) missingFields.push('organType');
      if (!bloodGroup) missingFields.push('bloodGroup');
      if (!quantity) missingFields.push('quantity');
      if (!inOrOut) missingFields.push('inOrOut');
      if (!donorReceiverName) missingFields.push('donorReceiverName');
      if (!age) missingFields.push('age');
      if (!email) missingFields.push('email');
      if (!phone) missingFields.push('phone');

      if (missingFields.length) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: ' + missingFields.join(', '),
        });
      }

      // Validate quantity and age
      if (isNaN(quantity) || Number(quantity) < 1) {
        return res.status(400).json({ success: false, message: 'Quantity must be a number greater than 0' });
      }
      if (isNaN(age) || Number(age) < 0) {
        return res.status(400).json({ success: false, message: 'Age must be a valid number' });
      }

      // Validate donor ID if provided
      let donorId;
      if (donor) {
        try {
          donorId = new mongoose.Types.ObjectId(donor);
        } catch (err) {
          return res.status(400).json({ success: false, message: 'Invalid donor ID' });
        }
      }

      // File URLs if uploaded
      const medicalDocumentUrl = req.files?.medicalDocument
        ? '/uploads/' + req.files.medicalDocument[0].filename
        : '';
      const identityProofUrl = req.files?.identityProof
        ? '/uploads/' + req.files.identityProof[0].filename
        : '';

      const newOrgan = new OrganInventory({
        organType,
        bloodGroup,
        quantity: Number(quantity),
        inOrOut,
        donorReceiverName,
        age: Number(age),
        email,
        phone,
        medicalDocumentUrl,
        identityProofUrl,
        donor: donorId,
        hospital: hospital || undefined,
      });

      const savedOrgan = await newOrgan.save();

      return res.status(201).json({
        success: true,
        message: 'Organ added successfully',
        data: savedOrgan,
      });
    } catch (error) {
      console.error('Add Organ Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error adding organ',
        error: error.message,
      });
    }
  }
);

// GET ALL ORGAN INVENTORY TRANSACTIONS
router.get('/get-organ', async (req, res) => {
  try {
    const organs = await OrganInventory.find().populate('donor', 'name email');
    res.status(200).json({ success: true, data: organs });
  } catch (error) {
    console.error('Get Organ Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching organs', error: error.message });
  }
});

// ORGAN ANALYTICS - aggregation by organType
router.get('/organ-analytics', async (req, res) => {
  try {
    const analytics = await OrganInventory.aggregate([
      {
        $group: {
          _id: '$organType',
          totalIn: {
            $sum: { $cond: [{ $eq: ['$inOrOut', 'in'] }, '$quantity', 0] },
          },
          totalOut: {
            $sum: { $cond: [{ $eq: ['$inOrOut', 'out'] }, '$quantity', 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          organType: '$_id',
          totalIn: 1,
          totalOut: 1,
          available: { $subtract: ['$totalIn', '$totalOut'] },
        },
      },
    ]);
    res.status(200).json({ success: true, data: analytics });
  } catch (err) {
    console.error('Organ Analytics Error:', err);
    res.status(500).json({ success: false, message: 'Error fetching analytics', error: err.message });
  }
});

// DELETE organ transaction
router.delete('/delete/:id', async (req, res) => {
  try {
    const organ = await OrganInventory.findByIdAndDelete(req.params.id);
    if (!organ) {
      return res.status(404).json({ success: false, message: 'Organ not found' });
    }
    res.status(200).json({ success: true, message: 'Organ deleted successfully' });
  } catch (error) {
    console.error('Delete Organ Error:', error);
    res.status(500).json({ success: false, message: 'Error deleting organ', error: error.message });
  }
});

// UPDATE organ transaction
router.put(
  '/update-organ/:id',
  upload.fields([
    { name: 'medicalDocument', maxCount: 1 },
    { name: 'identityProof', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const organId = req.params.id;

      console.log('Update request body:', req.body);
      console.log('Update request files:', req.files);

      const organ = await OrganInventory.findById(organId);
      if (!organ) {
        return res.status(404).json({ success: false, message: 'Organ not found' });
      }

      // Validate quantity and age
      if (!req.body.quantity || isNaN(req.body.quantity) || Number(req.body.quantity) < 1) {
        return res.status(400).json({ success: false, message: 'Quantity must be a number greater than 0' });
      }
      if (!req.body.age || isNaN(req.body.age) || Number(req.body.age) < 0) {
        return res.status(400).json({ success: false, message: 'Age must be a valid number' });
      }

      // Prepare update data
      const updateData = {
        organType: req.body.organType,
        bloodGroup: req.body.bloodGroup,
        quantity: Number(req.body.quantity),
        inOrOut: req.body.inOrOut,
        donorReceiverName: req.body.donorReceiverName,
        age: Number(req.body.age),
        email: req.body.email,
        phone: req.body.phone,
        hospital: req.body.hospital || undefined,
      };

      // Optional donor field
      if (req.body.donor) {
        try {
          updateData.donor = new mongoose.Types.ObjectId(req.body.donor);
        } catch {
          return res.status(400).json({ success: false, message: 'Invalid donor ID' });
        }
      }

      // Handle files if uploaded
      if (req.files?.medicalDocument) {
        updateData.medicalDocumentUrl = '/uploads/' + req.files.medicalDocument[0].filename;
      }
      if (req.files?.identityProof) {
        updateData.identityProofUrl = '/uploads/' + req.files.identityProof[0].filename;
      }

      // Update and save
      Object.assign(organ, updateData);

      const savedOrgan = await organ.save();

      return res.status(200).json({
        success: true,
        message: 'Organ updated successfully',
        data: savedOrgan,
      });
    } catch (error) {
      console.error('Update Organ Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating organ',
        error: error.message,
      });
    }
  }
);

module.exports = router;
