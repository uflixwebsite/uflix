const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  isGuestOrder: {
    type: Boolean,
    default: false
  },
  guestCustomer: {
    name: String,
    email: String,
    phone: String
  },
  guestAccessTokenHash: {
    type: String,
    default: null,
  },
  guestAccessTokenExpiresAt: {
    type: Date,
    default: null,
  },
  isBusinessPurchase: {
    type: Boolean,
    default: false,
  },
  businessDetails: {
    companyName: String,
    gstNumber: String,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    image: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    discountPrice: Number,
    // Variant information
    variant: {
      _id: mongoose.Schema.Types.ObjectId,
      color: String,
      size: String,
      sku: String
    }
  }],
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  billingAddress: {
    name: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cod'],
    required: true
  },
  paymentInfo: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paidAt: Date
  },
  invoiceInfo: {
    razorpayInvoiceId: String,
    invoiceNumber: String,
    invoiceUrl: String,
    invoiceStatus: {
      type: String,
      enum: ['pending', 'issued', 'paid', 'cancelled'],
      default: 'pending'
    },
    issuedAt: Date,
    webhookProcessed: {
      type: Boolean,
      default: false
    }
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  trackingInfo: {
    carrier: String,
    trackingNumber: String,
    trackingUrl: String
  },
  notes: String,
  cancelReason: String,
  deliveredAt: Date,
  cancelledAt: Date,
  invoiceUrl: String,
  invoicePublicId: String
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function() {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `UFL${year}${month}${random}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);
