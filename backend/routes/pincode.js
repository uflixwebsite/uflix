const express = require('express');
const PincodeSettings = require('../models/PincodeSettings');

const router = express.Router();

// Get pincode data
router.get('/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    
    // Validate pincode format
    if (!pincode || !/^\d+$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pincode format'
      });
    }

    // Get pincode settings from database
    let settings = await PincodeSettings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = await PincodeSettings.create(PincodeSettings.getDefaultSettings());
    }

    // Function to get pincode data by checking first 2-3 digits
    function getPincodeData(code) {
      if (!code || code.length < 2) {
        return null;
      }

      const enabledPincodes = settings.pincodes.filter(p => p.enabled);

      // Try exact 3-digit match first
      if (code.length >= 3) {
        const threeDigitPrefix = code.substring(0, 3);
        const match = enabledPincodes.find(p => p.pincode === threeDigitPrefix);
        if (match) {
          return match;
        }
      }

      // Fall back to 2-digit match
      const twoDigitPrefix = code.substring(0, 2);
      const match = enabledPincodes.find(p => p.pincode === twoDigitPrefix);
      if (match) {
        return match;
      }

      return null;
    }

    const result = getPincodeData(pincode);
    
    if (result) {
      res.json({
        success: true,
        data: {
          state: result.state,
          city: result.city,
          transitDays: result.transitDays,
          assemblyDays: result.assemblyDays
        }
      });
    } else {
      res.json({
        success: false,
        message: 'Delivery not available in this area'
      });
    }
  } catch (error) {
    console.error('Error fetching pincode data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
