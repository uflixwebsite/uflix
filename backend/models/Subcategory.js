const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['living', 'bedroom', 'dining', 'home-office', 'modular-kitchen', 'storage', 'for-homes', 'for-businesses']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subcategory', subcategorySchema);
