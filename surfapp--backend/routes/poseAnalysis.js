/**
 * Pose Analysis Routes
 * Defines detailed pose analysis endpoints
 */

const express = require('express');
const router = express.Router();
const poseController = require('../controllers/poseController');

// Detailed pose analysis
router.post('/analyze', poseController.analyzePoseDetailed);

// Health check
router.get('/health', poseController.healthCheck);

module.exports = router;
