const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.disable('x-powered-by');

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// DATABASE CONNECTION
// ============================================
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('[✗] MONGODB_URI is not set in environment variables');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
})
.then(() => {
  console.log('\n═══════════════════════════════════════');
  console.log('[✓] MongoDB Connected Successfully!');
  console.log('[✓] Database:', mongoose.connection.name);
  console.log('═══════════════════════════════════════\n');
})
.catch(err => {
  console.error('[✗] MongoDB Connection Error:', err.message);
  console.log('[!] Server will continue but database features may not work\n');
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'FarmHelp API is running',
    timestamp: new Date().toISOString(),
    services: {
      backend: 'online',
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      mlService: 'http://localhost:5000',
      chatbot: 'integrated'
    }
  });
});

// ============================================
// LOAD ROUTES (with error handling)
// ============================================
const loadRoutes = () => {
  const routes = [
    { path: '/api/auth', file: './routes/auth-simple', name: 'Auth' },
    { path: '/api/plant', file: './routes/plant', name: 'Plant' },
    { path: '/api/community', file: './routes/community-routes', name: 'Community' },
    { path: '/api/services', file: './routes/serviceRoutes', name: 'Services' },
    { path: '/api/jobs', file: './routes/jobRoutes', name: 'Jobs' },
    { path: '/api/users', file: './routes/userRoutes', name: 'Users' },
    { path: '/api/machines', file: './routes/machines', name: 'Machines' },
    { path: '/api/chatbot', file: './routes/chatbot', name: 'Chatbot' }  // Use REAL chatbot route
  ];

  routes.forEach(({ path, file, name }) => {
    try {
      const route = require(file);
      app.use(path, route);
      console.log(`[✓] ${name} routes loaded`);
    } catch (error) {
      console.error(`[✗] Failed to load ${name} routes:`, error.message);
    }
  });
};

loadRoutes();

// ============================================
// ERROR HANDLERS
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found', 
    path: req.path 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║       🚀 FarmHelp Backend Server Started             ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log(`\n[✓] Server URL: http://localhost:${PORT}`);
  console.log('\n[✓] Available Endpoints:');
  console.log('   📍 Health Check:  GET  /');
  console.log('   🔐 Auth:          POST /api/auth/login, /api/auth/signup');
  console.log('   💬 Chatbot:       POST /api/chatbot');
  console.log('   🔍 Plant:         POST /api/plant/analyze');
  console.log('   📝 Community:     GET/POST /api/community');
  console.log('   🛠️  Services:      GET/POST /api/services');
  console.log('   💼 Jobs:          GET/POST /api/jobs');
  console.log('   👤 Users:         GET /api/users');
  console.log('   🚜 Machines:      GET /api/machines');
  console.log('\n═══════════════════════════════════════════════════════\n');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[✗] Port ${PORT} is already in use`);
    console.log('[!] Please close the other server or use a different port');
  } else {
    console.error('[✗] Server Error:', error);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n[!] SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('[✓] Server closed');
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n[!] SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('[✓] Server closed');
    mongoose.connection.close();
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[✗] Uncaught Exception:', error);
  console.log('[!] Server will continue running but this should be fixed');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[✗] Unhandled Rejection at:', promise, 'reason:', reason);
  console.log('[!] Server will continue running but this should be fixed');
});

module.exports = app;
