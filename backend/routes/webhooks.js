const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * Verify Razorpay webhook signature
 * This is critical for security - ensures webhook is from Razorpay
 */
const verifyWebhookSignature = (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not configured');
      return res.status(500).json({
        success: false,
        message: 'Webhook secret not configured'
      });
    }

    const webhookSignature = req.headers['x-razorpay-signature'];
    
    if (!webhookSignature) {
      console.error('No webhook signature found in headers');
      return res.status(400).json({
        success: false,
        message: 'No signature found'
      });
    }

    // Razorpay sends the raw body, so we need to use req.rawBody
    const body = req.rawBody || JSON.stringify(req.body);
    
    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    // Compare signatures
    if (webhookSignature !== expectedSignature) {
      console.error('Webhook signature verification failed');
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Signature verified successfully
    next();
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return res.status(500).json({
      success: false,
      message: 'Signature verification error'
    });
  }
};

/**
 * Create Razorpay invoice for a paid order
 * @param {Object} order - Order document
 * @param {Object} paymentDetails - Payment details from webhook
 * @returns {Object} Invoice details
 */
async function createRazorpayInvoice(order, paymentDetails) {
  try {
    // Prepare customer details
    const customerInfo = order.isGuestOrder 
      ? order.guestCustomer 
      : {
          name: order.shippingAddress.name,
          email: order.user?.email || order.guestCustomer?.email,
          phone: order.shippingAddress.phone
        };

    // Prepare line items for invoice
    const lineItems = order.items.map(item => ({
      name: item.name,
      description: `Product: ${item.name}`,
      amount: (item.discountPrice || item.price) * 100, // in paise
      currency: 'INR',
      quantity: item.quantity
    }));

    // Add tax as a line item
    if (order.taxPrice > 0) {
      lineItems.push({
        name: 'GST (18%)',
        description: 'Goods and Services Tax',
        amount: Math.round(order.taxPrice * 100),
        currency: 'INR',
        quantity: 1
      });
    }

    // Add shipping as a line item
    if (order.shippingPrice > 0) {
      lineItems.push({
        name: 'Shipping Charges',
        description: 'Delivery charges',
        amount: Math.round(order.shippingPrice * 100),
        currency: 'INR',
        quantity: 1
      });
    }

    // Create invoice via Razorpay API
    const invoiceData = {
      type: 'invoice',
      description: `Invoice for Order #${order.orderNumber}`,
      customer: {
        name: customerInfo.name,
        email: customerInfo.email,
        contact: customerInfo.phone
      },
      line_items: lineItems,
      currency: 'INR',
      paid: true, // Mark as paid since payment is already captured
      payment_id: paymentDetails.razorpay_payment_id,
      notes: {
        order_id: order._id.toString(),
        order_number: order.orderNumber,
        payment_id: paymentDetails.razorpay_payment_id
      }
    };

    console.log('Creating Razorpay invoice for order:', order.orderNumber);
    const invoice = await razorpay.invoices.create(invoiceData);
    
    console.log('Invoice created successfully:', invoice.id);
    return invoice;
  } catch (error) {
    console.error('Error creating Razorpay invoice:', error);
    throw error;
  }
}

/**
 * Handle payment.captured event
 * Creates invoice automatically when payment is successful
 */
async function handlePaymentCaptured(payload) {
  try {
    const payment = payload.payment.entity;
    const razorpayPaymentId = payment.id;
    const razorpayOrderId = payment.order_id;
    const amount = payment.amount / 100; // Convert from paise to rupees

    console.log(`Processing payment.captured for payment: ${razorpayPaymentId}`);

    // Find order by Razorpay order ID
    const order = await Order.findOne({
      'paymentInfo.razorpayOrderId': razorpayOrderId
    });

    if (!order) {
      console.error(`Order not found for Razorpay order ID: ${razorpayOrderId}`);
      return {
        success: false,
        message: 'Order not found'
      };
    }

    // Idempotency check - prevent duplicate invoice creation
    if (order.invoiceInfo?.webhookProcessed && order.invoiceInfo?.razorpayInvoiceId) {
      console.log(`Invoice already created for order ${order.orderNumber}, skipping`);
      return {
        success: true,
        message: 'Invoice already processed',
        orderId: order._id
      };
    }

    // Update payment info
    order.paymentInfo.razorpayPaymentId = razorpayPaymentId;
    order.paymentInfo.status = 'completed';
    order.paymentInfo.paidAt = new Date();
    order.orderStatus = 'confirmed';

    // Add status history
    order.statusHistory.push({
      status: 'confirmed',
      note: `Payment captured via webhook - ₹${amount}`,
      timestamp: new Date()
    });

    // Create Razorpay invoice
    try {
      const invoice = await createRazorpayInvoice(order, {
        razorpay_payment_id: razorpayPaymentId
      });

      // Update invoice info in order
      order.invoiceInfo = {
        razorpayInvoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        invoiceUrl: invoice.short_url,
        invoiceStatus: 'paid',
        issuedAt: new Date(),
        webhookProcessed: true
      };

      console.log(`Invoice ${invoice.invoice_number} created for order ${order.orderNumber}`);
    } catch (invoiceError) {
      console.error('Failed to create invoice, but payment is captured:', invoiceError);
      // Mark webhook as processed even if invoice creation fails
      // This prevents retries from creating duplicate invoices
      order.invoiceInfo = {
        webhookProcessed: true,
        invoiceStatus: 'pending'
      };
      
      order.statusHistory.push({
        status: 'confirmed',
        note: 'Invoice creation failed - manual intervention required',
        timestamp: new Date()
      });
    }

    await order.save();

    return {
      success: true,
      message: 'Payment processed and invoice created',
      orderId: order._id,
      invoiceId: order.invoiceInfo?.razorpayInvoiceId
    };
  } catch (error) {
    console.error('Error handling payment.captured:', error);
    throw error;
  }
}

/**
 * Handle payment.failed event
 * Marks order as failed, no invoice created
 */
async function handlePaymentFailed(payload) {
  try {
    const payment = payload.payment.entity;
    const razorpayOrderId = payment.order_id;
    const razorpayPaymentId = payment.id;
    const errorDescription = payment.error_description || 'Payment failed';

    console.log(`Processing payment.failed for payment: ${razorpayPaymentId}`);

    // Find order by Razorpay order ID
    const order = await Order.findOne({
      'paymentInfo.razorpayOrderId': razorpayOrderId
    });

    if (!order) {
      console.error(`Order not found for Razorpay order ID: ${razorpayOrderId}`);
      return {
        success: false,
        message: 'Order not found'
      };
    }

    // Update payment info
    order.paymentInfo.razorpayPaymentId = razorpayPaymentId;
    order.paymentInfo.status = 'failed';
    order.orderStatus = 'cancelled';
    order.cancelReason = errorDescription;
    order.cancelledAt = new Date();

    // Add status history
    order.statusHistory.push({
      status: 'cancelled',
      note: `Payment failed via webhook - ${errorDescription}`,
      timestamp: new Date()
    });

    // Mark invoice webhook as processed (no invoice will be created)
    order.invoiceInfo = {
      webhookProcessed: true,
      invoiceStatus: 'cancelled'
    };

    await order.save();

    console.log(`Order ${order.orderNumber} marked as failed`);

    return {
      success: true,
      message: 'Payment failure processed',
      orderId: order._id
    };
  } catch (error) {
    console.error('Error handling payment.failed:', error);
    throw error;
  }
}

/**
 * @route   POST /api/webhooks/razorpay
 * @desc    Handle Razorpay webhooks
 * @access  Public (but signature verified)
 */
router.post('/razorpay', verifyWebhookSignature, async (req, res) => {
  try {
    const { event, payload } = req.body;

    console.log(`Received Razorpay webhook event: ${event}`);

    let result;

    switch (event) {
      case 'payment.captured':
        result = await handlePaymentCaptured(payload);
        break;

      case 'payment.failed':
        result = await handlePaymentFailed(payload);
        break;

      case 'payment.authorized':
        console.log('Payment authorized event received (no action needed)');
        result = { success: true, message: 'Payment authorized' };
        break;

      case 'order.paid':
        console.log('Order paid event received (handled by payment.captured)');
        result = { success: true, message: 'Order paid' };
        break;

      default:
        console.log(`Unhandled webhook event: ${event}`);
        result = { success: true, message: 'Event received but not processed' };
    }

    // Always return 200 to Razorpay to acknowledge receipt
    res.status(200).json({
      success: true,
      message: result.message || 'Webhook processed',
      event
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Still return 200 to prevent Razorpay from retrying
    // Log the error for manual investigation
    res.status(200).json({
      success: false,
      message: 'Webhook received but processing failed',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/webhooks/test
 * @desc    Test endpoint to verify webhook route is working
 * @access  Public
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
