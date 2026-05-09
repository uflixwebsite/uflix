const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const mongoose = require('mongoose');
const { protect, admin, optionalAuth } = require('../middleware/auth');

// Helper: get all descendant category IDs including self
const getAllDescendantIds = async (categoryId) => {
  const all = await Category.find({}, '_id parent');
  const collect = (pid) => {
    const children = all.filter(c => c.parent && c.parent.toString() === pid.toString());
    return children.reduce((acc, c) => [...acc, c._id, ...collect(c._id)], []);
  };
  return [categoryId, ...collect(categoryId)];
};

// Normalize incoming data to a single `subcategory` object
const normalizeSubcategory = (body) => {
  // Accepts either `subcategory` (object/string) or legacy `subcategories` array
  let sub = null;
  if (!body) return null;
  if (body.subcategory) sub = body.subcategory;
  else if (Array.isArray(body.subcategories) && body.subcategories.length) sub = body.subcategories[0];

  if (!sub) return null;

  // If sub is a string that looks like an ObjectId, keep as _id
  if (typeof sub === 'string') {
    if (/^[0-9a-fA-F]{24}$/.test(sub)) return { _id: new mongoose.Types.ObjectId(sub) };
    return { name: String(sub).trim().toLowerCase() };
  }

  if (typeof sub === 'object') {
    const id = sub._id || sub.id || null;
    const name = (sub.name || '').toString().trim().toLowerCase();
    return id ? { _id: new mongoose.Types.ObjectId(String(id)), name } : { name };
  }

  return null;
};

// Escape user input before building regex search filters
const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Category filter - support multiple categories
    if (req.query.category) {
      query.categories = { $in: [req.query.category] };
    }

    // New: filter by categoryRef (with descendants)
    // Also falls back to legacy subcategory.name/subcategory._id so products
    // stored via the old subcategory system are still returned.
    if (req.query.categoryId) {
      const descendantIds = await getAllDescendantIds(req.query.categoryId);
      const descendantCats = await Category.find(
        { _id: { $in: descendantIds } },
        'name slug'
      ).lean();
      const legacyNames = [
        ...descendantCats.map(c => (c.name || '').trim().toLowerCase()),
        ...descendantCats.map(c => (c.slug || '').trim().toLowerCase()),
      ].filter(Boolean);
      const uniqueNames = [...new Set(legacyNames)];

      query.$or = [
        { categoryRef: { $in: descendantIds } },
        { categoryRefs: { $in: descendantIds } },
        { 'subcategory._id': { $in: descendantIds } },
        ...(uniqueNames.length ? [{ 'subcategory.name': { $in: uniqueNames } }] : []),
      ];
    }

    // Subcategory filter - match single subcategory by id or name
    if (req.query.subcategory) {
      const vals = req.query.subcategory.split(',').map(v => v.trim()).filter(Boolean);
      if (vals.length) {
        const objectIds = vals.filter(v => /^[0-9a-fA-F]{24}$/.test(v)).map(v => new mongoose.Types.ObjectId(v));
        if (objectIds.length === vals.length) {
          query['subcategory._id'] = { $in: objectIds };
        } else {
          query['subcategory.name'] = { $in: vals.map(v => v.toLowerCase()) };
        }
      }
    }

    // Material filter
    if (req.query.material) {
      query.material = { $in: req.query.material.split(',') };
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Search (partial, case-insensitive) for admin/product management UX
    if (req.query.search) {
      const safeSearch = escapeRegex(String(req.query.search).trim());
      if (safeSearch) {
        const searchRegex = new RegExp(safeSearch, 'i');
        const searchFilter = {
          $or: [
            { name: searchRegex },
            { description: searchRegex },
            { sku: searchRegex },
            { categories: { $elemMatch: { $regex: searchRegex } } },
            { 'subcategory.name': searchRegex },
            { tags: { $elemMatch: { $regex: searchRegex } } },
          ],
        };

        if (query.$or) {
          query.$and = [{ $or: query.$or }, searchFilter];
          delete query.$or;
        } else {
          query.$and = [...(query.$and || []), searchFilter];
        }
      }
    }

    // Tags filter
    if (req.query.tags) {
      query.tags = { $in: req.query.tags.split(',') };
    }

    // Featured filter
    if (req.query.featured === 'true') {
      query.isFeatured = true;
    }

    // New Arrival filter
    if (req.query.newArrival === 'true') {
      query.newArrival = true;
    }

    // Best Seller filter
    if (req.query.bestSeller === 'true') {
      query.bestSeller = true;
    }

    // Sorting
    let sort = {};
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price-asc':
          sort.price = 1;
          break;
        case 'price-desc':
          sort.price = -1;
          break;
        case 'newest':
          sort.createdAt = -1;
          break;
        case 'oldest':
          sort.createdAt = 1;
          break;
        case 'popular':
          sort.sold = -1;
          break;
        case 'rating':
          sort['ratings.average'] = -1;
          break;
        default:
          sort.createdAt = -1;
      }
    } else {
      sort.createdAt = -1;
    }

    const products = await Product.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let product = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true, runValidators: false }
      );
    }

    if (!product) {
      product = await Product.findOneAndUpdate(
        { slug: String(id).toLowerCase() },
        { $inc: { views: 1 } },
        { new: true, runValidators: false }
      );
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/products
// @desc    Create product
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    // Normalize single subcategory from either `subcategory` or legacy `subcategories`
    if (req.body) {
      const norm = normalizeSubcategory(req.body);
      if (norm) req.body.subcategory = norm;
      // remove legacy key if present
      if (Object.prototype.hasOwnProperty.call(req.body, 'subcategories')) delete req.body.subcategories;
    }

    // Validate required fields
    if (!req.body.name || req.body.name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }

    if (!req.body.images || !Array.isArray(req.body.images) || req.body.images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product images are required'
      });
    }

    // Validate each image has a URL
    for (const image of req.body.images) {
      if (!image.url || image.url.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'All product images must have a valid URL'
        });
      }
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    if (req.body) {
      const norm = normalizeSubcategory(req.body);
      if (norm) req.body.subcategory = norm;
      if (Object.prototype.hasOwnProperty.call(req.body, 'subcategories')) delete req.body.subcategories;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const cloudinary = require('cloudinary').v2;
      
      for (const image of product.images) {
        try {
          // Extract public_id from Cloudinary URL
          const urlParts = image.url.split('/');
          const filename = urlParts[urlParts.length - 1];
          const publicId = `home/products/${product.category || 'uncategorized'}/${filename.split('.')[0]}`;
          
          await cloudinary.uploader.destroy(publicId);
        } catch (imgError) {
          console.error('Error deleting image from Cloudinary:', imgError);
          // Continue even if image deletion fails
        }
      }
    }

    // Delete product from database
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product and images deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/products/:id/reviews
// @desc    Get product reviews
// @access  Public
router.get('/:id/reviews', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ product: req.params.id, isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Review.countDocuments({ product: req.params.id, isApproved: true });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ═══ VARIANT MANAGEMENT ═══

// @route   POST /api/products/:id/variants
// @desc    Add a new variant to a product
// @access  Admin
router.post('/:id/variants', protect, admin, async (req, res) => {
  try {
    const { name, sku, color, size, price, discountPrice, stock, images, description, dimensions, weight, isActive } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (!color && !size) {
      return res.status(400).json({ success: false, message: 'At least color or size is required' });
    }

    // Create new variant
    const newVariant = {
      _id: new mongoose.Types.ObjectId(),
      name: name ? String(name).trim() : `${product.name} - ${color || size}`,
      sku: sku || `${product._id.toString()}-${color || size}`,
      color: color ? String(color).trim() : '',
      size: size ? String(size).trim() : '',
      price: price !== undefined && price !== '' ? Number(price) : undefined,
      discountPrice: discountPrice !== undefined && discountPrice !== '' ? Number(discountPrice) : undefined,
      stock: { quantity: Number(stock || 0), reserved: 0 },
      images: images || [],
      description: description ? String(description).trim() : undefined,
      dimensions: dimensions ? {
        length: dimensions.length !== undefined ? Number(dimensions.length) : undefined,
        width: dimensions.width !== undefined ? Number(dimensions.width) : undefined,
        height: dimensions.height !== undefined ? Number(dimensions.height) : undefined,
        unit: dimensions.unit || 'cm'
      } : undefined,
      weight: weight ? {
        value: weight.value !== undefined ? Number(weight.value) : undefined,
        unit: weight.unit || 'kg'
      } : undefined,
      isActive: isActive !== undefined ? Boolean(isActive) : true
    };

    product.variants.push(newVariant);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Variant added successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/products/:id/variants/:variantId
// @desc    Update a variant
// @access  Admin
router.put('/:id/variants/:variantId', protect, admin, async (req, res) => {
  try {
    const { name, color, size, price, discountPrice, stock, images, description, dimensions, weight, isActive } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const variant = product.variants.find(v => v._id.toString() === req.params.variantId);
    if (!variant) {
      return res.status(404).json({ success: false, message: 'Variant not found' });
    }

    // Update variant fields
    if (name !== undefined) variant.name = String(name).trim();
    if (color !== undefined) variant.color = color ? String(color).trim() : '';
    if (size !== undefined) variant.size = size ? String(size).trim() : '';
    if (price !== undefined) variant.price = price === '' ? undefined : Number(price);
    if (discountPrice !== undefined) variant.discountPrice = discountPrice === '' ? undefined : Number(discountPrice);
    if (stock !== undefined) variant.stock.quantity = Number(stock);
    if (images !== undefined) variant.images = images;
    if (description !== undefined) variant.description = description ? String(description).trim() : undefined;
    if (dimensions !== undefined) {
      variant.dimensions = dimensions ? {
        length: dimensions.length !== undefined ? Number(dimensions.length) : undefined,
        width: dimensions.width !== undefined ? Number(dimensions.width) : undefined,
        height: dimensions.height !== undefined ? Number(dimensions.height) : undefined,
        unit: dimensions.unit || 'cm'
      } : undefined;
    }
    if (weight !== undefined) {
      variant.weight = weight ? {
        value: weight.value !== undefined ? Number(weight.value) : undefined,
        unit: weight.unit || 'kg'
      } : undefined;
    }
    if (isActive !== undefined) variant.isActive = isActive;

    await product.save();

    res.json({
      success: true,
      message: 'Variant updated successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/products/:id/variants/:variantId
// @desc    Delete a variant
// @access  Admin
router.delete('/:id/variants/:variantId', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.variants = product.variants.filter(v => v._id.toString() !== req.params.variantId);
    await product.save();

    res.json({
      success: true,
      message: 'Variant deleted successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
