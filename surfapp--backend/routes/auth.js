const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectDB, getDb } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'replace-this-in-production';
const SALT_ROUNDS = 10;

// ensure DB connected
connectDB().catch(err => console.error('Mongo connect error', err));

function makeToken(user) {
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
  console.log('[makeToken] Creating token for user:', userId, user.email);
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  try {
    // Ensure DB is connected
    let db;
    try {
      db = getDb();
    } catch (dbError) {
      console.error('[register] Database not connected, attempting connection...');
      await connectDB();
      db = getDb();
    }
    const users = db.collection('users');
    const { email, password, name, age, weight, height, goal, skillLevel } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const existing = await users.findOne({ email });
    if (existing) return res.status(409).json({ error: 'user already exists' });
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const now = new Date();
    const hNum = height ? Number(height) : undefined;
    const wNum = weight ? Number(weight) : undefined;
    const aNum = age ? Number(age) : undefined;
    const bmi = hNum && wNum ? (wNum / Math.pow(hNum / 100, 2)) : undefined;
    // Handle goal as array (support multiple goals)
    let goalArray = [];
    if (goal) {
      goalArray = Array.isArray(goal) ? goal : [goal];
    }
    
    const profile = {
      email,
      passwordHash: hash,
      name: name || '',
      age: aNum,
      weight: wNum,
      height: hNum,
      bmi,
      goal: goalArray.length > 0 ? goalArray : [],
      skillLevel: skillLevel || null,
      createdAt: now,
      updatedAt: now
    };
    const result = await users.insertOne(profile);
    const user = await users.findOne({ _id: result.insertedId }, { projection: { passwordHash: 0 } });
    const token = makeToken(user);
    res.json({ user, token });
  } catch (err) {
    console.error('register error', err);
    res.status(500).json({ error: 'internal' });
  }
});

router.post('/login', async (req, res) => {
  try {
    // Ensure DB is connected
    let db;
    try {
      db = getDb();
    } catch (dbError) {
      console.error('[login] Database not connected, attempting connection...');
      await connectDB();
      db = getDb();
    }
    const users = db.collection('users');
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const user = await users.findOne({ email });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const publicUser = await users.findOne({ _id: user._id }, { projection: { passwordHash: 0 } });
    const token = makeToken(publicUser);
    res.json({ user: publicUser, token });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ error: 'internal' });
  }
});

// middleware to verify token
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

router.get('/profile', authMiddleware, async (req, res) => {
  console.log('[profile] ===== PROFILE REQUEST START =====');
  console.log('[profile] Request headers:', JSON.stringify(req.headers, null, 2));
  console.log('[profile] Request user from middleware:', JSON.stringify(req.user, null, 2));
  
  try {
    // Ensure DB is connected
    console.log('[profile] Step 1: Checking database connection...');
    let db;
    try {
      db = getDb();
      console.log('[profile] Database connection OK');
    } catch (dbError) {
      console.error('[profile] Database not connected:', dbError.message);
      console.error('[profile] Database error stack:', dbError.stack);
      // Try to connect
      try {
        console.log('[profile] Attempting to connect to database...');
        await connectDB();
        db = getDb();
        console.log('[profile] Database connection established');
      } catch (connectError) {
        console.error('[profile] Failed to connect to database:', connectError.message);
        console.error('[profile] Connection error stack:', connectError.stack);
        return res.status(503).json({ 
          error: 'database not available', 
          details: connectError.message,
          message: 'Please check MongoDB connection and MONGODB_URI environment variable'
        });
      }
    }
    
    console.log('[profile] Step 2: Getting users collection...');
    const users = db.collection('users');
    const { ObjectId } = require('mongodb');
    
    // Log for debugging
    console.log('[profile] Step 3: Processing token data...');
    console.log('[profile] Decoded token user:', JSON.stringify(req.user));
    console.log('[profile] User ID from token:', req.user?.id, 'Type:', typeof req.user?.id);
    
    if (!req.user || !req.user.id) {
      console.error('[profile] No user ID in token');
      return res.status(400).json({ error: 'invalid token - no user id' });
    }
    
    console.log('[profile] Step 4: Converting user ID to ObjectId...');
    let userId;
    
    // Handle both string and ObjectId formats
    try {
      if (typeof req.user.id === 'string') {
        console.log('[profile] User ID is string:', req.user.id);
        // Validate ObjectId string format
        if (ObjectId.isValid(req.user.id)) {
          userId = new ObjectId(req.user.id);
          console.log('[profile] Converted to ObjectId:', userId.toString());
        } else {
          console.error('[profile] Invalid ObjectId string:', req.user.id);
          return res.status(400).json({ error: 'invalid user id format', received: req.user.id });
        }
      } else if (req.user.id && req.user.id.toString) {
        // Handle ObjectId object
        userId = req.user.id;
        console.log('[profile] User ID is already ObjectId:', userId.toString());
      } else {
        console.error('[profile] Unexpected user id type:', typeof req.user.id, req.user.id);
        return res.status(400).json({ error: 'invalid user id format', received: String(req.user.id) });
      }
    } catch (e) {
      console.error('[profile] Error converting user id:', e.message);
      console.error('[profile] Conversion error stack:', e.stack);
      return res.status(400).json({ error: 'invalid user id format', details: e.message });
    }
    
    console.log('[profile] Step 5: Searching for user in database...');
    console.log('[profile] Searching for user with ObjectId:', userId.toString());
    const user = await users.findOne({ _id: userId }, { projection: { passwordHash: 0 } });
    
    if (!user) {
      console.error('[profile] User not found with id:', userId.toString());
      return res.status(404).json({ error: 'user not found', searchedId: userId.toString() });
    }
    
    console.log('[profile] Step 6: User found successfully!');
    console.log('[profile] User found:', user.email, 'ID:', user._id);
    console.log('[profile] ===== PROFILE REQUEST SUCCESS =====');
    res.json({ user });
  } catch (err) {
    console.error('[profile] ===== PROFILE REQUEST ERROR =====');
    console.error('[profile] Error object:', err);
    console.error('[profile] Error message:', err.message);
    console.error('[profile] Error stack:', err.stack);
    console.error('[profile] Error name:', err.name);
    console.error('[profile] Error type:', typeof err);
    
    // Return detailed error - always include details for debugging
    const errorResponse = {
      error: 'internal',
      details: err.message || 'Unknown error',
      name: err.name || 'Error',
      message: err.message || 'An internal server error occurred',
      type: typeof err
    };
    
    // Always include stack in development, but also include basic details in production
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.stack = err.stack;
      errorResponse.fullError = String(err);
    }
    
    console.error('[profile] Sending error response:', JSON.stringify(errorResponse, null, 2));
    console.error('[profile] ===== PROFILE REQUEST END (ERROR) =====');
    res.status(500).json(errorResponse);
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    // Ensure DB is connected
    let db;
    try {
      db = getDb();
    } catch (dbError) {
      console.error('[profile update] Database not connected, attempting connection...');
      await connectDB();
      db = getDb();
    }
    const users = db.collection('users');
    const { ObjectId } = require('mongodb');
    
    console.log('[profile update] Decoded token user:', req.user);
    
    let userId;
    
    // Handle both string and ObjectId formats
    try {
      if (typeof req.user.id === 'string') {
        if (ObjectId.isValid(req.user.id)) {
          userId = new ObjectId(req.user.id);
        } else {
          return res.status(400).json({ error: 'invalid user id format' });
        }
      } else if (req.user.id instanceof ObjectId) {
        userId = req.user.id;
      } else {
        return res.status(400).json({ error: 'invalid user id format' });
      }
    } catch (e) {
      return res.status(400).json({ error: 'invalid user id format', details: e.message });
    }
    
    const updates = {};
    const allowed = ['name', 'height', 'weight', 'age', 'bio', 'goal', 'skillLevel'];
    for (const k of allowed) {
      if (k in req.body) {
        // Handle goal as array
        if (k === 'goal') {
          updates[k] = Array.isArray(req.body[k]) ? req.body[k] : (req.body[k] ? [req.body[k]] : []);
        } else {
          updates[k] = req.body[k];
        }
      }
    }
    
    if ('height' in updates || 'weight' in updates) {
      const h = 'height' in updates ? Number(updates.height) : undefined;
      const w = 'weight' in updates ? Number(updates.weight) : undefined;
      if (h && w) {
        updates.bmi = w / Math.pow(h / 100, 2);
      }
    }
    updates.updatedAt = new Date();
    const result = await users.findOneAndUpdate(
      { _id: userId }, 
      { $set: updates }, 
      { returnDocument: 'after', projection: { passwordHash: 0 } }
    );
    res.json({ user: result.value });
  } catch (err) {
    console.error('profile update error', err);
    res.status(500).json({ error: 'internal', details: err.message });
  }
});

module.exports = router;
