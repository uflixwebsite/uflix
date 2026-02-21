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
      query.category = req.query.category.toLowerCase();
    }

    const subcategories = await Subcategory.find(query).sort({ category: 1, name: 1 });

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

// @route   GET /api/subcategories/grouped
// @desc    Get all subcategories grouped by category
// @access  Public
router.get('/grouped', async (req, res) => {
  try {
    const subcategories = await Subcategory.find().sort({ category: 1, name: 1 });

    const grouped = {};
    subcategories.forEach(sub => {
      if (!grouped[sub.category]) {
        grouped[sub.category] = [];
      }
      grouped[sub.category].push(sub);
    });

    res.json({
      success: true,
      data: grouped
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/subcategories
// @desc    Create new subcategory (single-level)
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required and must be a string'
      });
    }

    if (!category || typeof category !== 'string' || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category is required and must be a string'
      });
    }

    const subcategory = await Subcategory.create({
      name: name.trim().toLowerCase(),
      category: category.trim().toLowerCase()
    });

    res.status(201).json({
      success: true,
      data: subcategory
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This subcategory already exists in this category'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/subcategories/:id
// @desc    Update subcategory
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, category } = req.body;
    const update = {};
    if (name) update.name = name.trim().toLowerCase();
    if (category) update.category = category.trim().toLowerCase();

    const subcategory = await Subcategory.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }
    res.json({
      success: true,
      data: subcategory
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This subcategory already exists in this category'
      });
    }
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
