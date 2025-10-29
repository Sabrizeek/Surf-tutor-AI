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

// Save progress (completed drills, scores, etc)
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const users = db.collection('users');
    const { completedDrills, scores, badges } = req.body;
    const updates = { progress: { completedDrills, scores, badges }, updatedAt: new Date() };
    const result = await users.findOneAndUpdate(
      { _id: ObjectId(req.user.id) },
      { $set: updates },
      { returnOriginal: false, projection: { passwordHash: 0 } }
    );
    res.json({ user: result.value });
  } catch (err) {
    console.error('progress save error', err);
    res.status(500).json({ error: 'internal' });
  }
});

// Load progress
router.get('/load', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const users = db.collection('users');
    const user = await users.findOne(
      { _id: ObjectId(req.user.id) },
      { projection: { passwordHash: 0, progress: 1 } }
    );
    if (!user) return res.status(404).json({ error: 'user not found' });
    res.json({ progress: user.progress || {} });
  } catch (err) {
    console.error('progress load error', err);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;