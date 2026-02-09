const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  buttonText: { type: String, default: 'Shop Now' },
  buttonLink: { type: String, default: '/shop' }
}, { _id: true });

const clientLogoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }
}, { _id: true });

const collectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String, required: true },
  itemCount: { type: Number, default: 0 },
  link: { type: String, default: '/shop' }
}, { _id: true });

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  handle: { type: String },
  avatar: { type: String },
  text: { type: String, required: true }
}, { _id: true });

const statSchema = new mongoose.Schema({
  value: { type: String, required: true },
  label: { type: String, required: true }
}, { _id: true });

const benefitSchema = new mongoose.Schema({
  icon: { type: String, default: 'check' },
  title: { type: String, required: true },
  description: { type: String }
}, { _id: true });

const productSectionSchema = new mongoose.Schema({
  title: { type: String },
  subtitle: { type: String },
  categories: [{ type: String }],
  showBestSellers: { type: Boolean, default: false },
  showNewArrivals: { type: Boolean, default: false },
  limit: { type: Number, default: 8 }
}, { _id: false });

const sectionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['hero', 'clients', 'categories', 'collections', 'products', 'testimonials', 'brandStory', 'benefits']
  },
  enabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { _id: true });

const homeSettingsSchema = new mongoose.Schema({
  // Section ordering and visibility
  sections: [sectionSchema],

  // Hero section
  hero: {
    slides: [heroSlideSchema]
  },

  // Client logos carousel
  clients: {
    title: { type: String, default: 'Trusted by Leading Organizations' },
    logos: [clientLogoSchema]
  },

  // Featured collections
  collections: {
    title: { type: String, default: 'Featured Collections' },
    subtitle: { type: String, default: 'Curated selections for every style and space' },
    items: [collectionSchema]
  },

  // Product sections (best sellers, new arrivals, category-specific)
  productSections: {
    bestSellers: {
      enabled: { type: Boolean, default: true },
      title: { type: String, default: 'Best Sellers' },
      subtitle: { type: String, default: 'Our most popular and loved furniture pieces chosen by customers' },
      limit: { type: Number, default: 8 }
    },
    newArrivals: {
      enabled: { type: Boolean, default: true },
      title: { type: String, default: 'New Arrivals' },
      subtitle: { type: String, default: 'Discover our latest furniture collections and designs' },
      limit: { type: Number, default: 8 }
    },
    categoryProducts: [{
      category: { type: String, required: true },
      categoryName: { type: String },
      title: { type: String },
      subtitle: { type: String },
      limit: { type: Number, default: 8 },
      enabled: { type: Boolean, default: true }
    }]
  },

  // Testimonials
  testimonials: {
    title: { type: String, default: 'Loved by Thousands of Happy Customers' },
    description: { type: String, default: 'See what our customers have to say about their Uflix furniture experience' },
    items: [testimonialSchema]
  },

  // Brand story / Our Story
  brandStory: {
    title: { type: String, default: 'Our Story' },
    image: { type: String, default: '' },
    paragraphs: [{ type: String }],
    stats: [statSchema]
  },

  // Benefits / Why shop with us
  benefits: {
    title: { type: String, default: 'Why Shop With Us' },
    subtitle: { type: String, default: 'Experience the Uflix difference' },
    items: [benefitSchema]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HomeSettings', homeSettingsSchema);
