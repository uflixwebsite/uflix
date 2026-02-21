const express = require('express');
const router = express.Router();
const NavbarItem = require('../models/NavbarItem');
const MegaMenuCategory = require('../models/MegaMenuCategory');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/mega-menu/navbar
// @desc    Get all navbar items with mega menu data
// @access  Public
router.get('/navbar', async (req, res) => {
  try {
    const navbarItems = await NavbarItem.find()
      .populate({
        path: 'megaMenuCategories',
        populate: {
          path: 'blocks'
        }
      })
      .sort({ order: 1, title: 1 });

    res.json({
      success: true,
      data: navbarItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/mega-menu/navbar/:id
// @desc    Get single navbar item
// @access  Public
router.get('/navbar/:id', async (req, res) => {
  try {
    const navbarItem = await NavbarItem.findById(req.params.id)
      .populate({
        path: 'megaMenuCategories',
        populate: {
          path: 'blocks'
        }
      });

    if (!navbarItem) {
      return res.status(404).json({
        success: false,
        message: 'Navbar item not found'
      });
    }

    res.json({
      success: true,
      data: navbarItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/mega-menu/navbar
// @desc    Update multiple navbar items
// @access  Private/Admin
router.put('/navbar', protect, admin, async (req, res) => {
  try {
    const { items } = req.body;

    // Update each item with its order
    for (const item of items) {
      await NavbarItem.findByIdAndUpdate(item._id, item, { new: true });
    }

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/mega-menu/navbar/:id
// @desc    Update single navbar item
// @access  Private/Admin
router.put('/navbar/:id', protect, admin, async (req, res) => {
  try {
    const navbarItem = await NavbarItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!navbarItem) {
      return res.status(404).json({
        success: false,
        message: 'Navbar item not found'
      });
    }

    res.json({
      success: true,
      data: navbarItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/mega-menu/navbar
// @desc    Create new navbar item
// @access  Private/Admin
router.post('/navbar', protect, admin, async (req, res) => {
  try {
    const navbarItem = await NavbarItem.create(req.body);

    res.status(201).json({
      success: true,
      data: navbarItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/mega-menu/navbar/:id
// @desc    Delete navbar item
// @access  Private/Admin
router.delete('/navbar/:id', protect, admin, async (req, res) => {
  try {
    const navbarItem = await NavbarItem.findByIdAndDelete(req.params.id);

    if (!navbarItem) {
      return res.status(404).json({
        success: false,
        message: 'Navbar item not found'
      });
    }

    res.json({
      success: true,
      message: 'Navbar item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
