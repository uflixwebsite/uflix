const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['living', 'bedroom', 'home-office', 'modular-kitchen', 'storage', 'shop-fittings', 'for-businesses']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subcategory', subcategorySchema);
