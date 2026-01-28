const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, admin, optionalProtect } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create new order (supports guest checkout)
// @access  Public/Private
router.post('/', optionalProtect, async (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, paymentMethod, paymentInfo, guestCustomer } = req.body;

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

    // Calculate tax and shipping
    const taxPrice = itemsPrice * 0.18; // 18% GST
    const shippingPrice = itemsPrice > 5000 ? 0 : 200;
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
      orderStatus: paymentMethod === 'cod' ? 'confirmed' : 'pending'
    };

    // Add user or guest customer info
    if (req.isGuest) {
      orderData.isGuestOrder = true;
      orderData.guestCustomer = {
        name: guestCustomer.name,
        email: guestCustomer.email,
        phone: guestCustomer.phone
      };
    } else {
      orderData.user = req.user._id;
      orderData.isGuestOrder = false;
    }

    const order = await Order.create(orderData);

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
      data: populatedOrder
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
// @access  Public/Private (supports guest orders)
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

    // For logged-in users, check if they own this order or are admin
    if (!req.isGuest && req.user) {
      if (order.user && order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this order'
        });
      }
    }
    // Guest orders are accessible by anyone with the order ID (like a receipt)

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
// @access  Public (with order number)
router.get('/:id/track', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .select('orderNumber orderStatus statusHistory trackingInfo createdAt deliveredAt')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
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
