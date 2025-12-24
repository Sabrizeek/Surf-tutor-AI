/**
 * Routes Index
 * Central export for all routes
 */

const progressRouter = require('./progress');
const gamificationRouter = require('./gamification');
const poseRouter = require('./pose');
const poseAnalysisRouter = require('./poseAnalysis');
const recommendRouter = require('./recommend');

module.exports = {
  progressRouter,
  gamificationRouter,
  poseRouter,
  poseAnalysisRouter,
  recommendRouter
};

