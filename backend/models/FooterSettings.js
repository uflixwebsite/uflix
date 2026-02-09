const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  url: { type: String, required: true },
  enabled: { type: Boolean, default: true }
}, { _id: true });

const navLinkSchema = new mongoose.Schema({
  label: { type: String, required: true },
  url: { type: String, required: true },
  enabled: { type: Boolean, default: true }
}, { _id: true });

const linkColumnSchema = new mongoose.Schema({
  title: { type: String, required: true },
  links: [navLinkSchema],
  enabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { _id: true });

const contactItemSchema = new mongoose.Schema({
  type: { type: String, enum: ['address', 'phone', 'email', 'custom'], required: true },
  label: { type: String, required: true },
  value: { type: String, required: true },
  enabled: { type: Boolean, default: true }
}, { _id: true });

const bottomLinkSchema = new mongoose.Schema({
  label: { type: String, required: true },
  url: { type: String, required: true },
  enabled: { type: Boolean, default: true }
}, { _id: true });

const footerSettingsSchema = new mongoose.Schema({
  // Brand section
  brandName: { type: String, default: 'UFLIX' },
  brandDescription: { type: String, default: '' },
  
  // Social media links
  socialLinks: [socialLinkSchema],
  
  // Navigation link columns
  linkColumns: [linkColumnSchema],
  
  // Contact info
  contactTitle: { type: String, default: 'Contact' },
  contactItems: [contactItemSchema],
  
  // Bottom bar
  copyrightText: { type: String, default: '© 2026 Uflix. All rights reserved.' },
  bottomLinks: [bottomLinkSchema],
  
  // Meta
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('FooterSettings', footerSettingsSchema);
