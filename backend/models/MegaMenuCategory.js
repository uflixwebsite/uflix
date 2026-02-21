const mongoose = require('mongoose');

const megaMenuCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    trim: true,
    lowercase: true
  },
  icon: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 1
  },
  enabled: {
    type: Boolean,
    default: true
  },
  parentNavbarItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NavbarItem',
    default: null
  },
  blocks: [{
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['image-card', 'link-list', 'promotional-banner']
    },
    order: {
      type: Number,
      default: 1
    },
    enabled: {
      type: Boolean,
      default: true
    },
    content: {
      // Image Card
      image: String,
      title: String,
      subtitle: String,
      link: String,
      openInNewTab: {
        type: Boolean,
        default: false
      },
      // Link List
      sectionTitle: String,
      links: [{
        label: String,
        url: String,
        icon: String
      }],
      // Promotional Banner
      backgroundImage: String,
      heading: String,
      description: String,
      ctaText: String,
      ctaUrl: String
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('MegaMenuCategory', megaMenuCategorySchema);
