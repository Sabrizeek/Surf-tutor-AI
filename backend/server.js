require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
const firebaseAdmin = require('./firebaseAdmin');
const { connectDB } = require('./db');
const authRouter = require('./routes/auth');
const progressRouter = require('./routes/progress');
const gamificationRouter = require('./routes/gamification');
const app = express();

app.use(cors());
app.use(express.json());

// mount auth routes
app.use('/api/auth', authRouter);
app.use('/api/progress', progressRouter);
app.use('/api/gamification', gamificationRouter);

// Health endpoint
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Create the /api/recommend endpoint - forwards to model server
app.post('/api/recommend', async (req, res) => {
    // Accept richer user input, e.g. skillLevel, goal, and an optional userDetails object
    const { skillLevel, goal, userId, userDetails } = req.body || {};

    if (!skillLevel || !goal) {
        return res.status(400).json({ error: 'Missing required fields: skillLevel and goal' });
    }

    const modelUrl = process.env.MODEL_SERVER_URL || 'http://127.0.0.1:8000/predict';

    const payload = { skillLevel, goal };
    // Attach optional user details (bmi, age, weight, height, goals, etc.)
    if (userDetails && typeof userDetails === 'object') {
        payload.userDetails = userDetails;
    }

    try {
        const resp = await fetch(modelUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const json = await resp.json();

        if (!resp.ok) {
            return res.status(resp.status).json(json);
        }

        // Optionally persist plan to Firestore if firebase is initialized and userId provided
        if (firebaseAdmin.isInitialized() && userId) {
            try {
                const db = firebaseAdmin.firestore();
                const planDoc = db.collection('users').doc(userId).collection('plans').doc();
                await planDoc.set({
                    requestedAt: new Date().toISOString(),
                    skillLevel,
                    goal,
                    userDetails: userDetails || null,
                    recommendedExercises: json.recommendedExercises || [],
                    modelVersion: json.meta ? json.meta.modelVersion : null
                });
            } catch (e) {
                console.error('Failed to save plan to Firestore', e.message || e);
            }
        }

        return res.json(json);
    } catch (e) {
        console.error('Error calling model server', e.message || e);
        return res.status(500).json({ error: 'Failed to call model server', details: e.message });
    }
});

// Simple signup/login stubs using Firebase Admin if available
app.post('/api/signup', async (req, res) => {
    const { email, displayName, password } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Missing email' });

    if (!firebaseAdmin.isInitialized()) {
        return res.status(501).json({ error: 'Firebase not configured. Set FIREBASE_SERVICE_ACCOUNT env var.' });
    }

    try {
        // Create or get existing user by email
        let userRecord;
        try {
            userRecord = await firebaseAdmin.auth().getUserByEmail(email);
        } catch (err) {
            // create
            userRecord = await firebaseAdmin.auth().createUser({ email, displayName, password });
        }

        // Create a basic user profile in Firestore
        const db = firebaseAdmin.firestore();
        const userRef = db.collection('users').doc(userRecord.uid);
        await userRef.set({ email, displayName, createdAt: new Date().toISOString() }, { merge: true });

        // Create a custom token for client-side sign-in
        const token = await firebaseAdmin.auth().createCustomToken(userRecord.uid);
        return res.json({ uid: userRecord.uid, token });
    } catch (e) {
        console.error('Signup error', e);
        return res.status(500).json({ error: 'Signup failed', details: e.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Missing email' });

    if (!firebaseAdmin.isInitialized()) {
        return res.status(501).json({ error: 'Firebase not configured. Set FIREBASE_SERVICE_ACCOUNT env var.' });
    }

    try {
        const userRecord = await firebaseAdmin.auth().getUserByEmail(email);
        const token = await firebaseAdmin.auth().createCustomToken(userRecord.uid);
        return res.json({ uid: userRecord.uid, token });
    } catch (e) {
        console.error('Login error', e.message || e);
        return res.status(500).json({ error: 'Login failed', details: e.message });
    }
});

const PORT = process.env.PORT || 3000;

// attempt to connect to MongoDB at startup (optional)
connectDB().catch(err => {
    console.warn('MongoDB connection failed at startup - some features may be disabled', err && err.message ? err.message : err);
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});