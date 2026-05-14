const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const hpp = require('hpp');
const path = require('path');
const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');
const PageContent = require('./models/PageContent');
const {
  globalApiLimiter,
  contactLimiter,
  paymentLimiter,
  uploadLimiter,
} = require('./middleware/rateLimiter');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const BUSINESS_CLONE_PAGES = [
  { slug: 'steel-fabrication-delhi-ncr-msfabrication', title: 'MS Fabrication' },
  { slug: 'steel-fabrication-delhi-ncr-laser-sheet-cutting', title: 'Laser Sheet Cutting' },
  { slug: 'steel-fabrication-delhi-ncr-powder-coating', title: 'Powder Coating' },
  { slug: 'steel-fabrication-delhi-ncr-laser-pipe-cutting', title: 'Laser Pipe Cutting' },
];

const cloneSections = (sections = []) => sections.map((section) => {
  const plain = section?.toObject ? section.toObject() : section;
  const clonedItems = Array.isArray(plain?.items)
    ? plain.items.map((item) => {
        const plainItem = item?.toObject ? item.toObject() : item;
        return { ...plainItem, _id: undefined };
      })
    : [];

  return {
    ...plain,
    _id: undefined,
    items: clonedItems,
  };
});

const ensureBusinessClonePages = async () => {
  try {
    const source = await PageContent.findOne({ slug: 'business' }).lean();

    if (!source) {
      console.log('Business page not found. Skipping steel child page seeding.');
      return;
    }

    for (const target of BUSINESS_CLONE_PAGES) {
      const existing = await PageContent.findOne({ slug: target.slug }).select('_id').lean();
      if (existing) continue;

      await PageContent.create({
        slug: target.slug,
        title: target.title,
        description: source.description || '',
        isPublished: source.isPublished !== false,
        sections: cloneSections(source.sections),
      });

      console.log(`Seeded business-clone page: ${target.slug}`);
    }
  } catch (error) {
    console.error('Failed to seed business-clone pages:', error);
  }
};

/* ======================================================
   HEALTH CHECK (MUST BE FIRST)
   - No auth
   - No logging
   - No DB
   - No side effects
   - <10ms
====================================================== */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'uflix-backend',
    timestamp: new Date().toISOString(),
  });
});

/* ======================================================
   GLOBAL MIDDLEWARE
====================================================== */
app.use(helmet());
app.use(hpp());
app.use(morgan('dev'));

// Raw body parser for webhook signature verification
app.use('/api/webhooks', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body.toString('utf8');
  next();
});

app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true, limit: '200kb' }));

app.use(cors({ origin: true, credentials: true }));

app.use('/api', globalApiLimiter);
app.use('/api/contact', contactLimiter);
app.use('/api/payments', paymentLimiter);
app.use('/api/upload', uploadLimiter);

/* ======================================================
   AUTH MIDDLEWARE (AFTER /health)
====================================================== */
app.use(
  ClerkExpressWithAuth({
    onError: (error) => {
      console.error('Clerk auth error:', error);
    },
  })
);

/* ======================================================
   STATIC FILES
====================================================== */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ======================================================
   ROUTES
====================================================== */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/collections', require('./routes/collections'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/subcategories', require('./routes/subcategories'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/quotations', require('./routes/quotations'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/footer', require('./routes/footer'));
app.use('/api/home', require('./routes/home'));
app.use('/api/pincode', require('./routes/pincode'));
app.use('/api/pincode-settings', require('./routes/pincodeSettings'));
app.use('/api/navbar', require('./routes/navbar'));
app.use('/api/mega-menu', require('./routes/megaMenu'));
app.use('/api/mega-menu-v2', require('./routes/megaMenuV2'));

/* ======================================================
   ERROR HANDLING
====================================================== */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

/* ======================================================
   404 HANDLER
====================================================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

/* ======================================================
   SERVER + DATABASE
====================================================== */
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');

    await ensureBusinessClonePages();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
};

startServer();
