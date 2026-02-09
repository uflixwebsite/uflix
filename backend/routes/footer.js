const express = require('express');
const router = express.Router();
const FooterSettings = require('../models/FooterSettings');
const { protect, admin } = require('../middleware/auth');

// GET /api/footer - Get footer settings (public)
router.get('/', async (req, res) => {
  try {
    let footer = await FooterSettings.findOne({ isActive: true });
    if (!footer) {
      return res.json({ success: true, data: null });
    }
    res.json({ success: true, data: footer });
  } catch (error) {
    console.error('Error fetching footer settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/footer - Update footer settings (admin only)
router.put('/', protect, admin, async (req, res) => {
  try {
    const {
      brandName,
      brandDescription,
      socialLinks,
      linkColumns,
      contactTitle,
      contactItems,
      copyrightText,
      bottomLinks
    } = req.body;

    let footer = await FooterSettings.findOne({ isActive: true });

    if (!footer) {
      footer = new FooterSettings({
        brandName,
        brandDescription,
        socialLinks,
        linkColumns,
        contactTitle,
        contactItems,
        copyrightText,
        bottomLinks
      });
    } else {
      if (brandName !== undefined) footer.brandName = brandName;
      if (brandDescription !== undefined) footer.brandDescription = brandDescription;
      if (socialLinks !== undefined) footer.socialLinks = socialLinks;
      if (linkColumns !== undefined) footer.linkColumns = linkColumns;
      if (contactTitle !== undefined) footer.contactTitle = contactTitle;
      if (contactItems !== undefined) footer.contactItems = contactItems;
      if (copyrightText !== undefined) footer.copyrightText = copyrightText;
      if (bottomLinks !== undefined) footer.bottomLinks = bottomLinks;
    }

    await footer.save();
    res.json({ success: true, data: footer });
  } catch (error) {
    console.error('Error updating footer settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/footer/link-column - Add a new link column
router.post('/link-column', protect, admin, async (req, res) => {
  try {
    let footer = await FooterSettings.findOne({ isActive: true });
    if (!footer) {
      return res.status(404).json({ success: false, message: 'Footer settings not found' });
    }

    const { title, links } = req.body;
    footer.linkColumns.push({
      title,
      links: links || [],
      enabled: true,
      order: footer.linkColumns.length
    });

    await footer.save();
    res.json({ success: true, data: footer });
  } catch (error) {
    console.error('Error adding link column:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/footer/link-column/:columnId - Remove a link column
router.delete('/link-column/:columnId', protect, admin, async (req, res) => {
  try {
    let footer = await FooterSettings.findOne({ isActive: true });
    if (!footer) {
      return res.status(404).json({ success: false, message: 'Footer settings not found' });
    }

    footer.linkColumns = footer.linkColumns.filter(
      col => col._id.toString() !== req.params.columnId
    );

    await footer.save();
    res.json({ success: true, data: footer });
  } catch (error) {
    console.error('Error removing link column:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/footer/social-link - Add a social link
router.post('/social-link', protect, admin, async (req, res) => {
  try {
    let footer = await FooterSettings.findOne({ isActive: true });
    if (!footer) {
      return res.status(404).json({ success: false, message: 'Footer settings not found' });
    }

    const { platform, url } = req.body;
    footer.socialLinks.push({ platform, url, enabled: true });

    await footer.save();
    res.json({ success: true, data: footer });
  } catch (error) {
    console.error('Error adding social link:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/footer/social-link/:linkId - Remove a social link
router.delete('/social-link/:linkId', protect, admin, async (req, res) => {
  try {
    let footer = await FooterSettings.findOne({ isActive: true });
    if (!footer) {
      return res.status(404).json({ success: false, message: 'Footer settings not found' });
    }

    footer.socialLinks = footer.socialLinks.filter(
      link => link._id.toString() !== req.params.linkId
    );

    await footer.save();
    res.json({ success: true, data: footer });
  } catch (error) {
    console.error('Error removing social link:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
