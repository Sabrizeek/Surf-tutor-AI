/**
 * Session Controller
 * Phase 4.3: Handles session replay operations
 */

const Session = require('../models/Session');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Save a session
 * POST /api/sessions/save
 */
const saveSession = asyncHandler(async (req, res) => {
  console.log('[Session] Save session request for user:', req.user?.id);
  
  if (!req.user || !req.user.id) {
    return res.status(400).json({ error: 'invalid user id' });
  }
  
  const {
    drillId,
    startTime,
    endTime,
    duration,
    landmarksHistory,
    finalScore,
    badgesEarned,
    xpEarned,
  } = req.body;
  
  if (!drillId) {
    return res.status(400).json({ error: 'drillId is required' });
  }
  
  try {
    const session = await Session.createSession({
      userId: req.user.id,
      drillId,
      startTime: startTime ? new Date(startTime) : new Date(),
      endTime: endTime ? new Date(endTime) : new Date(),
      duration: duration || 0,
      landmarksHistory: landmarksHistory || [],
      finalScore: finalScore || 0,
      badgesEarned: badgesEarned || [],
      xpEarned: xpEarned || 0,
    });
    
    console.log('[Session] Session saved successfully:', session._id);
    res.json({ session });
  } catch (err) {
    if (err.message === 'Invalid user ID format' || err.message === 'userId and drillId are required') {
      return res.status(400).json({ error: err.message });
    }
    throw err;
  }
});

/**
 * Get user sessions
 * GET /api/sessions
 */
const getUserSessions = asyncHandler(async (req, res) => {
  console.log('[Session] Get sessions request for user:', req.user?.id);
  
  if (!req.user || !req.user.id) {
    return res.status(400).json({ error: 'invalid user id' });
  }
  
  try {
    const { drillId, limit, skip } = req.query;
    const sessions = await Session.getUserSessions(req.user.id, {
      drillId: drillId || null,
      limit: limit ? parseInt(limit) : 50,
      skip: skip ? parseInt(skip) : 0,
    });
    
    console.log('[Session] Retrieved', sessions.length, 'sessions');
    res.json({ sessions });
  } catch (err) {
    if (err.message === 'Invalid user ID format') {
      return res.status(400).json({ error: 'invalid user id' });
    }
    throw err;
  }
});

/**
 * Get specific session
 * GET /api/sessions/:sessionId
 */
const getSession = asyncHandler(async (req, res) => {
  console.log('[Session] Get session request:', req.params.sessionId);
  
  try {
    const session = await Session.findById(req.params.sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'session not found' });
    }
    
    // Verify session belongs to user
    const sessionUserId = session.userId.toString();
    const userId = req.user?.id?.toString();
    if (sessionUserId !== userId) {
      return res.status(403).json({ error: 'access denied' });
    }
    
    res.json({ session });
  } catch (err) {
    if (err.message === 'Invalid session ID format') {
      return res.status(400).json({ error: 'invalid session id' });
    }
    throw err;
  }
});

/**
 * Get session statistics
 * GET /api/sessions/stats/summary
 */
const getSessionStats = asyncHandler(async (req, res) => {
  console.log('[Session] Get stats request for user:', req.user?.id);
  
  if (!req.user || !req.user.id) {
    return res.status(400).json({ error: 'invalid user id' });
  }
  
  try {
    const { drillId } = req.query;
    const stats = await Session.getUserSessionStats(req.user.id, drillId || null);
    
    res.json({ stats });
  } catch (err) {
    if (err.message === 'Invalid user ID format') {
      return res.status(400).json({ error: 'invalid user id' });
    }
    throw err;
  }
});

module.exports = {
  saveSession,
  getUserSessions,
  getSession,
  getSessionStats,
};

