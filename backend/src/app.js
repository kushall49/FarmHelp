const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.disable('x-powered-by');

// ============================================
// MODELS
// ============================================
const Crop = require('./models/Crop.js');
const User = require('./models/User.js');
const Post = require('./models/Post.js');

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// CORS - Must be first
app.use(cors({
  origin: [
    'http://localhost:8081',
    'http://localhost:19000',
    'http://localhost:19001',
    'http://localhost:19003',
    'http://localhost:19006',
    /^http:\/\/192\.168\.\d+\.\d+:19000$/,
    /^http:\/\/10\.\d+\.\d+\.\d+:8081$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
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

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://1ms23cs094_db_user:AEQZush8GtcXuvfH@cluster0.ug766o7.mongodb.net/farmmate';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('\n═══════════════════════════════════════');
  console.log('[✓] MongoDB Connected Successfully!');
  console.log('[✓] Database: farmmate');
  console.log('═══════════════════════════════════════\n');
})
.catch((err) => {
  console.error('[✗] MongoDB Connection Error:', err.message);
  process.exit(1);
});

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required. Add JWT_SECRET to your .env file.');
}

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ============================================
// CROP SCORING UTILITY
// ============================================

function getCurrentSeason(month) {
  if (month >= 6 && month <= 9) return 'monsoon';
  if (month >= 10 || month <= 2) return 'winter';
  if (month >= 3 && month <= 5) return 'summer';
  return 'spring';
}

function scoreCrop(crop, conditions) {
  let totalScore = 0;
  let maxScore = 0;
  const reasons = [];

  // Soil matching
  if (crop.suitableSoils && crop.suitableSoils.length > 0) {
    const soilWeight = crop.soilScore || 5;
    maxScore += soilWeight * 10;
    
    const soilMatch = crop.suitableSoils.some(s => 
      s.toLowerCase() === conditions.soilType.toLowerCase()
    );
    
    if (soilMatch) {
      totalScore += soilWeight * 10;
      reasons.push(`Perfect match for ${conditions.soilType} soil`);
    } else {
      totalScore += soilWeight * 3;
    }
  }

  // Season matching
  if (crop.seasons && crop.seasons.length > 0) {
    const seasonWeight = crop.seasonScore || 5;
    maxScore += seasonWeight * 10;
    
    const seasonMatch = crop.seasons.some(s => 
      s.toLowerCase() === conditions.season.toLowerCase()
    );
    
    if (seasonMatch) {
      totalScore += seasonWeight * 10;
      reasons.push(`Ideal for ${conditions.season} season`);
    } else {
      totalScore += seasonWeight * 2;
    }
  }

  // Temperature matching
  if (crop.minTemp !== undefined && crop.maxTemp !== undefined) {
    const tempWeight = crop.tempScore || 5;
    maxScore += tempWeight * 10;
    
    const temp = conditions.temperature;
    if (temp >= crop.minTemp && temp <= crop.maxTemp) {
      totalScore += tempWeight * 10;
      reasons.push(`Temperature ${temp}°C is optimal`);
    } else if (temp >= crop.minTemp - 5 && temp <= crop.maxTemp + 5) {
      totalScore += tempWeight * 6;
      reasons.push(`Temperature ${temp}°C is acceptable`);
    } else {
      totalScore += tempWeight * 2;
    }
  }

  // Rainfall matching
  if (crop.minRainfall !== undefined && crop.maxRainfall !== undefined) {
    const rainfallWeight = crop.rainfallScore || 5;
    maxScore += rainfallWeight * 10;
    
    const rainfall = conditions.rainfall || 800;
    if (rainfall >= crop.minRainfall && rainfall <= crop.maxRainfall) {
      totalScore += rainfallWeight * 10;
      reasons.push(`Rainfall requirement matches`);
    } else {
      totalScore += rainfallWeight * 4;
    }
  }

  // Market demand
  if (crop.marketDemand) {
    const marketWeight = crop.marketScore || 5;
    maxScore += marketWeight * 10;
    
    const demandScore = {
      'High': 10,
      'Medium': 6,
      'Low': 3
    }[crop.marketDemand] || 5;
    
    totalScore += marketWeight * (demandScore / 10) * 10;
    if (crop.marketDemand === 'High') {
      reasons.push(`High market demand - profitable crop`);
    }
  }

  // Normalize to 0-100 scale
  const normalizedScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  return {
    totalScore: Math.round(normalizedScore),
    reasons: reasons
  };
}

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'FarmHelp API is running',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// AUTH ROUTES
// ============================================

// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { id: user._id, userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('[SIGNUP ERROR]', error);
    res.status(500).json({ error: 'Signup failed', message: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

// ============================================
// CROP RECOMMENDATION ROUTES
// ============================================

// Get crop recommendations
app.get('/api/crops', async (req, res) => {
  try {
    const { soil, season, temp } = req.query;

    // If no filters, return all crops
    if (!soil && !season && !temp) {
      const allCrops = await Crop.find({});
      return res.json({ success: true, results: allCrops });
    }

    // Get all crops
    const allCrops = await Crop.find({});

    if (allCrops.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No crops in database',
        results: [] 
      });
    }

    const temperature = temp ? parseFloat(temp) : 25;
    const soilType = soil ? soil.toLowerCase() : 'loam';
    const currentSeason = season ? season.toLowerCase() : getCurrentSeason(new Date().getMonth() + 1);

    console.log(`[CROP RECOMMENDATION] Soil: ${soilType}, Season: ${currentSeason}, Temp: ${temperature}°C`);

    const conditions = {
      soilType,
      season: currentSeason,
      temperature,
      rainfall: 800
    };

    // Score and rank crops
    const scoredCrops = allCrops.map(crop => {
      const scoreResult = scoreCrop(crop, conditions);
      return {
        _id: crop._id,
        name: crop.name,
        score: scoreResult.totalScore,
        reasons: scoreResult.reasons,
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

    const recommendations = scoredCrops
      .filter(crop => crop.score > 20) // Lowered threshold from 30 to 20
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((crop, index) => ({ ...crop, rank: index + 1 }));

    console.log(`[CROP RECOMMENDATION] Found ${recommendations.length} suitable crops`);

    res.json({ 
      success: true, 
      results: recommendations,
      conditions: { soil: soilType, season: currentSeason, temperature }
    });

  } catch (error) {
    console.error('[CROP RECOMMENDATION ERROR]', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations',
      message: error.message
    });
  }
});

// ============================================
// COMMUNITY ROUTES
// ============================================

// Get all posts
app.get('/api/community', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, posts });
  } catch (error) {
    console.error('[GET POSTS ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch posts', message: error.message });
  }
});

// Create post
app.post('/api/community', authMiddleware, async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Auto-generate title if not provided
    const postTitle = title || content.substring(0, 50) + (content.length > 50 ? '...' : '');

    const post = new Post({
      title: postTitle,
      author: req.user.userId || req.user.id,
      content,
      imageUrl: imageUrl || '',
      comments: [],
      upvotes: [],
      downvotes: []
    });

    await post.save();
    await post.populate('author', 'name email');

    res.status(201).json({ success: true, post });
  } catch (error) {
    console.error('[CREATE POST ERROR]', error);
    res.status(500).json({ error: 'Failed to create post', message: error.message });
  }
});

// ============================================
// CHATBOT ROUTE (Advanced AI System)
// ============================================

const chatbotController = require('./chatbot/controllers/chatbotController');

// TEMPORARY: Chatbot without auth for testing
app.post('/api/chatbot/test', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false,
        error: 'Message is required' 
      });
    }

    // Use test user ID
    const userId = 'test-user-' + Date.now();

    // Pass message to chatbot controller
    const result = await chatbotController.handleMessage(userId, message);

    if (result.success) {
      res.json({ 
        success: true,
        reply: result.reply,
        intent: result.intent,
        confidence: result.confidence
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.reply || 'Failed to process message'
      });
    }
  } catch (error) {
    console.error('[CHATBOT TEST ERROR]', error);
    res.status(500).json({ 
      success: false,
      error: 'Chatbot service temporarily unavailable',
      details: error.message
    });
  }
});

app.post('/api/chatbot', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false,
        error: 'Message is required' 
      });
    }

    // Get user ID from authenticated request
    const userId = req.user?.userId || req.user?.id || 'anonymous';

    // Pass message to new chatbot controller
    const result = await chatbotController.handleMessage(userId, message);

    if (result.success) {
      // Return reply in format expected by frontend
      res.json({ 
        success: true,
        reply: result.reply,
        intent: result.intent,
        confidence: result.confidence
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.reply || 'Failed to process message'
      });
    }
  } catch (error) {
    console.error('[CHATBOT ERROR]', error);
    res.status(500).json({ 
      success: false,
      error: 'Chatbot service temporarily unavailable',
      details: error.message
    });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[GLOBAL ERROR]', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

// ============================================
// START SERVER
// ============================================

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
  console.log('   🌾 Crops:         GET  /api/crops');
  console.log('   📝 Community:     GET/POST /api/community');
  console.log('   💬 Chatbot:       POST /api/chatbot');
  console.log('\n═══════════════════════════════════════════════════════\n');
});

module.exports = app;
