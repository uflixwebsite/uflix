const mongoose = require('mongoose');

const sectionItemSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  icon: { type: String, default: '' },
  image: { type: String, default: '' },
  mobileImage: { type: String, default: '' },
  mobileTitle: { type: String, default: '' },
  mobileSubtitle: { type: String, default: '' },
  link: { type: String, default: '' },
  linkText: { type: String, default: '' },
  items: [{ type: String }],
  stats: { type: String, default: '' },
  statsLabel: { type: String, default: '' },
  titleColor: { type: String, default: '' },
  subtitleColor: { type: String, default: '' },
  mobileTitleColor: { type: String, default: '' },
  mobileSubtitleColor: { type: String, default: '' },
  primaryButtonBg: { type: String, default: '' },
  primaryButtonTextColor: { type: String, default: '' },
  secondaryButtonBg: { type: String, default: '' },
  secondaryButtonTextColor: { type: String, default: '' }
}, { _id: true });

const sectionSchema = new mongoose.Schema({
  sectionId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['hero', 'content', 'features', 'stats', 'cta', 'cards', 'gallery', 'contact-info', 'form', 'text-image', 'list', 'custom'],
    default: 'content'
  },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  mobileImage: { type: String, default: '' },
  mobileTitle: { type: String, default: '' },
  mobileSubtitle: { type: String, default: '' },
  imageAlt: { type: String, default: '' },
  bgColor: { type: String, default: 'white' },
  items: [sectionItemSchema],
  content: { type: String, default: '' },
  link: { type: String, default: '' },
  linkText: { type: String, default: '' },
  secondaryLink: { type: String, default: '' },
  secondaryLinkText: { type: String, default: '' },
  titleColor: { type: String, default: '' },
  subtitleColor: { type: String, default: '' },
  mobileTitleColor: { type: String, default: '' },
  mobileSubtitleColor: { type: String, default: '' },
  primaryButtonBg: { type: String, default: '' },
  primaryButtonTextColor: { type: String, default: '' },
  secondaryButtonBg: { type: String, default: '' },
  secondaryButtonTextColor: { type: String, default: '' },
  order: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true }
}, { _id: true });

const pageContentSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  sections: [sectionSchema]
}, {
  timestamps: true
});


module.exports = mongoose.model('PageContent', pageContentSchema);
