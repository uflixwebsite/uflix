const express = require('express');
const router = express.Router();
const { sendContactFormNotifications } = require('../utils/emailService');

// @route   POST /api/contact
// @desc    Submit contact form and send notification emails
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, selectedProduct, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    await sendContactFormNotifications({
      name,
      email,
      phone,
      subject,
      selectedProduct,
      message,
    });

    res.status(201).json({
      success: true,
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

module.exports = router;
