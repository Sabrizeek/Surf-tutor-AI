/**
 * Gamification Routes
 * Defines points, badges, and streak endpoints
 */

const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');

// All routes (no auth required)
router.post('/award', gamificationController.awardPoints);
router.get('/stats', gamificationController.getStats);

module.exports = router;
