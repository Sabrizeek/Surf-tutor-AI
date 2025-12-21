const express = require('express');
const router = express.Router();
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'replace-this-in-production';

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing auth' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'bad auth header' });
  try {
    const payload = jwt.verify(parts[1], JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

// Award points/badges
router.post('/award', authMiddleware, async (req, res) => {
  try {
    let db;
    try {
      db = getDb();
    } catch (dbError) {
      const { connectDB } = require('../config/db');
      await connectDB();
      db = getDb();
    }
    const users = db.collection('users');
    const { points = 0, badge = null, streak = null } = req.body;
    
    let userId;
    if (ObjectId.isValid(req.user.id)) {
      userId = new ObjectId(req.user.id);
    } else {
      return res.status(400).json({ error: 'invalid user id' });
    }
    
    const updates = { updatedAt: new Date() };
    if (points) updates['gamification.points'] = points;
    if (badge) updates['gamification.badges'] = badge;
    if (streak) updates['gamification.streak'] = streak;
    
    const result = await users.findOneAndUpdate(
      { _id: userId },
      { $set: updates },
      { returnDocument: 'after', projection: { passwordHash: 0 } }
    );
    res.json({ user: result.value });
  } catch (err) {
    console.error('gamification award error', err);
    res.status(500).json({ error: 'internal', details: err.message });
  }
});

// Get gamification stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    let db;
    try {
      db = getDb();
    } catch (dbError) {
      const { connectDB } = require('../config/db');
      await connectDB();
      db = getDb();
    }
    const users = db.collection('users');
    
    let userId;
    if (ObjectId.isValid(req.user.id)) {
      userId = new ObjectId(req.user.id);
    } else {
      return res.status(400).json({ error: 'invalid user id' });
    }
    
    const user = await users.findOne(
      { _id: userId },
      { projection: { passwordHash: 0, gamification: 1 } }
    );
    if (!user) return res.status(404).json({ error: 'user not found' });
    res.json({ gamification: user.gamification || {} });
  } catch (err) {
    console.error('gamification stats error', err);
    res.status(500).json({ error: 'internal', details: err.message });
  }
});

module.exports = router;