const { ClerkExpressRequireAuth, clerkClient } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

// Protect routes - verify Clerk session
exports.protect = async (req, res, next) => {
  try {
    // Clerk middleware adds auth object to req
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
        debug: {
          hasAuth: !!req.auth,
          hasUserId: !!req.auth?.userId,
          authKeys: req.auth ? Object.keys(req.auth) : []
        }
      });
    }

    // Find or create user in database
    let user = await User.findOne({ clerkId: req.auth.userId });

    if (!user) {
      // Fetch full user data from Clerk API since sessionClaims doesn't include email/name
      const clerkUser = await clerkClient.users.getUser(req.auth.userId);
      
      // Auto-create user from Clerk data
      user = await User.create({
        clerkId: req.auth.userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || `user_${req.auth.userId}@temp.com`,
        name: clerkUser.firstName || clerkUser.username || 'User',
        role: 'user'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

// Admin only access
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.'
    });
  }
};

// Optional auth - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  try {
    if (req.auth && req.auth.userId) {
      let user = await User.findOne({ clerkId: req.auth.userId });
      
      if (!user) {
        const clerkUser = await clerkClient.users.getUser(req.auth.userId);
        user = await User.create({
          clerkId: req.auth.userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || `user_${req.auth.userId}@temp.com`,
          name: clerkUser.firstName || clerkUser.username || 'User',
          role: 'user'
        });
      }
      
      req.user = user;
    }
  } catch (error) {
    // Continue without user
  }
  
  next();
};

// Optional protect - allows guest checkout but syncs user if authenticated
exports.optionalProtect = async (req, res, next) => {
  try {
    // Check if user is authenticated via Clerk
    if (req.auth && req.auth.userId) {
      let user = await User.findOne({ clerkId: req.auth.userId });
      
      if (!user) {
        const clerkUser = await clerkClient.users.getUser(req.auth.userId);
        user = await User.create({
          clerkId: req.auth.userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || `user_${req.auth.userId}@temp.com`,
          name: clerkUser.firstName || clerkUser.username || 'User',
          role: 'user'
        });
      }
      
      req.user = user;
      req.isGuest = false;
    } else {
      // No authentication - mark as guest
      req.isGuest = true;
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication check failed',
      error: error.message
    });
  }
};
