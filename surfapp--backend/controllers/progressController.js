/**
 * Progress Controller
 * Handles user progress tracking operations
 */

const User = require('../models/User');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Save user progress
 * POST /api/progress/save
 */
const saveProgress = asyncHandler(async (req, res) => {
  console.log('[progress] Save progress request for user:', req.user?.id);
  
  if (!req.user || !req.user.id) {
    return res.status(400).json({ error: 'invalid user id' });
  }
  
  // Support both legacy format and new categorized format
  const { category, data, completedDrills, scores, badges } = req.body;
  
  try {
    let progressData;
    if (category && data) {
      // New categorized format
      progressData = {
        category,
        data: {
          completedDrills: data.completedDrills || [],
          scores: data.scores || {},
          totalTime: data.totalTime || 0,
          sessions: data.sessions || 1,
          badges: data.badges || [],
        }
      };
    } else {
      // Legacy format (for backward compatibility)
      progressData = {
        completedDrills: completedDrills || [],
        scores: scores || {},
        badges: badges || []
      };
    }
    
    const user = await User.updateProgress(req.user.id, progressData);
    
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }
    
    console.log('[progress] Progress saved successfully');
    res.json({ user });
  } catch (err) {
    if (err.message === 'Invalid user ID format') {
      return res.status(400).json({ error: 'invalid user id' });
    }
    throw err;
  }
});

/**
 * Load user progress
 * GET /api/progress/load
 */
const loadProgress = asyncHandler(async (req, res) => {
  console.log('[progress] Load progress request for user:', req.user?.id);
  
  if (!req.user || !req.user.id) {
    return res.status(400).json({ error: 'invalid user id' });
  }
  
  try {
    const progress = await User.getProgress(req.user.id);
    
    console.log('[progress] Progress loaded successfully');
    res.json({ progress });
  } catch (err) {
    if (err.message === 'Invalid user ID format') {
      return res.status(400).json({ error: 'invalid user id' });
    }
    throw err;
  }
});

module.exports = {
  saveProgress,
  loadProgress
};

