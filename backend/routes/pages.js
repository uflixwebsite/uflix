const express = require('express');
const router = express.Router();
const PageContent = require('../models/PageContent');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/pages
// @desc    Get all pages (admin - includes unpublished)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const pages = await PageContent.find()
      .select('slug title description isPublished updatedAt sections')
      .sort({ title: 1 });

    const pagesWithCount = pages.map(p => ({
      _id: p._id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      isPublished: p.isPublished,
      updatedAt: p.updatedAt,
      sectionCount: p.sections ? p.sections.length : 0
    }));

    res.json({ success: true, data: pagesWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/pages/:slug
// @desc    Get page content by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const page = await PageContent.findOne({ slug: req.params.slug });

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    // If not published, only admin can view
    if (!page.isPublished) {
      // Check if user is admin via auth header
      if (!req.auth || !req.auth.userId) {
        return res.status(404).json({ success: false, message: 'Page not found' });
      }
    }

    // Filter out hidden sections and sort by order
    const visibleSections = page.sections
      .filter(s => s.isVisible)
      .sort((a, b) => a.order - b.order);

    res.json({
      success: true,
      data: {
        ...page.toObject(),
        sections: visibleSections
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/pages/:slug/admin
// @desc    Get full page content for admin editing (includes hidden sections)
// @access  Private/Admin
router.get('/:slug/admin', protect, admin, async (req, res) => {
  try {
    const page = await PageContent.findOne({ slug: req.params.slug });

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/pages/:slug
// @desc    Update page content
// @access  Private/Admin
router.put('/:slug', protect, admin, async (req, res) => {
  try {
    const { title, description, isPublished, sections } = req.body;

    let page = await PageContent.findOne({ slug: req.params.slug });

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    if (title !== undefined) page.title = title;
    if (description !== undefined) page.description = description;
    if (isPublished !== undefined) page.isPublished = isPublished;
    if (sections !== undefined) page.sections = sections;

    await page.save();

    res.json({ success: true, data: page, message: 'Page updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/pages/:slug/sections
// @desc    Add a new section to a page
// @access  Private/Admin
router.post('/:slug/sections', protect, admin, async (req, res) => {
  try {
    const page = await PageContent.findOne({ slug: req.params.slug });

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    const newSection = {
      sectionId: req.body.sectionId || `section-${Date.now()}`,
      type: req.body.type || 'content',
      title: req.body.title || '',
      subtitle: req.body.subtitle || '',
      description: req.body.description || '',
      image: req.body.image || '',
      imageAlt: req.body.imageAlt || '',
      bgColor: req.body.bgColor || 'white',
      items: req.body.items || [],
      content: req.body.content || '',
      link: req.body.link || '',
      linkText: req.body.linkText || '',
      secondaryLink: req.body.secondaryLink || '',
      secondaryLinkText: req.body.secondaryLinkText || '',
      order: page.sections.length,
      isVisible: true
    };

    page.sections.push(newSection);
    await page.save();

    res.json({ success: true, data: page, message: 'Section added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/pages/:slug/sections/:sectionId
// @desc    Update a specific section
// @access  Private/Admin
router.put('/:slug/sections/:sectionId', protect, admin, async (req, res) => {
  try {
    const page = await PageContent.findOne({ slug: req.params.slug });

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    const sectionIndex = page.sections.findIndex(
      s => s._id.toString() === req.params.sectionId || s.sectionId === req.params.sectionId
    );

    if (sectionIndex === -1) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    // Update section fields
    const updateFields = ['type', 'title', 'subtitle', 'description', 'image', 'imageAlt',
      'bgColor', 'items', 'content', 'link', 'linkText', 'secondaryLink',
      'secondaryLinkText', 'order', 'isVisible', 'sectionId'];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        page.sections[sectionIndex][field] = req.body[field];
      }
    });

    await page.save();

    res.json({ success: true, data: page, message: 'Section updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/pages/:slug/sections/:sectionId
// @desc    Delete a section from a page
// @access  Private/Admin
router.delete('/:slug/sections/:sectionId', protect, admin, async (req, res) => {
  try {
    const page = await PageContent.findOne({ slug: req.params.slug });

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    page.sections = page.sections.filter(
      s => s._id.toString() !== req.params.sectionId && s.sectionId !== req.params.sectionId
    );

    await page.save();

    res.json({ success: true, data: page, message: 'Section deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/pages
// @desc    Create a new page
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { slug, title, description, sections } = req.body;

    const existing = await PageContent.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Page with this slug already exists' });
    }

    const page = await PageContent.create({
      slug,
      title,
      description: description || '',
      sections: sections || [],
      isPublished: true
    });

    res.status(201).json({ success: true, data: page, message: 'Page created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
