const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { sendContactFormNotifications } = require('../utils/emailService');
const { appendLeadToSheet } = require('../utils/googleSheets');
const { protect, admin } = require('../middleware/auth');

// @route   POST /api/contact
// @desc    Submit contact form, store it, and send notification emails
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, selectedProduct, message } = req.body;

    // Basic validation
    const errors = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = (phone || '').replace(/[^0-9]/g, '');
    const allowedSubjects = [
      'custom-built',
      'steel-metal-fabrication-enquiry',
      'customize-existing',
      'shop-fittings',
      'business-order',
      'become-dealer',
      'general',
      'other',
    ];

    if (!name || String(name).trim().length < 2) errors.push('name');
    if (!email || !emailRegex.test(String(email).trim())) errors.push('email');
    if (!phone || phoneDigits.length < 7) errors.push('phone');
    if (!subject || !allowedSubjects.includes(subject)) errors.push('subject');
    if (!message || String(message).trim().length < 10) errors.push('message');

    if (subject === 'customize-existing' && (!selectedProduct || String(selectedProduct).trim().length === 0)) {
      errors.push('selectedProduct');
    }

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // sanitize
    const safe = {
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      subject: String(subject).trim(),
      selectedProduct: selectedProduct ? String(selectedProduct).trim() : '',
      message: String(message).trim(),
    };

    const contact = await Contact.create(safe);

    try {
      await sendContactFormNotifications({
        name,
        email,
        phone,
        subject,
        selectedProduct,
        message,
      });
    } catch (emailError) {
      console.error('Error sending contact notification email:', emailError);
    }

    // Append to Google Sheet (best-effort; do not fail the request if this errors)
    try {
      await appendLeadToSheet(contact);
    } catch (sheetError) {
      console.error('Error appending contact to Google Sheet:', sheetError);
    }

    res.status(201).json({
      success: true,
      data: contact,
      message: 'Contact form submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit contact form',
    });
  }
});

// @route   GET /api/contact
// @desc    Get all contact submissions (Admin)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.search) {
      const search = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: search },
        { email: search },
        { phone: search },
        { subject: search },
        { selectedProduct: search },
      ];
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/contact/:id
// @desc    Get single contact submission (Admin)
// @access  Private/Admin
router.get('/:id', protect, admin, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found',
      });
    }

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/contact/:id
// @desc    Update contact status/notes (Admin)
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { status, notes } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found',
      });
    }

    if (status) contact.status = status;
    if (notes !== undefined) contact.notes = notes;

    await contact.save();

    res.json({
      success: true,
      data: contact,
      message: 'Contact submission updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact submission (Admin)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found',
      });
    }

    res.json({
      success: true,
      message: 'Contact submission deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
