const express = require('express');
const router = express.Router();
const Subcategory = require('../models/Subcategory');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/subcategories
// @desc    Get all subcategories (optionally filtered by category)
// @access  Public
router.get('/', async (req, res) => {
  try {
    let query = {};
    
    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    const subcategories = await Subcategory.find(query).sort({ name: 1 });
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
    const { name, category } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    const existingSubcategory = await Subcategory.findOne({ 
      name: name?.toLowerCase() || '',
      category: category
    });
    if (existingSubcategory) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory already exists in this category'
      });
    }

    const subcategory = await Subcategory.create({ 
      name: name?.toLowerCase() || '', 
      category 
    });
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
