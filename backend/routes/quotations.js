const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');
const { protect, admin } = require('../middleware/auth');
const { sendQuotationNotifications } = require('../utils/emailService');

// @route   POST /api/quotations
// @desc    Create new quotation request
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, mobile, products, message } = req.body;

    if (!name || !email || !mobile || !products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const quotation = await Quotation.create({
      name,
      email,
      mobile,
      products,
      message
    });

    // Send email notifications to admin and requester
    try {
      await sendQuotationNotifications(quotation);
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      data: quotation,
      message: 'Quotation request submitted successfully'
    });
  } catch (error) {
    console.error('Error creating quotation:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/quotations
// @desc    Get all quotation requests (Admin)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const quotations = await Quotation.find(query)
      .populate('products.productId', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Quotation.countDocuments(query);

    res.json({
      success: true,
      data: quotations,
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

// @route   GET /api/quotations/:id
// @desc    Get single quotation request
// @access  Private/Admin
router.get('/:id', protect, admin, async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('products.productId', 'name images price');

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    res.json({
      success: true,
      data: quotation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/quotations/:id
// @desc    Update quotation status/notes
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { status, notes } = req.body;

    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    if (status) quotation.status = status;
    if (notes !== undefined) quotation.notes = notes;

    await quotation.save();

    res.json({
      success: true,
      data: quotation,
      message: 'Quotation updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/quotations/:id
// @desc    Delete quotation request
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    res.json({
      success: true,
      message: 'Quotation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
