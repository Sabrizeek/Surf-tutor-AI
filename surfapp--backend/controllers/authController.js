/**
 * Auth Controller
 * Handles user authentication operations
 */

const User = require('../models/User');
const { createToken } = require('../middlewares/auth');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  console.log('[register] Registration request received');
  
  const { email, password, name, age, weight, height, goal, skillLevel } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }
  
  try {
    const user = await User.createUser({
      email,
      password,
      name,
      age,
      weight,
      height,
      goal,
      skillLevel
    });
    
    const token = createToken(user);
    console.log('[register] User registered successfully:', email);
    
    res.json({ user, token });
  } catch (err) {
    if (err.code === 'USER_EXISTS') {
      return res.status(409).json({ error: 'user already exists' });
    }
    throw err;
  }
});

/**
 * Login user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  console.log('[login] Login request received');
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }
  
  const user = await User.findByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'invalid credentials' });
  }
  
  const isValid = await User.verifyPassword(user, password);
  if (!isValid) {
    return res.status(401).json({ error: 'invalid credentials' });
  }
  
  const publicUser = await User.findById(user._id);
  const token = createToken(publicUser);
  
  console.log('[login] User logged in successfully:', email);
  res.json({ user: publicUser, token });
});

/**
 * Get user profile
 * GET /api/auth/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  console.log('[profile] ===== PROFILE REQUEST START =====');
  console.log('[profile] User ID from token:', req.user?.id);
  
  if (!req.user || !req.user.id) {
    console.error('[profile] No user ID in token');
    return res.status(400).json({ error: 'invalid token - no user id' });
  }
  
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.error('[profile] User not found with id:', req.user.id);
      return res.status(404).json({ error: 'user not found', searchedId: req.user.id });
    }
    
    console.log('[profile] User found:', user.email);
    console.log('[profile] ===== PROFILE REQUEST SUCCESS =====');
    res.json({ user });
  } catch (err) {
    if (err.message === 'Invalid user ID format') {
      return res.status(400).json({ error: 'invalid user id format', received: req.user.id });
    }
    throw err;
  }
});

/**
 * Update user profile
 * PUT /api/auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  console.log('[profile update] Update request for user:', req.user?.id);
  
  if (!req.user || !req.user.id) {
    return res.status(400).json({ error: 'invalid token - no user id' });
  }
  
  try {
    const user = await User.updateProfile(req.user.id, req.body);
    
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }
    
    console.log('[profile update] Profile updated successfully');
    res.json({ user });
  } catch (err) {
    if (err.message === 'Invalid user ID format') {
      return res.status(400).json({ error: 'invalid user id format' });
    }
    throw err;
  }
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};

