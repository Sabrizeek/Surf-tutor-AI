/**
 * Controllers Index
 * Central export for all controllers
 */

const authController = require('./authController');
const progressController = require('./progressController');
const gamificationController = require('./gamificationController');
const poseController = require('./poseController');
const recommendController = require('./recommendController');

module.exports = {
  authController,
  progressController,
  gamificationController,
  poseController,
  recommendController
};

