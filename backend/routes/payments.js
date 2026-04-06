const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const { protect, optionalProtect, admin } = require('../middleware/auth');
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
    const { amount, currency = 'INR', receipt, orderId } = req.body;
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      });
    }

    let order = null;
    if (orderId) {
      order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      if (!req.isGuest && req.user) {
        if (order.user && order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to create payment for this order'
          });
        }
      } else if (!order.isGuestOrder) {
        return res.status(403).json({
          success: false,
          message: 'Authentication required for this order'
        });
      }
    }

    const options = {
      amount: Math.round(parsedAmount * 100), // amount in smallest currency unit (paise)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: orderId
        ? {
            internalOrderId: String(orderId)
          }
        : undefined,
      payment_capture: 1
    };

    const razorpayOrder = await razorpay.orders.create(options);

    if (order) {
      order.paymentInfo = {
        ...(order.paymentInfo || {}),
        razorpayOrderId: razorpayOrder.id,
        status: 'pending'
      };
      await order.save();
    }

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

      if (!req.isGuest && req.user) {
        if (order.user && order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to verify payment for this order'
          });
        }
      } else if (!order.isGuestOrder) {
        return res.status(403).json({
          success: false,
          message: 'Authentication required for this order'
        });
      }

      if (!order.paymentInfo?.razorpayOrderId || order.paymentInfo.razorpayOrderId !== finalRazorpayOrderId) {
        return res.status(400).json({
          success: false,
          message: 'Razorpay order does not match this order'
        });
      }

      const razorpayPayment = await razorpay.payments.fetch(finalRazorpayPaymentId);

      if (razorpayPayment.order_id !== finalRazorpayOrderId) {
        return res.status(400).json({
          success: false,
          message: 'Payment does not belong to this Razorpay order'
        });
      }

      if (String(razorpayPayment.currency || '').toUpperCase() !== 'INR') {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment currency'
        });
      }

      const expectedAmountInPaise = Math.round(Number(order.totalPrice || 0) * 100);
      if (Number(razorpayPayment.amount) !== expectedAmountInPaise) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount mismatch'
        });
      }

      if (!['captured', 'authorized'].includes(String(razorpayPayment.status || '').toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Payment is not completed'
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
        order.paymentInfo = {
          ...(order.paymentInfo || {}),
          status: 'failed'
        };
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
router.post('/refund', protect, admin, async (req, res) => {
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
