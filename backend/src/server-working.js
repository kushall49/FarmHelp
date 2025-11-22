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

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
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
  process.exit(1);
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'FarmHelp API is running',
    timestamp: new Date().toISOString()
  });
});

// Import routes
const authRoutes = require('./routes/auth-simple');
const plantRoutes = require('./routes/plant');
const communityRoutes = require('./routes/community-routes');
const serviceRoutes = require('./routes/serviceRoutes');
const jobRoutes = require('./routes/jobRoutes');
const userRoutes = require('./routes/userRoutes');
const machineRoutes = require('./routes/machines');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/plant', plantRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/machines', machineRoutes);

// Simple chatbot endpoint (without complex controller)
app.post('/api/chatbot', (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false,
        error: 'Message is required' 
      });
    }

    // Simple pattern matching responses
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
      reply = '👋 Hello! I\'m FarmHelp Assistant. How can I help you today? You can ask me about:\n✅ Weather\n✅ Crop recommendations\n✅ Plant diseases\n✅ Market prices';
    } else {
      reply = 'I can help you with farming questions! Try asking about:\n🌾 Crop recommendations\n🌡️ Weather information\n🔍 Plant disease diagnosis\n💰 Market prices';
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

// Start server
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║       🚀 FarmHelp Backend Server Started             ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log(`\n[✓] Server URL: http://localhost:${PORT}`);
  console.log('\n[✓] Available Endpoints:');
  console.log('   📍 Health Check:  GET  /');
  console.log('   🔐 Signup:        POST /api/auth/signup');
  console.log('   🔐 Login:         POST /api/auth/login');
  console.log('   👤 Users:         GET  /api/users');
  console.log('   📝 Community:     GET/POST /api/community');
  console.log('   🛠️  Services:      GET/POST /api/services');
  console.log('   💼 Jobs:          GET/POST /api/jobs');
  console.log('   🚜 Machines:      GET/POST /api/machines');
  console.log('   💬 Chatbot:       POST /api/chatbot');
  console.log('   🔍 Plant Analyze: POST /api/plant/analyze');
  console.log('\n═══════════════════════════════════════════════════════\n');
});

module.exports = app;
