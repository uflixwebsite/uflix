const express = require('express');
const fs = require('fs').promises;
const path = require('path');

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

    // Read pincode data
    const pincodeDataPath = path.join(__dirname, '../data/pincodeData.json');
    const rawData = await fs.readFile(pincodeDataPath, 'utf8');
    const pincodeData = JSON.parse(rawData);

    // Function to get pincode data by checking first 2-3 digits
    function getPincodeData(code) {
      if (!code || code.length < 2) {
        return null;
      }

      // Try exact 3-digit match first
      if (code.length >= 3) {
        const threeDigitPrefix = code.substring(0, 3);
        if (pincodeData[threeDigitPrefix]) {
          return pincodeData[threeDigitPrefix];
        }
      }

      // Fall back to 2-digit match
      const twoDigitPrefix = code.substring(0, 2);
      if (pincodeData[twoDigitPrefix]) {
        return pincodeData[twoDigitPrefix];
      }

      return null;
    }

    const result = getPincodeData(pincode);
    
    if (result) {
      res.json({
        success: true,
        data: result
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
