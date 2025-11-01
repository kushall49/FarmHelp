const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION (ORDER IS CRITICAL!)
// ============================================

// 1. CORS - Enable Cross-Origin Resource Sharing
// Must be first to handle preflight requests
app.use(cors({
  origin: ['http://localhost:19000', 'http://localhost:19001', 'http://localhost:19006', 'http://192.168.*.*:19000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. JSON Body Parser - CRITICAL: Must be placed BEFORE route definitions!
// This middleware parses incoming JSON payloads from request bodies.
// If placed AFTER routes, req.body will be undefined, causing 400 errors.
// Always configure this BEFORE any app.use('/api/...') route handlers!
app.use(express.json({ limit: '10mb' }));

// 3. URL-encoded Body Parser - For form data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Request Logging Middleware - Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('[HEADERS]', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('[BODY]', JSON.stringify(req.body, null, 2));
  }
  next();
});

// ============================================
// DATABASE CONNECTION
// ============================================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://1ms23cs094_db_user:AEQZush8GtcXuvfH@cluster0.ug766o7.mongodb.net/farmmate';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('═══════════════════════════════════════');
    console.log('[✓] MongoDB Connected Successfully!');
    console.log('[✓] Database:', mongoose.connection.name);
    console.log('═══════════════════════════════════════');
  })
  .catch(err => {
    console.error('═══════════════════════════════════════');
    console.error('[✗] MongoDB Connection Error:', err.message);
    console.error('═══════════════════════════════════════');
  });

// ============================================
// ROUTES - Defined AFTER middleware configuration
// ============================================

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'FarmHelp API Server is running!',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      auth: '/api/auth (signup, login)',
      community: '/api/community (posts, comments)',
      services: '/api/services (marketplace listings)',
      jobs: '/api/jobs (job requests)',
      users: '/api/users (ratings)',
      chatbot: '/api/chatbot'
    }
  });
});

// Auth routes - User authentication
const authRoutes = require('./routes/auth-simple');
app.use('/api/auth', authRoutes);

// Community routes - Posts & Comments (Reddit-like feature)
const communityRoutes = require('./routes/community-routes');
app.use('/api/community', communityRoutes);

// Services Marketplace routes - New OLX-style marketplace for farmers
const serviceRoutes = require('./routes/serviceRoutes');
app.use('/api/services', serviceRoutes);

const jobRoutes = require('./routes/jobRoutes');
app.use('/api/jobs', jobRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// Plant analysis routes - Disease detection & ML integration
const plantUploadRoutes = require('./routes/plant-upload');
const plantRoutes = require('./routes/plant');
app.use('/api/plant', plantUploadRoutes);  // Handles /upload-plant
app.use('/api/plant', plantRoutes);        // Handles /analyze and /last

// Chatbot route - AI farming assistant
app.post('/api/chatbot', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false,
        error: 'message required',
        hint: 'Send a JSON body with { "message": "your question here" }'
      });
    }
    
    console.log('[CHATBOT] Received message:', message);
    
    // Import AI service
    const AIService = require('./services/ai');
    const reply = await AIService.chat(message);
    
    console.log('[CHATBOT] Sending reply');
    res.json({ 
      success: true,
      reply 
    });
  } catch (err) {
    console.error('[CHATBOT ERROR]', err);
    res.status(500).json({ 
      success: false,
      error: err.message || 'Internal server error' 
    });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler - Route not found
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
    availableRoutes: [
      'GET /',
      'POST /api/auth/signup',
      'POST /api/auth/login',
      'GET /api/community',
      'POST /api/community',
      'GET /api/services',
      'POST /api/services',
      'GET /api/jobs',
      'POST /api/jobs',
      'POST /api/users/rate/:providerId',
      'POST /api/plant/analyze',        // Frontend-compatible endpoint
      'GET /api/plant/last',             // Get user's last 5 analyses
      'POST /api/plant/upload-plant',    // Alternative upload endpoint
      'POST /api/chatbot'
    ]
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('═══════════════════════════════════════');
  console.error('[ERROR] Unhandled Error:', err.message);
  console.error('[STACK]', err.stack);
  console.error('═══════════════════════════════════════');
  
  res.status(err.status || 500).json({ 
    success: false, 
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║          🚀 FarmHelp Backend Server Started           ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log(`\n[✓] Server URL: http://localhost:${PORT}`);
  console.log('\n[✓] Available Endpoints:');
  console.log('   📍 Health Check:  GET  /');
  console.log('   🔐 Signup:        POST /api/auth/signup');
  console.log('   🔐 Login:         POST /api/auth/login');
  console.log('   📝 Community:     GET/POST /api/community');
  console.log('   💬 Chatbot:       POST /api/chatbot');
  console.log('\n[✓] Middleware Order:');
  console.log('   1. CORS');
  console.log('   2. express.json() ← Body Parser (CRITICAL!)');
  console.log('   3. express.urlencoded()');
  console.log('   4. Request Logger');
  console.log('   5. Routes');
  console.log('\n═══════════════════════════════════════════════════════\n');
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGTERM', () => {
  console.log('\n[!] SIGTERM received, shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close();
    console.log('[✓] Server terminated gracefully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n[!] SIGINT received, shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close();
    console.log('[✓] Server terminated gracefully');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('═══════════════════════════════════════');
  console.error('[✗] Unhandled Rejection at:', promise);
  console.error('[✗] Reason:', reason);
  console.error('═══════════════════════════════════════');
});
