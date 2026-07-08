const mongoose = require('mongoose');
const PageContent = require('../models/PageContent');
require('dotenv').config();

const SLUG = 'cable-tray-manufacture-delhi-ncr';

const sections = [
  {
    sectionId: 'hero',
    type: 'hero',
    bgColor: 'dark',
    order: 0,
    isVisible: true,
    title: 'Cable Tray Manufacturer in Delhi NCR',
    subtitle: 'Premium Cable Management Solutions',
    description: 'Leading manufacturer of cable trays, ladder trays, and perforated cable trays for industrial, commercial, and institutional projects across Delhi NCR.',
    link: '#products',
    linkText: 'Browse Products',
    secondaryLink: '/contact',
    secondaryLinkText: 'Request a Quote',
    image: '',
    items: [],
  },
  {
    sectionId: 'slider',
    type: 'custom',
    bgColor: 'white',
    order: 1,
    isVisible: true,
    title: 'Product Slider',
    description: '',
    image: '',
    items: [],
  },
  {
    sectionId: 'stats-bar',
    type: 'custom',
    bgColor: 'white',
    order: 4,
    isVisible: true,
    title: 'Stats Bar',
    description: '',
    image: '',
    items: [],
  },
  {
    sectionId: 'image-grid',
    type: 'custom',
    bgColor: 'white',
    order: 5,
    isVisible: true,
    title: 'Image Grid',
    description: '',
    image: '',
    items: [],
  },
  {
    sectionId: 'split-1',
    type: 'custom',
    bgColor: 'white',
    order: 6,
    isVisible: true,
    title: 'Split Section 1',
    description: '',
    image: '',
    link: '',
    linkText: 'Learn More',
    items: [],
  },
  {
    sectionId: 'split-2',
    type: 'custom',
    bgColor: 'light',
    order: 7,
    isVisible: true,
    title: 'Split Section 2',
    description: '',
    image: '',
    link: '',
    linkText: 'Learn More',
    items: [],
  },
  {
    sectionId: 'projects',
    type: 'custom',
    bgColor: 'white',
    order: 8,
    isVisible: true,
    title: 'Flagship Projects',
    description: '',
    image: '',
    items: [],
  },
  {
    sectionId: 'cta',
    type: 'cta',
    bgColor: 'dark',
    order: 9,
    isVisible: true,
    title: 'Need Bulk Cable Tray Orders or Custom Solutions?',
    subtitle: 'Bottom call-to-action section.',
    description: 'We specialise in large-scale industrial and commercial cable management projects. Talk to our team for a personalised quote.',
    link: '/contact',
    linkText: 'Get Bulk Quote',
    secondaryLink: 'https://wa.me/917303836300',
    secondaryLinkText: 'WhatsApp Us',
    image: '',
    items: [],
  },
];

async function createCableTrayPage() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await PageContent.findOne({ slug: SLUG });

    if (existing) {
      console.log('Page already exists — skipping. Delete it first to re-seed.');
    } else {
      await PageContent.create({
        slug: SLUG,
        title: 'Cable Tray Manufacturer Delhi NCR',
        description: 'Premium cable tray manufacturing and supply for industrial and commercial projects in Delhi NCR.',
        isPublished: true,
        sections,
      });
      console.log(`Page "${SLUG}" created successfully.`);
    }
  } catch (error) {
    console.error('Error creating cable tray page:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createCableTrayPage();
