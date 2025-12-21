require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
const firebaseAdmin = require('./config/firebaseAdmin');
const { connectDB } = require('./config/db');
const authRouter = require('./routes/auth');
const progressRouter = require('./routes/progress');
const gamificationRouter = require('./routes/gamification');
const poseRouter = require('./routes/pose');
const poseAnalysisRouter = require('./routes/poseAnalysis');

const app = express();

// CORS configuration - allow requests from mobile app
app.use(cors({
  origin: '*', // In production, specify exact origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// mount auth routes
app.use('/api/auth', authRouter);
app.use('/api/progress', progressRouter);
app.use('/api/gamification', gamificationRouter);
app.use('/api/pose', poseRouter);
app.use('/api/pose-analysis', poseAnalysisRouter);

// Health endpoint
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Create the /api/recommend endpoint - forwards to model server
app.post('/api/recommend', async (req, res) => {
    // Accept richer user input, e.g. skillLevel, goal (can be array), and an optional userDetails object
    const { skillLevel, goal, userId, userDetails } = req.body || {};

    if (!skillLevel || !goal || (Array.isArray(goal) && goal.length === 0)) {
        return res.status(400).json({ error: 'Missing required fields: skillLevel and goal' });
    }

    const modelUrl = process.env.MODEL_SERVER_URL || 'http://127.0.0.1:8000/predict';

    // Normalize inputs to match model training vocab
    const norm = (s) => (typeof s === 'string' ? s.trim().toLowerCase() : '');
    const skillMap = {
        'beginner': 'Beginner',
        'intermediate': 'Intermediate',
        'advanced': 'Pro',
        'pro': 'Pro'
    };
    const goalMap = {
        'endurance': 'Endurance',
        'power': 'Power',
        'strength': 'Power',
        'fat loss': 'Fat Loss',
        'stamina': 'Stamina',
        'flexibility': 'Endurance',
        'balance': 'Stamina'
    };

    const normalizedSkill = skillMap[norm(skillLevel)] || 'Beginner';
    // Handle goal as array or string
    const goalArray = Array.isArray(goal) ? goal : [goal];
    const normalizedGoals = goalArray.map(g => goalMap[norm(g)] || g).filter(Boolean);

    console.log('[recommend] incoming', { skillLevel, goal, userId, userDetails });
    console.log('[recommend] normalized', { skillLevel: normalizedSkill, goals: normalizedGoals });
    console.log('[recommend] modelUrl', process.env.MODEL_SERVER_URL || 'http://127.0.0.1:8000/predict');

    const payload = { skillLevel: normalizedSkill, goal: normalizedGoals };
    // Attach optional user details (bmi, age, weight, height, goals, etc.)
    if (userDetails && typeof userDetails === 'object') {
        payload.userDetails = userDetails;
    }

    try {
        console.log('[recommend] Calling model server at:', modelUrl);
        console.log('[recommend] Payload:', JSON.stringify(payload, null, 2));
        
        // Use AbortController for timeout with node-fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const resp = await fetch(modelUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!resp.ok) {
            let json;
            try {
                json = await resp.json();
            } catch (parseError) {
                json = { error: 'Failed to parse model server response', status: resp.status };
            }
            
            const errorPayload = {
                error: (json && (json.error || (json.detail && (json.detail.error || json.detail.message)) || json.message)) || 'Model server error',
                details: (json && (json.details || (json.detail && json.detail.details) || json.detail)) || `HTTP ${resp.status}`,
                status: resp.status
            };
            console.error('[recommend] Model server returned error:', errorPayload);
            return res.status(resp.status >= 400 && resp.status < 600 ? resp.status : 500).json(errorPayload);
        }

        const json = await resp.json();
        console.log('[recommend] Model server response received successfully');

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
                console.error('[recommend] Failed to save plan to Firestore', e.message || e);
            }
        }

        return res.json(json);
    } catch (e) {
        console.error('[recommend] Error calling model server:', e);
        console.error('[recommend] Error message:', e.message);
        console.error('[recommend] Error code:', e.code);
        console.error('[recommend] Error stack:', e.stack);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to call model server';
        let errorDetails = e.message || 'Unknown error';
        
        if (e.code === 'ECONNREFUSED' || e.message.includes('ECONNREFUSED')) {
            errorMessage = 'Model server is not running';
            errorDetails = `Cannot connect to ${modelUrl}. Please ensure the Python model server is running on port 8000.`;
        } else if (e.code === 'ETIMEDOUT' || e.message.includes('timeout')) {
            errorMessage = 'Model server request timed out';
            errorDetails = 'The model server took too long to respond. Please try again.';
        } else if (e.message.includes('fetch')) {
            errorMessage = 'Network error connecting to model server';
            errorDetails = e.message;
        }
        
        return res.status(500).json({ 
            error: errorMessage, 
            details: errorDetails,
            modelUrl: modelUrl,
            code: e.code
        });
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