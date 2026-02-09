const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Material name is required'],
    trim: true,
    lowercase: true,
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Material', materialSchema);
