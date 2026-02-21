const mongoose = require('mongoose');

const navbarItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  enableMegaMenu: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 1
  },
  enabled: {
    type: Boolean,
    default: true
  },
  megaMenuCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MegaMenuCategory'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('NavbarItem', navbarItemSchema);
