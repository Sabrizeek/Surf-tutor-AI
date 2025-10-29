const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
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
    const db = getDb();
    const users = db.collection('users');
    const { points = 0, badge = null, streak = null } = req.body;
    const updates = {};
    if (points) updates['gamification.points'] = points;
    if (badge) updates['gamification.badges'] = badge;
    if (streak) updates['gamification.streak'] = streak;
    updates.updatedAt = new Date();
    const result = await users.findOneAndUpdate(
      { _id: ObjectId(req.user.id) },
      { $set: updates },
      { returnOriginal: false, projection: { passwordHash: 0 } }
    );
    res.json({ user: result.value });
  } catch (err) {
    console.error('gamification award error', err);
    res.status(500).json({ error: 'internal' });
  }
});

// Get gamification stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const users = db.collection('users');
    const user = await users.findOne(
      { _id: ObjectId(req.user.id) },
      { projection: { passwordHash: 0, gamification: 1 } }
    );
    if (!user) return res.status(404).json({ error: 'user not found' });
    res.json({ gamification: user.gamification || {} });
  } catch (err) {
    console.error('gamification stats error', err);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;