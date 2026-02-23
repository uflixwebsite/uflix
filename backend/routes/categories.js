const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const { protect, admin } = require('../middleware/auth');

// Helper: get all descendant IDs including self
const getAllDescendantIds = async (categoryId) => {
  const all = await Category.find({}, '_id parent');
  const collect = (pid) => {
    const children = all.filter(c => c.parent && c.parent.toString() === pid.toString());
    return children.reduce((acc, c) => [...acc, c._id, ...collect(c._id)], []);
  };
  return [categoryId, ...collect(categoryId)];
};

// Helper: build nested tree from flat list
const buildTree = (items, parentId = null) => {
  return items
    .filter(item => {
      if (parentId === null) return !item.parent;
      // item.parent may be a populated object or a raw ObjectId
      const parentRef = item.parent?._id ?? item.parent;
      return parentRef && parentRef.toString() === parentId.toString();
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name))
    .map(item => ({
      _id: item._id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      image: item.image,
      icon: item.icon,
      order: item.order,
      parent: item.parent,
      children: buildTree(items, item._id)
    }));
};

// ──────────────────────────────────────────────────────────────
// IMPORTANT: Specific string routes MUST come before /:id
// ──────────────────────────────────────────────────────────────

// @route   GET /api/categories
// @desc    Get all categories (flat list, optional parentId filter)
// @access  Public
router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.query.parentId === 'null' || req.query.parentId === '') {
      query.parent = null;
    } else if (req.query.parentId) {
      query.parent = req.query.parentId;
    }

    const categories = await Category.find(query)
      .populate('parent', 'name slug')
      .sort({ order: 1, name: 1 });

    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/categories/tree
// @desc    Get full category tree (nested)
// @access  Public
router.get('/tree', async (req, res) => {
  try {
    const categories = await Category.find().populate('parent', 'name slug');
    const tree = buildTree(categories);
    res.json({ success: true, data: tree });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/categories/by-path?path=living/beds/king-size-beds
// @desc    Resolve category chain from slug path
// @access  Public
router.get('/by-path', async (req, res) => {
  try {
    const pathStr = (req.query.path || req.query.slugs || '').toString();
    const slugs = pathStr.split('/').filter(Boolean);
    if (!slugs.length) {
      return res.status(400).json({ success: false, message: 'Path is required' });
    }

    const chain = [];
    for (let i = 0; i < slugs.length; i++) {
      const slug = slugs[i];
      const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // 1. Try Category collection: exact slug, case-insensitive slug, name match (hyphens = spaces)
      const category = await Category.findOne({
        $or: [
          { slug: slug },
          { slug: { $regex: new RegExp(`^${escaped}$`, 'i') } },
          { name: { $regex: new RegExp(`^${escaped.replace(/-/g, '[\\s-]')}$`, 'i') } },
        ]
      }).populate('parent', 'name slug');

      if (category) {
        chain.push(category);
        continue;
      }

      // 2. Fall back to old Subcategory collection — match by name (with/without trailing s)
      const nameVariants = [slug, slug.replace(/-/g, ' ')];
      if (slug.endsWith('s')) nameVariants.push(slug.slice(0, -1), slug.slice(0, -1).replace(/-/g, ' '));
      else nameVariants.push(slug + 's', (slug + 's').replace(/-/g, ' '));

      // Determine parent category string from the previous chain entry
      const parentSlug = chain.length > 0 ? (chain[chain.length - 1].slug || chain[chain.length - 1].name?.toLowerCase().replace(/\s+/g, '-')) : null;

      const subQuery = { name: { $in: nameVariants } };
      if (parentSlug) {
        // match against category string (old model uses plain string e.g. "bedroom")
        const parentVariants = [parentSlug, parentSlug.replace(/-/g, ' '), parentSlug.replace(/-/g, '')];
        subQuery.$or = [
          { category: { $in: parentVariants } },
          { category: { $regex: new RegExp(`^${parentSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/-/g, '[\\s-]?')}$`, 'i') } },
        ];
      }

      const subcategory = await Subcategory.findOne(subQuery);
      if (subcategory) {
        // Return a synthetic chain entry shaped like a Category so the frontend works
        chain.push({
          _id: subcategory._id,
          name: subcategory.name,
          slug: subcategory.name.replace(/\s+/g, '-').toLowerCase(),
          parent: null,
          _fromSubcategoryCollection: true,
        });
        continue;
      }

      return res.status(404).json({ success: false, message: `Category "${slug}" not found` });
    }

    res.json({ success: true, data: chain });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/categories/:id/descendants
// @desc    Get self + all descendant category IDs
// @access  Public
router.get('/:id/descendants', async (req, res) => {
  try {
    const ids = await getAllDescendantIds(req.params.id);
    res.json({ success: true, data: ids });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parent', 'name slug');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/categories
// @desc    Create category
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const updateBody = { ...req.body };

    // Auto-regenerate slug when name is being changed (findByIdAndUpdate bypasses pre-save hook)
    if (updateBody.name) {
      updateBody.slug = updateBody.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateBody,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category (and unlinks children)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if it has children
    const childCount = await Category.countDocuments({ parent: req.params.id });
    if (childCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: this category has ${childCount} sub-categor${childCount === 1 ? 'y' : 'ies'}. Delete or reassign them first.`
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

