const express = require('express');
const router = express.Router();
const MegaMenu = require('../models/MegaMenu');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/mega-menu-v2?pagePath=*&navbarLinkUrl=/shop
// @desc    Get mega menu for a specific navbar link on a specific page
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { pagePath = '/', navbarLinkUrl } = req.query;
    
    if (!navbarLinkUrl) {
      return res.status(400).json({
        success: false,
        message: 'navbarLinkUrl is required'
      });
    }

    // Find all matching menus: exact page match OR wildcard "*"
    const megaMenus = await MegaMenu.find({
      pagePath: { $in: [pagePath, '*'] },
      navbarLinkUrl,
      enabled: true
    });

    // Prefer exact page match over wildcard
    const megaMenu = megaMenus.find(m => m.pagePath === pagePath) 
                  || megaMenus.find(m => m.pagePath === '*') 
                  || null;

    console.log(`✅ Mega menu for [${pagePath}] ${navbarLinkUrl}:`, megaMenu ? `Found (pagePath: ${megaMenu.pagePath})` : 'Not found');

    res.json({
      success: true,
      data: megaMenu
    });
  } catch (error) {
    console.error('Error fetching mega menu:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/mega-menu-v2/all
// @desc    Get all mega menus (for admin)
// @access  Private/Admin
router.get('/all', protect, admin, async (req, res) => {
  try {
    const { pagePath } = req.query;
    
    const query = pagePath ? { pagePath } : {};
    const megaMenus = await MegaMenu.find(query).sort({ pagePath: 1, navbarLinkLabel: 1 });

    res.json({
      success: true,
      data: megaMenus
    });
  } catch (error) {
    console.error('Error fetching all mega menus:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/mega-menu-v2
// @desc    Create or update mega menu
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { pagePath, navbarLinkUrl, navbarLinkLabel, categories, items, enabled } = req.body;

    // Check if mega menu already exists
    let megaMenu = await MegaMenu.findOne({ pagePath, navbarLinkUrl });

    if (megaMenu) {
      // Update existing
      megaMenu.navbarLinkLabel = navbarLinkLabel;
      megaMenu.categories = categories;
      megaMenu.items = items;
      megaMenu.enabled = enabled !== undefined ? enabled : true;
      await megaMenu.save();
    } else {
      // Create new
      megaMenu = await MegaMenu.create({
        pagePath,
        navbarLinkUrl,
        navbarLinkLabel,
        categories,
        items,
        enabled: enabled !== undefined ? enabled : true
      });
    }

    res.json({
      success: true,
      data: megaMenu,
      message: megaMenu.isNew ? 'Mega menu created' : 'Mega menu updated'
    });
  } catch (error) {
    console.error('Error saving mega menu:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/mega-menu-v2/:id
// @desc    Delete mega menu
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const megaMenu = await MegaMenu.findByIdAndDelete(req.params.id);

    if (!megaMenu) {
      return res.status(404).json({
        success: false,
        message: 'Mega menu not found'
      });
    }

    res.json({
      success: true,
      message: 'Mega menu deleted'
    });
  } catch (error) {
    console.error('Error deleting mega menu:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
