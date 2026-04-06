const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, admin, optionalProtect } = require('../middleware/auth');
const { generateAndUploadInvoice } = require('../utils/invoiceGenerator');
const { sendOrderPlacedNotifications } = require('../utils/emailService');

const createGuestAccessToken = () => crypto.randomBytes(24).toString('hex');
const hashGuestAccessToken = (token) =>
  crypto.createHash('sha256').update(String(token || '')).digest('hex');

const isGuestTokenValidForOrder = (order, providedToken) => {
  if (!order?.isGuestOrder) {
    return false;
  }

  if (!providedToken || !order.guestAccessTokenHash || !order.guestAccessTokenExpiresAt) {
    return false;
  }

  if (new Date(order.guestAccessTokenExpiresAt).getTime() < Date.now()) {
    return false;
  }

  return hashGuestAccessToken(providedToken) === order.guestAccessTokenHash;
};

// @route   POST /api/orders
// @desc    Create new order (supports guest checkout)
// @access  Public/Private
router.post('/', optionalProtect, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentInfo,
      guestCustomer,
      isBusinessPurchase,
      businessDetails,
    } = req.body;

    const gstPattern = /^[0-9A-Z]{15}$/;
    const isB2BPurchase = isBusinessPurchase === true || isBusinessPurchase === 'true';

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items'
      });
    }

    // Verify stock and calculate prices
    let itemsPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      const price = product.discountPrice || product.price;
      itemsPrice += price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        quantity: item.quantity,
        price: product.price,
        discountPrice: product.discountPrice
      });
    }

    // Product prices are tax-inclusive, so only calculate shipping separately
    const taxPrice = 0;
    let shippingPrice = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      shippingPrice += (product.shippingFees || 0);
    }
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    // Validate guest customer info if guest order
    if (req.isGuest) {
      if (!guestCustomer || !guestCustomer.name || !guestCustomer.email || !guestCustomer.phone) {
        return res.status(400).json({
          success: false,
          message: 'Guest customer information (name, email, phone) is required for guest checkout'
        });
      }
    }

    if (isB2BPurchase) {
      const companyName = String(businessDetails?.companyName || '').trim();
      const gstNumber = String(businessDetails?.gstNumber || '').trim().toUpperCase();

      if (!companyName || !gstPattern.test(gstNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Valid company name and 15-character GST number are required for business purchase'
        });
      }
    }

    // Create order
    const orderData = {
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isBusinessPurchase: isB2BPurchase,
      businessDetails: isB2BPurchase
        ? {
            companyName: String(businessDetails?.companyName || '').trim(),
            gstNumber: String(businessDetails?.gstNumber || '').trim().toUpperCase(),
          }
        : undefined,
      orderStatus: paymentMethod === 'cod' ? 'confirmed' : 'pending'
    };

    let guestAccessToken = null;

    // Add user or guest customer info
    if (req.isGuest) {
      guestAccessToken = createGuestAccessToken();
      orderData.isGuestOrder = true;
      orderData.guestCustomer = {
        name: guestCustomer.name,
        email: guestCustomer.email,
        phone: guestCustomer.phone
      };
      orderData.guestAccessTokenHash = hashGuestAccessToken(guestAccessToken);
      orderData.guestAccessTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else {
      orderData.user = req.user._id;
      orderData.isGuestOrder = false;
    }

    const order = await Order.create(orderData);

    const customerInfo = req.isGuest
      ? {
          name: guestCustomer?.name,
          email: guestCustomer?.email,
          phone: guestCustomer?.phone,
        }
      : {
          name: req.user?.name,
          email: req.user?.email,
          phone: req.user?.phone,
        };

    let invoiceInfo = null;
    try {
      invoiceInfo = await generateAndUploadInvoice(order, customerInfo);
      order.invoiceUrl = invoiceInfo.url;
      order.invoicePublicId = invoiceInfo.publicId;
      await order.save();
    } catch (invoiceError) {
      console.error('Invoice generation failed:', invoiceError);
    }

    const shouldSendOrderNotifications =
      paymentMethod === 'cod' ||
      paymentInfo?.status === 'completed';

    if (shouldSendOrderNotifications) {
      try {
        await sendOrderPlacedNotifications({
          order,
          customer: customerInfo,
          invoice: invoiceInfo,
        });
      } catch (emailError) {
        console.error('Order email notifications failed:', emailError);
      }
    }

    // Update product stock and sold count
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity }
      });
    }

    // Clear user's cart (only for logged-in users)
    if (!req.isGuest && req.user) {
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { items: [] }
      );
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name images');

    res.status(201).json({
      success: true,
      data: populatedOrder,
      guestAccessToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Order.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: orders,
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

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private or tokenized guest access
router.get('/:id', optionalProtect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images price')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const orderAccessToken = String(
      req.query.token || req.headers['x-order-access-token'] || ''
    );

    // Logged-in user can access only own order or admin override
    if (req.user) {
      if (order.isGuestOrder && req.user.role !== 'admin' && !isGuestTokenValidForOrder(order, orderAccessToken)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this order'
        });
      }

      if (order.user && order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this order'
        });
      }
    } else if (!isGuestTokenValidForOrder(order, orderAccessToken)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order at this stage'
      });
    }

    order.orderStatus = 'cancelled';
    order.cancelledAt = Date.now();
    order.cancelReason = req.body.reason || 'Cancelled by user';
    order.statusHistory.push({
      status: 'cancelled',
      note: req.body.reason,
      updatedBy: req.user._id
    });

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, sold: -item.quantity }
      });
    }

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/orders/:id/track
// @desc    Track order
// @access  Private or tokenized guest access
router.get('/:id/track', optionalProtect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .select('user isGuestOrder guestAccessTokenHash guestAccessTokenExpiresAt orderNumber orderStatus statusHistory trackingInfo createdAt deliveredAt')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const orderAccessToken = String(
      req.query.token || req.headers['x-order-access-token'] || ''
    );

    if (req.user) {
      if (order.isGuestOrder && req.user.role !== 'admin' && !isGuestTokenValidForOrder(order, orderAccessToken)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to track this order'
        });
      }

      if (order.user && order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to track this order'
        });
      }
    } else if (!isGuestTokenValidForOrder(order, orderAccessToken)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to track this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
