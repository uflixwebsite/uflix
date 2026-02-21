const express = require('express');
const router = express.Router();
const PincodeSettings = require('../models/PincodeSettings');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/pincode-settings
// @desc    Get all pincode settings (admin only)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    let settings = await PincodeSettings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await PincodeSettings.create(PincodeSettings.getDefaultSettings());
    }
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/pincode-settings
// @desc    Update pincode settings (admin only)
// @access  Private/Admin
router.put('/', protect, admin, async (req, res) => {
  try {
    const { pincodes } = req.body;
    
    if (!Array.isArray(pincodes)) {
      return res.status(400).json({
        success: false,
        message: 'Pincodes must be an array'
      });
    }

    // Validate each pincode entry
    for (const entry of pincodes) {
      if (!entry.pincode || !entry.pincode.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Pincode is required for each entry'
        });
      }
      if (!entry.state || !entry.state.trim()) {
        return res.status(400).json({
          success: false,
          message: 'State is required for each entry'
        });
      }
      if (!entry.city || !entry.city.trim()) {
        return res.status(400).json({
          success: false,
          message: 'City is required for each entry'
        });
      }
      if (!entry.transitDays || !entry.transitDays.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Transit days is required for each entry'
        });
      }
      if (!entry.assemblyDays || !entry.assemblyDays.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Assembly days is required for each entry'
        });
      }
    }

    let settings = await PincodeSettings.findOne();
    if (!settings) {
      settings = await PincodeSettings.create({ pincodes });
    } else {
      settings.pincodes = pincodes;
      await settings.save();
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    // Handle duplicate pincode error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate pincode found. Each pincode must be unique.'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/pincode-settings/pincode
// @desc    Add new pincode entry (admin only)
// @access  Private/Admin
router.post('/pincode', protect, admin, async (req, res) => {
  try {
    const { pincode, state, city, transitDays, assemblyDays } = req.body;

    if (!pincode || !pincode.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Pincode is required'
      });
    }

    if (!state || !state.trim()) {
      return res.status(400).json({
        success: false,
        message: 'State is required'
      });
    }

    if (!city || !city.trim()) {
      return res.status(400).json({
        success: false,
        message: 'City is required'
      });
    }

    if (!transitDays || !transitDays.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Transit days is required'
      });
    }

    if (!assemblyDays || !assemblyDays.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Assembly days is required'
      });
    }

    let settings = await PincodeSettings.findOne();
    if (!settings) {
      settings = await PincodeSettings.create(PincodeSettings.getDefaultSettings());
    }

    // Check for duplicate pincode
    const existingPincode = settings.pincodes.find(p => p.pincode === pincode.trim());
    if (existingPincode) {
      return res.status(400).json({
        success: false,
        message: 'Pincode already exists'
      });
    }

    const newPincode = {
      pincode: pincode.trim(),
      state: state.trim(),
      city: city.trim(),
      transitDays: transitDays.trim(),
      assemblyDays: assemblyDays.trim(),
      enabled: true
    };

    settings.pincodes.push(newPincode);
    await settings.save();

    res.status(201).json({
      success: true,
      data: newPincode
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/pincode-settings/pincode/:index
// @desc    Update specific pincode entry (admin only)
// @access  Private/Admin
router.put('/pincode/:index', protect, admin, async (req, res) => {
  try {
    const { index } = req.params;
    const updateData = req.body;

    let settings = await PincodeSettings.findOne();
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Pincode settings not found'
      });
    }

    if (index < 0 || index >= settings.pincodes.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode index'
      });
    }

    // Update the pincode entry
    Object.assign(settings.pincodes[index], updateData);
    await settings.save();

    res.json({
      success: true,
      data: settings.pincodes[index]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/pincode-settings/pincode/:index
// @desc    Delete specific pincode entry (admin only)
// @access  Private/Admin
router.delete('/pincode/:index', protect, admin, async (req, res) => {
  try {
    const { index } = req.params;

    let settings = await PincodeSettings.findOne();
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Pincode settings not found'
      });
    }

    if (index < 0 || index >= settings.pincodes.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode index'
      });
    }

    const deletedPincode = settings.pincodes[index];
    settings.pincodes.splice(index, 1);
    await settings.save();

    res.json({
      success: true,
      message: 'Pincode deleted successfully',
      data: deletedPincode
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
