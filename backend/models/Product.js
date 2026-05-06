const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String
  },
  sku: {
    type: String,
    default: null
  },
  price: {
    type: Number,
    min: 0,
    default: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  shippingFees: {
    type: Number,
    min: 0,
    default: 0
  },
  categories: [{
    type: String,
    trim: true
  }],
  // New: primary category reference (any depth in tree)
  categoryRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  // Multi-category references — a product can belong to multiple nodes at any depth
  categoryRefs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  // Single subcategory (no path/level/hierarchy)
  subcategory: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
      default: null
    },
    name: {
      type: String,
      trim: true,
      default: ''
    }
  },
  images: [{
    url: {
      type: String,
      required: [true, 'Product image is required']
    },
    alt: String
  }],
  video: {
    type: String,
    default: null
  },
  specifications: [{
    key: String,
    value: String
  }],
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: { type: String, default: 'cm' }
  },
  weight: {
    value: Number,
    unit: { type: String, default: 'kg' }
  },
  material: String,
  color: [String],
  tags: [String],
  // Variants with color, size, and stock
  variants: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    name: {
      type: String,
      trim: true
    },
    sku: {
      type: String,
      trim: true
    },
    color: {
      type: String,
      trim: true,
      default: ''
    },
    size: {
      type: String,
      trim: true,
      default: ''
    },
    price: {
      type: Number,
      min: 0
    },
    discountPrice: {
      type: Number,
      min: 0
    },
    stock: {
      quantity: { type: Number, default: 0 },
      reserved: { type: Number, default: 0 }
    },
    images: [{
      url: String,
      alt: String
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    description: {
      type: String,
      trim: true
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: { type: String, default: 'cm' }
    },
    weight: {
      value: Number,
      unit: { type: String, default: 'kg' }
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  bestSeller: {
    type: Boolean,
    default: false
  },
  newArrival: {
    type: Boolean,
    default: false
  },
  availableOnQuotation: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  sold: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create slug from name before saving
productSchema.pre('save', async function() {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});

// Index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
