const express = require('express');
const router = express.Router();
const NavbarSettings = require('../models/NavbarSettings');
const { protect, admin } = require('../middleware/auth');

const getDefaultSettings = () => ({
  configs: [
    {
      path: '*',
      enabled: true,
      order: 0,
      links: [
        { label: 'All Products', url: '/shop', enabled: true, order: 0 },
        { label: 'Categories', url: '/categories', enabled: true, order: 1 },
        { label: 'Projects', url: '/projects', enabled: true, order: 2 },
        { label: 'For Business', url: '/business', enabled: true, order: 3 },
        { label: 'Contact', url: '/contact', enabled: true, order: 4 }
      ]
    }
  ]
});

const pickConfigForPath = (settings, path) => {
  if (!settings || !Array.isArray(settings.configs)) return null;
  const enabledConfigs = settings.configs
    .filter(c => c && c.enabled)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const normalizePath = (p) => {
    if (!p || typeof p !== 'string') return '/';
    if (!p.startsWith('/')) return `/${p}`;
    return p;
  };

  const matchesWildcardPrefix = (pattern, currentPath) => {
    if (typeof pattern !== 'string') return false;
    if (!pattern.endsWith('/*')) return false;
    const prefix = pattern.slice(0, -2);
    if (!prefix) return false;
    if (currentPath === prefix) return true;
    return currentPath.startsWith(prefix + '/');
  };

  const getSpecificityScore = (pattern) => {
    if (!pattern || typeof pattern !== 'string') return 0;
    if (pattern === '*') return 0;
    if (pattern.endsWith('/*')) return pattern.length - 2;
    return pattern.length;
  };

  const currentPath = normalizePath(path);

  const exact = enabledConfigs.find(c => normalizePath(c.path) === currentPath);
  if (exact) return exact;

  const wildcardMatches = enabledConfigs
    .filter(c => matchesWildcardPrefix(normalizePath(c.path), currentPath))
    .sort((a, b) => {
      const aScore = getSpecificityScore(normalizePath(a.path));
      const bScore = getSpecificityScore(normalizePath(b.path));
      if (aScore !== bScore) return bScore - aScore; // prefer most specific
      return (a.order || 0) - (b.order || 0);
    });

  if (wildcardMatches.length) return wildcardMatches[0];

  const fallback = enabledConfigs.find(c => c.path === '*');
  return fallback || null;
};

// GET /api/navbar?path=/some-page - Public
router.get('/', async (req, res) => {
  try {
    const path = typeof req.query.path === 'string' ? req.query.path : '*';

    let settings = await NavbarSettings.findOne();
    if (!settings) {
      settings = getDefaultSettings();
    }

    const config = pickConfigForPath(settings, path);
    return res.json({ success: true, data: { configs: [config] } });
  } catch (error) {
    console.error('Error fetching navbar settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/navbar/admin - Admin (full settings)
router.get('/admin', protect, admin, async (req, res) => {
  try {
    let settings = await NavbarSettings.findOne();
    if (!settings) {
      return res.json({ success: true, data: getDefaultSettings() });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching navbar settings (admin):', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/navbar - Admin (replace settings)
router.put('/', protect, admin, async (req, res) => {
  try {
    const { configs } = req.body;

    let settings = await NavbarSettings.findOne();
    if (!settings) {
      settings = await NavbarSettings.create({ configs: configs || [] });
    } else {
      if (configs !== undefined) settings.configs = configs;
      await settings.save();
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error updating navbar settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
