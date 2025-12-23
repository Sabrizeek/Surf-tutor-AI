/**
 * User Model
 * Handles user data structure, validation, and database operations
 */

const { getDb, connectDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const { SALT_ROUNDS, ALLOWED_SKILL_LEVELS, ALLOWED_GOALS } = require('../config/constants');

/**
 * User Schema Definition
 * Defines the structure and validation for user documents
 */
const UserSchema = {
  email: { type: 'string', required: true, unique: true },
  passwordHash: { type: 'string', required: true },
  name: { type: 'string', default: '' },
  age: { type: 'number', default: null },
  weight: { type: 'number', default: null },
  height: { type: 'number', default: null },
  bmi: { type: 'number', default: null },
  goal: { type: 'array', default: [] },
  skillLevel: { type: 'string', default: null },
  progress: { type: 'object', default: {} },
  gamification: { type: 'object', default: {} },
  createdAt: { type: 'date', default: () => new Date() },
  updatedAt: { type: 'date', default: () => new Date() }
};

/**
 * Get the users collection
 */
async function getUsersCollection() {
  let db;
  try {
    db = getDb();
  } catch (error) {
    await connectDB();
    db = getDb();
  }
  return db.collection('users');
}

/**
 * Calculate BMI from height (cm) and weight (kg)
 */
function calculateBMI(height, weight) {
  if (height && weight && height > 0 && weight > 0) {
    return weight / Math.pow(height / 100, 2);
  }
  return null;
}

/**
 * Create a new user
 */
async function createUser(userData) {
  const users = await getUsersCollection();
  
  const { email, password, name, age, weight, height, goal, skillLevel } = userData;
  
  // Validate required fields
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  // Check if user exists
  const existing = await users.findOne({ email });
  if (existing) {
    const error = new Error('User already exists');
    error.code = 'USER_EXISTS';
    throw error;
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  
  // Process numeric fields
  const hNum = height ? Number(height) : null;
  const wNum = weight ? Number(weight) : null;
  const aNum = age ? Number(age) : null;
  const bmi = calculateBMI(hNum, wNum);
  
  // Process goal as array
  let goalArray = [];
  if (goal) {
    goalArray = Array.isArray(goal) ? goal : [goal];
  }
  
  const now = new Date();
  const userDoc = {
    email,
    passwordHash,
    name: name || '',
    age: aNum,
    weight: wNum,
    height: hNum,
    bmi,
    goal: goalArray,
    skillLevel: skillLevel || null,
    progress: {},
    gamification: {},
    createdAt: now,
    updatedAt: now
  };
  
  const result = await users.insertOne(userDoc);
  return findById(result.insertedId);
}

/**
 * Find user by ID (excludes password)
 */
async function findById(id) {
  const users = await getUsersCollection();
  
  let userId;
  if (typeof id === 'string') {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid user ID format');
    }
    userId = new ObjectId(id);
  } else {
    userId = id;
  }
  
  return users.findOne({ _id: userId }, { projection: { passwordHash: 0 } });
}

/**
 * Find user by email (includes password for auth)
 */
async function findByEmail(email) {
  const users = await getUsersCollection();
  return users.findOne({ email });
}

/**
 * Find user by email (excludes password)
 */
async function findByEmailPublic(email) {
  const users = await getUsersCollection();
  return users.findOne({ email }, { projection: { passwordHash: 0 } });
}

/**
 * Update user profile
 */
async function updateProfile(id, updates) {
  const users = await getUsersCollection();
  
  let userId;
  if (typeof id === 'string') {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid user ID format');
    }
    userId = new ObjectId(id);
  } else {
    userId = id;
  }
  
  // Only allow specific fields to be updated
  const allowedFields = ['name', 'height', 'weight', 'age', 'bio', 'goal', 'skillLevel'];
  const sanitizedUpdates = {};
  
  for (const field of allowedFields) {
    if (field in updates) {
      if (field === 'goal') {
        // Handle goal as array
        sanitizedUpdates[field] = Array.isArray(updates[field]) 
          ? updates[field] 
          : (updates[field] ? [updates[field]] : []);
      } else {
        sanitizedUpdates[field] = updates[field];
      }
    }
  }
  
  // Recalculate BMI if height or weight changed
  if ('height' in sanitizedUpdates || 'weight' in sanitizedUpdates) {
    const currentUser = await findById(userId);
    const h = sanitizedUpdates.height !== undefined ? Number(sanitizedUpdates.height) : currentUser?.height;
    const w = sanitizedUpdates.weight !== undefined ? Number(sanitizedUpdates.weight) : currentUser?.weight;
    sanitizedUpdates.bmi = calculateBMI(h, w);
  }
  
  sanitizedUpdates.updatedAt = new Date();
  
  const result = await users.findOneAndUpdate(
    { _id: userId },
    { $set: sanitizedUpdates },
    { returnDocument: 'after', projection: { passwordHash: 0 } }
  );
  
  return result.value;
}

/**
 * Verify user password
 */
async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.passwordHash);
}

/**
 * Update user progress (supports categorized progress)
 */
async function updateProgress(id, progressData) {
  const users = await getUsersCollection();
  
  let userId;
  if (typeof id === 'string') {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid user ID format');
    }
    userId = new ObjectId(id);
  } else {
    userId = id;
  }
  
  // If progressData has a category, merge it into the existing progress structure
  if (progressData.category && progressData.data) {
    const user = await findById(id);
    const existingProgress = user?.progress || {};
    
    // Initialize category if it doesn't exist (Phase 4.1: Categorized XP System)
    if (!existingProgress[progressData.category]) {
      existingProgress[progressData.category] = {
        level: 1,
        xp: 0,
        xpToNext: 100,
        drills: {},
        badges: [],
        streaks: {
          current: 0,
          longest: 0,
        },
        completedDrills: [], // Legacy support
        scores: {}, // Legacy support
        totalTime: 0,
        sessions: 0,
      };
    }
    
    // Merge new data with existing (Phase 4.1: Enhanced XP System)
    const categoryProgress = existingProgress[progressData.category];
    
    // Update XP and level
    if (progressData.data.xpEarned) {
      categoryProgress.xp = (categoryProgress.xp || 0) + progressData.data.xpEarned;
      // Calculate level based on XP (100 XP per level, exponential after level 10)
      const baseXPPerLevel = 100;
      let currentLevel = 1;
      let xpForCurrentLevel = 0;
      let xpNeeded = baseXPPerLevel;
      
      while (categoryProgress.xp >= xpNeeded) {
        currentLevel++;
        xpForCurrentLevel = xpNeeded;
        // After level 10, increase XP needed by 20% per level
        if (currentLevel <= 10) {
          xpNeeded += baseXPPerLevel;
        } else {
          xpNeeded += Math.floor(baseXPPerLevel * Math.pow(1.2, currentLevel - 10));
        }
      }
      
      categoryProgress.level = currentLevel;
      categoryProgress.xpToNext = xpNeeded - categoryProgress.xp;
    }
    
    // Update drills data (new structure)
    if (progressData.data.drills) {
      Object.keys(progressData.data.drills).forEach(drillId => {
        if (!categoryProgress.drills[drillId]) {
          categoryProgress.drills[drillId] = {
            completed: 0,
            bestScore: 0,
            totalTime: 0,
          };
        }
        const drillData = progressData.data.drills[drillId];
        if (drillData.completed !== undefined) {
          categoryProgress.drills[drillId].completed += drillData.completed;
        }
        if (drillData.bestScore !== undefined) {
          categoryProgress.drills[drillId].bestScore = Math.max(
            categoryProgress.drills[drillId].bestScore,
            drillData.bestScore
          );
        }
        if (drillData.totalTime !== undefined) {
          categoryProgress.drills[drillId].totalTime += drillData.totalTime;
        }
      });
    }
    
    // Update streaks
    if (progressData.data.streaks) {
      if (progressData.data.streaks.current !== undefined) {
        categoryProgress.streaks.current = progressData.data.streaks.current;
        categoryProgress.streaks.longest = Math.max(
          categoryProgress.streaks.longest || 0,
          progressData.data.streaks.current
        );
      }
    }
    
    // Legacy support (for backward compatibility)
    if (progressData.data.completedDrills) {
      categoryProgress.completedDrills = [
        ...new Set([...categoryProgress.completedDrills || [], ...progressData.data.completedDrills])
      ];
    }
    if (progressData.data.scores) {
      if (!categoryProgress.scores) categoryProgress.scores = {};
      Object.keys(progressData.data.scores).forEach(drillId => {
        if (!categoryProgress.scores[drillId]) {
          categoryProgress.scores[drillId] = [];
        }
        categoryProgress.scores[drillId].push(...progressData.data.scores[drillId]);
      });
    }
    if (progressData.data.totalTime) {
      categoryProgress.totalTime = (categoryProgress.totalTime || 0) + progressData.data.totalTime;
    }
    if (progressData.data.sessions) {
      categoryProgress.sessions = (categoryProgress.sessions || 0) + progressData.data.sessions;
    }
    if (progressData.data.badges) {
      categoryProgress.badges = [
        ...new Set([...categoryProgress.badges || [], ...progressData.data.badges])
      ];
    }
    
    const updates = {
      progress: existingProgress,
      updatedAt: new Date()
    };
    
    const result = await users.findOneAndUpdate(
      { _id: userId },
      { $set: updates },
      { returnDocument: 'after', projection: { passwordHash: 0 } }
    );
    
    return result.value;
  } else {
    // Legacy support: direct progress update
    const updates = {
      progress: progressData,
      updatedAt: new Date()
    };
    
    const result = await users.findOneAndUpdate(
      { _id: userId },
      { $set: updates },
      { returnDocument: 'after', projection: { passwordHash: 0 } }
    );
    
    return result.value;
  }
}

/**
 * Update user gamification data
 */
async function updateGamification(id, gamificationData) {
  const users = await getUsersCollection();
  
  let userId;
  if (typeof id === 'string') {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid user ID format');
    }
    userId = new ObjectId(id);
  } else {
    userId = id;
  }
  
  const updates = { updatedAt: new Date() };
  
  if (gamificationData.points !== undefined) {
    updates['gamification.points'] = gamificationData.points;
  }
  if (gamificationData.badges !== undefined) {
    updates['gamification.badges'] = gamificationData.badges;
  }
  if (gamificationData.streak !== undefined) {
    updates['gamification.streak'] = gamificationData.streak;
  }
  
  const result = await users.findOneAndUpdate(
    { _id: userId },
    { $set: updates },
    { returnDocument: 'after', projection: { passwordHash: 0 } }
  );
  
  return result.value;
}

/**
 * Get user progress
 */
async function getProgress(id) {
  const user = await findById(id);
  return user?.progress || {};
}

/**
 * Get user gamification data
 */
async function getGamification(id) {
  const user = await findById(id);
  return user?.gamification || {};
}

module.exports = {
  UserSchema,
  createUser,
  findById,
  findByEmail,
  findByEmailPublic,
  updateProfile,
  verifyPassword,
  updateProgress,
  updateGamification,
  getProgress,
  getGamification,
  calculateBMI
};

