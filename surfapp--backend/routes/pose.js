/**
 * Pose Routes
 * Defines pose analysis endpoints
 */

const express = require('express');
const router = express.Router();
const poseController = require('../controllers/poseController');

// Pose detection endpoint (MediaPipe)
router.post('/detect', poseController.detectPose);

// Pose analysis endpoint (legacy)
router.post('/analyze', poseController.analyzePose);

module.exports = router;
