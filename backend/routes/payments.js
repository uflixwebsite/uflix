const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const { protect, optionalProtect } = require('../middleware/auth');
const { generateAndUploadInvoice } = require('../utils/invoiceGenerator');
const { sendOrderPlacedNotifications } = require('../utils/emailService');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @route   POST /api/payments/create-order
// @desc    Create Razorpay order
// @access  Public/Private
router.post('/create-order', optionalProtect, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      success: true,
      data: razorpayOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment
// @access  Public/Private
router.post('/verify', optionalProtect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderId,
    } = req.body;

    const finalRazorpayOrderId = razorpay_order_id || razorpayOrderId;
    const finalRazorpayPaymentId = razorpay_payment_id || razorpayPaymentId;
    const finalRazorpaySignature = razorpay_signature || razorpaySignature;

    if (!finalRazorpayOrderId || !finalRazorpayPaymentId || !finalRazorpaySignature || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data'
      });
    }

    // Verify signature
    const sign = finalRazorpayOrderId + '|' + finalRazorpayPaymentId;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (finalRazorpaySignature === expectedSign) {
      // Update order payment status
      const order = await Order.findById(orderId).populate('user', 'name email phone');
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      order.paymentInfo = {
        razorpayOrderId: finalRazorpayOrderId,
        razorpayPaymentId: finalRazorpayPaymentId,
        razorpaySignature: finalRazorpaySignature,
        status: 'completed',
        paidAt: Date.now()
      };
      order.orderStatus = 'confirmed';
      order.statusHistory.push({
        status: 'confirmed',
        note: 'Payment completed successfully',
        timestamp: Date.now()
      });

      await order.save();

      let invoiceInfo = null;
      const customerInfo = order.isGuestOrder
        ? {
            name: order.guestCustomer?.name,
            email: order.guestCustomer?.email,
            phone: order.guestCustomer?.phone,
          }
        : {
            name: order.user?.name,
            email: order.user?.email,
            phone: order.user?.phone,
          };

      try {
        invoiceInfo = await generateAndUploadInvoice(order, customerInfo);
        order.invoiceUrl = invoiceInfo.url;
        order.invoicePublicId = invoiceInfo.publicId;
        await order.save();
      } catch (invoiceError) {
        console.error('Invoice generation failed after payment verification:', invoiceError);
      }

      try {
        await sendOrderPlacedNotifications({
          order,
          customer: customerInfo,
          invoice: invoiceInfo,
        });
      } catch (emailError) {
        console.error('Order email notifications failed after payment verification:', emailError);
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: order
      });
    } else {
      // Payment verification failed
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentInfo.status = 'failed';
        await order.save();
      }

      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/payments/refund
// @desc    Process refund
// @access  Private/Admin
router.post('/refund', protect, async (req, res) => {
  try {
    const { paymentId, amount, orderId } = req.body;

    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100, // amount in paise
      speed: 'normal'
    });

    // Update order status
    const order = await Order.findById(orderId);
    if (order) {
      order.paymentInfo.status = 'refunded';
      order.orderStatus = 'refunded';
      order.statusHistory.push({
        status: 'refunded',
        note: 'Refund processed',
        updatedBy: req.user._id,
        timestamp: Date.now()
      });
      await order.save();
    }

    res.json({
      success: true,
      data: refund
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/payments/:paymentId
// @desc    Get payment details
// @access  Private
router.get('/:paymentId', protect, async (req, res) => {
  try {
    const payment = await razorpay.payments.fetch(req.params.paymentId);

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
