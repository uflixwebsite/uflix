const mongoose = require('mongoose');

const navLinkSchema = new mongoose.Schema({
  label: { type: String, required: true },
  url: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { _id: true });

const navConfigSchema = new mongoose.Schema({
  // Path to match (exact match). Use '*' for default.
  path: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  links: [navLinkSchema]
}, { _id: true });

const navbarSettingsSchema = new mongoose.Schema({
  configs: [navConfigSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('NavbarSettings', navbarSettingsSchema);
