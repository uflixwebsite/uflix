const express = require('express');
const router = express.Router();
const MegaMenu = require('../models/MegaMenu');
const { protect, admin } = require('../middleware/auth');

const createUniqueId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const URL_RENAMES = {
  '/steel-fabrication-delhi-ncr/msfabrication': '/msfabrication-delhi-ncr',
  '/steel-fabrication-delhi-ncr/laser-sheet-cutting': '/laser-sheet-cutting-delhi-ncr',
  '/steel-fabrication-delhi-ncr/powder-coating': '/powder-coating-delhi-ncr',
  '/steel-fabrication-delhi-ncr/laser-pipe-cutting': '/laser-pipe-cutting-delhi-ncr',
};

const normalizeUrl = (value) => {
  if (typeof value !== 'string') return value;
  return URL_RENAMES[value] || value;
};

const getCandidates = (value) => {
  const normalized = normalizeUrl(value);
  const aliases = Object.entries(URL_RENAMES)
    .filter(([, target]) => target === normalized)
    .map(([source]) => source);
  return Array.from(new Set([value, normalized, ...aliases])).filter(Boolean);
};

const normalizeMenu = (menu) => {
  if (!menu) return menu;
  return {
    ...menu,
    pagePath: normalizeUrl(menu.pagePath),
    navbarLinkUrl: normalizeUrl(menu.navbarLinkUrl),
  };
};

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

    // Build all candidate paths from most-specific to least-specific:
    // e.g. /business/healthcare => ['/business/healthcare', '/business/*', '*']
    const normalizedPagePath = normalizeUrl(pagePath);
    const normalizedNavbarLinkUrl = normalizeUrl(navbarLinkUrl);

    const candidatePaths = getCandidates(normalizedPagePath);
    const parts = normalizedPagePath.split('/').filter(Boolean);
    for (let i = parts.length - 1; i > 0; i--) {
      candidatePaths.push('/' + parts.slice(0, i).join('/') + '/*');
    }
    if (!candidatePaths.includes('*')) candidatePaths.push('*');

    // Find all matching menus
    const megaMenus = await MegaMenu.find({
      pagePath: { $in: candidatePaths },
      navbarLinkUrl: { $in: getCandidates(normalizedNavbarLinkUrl) },
      enabled: true
    });

    // Prefer most-specific match (earliest in candidatePaths wins)
    const megaMenu = candidatePaths.reduce((found, path) => {
      if (found) return found;
      return megaMenus.find(m => m.pagePath === path) || null;
    }, null);

    console.log(`✅ Mega menu for [${pagePath}] ${navbarLinkUrl}:`, megaMenu ? `Found (pagePath: ${megaMenu.pagePath})` : 'Not found');

    res.json({
      success: true,
      data: normalizeMenu(megaMenu ? (megaMenu.toObject ? megaMenu.toObject() : megaMenu) : null)
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
    
    const query = pagePath ? { pagePath: { $in: getCandidates(pagePath) } } : {};
    const megaMenus = await MegaMenu.find(query).sort({ pagePath: 1, navbarLinkLabel: 1 });

    res.json({
      success: true,
      data: megaMenus.map((menu) => normalizeMenu(menu.toObject()))
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
    const normalizedPagePath = normalizeUrl(pagePath);
    const normalizedNavbarLinkUrl = normalizeUrl(navbarLinkUrl);

    const normalizedCategories = (Array.isArray(categories) ? categories : []).map((category, index) => ({
      ...category,
      id: String(category?.id || createUniqueId('cat')),
      order: Number.isFinite(category?.order) ? category.order : index + 1,
      enabled: category?.enabled !== false
    }));

    const normalizedItems = (Array.isArray(items) ? items : []).map((item, index) => ({
      ...item,
      id: String(item?.id || createUniqueId('item')),
      order: Number.isFinite(item?.order) ? item.order : index + 1,
      enabled: item?.enabled !== false
    }));

    // Check if mega menu already exists
    let megaMenu = await MegaMenu.findOne({ pagePath: normalizedPagePath, navbarLinkUrl: normalizedNavbarLinkUrl });

    if (megaMenu) {
      // Update existing
      megaMenu.navbarLinkLabel = navbarLinkLabel;
      megaMenu.categories = normalizedCategories;
      megaMenu.items = normalizedItems;
      megaMenu.enabled = enabled !== undefined ? enabled : true;
      megaMenu.pagePath = normalizedPagePath;
      megaMenu.navbarLinkUrl = normalizedNavbarLinkUrl;
      await megaMenu.save();
    } else {
      // Create new
      megaMenu = await MegaMenu.create({
        pagePath: normalizedPagePath,
        navbarLinkUrl: normalizedNavbarLinkUrl,
        navbarLinkLabel,
        categories: normalizedCategories,
        items: normalizedItems,
        enabled: enabled !== undefined ? enabled : true
      });
    }

    res.json({
      success: true,
      data: normalizeMenu(megaMenu.toObject()),
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
