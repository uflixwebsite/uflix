const rateLimit = require('express-rate-limit');

const createLimiter = ({ windowMs, max, message, skip }) =>
  rateLimit({
    windowMs,
    max,
    skip: (req) => {
      if (req.path === '/health') return true;
      if (typeof skip === 'function') return skip(req);
      return false;
    },
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });

const globalApiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: 'Too many requests. Please try again later.',
  skip: (req) => req.originalUrl.startsWith('/api/admin'),
});

const contactLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many contact submissions. Please try again shortly.',
});

const paymentLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 80,
  message: 'Too many payment requests. Please try again shortly.',
});

const uploadLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 40,
  message: 'Too many upload requests. Please try again shortly.',
});

module.exports = {
  globalApiLimiter,
  contactLimiter,
  paymentLimiter,
  uploadLimiter,
};
