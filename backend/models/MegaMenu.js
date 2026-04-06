const mongoose = require('mongoose');

const megaMenuSchema = new mongoose.Schema({
  // Which page this mega menu is for
  pagePath: {
    type: String,
    required: true,
    trim: true,
    default: '*' // * means default/all pages
  },
  // Which navbar link this mega menu is for
  navbarLinkUrl: {
    type: String,
    required: true,
    trim: true
  },
  navbarLinkLabel: {
    type: String,
    required: true,
    trim: true
  },
  // Left column - Category names
  categories: [{
    id: String,
    name: String,
    order: Number,
    enabled: {
      type: Boolean,
      default: true
    }
  }],
  // Right column - Items for each category
  items: [{
    id: String,
    categoryId: String, // Which left category this belongs to
    title: String,
    url: String,
    image: String, // Optional image
    order: Number,
    enabled: {
      type: Boolean,
      default: true
    }
  }],
  enabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for fast lookups
megaMenuSchema.index({ pagePath: 1, navbarLinkUrl: 1 });

module.exports = mongoose.model('MegaMenu', megaMenuSchema);
