const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema({
  image: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  buttonText: { type: String, default: 'Shop Now' },
  buttonLink: { type: String, default: '/shop' },
  titleColor: { type: String, default: '' },
  subtitleColor: { type: String, default: '' },
  primaryButtonBg: { type: String, default: '' },
  primaryButtonTextColor: { type: String, default: '' },
  secondaryButtonBg: { type: String, default: '' },
  secondaryButtonTextColor: { type: String, default: '' }
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
  link: { type: String, default: '/shop' },
  buttonText: { type: String, default: 'Explore Collection' },
  primaryButtonBg: { type: String, default: '' },
  primaryButtonTextColor: { type: String, default: '' }
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
    enum: ['hero', 'clients', 'categories', 'collections', 'products', 'testimonials', 'brandStory', 'benefits', 'categorySlider', 'photoGrid', 'promoCards', 'statsBanner']
  },
  enabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { _id: true });

const categorySliderSubSchema = new mongoose.Schema({
  name: { type: String },
  image: { type: String },
  link: { type: String, default: '/shop' }
}, { _id: false });

const categorySliderCatSchema = new mongoose.Schema({
  name: { type: String },
  subcategories: [categorySliderSubSchema]
}, { _id: false });

const photoGridItemSchema = new mongoose.Schema({
  image: { type: String },
  label: { type: String },
  link: { type: String, default: '/shop' },
  showInstagramIcon: { type: Boolean, default: true }
}, { _id: false });

const promoCardSchema = new mongoose.Schema({
  category: { type: String },
  title: { type: String },
  buttonText: { type: String, default: 'Book a consultation' },
  buttonLink: { type: String, default: '/contact' },
  primaryButtonBg: { type: String, default: '' },
  primaryButtonTextColor: { type: String, default: '' },
  image: { type: String },
  note: { type: String }
}, { _id: false });

const statsBannerStatSchema = new mongoose.Schema({
  value: { type: String },
  label: { type: String }
}, { _id: false });

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
      limit: { type: Number, default: 8 },
      ctaText: { type: String, default: 'View All Products' },
      ctaLink: { type: String, default: '/shop' },
      primaryButtonBg: { type: String, default: '' },
      primaryButtonTextColor: { type: String, default: '' }
    },
    newArrivals: {
      enabled: { type: Boolean, default: true },
      title: { type: String, default: 'New Arrivals' },
      subtitle: { type: String, default: 'Discover our latest furniture collections and designs' },
      limit: { type: Number, default: 8 },
      ctaText: { type: String, default: 'View All Products' },
      ctaLink: { type: String, default: '/shop' },
      primaryButtonBg: { type: String, default: '' },
      primaryButtonTextColor: { type: String, default: '' }
    },
    categoryProducts: [{
      category: { type: String, required: true },
      categoryName: { type: String },
      title: { type: String },
      subtitle: { type: String },
      limit: { type: Number, default: 8 },
      enabled: { type: Boolean, default: true },
      ctaText: { type: String, default: '' },
      ctaLink: { type: String, default: '' },
      primaryButtonBg: { type: String, default: '' },
      primaryButtonTextColor: { type: String, default: '' }
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
  },

  // Category slider (tabbed categories with subcategory images)
  categorySlider: {
    title: { type: String },
    categories: [categorySliderCatSchema]
  },

  // Photo grid / Instagram-style grid
  photoGrid: {
    title: { type: String },
    photos: [photoGridItemSchema]
  },

  // Promo cards (two tall portrait cards)
  promoCards: {
    cards: [promoCardSchema]
  },

  // Stats / numbers banner
  statsBanner: {
    title: { type: String },
    subtitle: { type: String },
    bgColor: { type: String, default: '#f05a54' },
    stats: [statsBannerStatSchema]
  },

  // Global button theme used across most public pages
  siteButtonTheme: {
    primaryBg: { type: String, default: '#FF6B35' },
    primaryText: { type: String, default: '#FFFFFF' },
    primaryHoverBg: { type: String, default: '#C73E1D' },
    secondaryBg: { type: String, default: '#C73E1D' },
    secondaryText: { type: String, default: '#FFFFFF' },
    secondaryHoverBg: { type: String, default: '#E85A2A' },
    outlineBg: { type: String, default: 'transparent' },
    outlineText: { type: String, default: '#FF6B35' },
    outlineBorder: { type: String, default: '#FF6B35' },
    outlineHoverBg: { type: String, default: '#FF6B35' },
    outlineHoverText: { type: String, default: '#FFFFFF' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HomeSettings', homeSettingsSchema);
