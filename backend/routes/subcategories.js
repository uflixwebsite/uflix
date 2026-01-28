const express = require('express');
const router = express.Router();
const Subcategory = require('../models/Subcategory');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/subcategories
// @desc    Get all subcategories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const subcategories = await Subcategory.find().sort({ name: 1 });
    res.json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/subcategories
// @desc    Create new subcategory
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name } = req.body;

    const existingSubcategory = await Subcategory.findOne({ name: name.toLowerCase() });
    if (existingSubcategory) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory already exists'
      });
    }

    const subcategory = await Subcategory.create({ name: name.toLowerCase() });
    res.status(201).json({
      success: true,
      data: subcategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/subcategories/:id
// @desc    Delete subcategory
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const subcategory = await Subcategory.findByIdAndDelete(req.params.id);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }
    res.json({
      success: true,
      message: 'Subcategory deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
