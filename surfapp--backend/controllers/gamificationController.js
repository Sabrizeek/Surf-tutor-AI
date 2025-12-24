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
  console.log('[gamification] Award request (auth removed)');
  
  const { points = 0, badge = null, streak = null } = req.body;
  
  try {
    // Since auth is removed, gamification is stored locally in frontend
    console.log('[gamification] Award data received (stored locally in app)');
    res.json({ success: true, message: 'Award stored locally' });
  } catch (err) {
    throw err;
  }
});

/**
 * Get gamification stats
 * GET /api/gamification/stats
 */
const getStats = asyncHandler(async (req, res) => {
  console.log('[gamification] Stats request (auth removed)');
  
  try {
    // Since auth is removed, gamification is stored locally in frontend
    console.log('[gamification] Stats loaded from local storage');
    res.json({ gamification: {} });
  } catch (err) {
    throw err;
  }
});

module.exports = {
  awardPoints,
  getStats
};

