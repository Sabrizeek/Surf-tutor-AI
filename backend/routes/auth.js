const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectDB, getDb } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'replace-this-in-production';
const SALT_ROUNDS = 10;

// ensure DB connected
connectDB().catch(err => console.error('Mongo connect error', err));

function makeToken(user) {
  const payload = { id: user._id, email: user.email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  try {
    const db = getDb();
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
    const profile = {
      email,
      passwordHash: hash,
      name: name || '',
      age: aNum,
      weight: wNum,
      height: hNum,
      bmi,
      goal: goal || null,
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
    const db = getDb();
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

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const users = db.collection('users');
    const user = await users.findOne({ _id: require('mongodb').ObjectId(req.user.id) }, { projection: { passwordHash: 0 } });
    if (!user) return res.status(404).json({ error: 'user not found' });
    res.json({ user });
  } catch (err) {
    console.error('profile error', err);
    res.status(500).json({ error: 'internal' });
  }
});

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const users = db.collection('users');
    const updates = {};
    const allowed = ['name', 'height', 'weight', 'age', 'bio', 'goal', 'skillLevel'];
    for (const k of allowed) if (k in req.body) updates[k] = req.body[k];
    if ('height' in updates || 'weight' in updates) {
      const h = 'height' in updates ? Number(updates.height) : undefined;
      const w = 'weight' in updates ? Number(updates.weight) : undefined;
      if (h && w) {
        updates.bmi = w / Math.pow(h / 100, 2);
      }
    }
    updates.updatedAt = new Date();
    const result = await users.findOneAndUpdate({ _id: require('mongodb').ObjectId(req.user.id) }, { $set: updates }, { returnOriginal: false, projection: { passwordHash: 0 } });
    res.json({ user: result.value });
  } catch (err) {
    console.error('profile update error', err);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
