/**
 * Progress Routes
 * Defines user progress tracking endpoints
 */

const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authMiddleware } = require('../middlewares/auth');

// All routes require authentication
router.post('/save', authMiddleware, progressController.saveProgress);
router.get('/load', authMiddleware, progressController.loadProgress);

module.exports = router;
