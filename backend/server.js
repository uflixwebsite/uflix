const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(morgan('dev'));

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
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));

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

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
};

startServer();
