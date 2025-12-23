/**
 * Authentication Middleware
 * Handles JWT token verification and user authentication
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');

/**
 * Verify JWT token and attach user to request
 */
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  
  if (!auth) {
    console.log('[auth] Missing authorization header');
    return res.status(401).json({ error: 'missing auth' });
  }
  
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.log('[auth] Bad auth header format');
    return res.status(401).json({ error: 'bad auth header' });
  }
  
  try {
    const payload = jwt.verify(parts[1], JWT_SECRET);
    console.log('[auth] Token verified successfully, user id:', payload.id);
    req.user = payload;
    next();
  } catch (err) {
    console.error('[auth] Token verification failed:', err.message);
    return res.status(401).json({ error: 'invalid token', details: err.message });
  }
}

/**
 * Create JWT token for user
 */
function createToken(user) {
  // Convert ObjectId to string for JWT payload
  let userId;
  if (user._id) {
    if (typeof user._id === 'string') {
      userId = user._id;
    } else if (user._id.toString) {
      userId = user._id.toString();
    } else {
      userId = String(user._id);
    }
  } else {
    throw new Error('User ID is missing');
  }
  
  const payload = { id: userId, email: user.email || '' };
  console.log('[createToken] Creating token for user:', userId, user.email);
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Optional auth middleware - doesn't fail if no token
 */
function optionalAuth(req, res, next) {
  const auth = req.headers.authorization;
  
  if (!auth) {
    return next();
  }
  
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next();
  }
  
  try {
    const payload = jwt.verify(parts[1], JWT_SECRET);
    req.user = payload;
  } catch (err) {
    // Token invalid, but continue without user
  }
  
  next();
}

module.exports = {
  authMiddleware,
  createToken,
  optionalAuth
};

