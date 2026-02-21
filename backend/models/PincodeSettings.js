const mongoose = require('mongoose');

const pincodeEntrySchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true,
    unique: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  transitDays: {
    type: String,
    required: [true, 'Transit days is required'],
    trim: true
  },
  assemblyDays: {
    type: String,
    required: [true, 'Assembly days is required'],
    trim: true
  },
  enabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster lookups
pincodeEntrySchema.index({ pincode: 1 });

const pincodeSettingsSchema = new mongoose.Schema({
  pincodes: [pincodeEntrySchema]
}, {
  timestamps: true
});

// Default settings initialization (fallback)
pincodeSettingsSchema.statics.getDefaultSettings = function() {
  return {
    pincodes: [
      {
        pincode: '201',
        state: 'Uttar Pradesh',
        city: 'Noida',
        transitDays: '1–3 Days',
        assemblyDays: '1-2 Days',
        enabled: true
      },
      {
        pincode: '11',
        state: 'Delhi',
        city: 'Delhi',
        transitDays: '1–3 Days',
        assemblyDays: '1-2 Days',
        enabled: true
      },
      {
        pincode: '12',
        state: 'Haryana',
        city: 'Gurugram',
        transitDays: '1–3 Days',
        assemblyDays: '1-2 Days',
        enabled: true
      }
    ]
  };
};

module.exports = mongoose.model('PincodeSettings', pincodeSettingsSchema);
