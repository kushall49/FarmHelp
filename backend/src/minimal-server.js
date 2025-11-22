const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.disable('x-powered-by');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'FarmHelp API is running',
    timestamp: new Date().toISOString(),
    services: {
      backend: 'online',
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      mlService: 'http://localhost:5000'
    }
  });
});

// Import auth routes (after MongoDB is defined above)
let authRoutes;
try {
  authRoutes = require('./routes/auth-simple');
  app.use('/api/auth', authRoutes);
  console.log('[✓] Auth routes loaded');
} catch (error) {
  console.error('[!] Could not load auth routes:', error.message);
}

// Import other routes
try {
  const plantRoutes = require('./routes/plant');
  app.use('/api/plant', plantRoutes);
  console.log('[✓] Plant routes loaded');
} catch (error) {
  console.error('[!] Could not load plant routes:', error.message);
}

try {
  const communityRoutes = require('./routes/community-routes');
  app.use('/api/community', communityRoutes);
  console.log('[✓] Community routes loaded');
} catch (error) {
  console.error('[!] Could not load community routes:', error.message);
}

try {
  const serviceRoutes = require('./routes/serviceRoutes');
  app.use('/api/services', serviceRoutes);
  console.log('[✓] Service routes loaded');
} catch (error) {
  console.error('[!] Could not load service routes:', error.message);
}

try {
  const jobRoutes = require('./routes/jobRoutes');
  app.use('/api/jobs', jobRoutes);
  console.log('[✓] Job routes loaded');
} catch (error) {
  console.error('[!] Could not load job routes:', error.message);
}

try {
  const userRoutes = require('./routes/userRoutes');
  app.use('/api/users', userRoutes);
  console.log('[✓] User routes loaded');
} catch (error) {
  console.error('[!] Could not load user routes:', error.message);
}

try {
  const machineRoutes = require('./routes/machines');
  app.use('/api/machines', machineRoutes);
  console.log('[✓] Machine routes loaded');
} catch (error) {
  console.error('[!] Could not load machine routes:', error.message);
}

// Simple chatbot endpoint
app.post('/api/chatbot', (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false,
        error: 'Message is required' 
      });
    }

    const msg = message.toLowerCase();
    let reply = '';

    if (msg.includes('weather') || msg.includes('temperature')) {
      reply = '🌤️ For weather information, please specify your location. I can help you get current weather conditions and forecasts.';
    } else if (msg.includes('crop') || msg.includes('farming')) {
      reply = '🌾 I can help with crop recommendations! Please tell me your soil type (loamy, clay, sandy) and current season.';
    } else if (msg.includes('disease') || msg.includes('pest')) {
      reply = '🔍 Use the Plant Health Analyzer to upload a photo of your plant. I can help identify diseases and suggest treatments.';
    } else if (msg.includes('price') || msg.includes('market')) {
      reply = '💰 For crop prices and market information, please specify which crop you are interested in.';
    } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      reply = '👋 Hello! I\'m FarmHelp Assistant. How can I help you today?';
    } else {
      reply = 'I can help you with farming questions about weather, crops, plant diseases, and market prices!';
    }

    res.json({ 
      success: true,
      reply,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[CHATBOT ERROR]', error);
    res.status(500).json({ 
      success: false,
      error: 'Chatbot service temporarily unavailable'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found', 
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error', 
    message: err.message 
  });
});

// Start server first
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
  console.log('\n═══════════════════════════════════════════════════════\n');
  
  // Connect to MongoDB after server starts
  console.log('[⏳] Connecting to MongoDB...');
  mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log('[✓] MongoDB Connected Successfully!');
    console.log('[✓] Database:', mongoose.connection.name);
    console.log('\n[✓] All services online and ready!\n');
  })
  .catch(err => {
    console.error('[✗] MongoDB Connection Error:', err.message);
    console.log('[!] Server continues without database\n');
  });
});

// Handle server errors
server.on('error', (error) => {
  console.error('[✗] Server Error:', error);
  process.exit(1);
});

// Handle process termination
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
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[✗] Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
