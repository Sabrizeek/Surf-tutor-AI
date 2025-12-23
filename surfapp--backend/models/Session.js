/**
 * Session Model
 * Stores session replay data with landmark history
 * Phase 4.3: Session Replay System
 */

const { getDb, connectDB } = require('../config/db');
const { ObjectId } = require('mongodb');

/**
 * Get the sessions collection
 */
async function getSessionsCollection() {
  let db;
  try {
    db = getDb();
  } catch (error) {
    await connectDB();
    db = getDb();
  }
  return db.collection('sessions');
}

/**
 * Create a new session
 */
async function createSession(sessionData) {
  const sessions = await getSessionsCollection();
  
  const {
    userId,
    drillId,
    startTime,
    endTime,
    duration,
    landmarksHistory,
    finalScore,
    badgesEarned,
    xpEarned,
  } = sessionData;
  
  if (!userId || !drillId) {
    throw new Error('userId and drillId are required');
  }
  
  const sessionDoc = {
    userId: typeof userId === 'string' ? new ObjectId(userId) : userId,
    drillId,
    startTime: startTime || new Date(),
    endTime: endTime || new Date(),
    duration: duration || 0,
    landmarksHistory: landmarksHistory || [],
    finalScore: finalScore || 0,
    badgesEarned: badgesEarned || [],
    xpEarned: xpEarned || 0,
    createdAt: new Date(),
  };
  
  const result = await sessions.insertOne(sessionDoc);
  return findById(result.insertedId);
}

/**
 * Find session by ID
 */
async function findById(id) {
  const sessions = await getSessionsCollection();
  
  let sessionId;
  if (typeof id === 'string') {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid session ID format');
    }
    sessionId = new ObjectId(id);
  } else {
    sessionId = id;
  }
  
  return sessions.findOne({ _id: sessionId });
}

/**
 * Get sessions for a user
 */
async function getUserSessions(userId, options = {}) {
  const sessions = await getSessionsCollection();
  
  let userIdObj;
  if (typeof userId === 'string') {
    if (!ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format');
    }
    userIdObj = new ObjectId(userId);
  } else {
    userIdObj = userId;
  }
  
  const query = { userId: userIdObj };
  
  // Filter by drill if specified
  if (options.drillId) {
    query.drillId = options.drillId;
  }
  
  // Filter by date range if specified
  if (options.startDate || options.endDate) {
    query.startTime = {};
    if (options.startDate) {
      query.startTime.$gte = new Date(options.startDate);
    }
    if (options.endDate) {
      query.startTime.$lte = new Date(options.endDate);
    }
  }
  
  const sort = options.sort || { startTime: -1 }; // Default: newest first
  const limit = options.limit || 50;
  const skip = options.skip || 0;
  
  return sessions.find(query).sort(sort).limit(limit).skip(skip).toArray();
}

/**
 * Get session statistics for a user
 */
async function getUserSessionStats(userId, drillId = null) {
  const sessions = await getSessionsCollection();
  
  let userIdObj;
  if (typeof userId === 'string') {
    if (!ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format');
    }
    userIdObj = new ObjectId(userId);
  } else {
    userIdObj = userId;
  }
  
  const query = { userId: userIdObj };
  if (drillId) {
    query.drillId = drillId;
  }
  
  const userSessions = await sessions.find(query).toArray();
  
  if (userSessions.length === 0) {
    return {
      totalSessions: 0,
      totalDuration: 0,
      averageScore: 0,
      bestScore: 0,
      totalXP: 0,
    };
  }
  
  const totalSessions = userSessions.length;
  const totalDuration = userSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const scores = userSessions.map(s => s.finalScore || 0).filter(s => s > 0);
  const averageScore = scores.length > 0
    ? scores.reduce((sum, s) => sum + s, 0) / scores.length
    : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const totalXP = userSessions.reduce((sum, s) => sum + (s.xpEarned || 0), 0);
  
  return {
    totalSessions,
    totalDuration,
    averageScore: Math.round(averageScore * 10) / 10,
    bestScore,
    totalXP,
  };
}

/**
 * Delete old sessions (cleanup)
 */
async function deleteOldSessions(userId, olderThanDays = 90) {
  const sessions = await getSessionsCollection();
  
  let userIdObj;
  if (typeof userId === 'string') {
    if (!ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format');
    }
    userIdObj = new ObjectId(userId);
  } else {
    userIdObj = userId;
  }
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  
  const result = await sessions.deleteMany({
    userId: userIdObj,
    startTime: { $lt: cutoffDate },
  });
  
  return result.deletedCount;
}

module.exports = {
  createSession,
  findById,
  getUserSessions,
  getUserSessionStats,
  deleteOldSessions,
};

