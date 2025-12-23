/**
 * Session Routes
 * Phase 4.3: Session Replay System
 */

const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { authenticateToken } = require('../middlewares/auth');

// Save session
router.post('/save', authenticateToken, sessionController.saveSession);

// Get user sessions
router.get('/', authenticateToken, sessionController.getUserSessions);

// Get specific session
router.get('/:sessionId', authenticateToken, sessionController.getSession);

// Get session statistics
router.get('/stats/summary', authenticateToken, sessionController.getSessionStats);

module.exports = router;

