// routes/organRoutes.js or similar
const express = require('express');
const router = express.Router();
const OrganInventory = require('../models/OrganInventoryModel');
const upload = require('../middlewares/multer'); // import your custom multer config

// PUT: Update Organ
router.put(
  '/update-organ/:id',
  upload.fields([
    { name: 'medicalDocument', maxCount: 1 },
    { name: 'identityProof', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const organId = req.params.id;
      const updates = { ...req.body };

      // Convert quantity to Number if present
      if (updates.quantity) updates.quantity = Number(updates.quantity);

      // Add uploaded file paths
      if (req.files.medicalDocument) {
        updates.medicalDocument = req.files.medicalDocument[0].path;
      }
      if (req.files.identityProof) {
        updates.identityProof = req.files.identityProof[0].path;
      }

      const updatedOrgan = await OrganInventory.findByIdAndUpdate(organId, updates, {
        new: true,
        runValidators: true,
      });

      if (!updatedOrgan) {
        return res.status(404).json({ success: false, message: 'Organ not found' });
      }

      res.json({ success: true, data: updatedOrgan });
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

module.exports = router;
