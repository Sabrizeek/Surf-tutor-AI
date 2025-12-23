/**
 * Recommend Routes
 * Defines ML-based recommendation endpoints
 */

const express = require('express');
const router = express.Router();
const recommendController = require('../controllers/recommendController');

// Get workout recommendations
router.post('/', recommendController.getRecommendation);

module.exports = router;

