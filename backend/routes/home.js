const express = require('express');
const router = express.Router();
const HomeSettings = require('../models/HomeSettings');
const { protect, admin } = require('../middleware/auth');

// Default data used when no settings exist yet
const getDefaults = () => ({
  sections: [
    { type: 'hero', enabled: true, order: 0 },
    { type: 'clients', enabled: true, order: 1 },
    { type: 'categories', enabled: true, order: 2 },
    { type: 'collections', enabled: true, order: 3 },
    { type: 'products', enabled: true, order: 4 },
    { type: 'testimonials', enabled: true, order: 5 },
    { type: 'brandStory', enabled: true, order: 6 },
    { type: 'benefits', enabled: true, order: 7 }
  ],
  hero: {
    slides: [
      { image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=80', title: 'Transform Your Living Space', subtitle: 'Discover premium furniture that combines style and comfort', buttonText: 'Shop Now', buttonLink: '/shop' },
      { image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=1920&q=80', title: 'Bedroom Elegance', subtitle: 'Create your perfect sanctuary with our curated collection', buttonText: 'Shop Now', buttonLink: '/shop' },
      { image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=1920&q=80', title: 'Dining in Style', subtitle: 'Gather around beautiful furniture made for memorable moments', buttonText: 'Shop Now', buttonLink: '/shop' }
    ]
  },
  clients: {
    title: 'Trusted by Leading Organizations',
    logos: [
      { name: 'AIIMS Kalyani', image: '/Logos/aiimskalyani.png' },
      { name: 'Indian Oil', image: '/Logos/indianoil.png' },
      { name: 'CPWD', image: '/Logos/cpwd.png' },
      { name: 'L&T', image: '/Logos/lnt.png' },
      { name: 'NBCC', image: '/Logos/nbcc.png' },
      { name: 'IRCON', image: '/Logos/ircon.png' },
      { name: 'Lifestyle', image: '/Logos/lifetsyle.png' },
      { name: 'Landmark Group', image: '/Logos/landmark.jpg' },
      { name: 'Daikin', image: '/Logos/daikin.jpg' },
      { name: 'IGL', image: '/Logos/igl.png' },
      { name: 'HLL', image: '/Logos/hll.jpg' }
    ]
  },
  collections: {
    title: 'Featured Collections',
    subtitle: 'Curated selections for every style and space',
    items: [
      { title: 'Modern Minimalist', description: 'Clean lines and contemporary design for the modern home', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80', itemCount: 45, link: '/shop' },
      { title: 'Classic Elegance', description: 'Timeless pieces that never go out of style', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', itemCount: 38, link: '/shop' },
      { title: 'Scandinavian Comfort', description: 'Cozy and functional Nordic-inspired furniture', image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80', itemCount: 52, link: '/shop' }
    ]
  },
  productSections: {
    bestSellers: { enabled: true, title: 'Best Sellers', subtitle: 'Our most popular and loved furniture pieces chosen by customers', limit: 8 },
    newArrivals: { enabled: true, title: 'New Arrivals', subtitle: 'Discover our latest furniture collections and designs', limit: 8 },
    categoryProducts: []
  },
  testimonials: {
    title: 'Loved by Thousands of Happy Customers',
    description: 'See what our customers have to say about their Uflix furniture experience',
    items: [
      { name: 'Priya Sharma', handle: '@priyahome', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face', text: 'The quality of furniture from Uflix is exceptional. Our living room transformation exceeded all expectations. Highly recommend!' },
      { name: 'Rahul Mehta', handle: '@rahulinteriors', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', text: 'Fast delivery and excellent customer service. The dining set we ordered arrived perfectly packaged and assembly was a breeze.' },
      { name: 'Anjali Patel', handle: '@anjalidesign', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face', text: 'Best furniture shopping experience online. The product photos match exactly what we received. Very satisfied with our bedroom set!' }
    ]
  },
  brandStory: {
    title: 'Our Story',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
    paragraphs: [
      'At Uflix, we believe that furniture is more than just functional pieces. It\'s about creating spaces that inspire, comfort, and bring people together.',
      'Since our founding, we\'ve been committed to offering premium quality furniture that combines timeless design with modern craftsmanship.'
    ],
    stats: [
      { value: '15+', label: 'Years Experience' },
      { value: '50K+', label: 'Happy Customers' },
      { value: '500+', label: 'Products' }
    ]
  },
  benefits: {
    title: 'Why Shop With Us',
    subtitle: 'Experience the Uflix difference',
    items: [
      { icon: 'check', title: 'Premium Quality', description: 'Handpicked materials and expert craftsmanship in every piece' },
      { icon: 'gift', title: 'Free Shipping', description: 'Free delivery on orders above ₹15,000' },
      { icon: 'shield', title: 'Secure Payment', description: 'Safe and encrypted payment processing' },
      { icon: 'refresh', title: 'Easy Returns', description: '30-day hassle-free return policy' }
    ]
  }
});

// @route   GET /api/home
// @desc    Get home page settings (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    let settings = await HomeSettings.findOne();
    if (!settings) {
      // Return defaults if nothing saved yet
      return res.json({ success: true, data: getDefaults() });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/home
// @desc    Update home page settings
// @access  Private/Admin
router.put('/', protect, admin, async (req, res) => {
  try {
    let settings = await HomeSettings.findOne();
    if (!settings) {
      settings = await HomeSettings.create(req.body);
    } else {
      // Update all provided fields
      const fields = ['sections', 'hero', 'clients', 'collections', 'productSections', 'testimonials', 'brandStory', 'benefits', 'categorySlider', 'photoGrid', 'promoCards', 'statsBanner'];
      fields.forEach(field => {
        if (req.body[field] !== undefined) {
          settings[field] = req.body[field];
        }
      });
      await settings.save();
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/home/sections
// @desc    Update section order and visibility
// @access  Private/Admin
router.put('/sections', protect, admin, async (req, res) => {
  try {
    let settings = await HomeSettings.findOne();
    if (!settings) {
      settings = await HomeSettings.create({ sections: req.body.sections });
    } else {
      settings.sections = req.body.sections;
      await settings.save();
    }
    res.json({ success: true, data: settings.sections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/home/:section
// @desc    Update a specific section
// @access  Private/Admin
router.put('/:section', protect, admin, async (req, res) => {
  try {
    const { section } = req.params;
    const validSections = ['hero', 'clients', 'collections', 'productSections', 'testimonials', 'brandStory', 'benefits', 'sections', 'categorySlider', 'photoGrid', 'promoCards', 'statsBanner'];
    
    if (!validSections.includes(section)) {
      return res.status(400).json({ success: false, message: 'Invalid section' });
    }

    let settings = await HomeSettings.findOne();
    if (!settings) {
      const defaults = getDefaults();
      defaults[section] = req.body;
      settings = await HomeSettings.create(defaults);
    } else {
      settings[section] = req.body;
      await settings.save();
    }
    res.json({ success: true, data: settings[section] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
