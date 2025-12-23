/**
 * Middlewares Index
 * Central export for all middlewares
 */

const { authMiddleware, createToken, optionalAuth } = require('./auth');
const { 
  ApiError, 
  NotFoundError, 
  ValidationError, 
  UnauthorizedError, 
  ForbiddenError,
  errorHandler, 
  asyncHandler, 
  notFoundHandler 
} = require('./errorHandler');

module.exports = {
  // Auth
  authMiddleware,
  createToken,
  optionalAuth,
  
  // Error handling
  ApiError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  errorHandler,
  asyncHandler,
  notFoundHandler
};

