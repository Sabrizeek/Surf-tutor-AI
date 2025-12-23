/**
 * Gamification Controller
 * Handles points, badges, and streak operations
 */

const User = require('../models/User');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Award points/badges to user
 * POST /api/gamification/award
 */
const awardPoints = asyncHandler(async (req, res) => {
  console.log('[gamification] Award request for user:', req.user?.id);
  
  if (!req.user || !req.user.id) {
    return res.status(400).json({ error: 'invalid user id' });
  }
  
  const { points = 0, badge = null, streak = null } = req.body;
  
  try {
    const user = await User.updateGamification(req.user.id, {
      points,
      badges: badge,
      streak
    });
    
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }
    
    console.log('[gamification] Award granted successfully');
    res.json({ user });
  } catch (err) {
    if (err.message === 'Invalid user ID format') {
      return res.status(400).json({ error: 'invalid user id' });
    }
    throw err;
  }
});

/**
 * Get gamification stats
 * GET /api/gamification/stats
 */
const getStats = asyncHandler(async (req, res) => {
  console.log('[gamification] Stats request for user:', req.user?.id);
  
  if (!req.user || !req.user.id) {
    return res.status(400).json({ error: 'invalid user id' });
  }
  
  try {
    const gamification = await User.getGamification(req.user.id);
    
    console.log('[gamification] Stats loaded successfully');
    res.json({ gamification });
  } catch (err) {
    if (err.message === 'Invalid user ID format') {
      return res.status(400).json({ error: 'invalid user id' });
    }
    throw err;
  }
});

module.exports = {
  awardPoints,
  getStats
};

