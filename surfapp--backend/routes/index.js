/**
 * Routes Index
 * Central export for all routes
 */

const authRouter = require('./auth');
const progressRouter = require('./progress');
const gamificationRouter = require('./gamification');
const poseRouter = require('./pose');
const poseAnalysisRouter = require('./poseAnalysis');
const recommendRouter = require('./recommend');

module.exports = {
  authRouter,
  progressRouter,
  gamificationRouter,
  poseRouter,
  poseAnalysisRouter,
  recommendRouter
};

