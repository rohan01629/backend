// controllers/organInventoryController.js

const Organ = require('../models/OrganInventoryModel');

exports.getOrgans = async (req, res) => {
  try {
    const organs = await Organ.find().populate('donor', 'name _id');
    res.status(200).json({ success: true, data: organs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addOrgan = async (req, res) => {
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

    // Extract uploaded file paths
    const medicalDocumentUrl = req.files?.medicalDocument?.[0]?.path || '';
    const identityProofUrl = req.files?.identityProof?.[0]?.path || '';

    const organ = new Organ({
      organType,
      bloodGroup,
      quantity,
      donor: donor || undefined,
      hospital: hospital || undefined,
      inOrOut,
      donorReceiverName,
      age,
      email,
      phone,
      medicalDocumentUrl,
      identityProofUrl,
    });

    await organ.save();

    res.status(201).json({ success: true, data: organ });
  } catch (err) {
    console.error('Add Organ Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteOrgan = async (req, res) => {
  try {
    const organ = await Organ.findByIdAndDelete(req.params.id);
    if (!organ) {
      return res.status(404).json({ success: false, message: "Organ not found" });
    }
    res.status(200).json({ success: true, message: "Organ deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOrgan = async (req, res) => {
  try {
    const organId = req.params.id;

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

    const updateData = {
      organType,
      bloodGroup,
      quantity,
      donor: donor || undefined,
      hospital: hospital || undefined,
      inOrOut,
      donorReceiverName,
      age,
      email,
      phone,
    };

    if (req.files) {
      if (req.files.medicalDocument && req.files.medicalDocument[0]) {
        updateData.medicalDocumentUrl = req.files.medicalDocument[0].path;
      }
      if (req.files.identityProof && req.files.identityProof[0]) {
        updateData.identityProofUrl = req.files.identityProof[0].path;
      }
    }

    const updatedOrgan = await Organ.findByIdAndUpdate(
      organId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedOrgan) {
      return res.status(404).json({ success: false, message: 'Organ not found' });
    }

    res.status(200).json({ success: true, data: updatedOrgan });
  } catch (err) {
    console.error('Update Organ Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
