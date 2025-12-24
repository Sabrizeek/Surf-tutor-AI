/**
 * Progress Routes
 * Defines user progress tracking endpoints
 */

const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');

// All routes (no auth required)
router.post('/save', progressController.saveProgress);
router.get('/load', progressController.loadProgress);

module.exports = router;
