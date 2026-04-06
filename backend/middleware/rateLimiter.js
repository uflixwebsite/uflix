const rateLimit = require('express-rate-limit');

const createLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });

const globalApiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many requests. Please try again later.',
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
