/**
 * Surf AI Backend Server
 * Main application entry point
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { PORT } = require('./config/constants');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// Import routes
const progressRouter = require('./routes/progress');
const gamificationRouter = require('./routes/gamification');
const poseRouter = require('./routes/pose');
const poseAnalysisRouter = require('./routes/poseAnalysis');
const recommendRouter = require('./routes/recommend');
const sessionsRouter = require('./routes/sessions'); // Phase 4.3: Session replay

// Create Express app
const app = express();

// ======================
// Middleware
// ======================

// CORS configuration - allow requests from mobile app
app.use(cors({
  origin: '*', // In production, specify exact origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies with increased limit for image data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ======================
// Routes
// ======================

// Health endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'surf-ai-backend' }));

// API routes
app.use('/api/progress', progressRouter);
app.use('/api/gamification', gamificationRouter);
app.use('/api/pose', poseRouter);
app.use('/api/pose-analysis', poseAnalysisRouter);
app.use('/api/recommend', recommendRouter);
app.use('/api/sessions', sessionsRouter); // Phase 4.3: Session replay

// ======================
// Error Handling
// ======================

// 404 handler for unknown routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ======================
// Server Startup
// ======================

// Connect to MongoDB and start server
async function startServer() {
  try {
    await connectDB();
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.warn('⚠️ MongoDB connection failed at startup - some features may be disabled');
    console.warn('   Error:', err.message || err);
  }
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Surf AI Backend running on http://localhost:${PORT}`);
    console.log('   Available endpoints:');
    console.log('   - GET  /health');
    console.log('   - POST /api/progress/save');
    console.log('   - GET  /api/progress/load');
    console.log('   - POST /api/gamification/award');
    console.log('   - GET  /api/gamification/stats');
    console.log('   - POST /api/pose/analyze');
    console.log('   - POST /api/pose-analysis/analyze');
    console.log('   - GET  /api/pose-analysis/health');
    console.log('   - POST /api/recommend');
  });

  // Handle port conflict errors
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ ERROR: Port ${PORT} is already in use!`);
      console.error('   Please stop the process using this port or change PORT in .env');
      console.error('   To find and kill the process:');
      console.error(`   Windows: netstat -ano | findstr ":${PORT}"`);
      console.error(`   Then: taskkill /PID <PID> /F\n`);
      process.exit(1);
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });
}

startServer();
