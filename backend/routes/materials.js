const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/materials
// @desc    Get all materials
// @access  Public
router.get('/', async (req, res) => {
  try {
    const materials = await Material.find().sort({ name: 1 });
    res.json({
      success: true,
      data: materials
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/materials
// @desc    Create new material
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Material name is required'
      });
    }

    // Check for existing material
    const existing = await Material.findOne({ name: name.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Material "${name}" already exists`
      });
    }

    const material = await Material.create({ 
      name: name.trim().toLowerCase()
    });
    res.status(201).json({
      success: true,
      data: material
    });
  } catch (error) {
    // Handle duplicate key error from unique index
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This material already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/materials/:id
// @desc    Update material
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name } = req.body;
    const update = {};
    if (name) update.name = name.trim().toLowerCase();

    const material = await Material.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }
    res.json({
      success: true,
      data: material
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This material already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/materials/:id
// @desc    Delete material
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }
    res.json({
      success: true,
      message: 'Material deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
