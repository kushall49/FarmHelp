const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.disable('x-powered-by');

// Import Crop model (registers the model with Mongoose)
require('./models/Crop');

// ============================================
// MIDDLEWARE CONFIGURATION (ORDER IS CRITICAL!)
// ============================================

// 1. CORS - Enable Cross-Origin Resource Sharing
// Must be first to handle preflight requests
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:19000', 'http://localhost:19001', 'http://localhost:19003', 'http://localhost:19006', 'http://localhost:8081'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o))) return callback(null, true);
    callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
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

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('[✗] MONGODB_URI environment variable is required');
  process.exit(1);
}

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
app.use('/api/posts', communityRoutes);  // Alias expected by frontend

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

// Chat route - FarmBot AI assistant (Groq-powered)
const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);

// Weather route - OpenWeather integration with mock fallback
const weatherRoutes = require('./routes/weather');
app.use('/api/weather', weatherRoutes);

// Saved Crops route - persist crop recommendations per user
const savedCropRoutes = require('./routes/savedCrops');
app.use('/api/crops/saved', savedCropRoutes);

// Enhanced Crops route - Smart recommendations based on soil, season, and temperature
app.get('/api/crops', async (req, res) => {
  try {
    const { soil, season, temp } = req.query;

    // If no filters provided, return all crops
    if (!soil && !season && !temp) {
      const Crop = mongoose.model('Crop');
      const allCrops = await Crop.find({});
      return res.json({ success: true, results: allCrops });
    }

    // Import scoring utility
    const { scoreCrop, getCurrentSeason } = require('./utils/cropScoring');
    const Crop = mongoose.model('Crop');

    // Get all crops from database
    const allCrops = await Crop.find({});

    if (allCrops.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No crops found in database. Please run the seed script.',
        results: [] 
      });
    }

    // Parse temperature
    const temperature = temp ? parseFloat(temp) : 25;

    // Normalize inputs
    const soilType = soil ? soil.toLowerCase() : 'loam';
    const currentSeason = season ? season.toLowerCase() : getCurrentSeason(new Date().getMonth() + 1);

    console.log(`[CROP RECOMMENDATION] Soil: ${soilType}, Season: ${currentSeason}, Temp: ${temperature}°C`);

    // Build conditions object for scoring
    const conditions = {
      soilType: soilType,
      season: currentSeason,
      temperature: temperature,
      rainfall: 800, // Default moderate rainfall
      marketDemand: 'Medium' // Default
    };

    // Score each crop and add ranking
    const scoredCrops = allCrops.map(crop => {
      const scoreResult = scoreCrop(crop, conditions);
      return {
        _id: crop._id,
        name: crop.name,
        score: scoreResult.score || scoreResult.totalScore || 0,
        reasons: scoreResult.reasons || [],
        suitableSoils: crop.suitableSoils,
        seasons: crop.seasons,
        minTemp: crop.minTemp,
        maxTemp: crop.maxTemp,
        minRainfall: crop.minRainfall,
        maxRainfall: crop.maxRainfall,
        waterRequirement: crop.waterRequirement,
        yieldPotential: crop.yieldPotential,
        marketDemand: crop.marketDemand
      };
    });

    // Log top 3 scores for debugging
    const topScores = scoredCrops
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(c => `${c.name}: ${c.score}`);
    console.log(`[CROP RECOMMENDATION] Top 3 scores: ${topScores.join(', ')}`);

    // Sort by score (highest first) and filter scores > 20 (lowered from 30)
    const recommendations = scoredCrops
      .filter(crop => crop.score > 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Top 10 recommendations
      .map((crop, index) => ({
        ...crop,
        rank: index + 1
      }));

    console.log(`[CROP RECOMMENDATION] Found ${recommendations.length} suitable crops`);

    res.json({ 
      success: true, 
      results: recommendations,
      conditions: {
        soil: soilType,
        season: currentSeason,
        temperature: temperature
      }
    });

  } catch (error) {
    console.error('[CROP RECOMMENDATION ERROR]', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get crop recommendations',
      message: error.message
    });
  }
});

// Location-Based Crop Recommendation route - AI-powered recommendations
app.get('/api/crops/location', async (req, res) => {
  try {
    const { lat, long } = req.query;

    if (!lat || !long) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: lat and long',
      });
    }

    console.log(`[CROP LOCATION] Received request for lat: ${lat}, long: ${long}`);

    // Import necessary modules
    const { recommendCrops } = require('./utils/cropScoring');
    const Crop = mongoose.model('Crop');

    // For geocoding, we'll use a simple reverse geocoding or mock data
    // In production, use a proper geocoding service
    const district = 'Belgaum'; // Mock - in production, use reverse geocoding API
    const state = 'Karnataka'; // Mock - in production, use reverse geocoding API

    // Get crop recommendations
    const result = await recommendCrops(
      parseFloat(lat),
      parseFloat(long),
      district,
      state,
      Crop
    );

    console.log(`[CROP LOCATION] Returning ${result.recommendations.length} recommendations`);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[CROP LOCATION ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get crop recommendations',
      error: error.message,
    });
  }
});

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
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET  /api/auth/me',
      'PUT  /api/auth/profile',
      'GET /api/community',
      'POST /api/community',
      'GET /api/posts',
      'POST /api/posts',
      'GET /api/services',
      'POST /api/services',
      'GET /api/jobs',
      'POST /api/jobs',
      'POST /api/users/rate/:providerId',
      'POST /api/plant/analyze',
      'GET /api/plant/last',
      'POST /api/plant/upload-plant',
      'POST /api/chatbot',
      'POST /api/chat/message',
      'GET  /api/weather?lat=&lon=',
      'GET  /api/crops/saved',
      'POST /api/crops/saved',
      'DELETE /api/crops/saved/:id'
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
  console.log('   🔐 Register:      POST /api/auth/register');
  console.log('   🔐 Login:         POST /api/auth/login');
  console.log('   👤 Profile:       GET  /api/auth/me');
  console.log('   ✏️  Profile Edit:  PUT  /api/auth/profile');
  console.log('   📝 Community:     GET/POST /api/community');
  console.log('   📝 Posts:         GET/POST /api/posts');
  console.log('   💬 Chatbot:       POST /api/chatbot');
  console.log('   🤖 Chat (Groq):   POST /api/chat/message');
  console.log('   🌤  Weather:       GET  /api/weather');
  console.log('   🌾 Saved Crops:   GET/POST/DELETE /api/crops/saved');
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
