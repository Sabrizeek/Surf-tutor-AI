/**
 * Session Routes
 * Phase 4.3: Session Replay System
 */

const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// Save session (no auth required)
router.post('/save', sessionController.saveSession);

// Get user sessions (no auth required)
router.get('/', sessionController.getUserSessions);

// Get specific session (no auth required)
router.get('/:sessionId', sessionController.getSession);

// Get session statistics (no auth required)
router.get('/stats/summary', sessionController.getSessionStats);

module.exports = router;

