const express = require('express');
const mongoose = require('mongoose');

const Collection = require('../models/Collection');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

const toCollectionCard = (collection) => ({
  _id: collection._id,
  name: collection.name,
  slug: collection.slug,
  subtitle: collection.subtitle,
  image: collection.image,
  showOnHome: collection.showOnHome,
  isActive: collection.isActive,
  sortOrder: collection.sortOrder,
  productIds: Array.isArray(collection.products)
    ? collection.products.map((product) =>
        product && typeof product === 'object' && product._id ? String(product._id) : String(product)
      )
    : [],
  itemCount: Array.isArray(collection.products) ? collection.products.length : 0,
});

const sanitizeProductIds = (products = []) => {
  if (!Array.isArray(products)) return [];
  const valid = products.filter((id) => mongoose.Types.ObjectId.isValid(String(id)));
  return [...new Set(valid.map((id) => String(id)))];
};

// @route   GET /api/collections
// @desc    Get all active collections
// @access  Public
router.get('/', async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const includeProducts = req.query.includeProducts === 'true';

    const query = includeInactive ? {} : { isActive: true };

    const baseQuery = Collection.find(query).sort({ sortOrder: 1, createdAt: -1 });

    if (includeProducts) {
      baseQuery.populate({
        path: 'products',
        match: { isActive: true },
        select: 'name slug images price discountPrice categories ratings',
      });
    }

    const collections = await baseQuery;

    res.json({
      success: true,
      data: collections.map((collection) => {
        if (includeProducts) {
          return {
            ...toCollectionCard(collection),
            products: collection.products || [],
          };
        }
        return toCollectionCard(collection);
      }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/collections/home
// @desc    Get collections enabled for homepage
// @access  Public
router.get('/home', async (req, res) => {
  try {
    const collections = await Collection.find({ isActive: true, showOnHome: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .select('name slug subtitle image showOnHome isActive sortOrder products');

    res.json({
      success: true,
      data: collections.map(toCollectionCard),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/collections/:slug
// @desc    Get a collection by slug with products and all collection cards
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const collection = await Collection.findOne({ slug: req.params.slug, isActive: true })
      .populate({
        path: 'products',
        match: { isActive: true },
        select: 'name slug description images price discountPrice categories ratings material',
      });

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const allCollections = await Collection.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .select('name slug subtitle image showOnHome isActive sortOrder products');

    res.json({
      success: true,
      data: {
        collection: {
          ...toCollectionCard(collection),
          products: collection.products || [],
        },
        allCollections: allCollections.map(toCollectionCard),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/collections
// @desc    Create a collection
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, subtitle, image, showOnHome, isActive, sortOrder, products } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Collection name is required' });
    }

    if (!image || !image.trim()) {
      return res.status(400).json({ success: false, message: 'Collection image is required' });
    }

    const productIds = sanitizeProductIds(products);

    if (productIds.length > 0) {
      const existingCount = await Product.countDocuments({ _id: { $in: productIds } });
      if (existingCount !== productIds.length) {
        return res.status(400).json({ success: false, message: 'One or more selected products are invalid' });
      }
    }

    const collection = await Collection.create({
      name: name.trim(),
      subtitle: subtitle || '',
      image: image.trim(),
      showOnHome: showOnHome !== false,
      isActive: isActive !== false,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      products: productIds,
    });

    res.status(201).json({
      success: true,
      data: toCollectionCard(collection),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Collection name already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/collections/:id
// @desc    Update a collection
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const updates = {};
    const fields = ['name', 'subtitle', 'image', 'showOnHome', 'isActive', 'sortOrder'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (req.body.products !== undefined) {
      const productIds = sanitizeProductIds(req.body.products);
      if (productIds.length > 0) {
        const existingCount = await Product.countDocuments({ _id: { $in: productIds } });
        if (existingCount !== productIds.length) {
          return res.status(400).json({ success: false, message: 'One or more selected products are invalid' });
        }
      }
      updates.products = productIds;
    }

    const collection = await Collection.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    res.json({ success: true, data: toCollectionCard(collection) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Collection name already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/collections/:id
// @desc    Delete a collection
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const collection = await Collection.findByIdAndDelete(req.params.id);

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    res.json({ success: true, message: 'Collection deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
