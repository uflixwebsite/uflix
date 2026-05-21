const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');
const Contact = require('../models/Contact');
const { sendContactFormNotifications } = require('../utils/emailService');
const { appendLeadToSheet } = require('../utils/googleSheets');
const { protect, admin } = require('../middleware/auth');

const isProduction = process.env.NODE_ENV === 'production';

const getRequestMeta = (req) => ({
  ip: req.ip,
  forwardedFor: req.get('x-forwarded-for') || '',
  userAgent: req.get('user-agent') || '',
});

const logContactEvent = (requestId, stage, details = {}) => {
  if (!isProduction) return;
  console.info('[contact]', {
    requestId,
    stage,
    ...details,
  });
};

const processContactFollowUps = async ({ requestId, startedAt, contact, payload }) => {
  logContactEvent(requestId, 'background_started', {
    contactId: String(contact._id),
  });

  try {
    const emailStartedAt = Date.now();
    logContactEvent(requestId, 'email_start', {
      contactId: String(contact._id),
    });

    await sendContactFormNotifications(payload);

    logContactEvent(requestId, 'email_sent', {
      contactId: String(contact._id),
      durationMs: Date.now() - emailStartedAt,
    });
  } catch (emailError) {
    console.error('[contact] email_failed', {
      requestId,
      contactId: String(contact._id),
      message: emailError?.message,
      stack: isProduction ? undefined : emailError?.stack,
    });
  }

  try {
    const sheetStartedAt = Date.now();
    logContactEvent(requestId, 'sheet_start', {
      contactId: String(contact._id),
    });

    await appendLeadToSheet(contact);

    logContactEvent(requestId, 'sheet_appended', {
      contactId: String(contact._id),
      durationMs: Date.now() - sheetStartedAt,
    });
  } catch (sheetError) {
    console.error('[contact] sheet_failed', {
      requestId,
      contactId: String(contact._id),
      message: sheetError?.message,
      stack: isProduction ? undefined : sheetError?.stack,
    });
  }

  logContactEvent(requestId, 'background_completed', {
    contactId: String(contact._id),
    durationMs: Date.now() - startedAt,
  });
};

// @route   POST /api/contact
// @desc    Submit contact form, store it, and send notification emails
// @access  Public
router.post('/', async (req, res) => {
  const requestId = randomUUID();
  const startedAt = Date.now();

  logContactEvent(requestId, 'received', {
    ...getRequestMeta(req),
  });

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
      logContactEvent(requestId, 'validation_failed', {
        errors,
        durationMs: Date.now() - startedAt,
      });

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

    logContactEvent(requestId, 'validated', {
      subject: safe.subject,
      hasSelectedProduct: Boolean(safe.selectedProduct),
    });

    const contact = await Contact.create(safe);

    logContactEvent(requestId, 'db_saved', {
      contactId: String(contact._id),
      durationMs: Date.now() - startedAt,
    });

    res.status(201).json({
      success: true,
      data: contact,
      message: 'Contact form submitted successfully',
    });

    logContactEvent(requestId, 'response_sent', {
      contactId: String(contact._id),
      totalBeforeResponseMs: Date.now() - startedAt,
    });

    setImmediate(() => {
      void processContactFollowUps({
        requestId,
        startedAt,
        contact,
        payload: {
          name: safe.name,
          email: safe.email,
          phone: safe.phone,
          subject: safe.subject,
          selectedProduct: safe.selectedProduct,
          message: safe.message,
        },
      }).catch((backgroundError) => {
        console.error('[contact] background_crashed', {
          requestId,
          contactId: String(contact._id),
          message: backgroundError?.message,
          stack: isProduction ? undefined : backgroundError?.stack,
        });
      });
    });
  } catch (error) {
    console.error('[contact] request_failed', {
      requestId,
      message: error?.message,
      stack: isProduction ? undefined : error?.stack,
      durationMs: Date.now() - startedAt,
    });
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
