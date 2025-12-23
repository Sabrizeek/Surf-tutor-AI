/**
 * Gamification Routes
 * Defines points, badges, and streak endpoints
 */

const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const { authMiddleware } = require('../middlewares/auth');

// All routes require authentication
router.post('/award', authMiddleware, gamificationController.awardPoints);
router.get('/stats', authMiddleware, gamificationController.getStats);

module.exports = router;
