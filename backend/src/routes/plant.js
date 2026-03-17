const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const Analysis = require('../models/Analysis');
const { callModelService } = require('../utils/modelClient');

const router = express.Router();

// Safe path utilities to prevent path traversal
function sanitizePath(filePath) {
  const normalized = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
  const uploadDir = path.join(__dirname, '../../uploads');
  const resolved = path.resolve(uploadDir, normalized);
  
  // Ensure the resolved path is within uploadDir
  if (!resolved.startsWith(uploadDir)) {
    throw new Error('Invalid file path - path traversal detected');
  }
  
  return resolved;
}

// Configure multer for file uploads with size limits
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Rate limiting for file operations
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(userId) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(userId) || [];
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(userId, recentRequests);
  return true;
}

// POST /api/plant/analyze - Upload and analyze plant image
router.post('/analyze', authMiddleware, upload.single('image'), async (req, res) => {
  // Rate limiting check
  if (!checkRateLimit(req.user.id)) {
    return res.status(429).json({ success: false, error: 'Too many requests. Please try again later.' });
  }
  try {
    console.log('[PLANT] === NEW ANALYZE REQUEST ===');
    console.log('[PLANT] Content-Type:', req.headers['content-type']);
    console.log('[PLANT] Body keys:', Object.keys(req.body));
    console.log('[PLANT] File received:', req.file ? 'YES' : 'NO');
    console.log('[PLANT] User:', req.user ? req.user.id : 'NO USER');
    
    if (!req.file) {
      console.log('[PLANT] ❌ ERROR: No file in request');
      console.log('[PLANT] Full request body:', req.body);
      console.log('[PLANT] Headers:', JSON.stringify(req.headers, null, 2));
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    console.log('[PLANT] Analyzing image:', req.file.filename);
    
    // Sanitize file path before use
    const safePath = sanitizePath(req.file.path);

    // Call model service
    const modelResult = await callModelService(safePath);

    console.log('[PLANT] Model result:', modelResult);

    // Save analysis to database
    const analysis = await Analysis.create({
      userId: req.user.id,
      imagePath: `/uploads/${req.file.filename}`,
      prediction: modelResult.prediction,
      confidence: modelResult.confidence,
      modelVersion: modelResult.model_version
    });

    console.log('[PLANT] Analysis saved:', analysis._id);

    res.json({
      success: true,
      analysis: {
        id: analysis._id,
        prediction: modelResult.prediction,
        crop: modelResult.crop,
        disease: modelResult.prediction,
        confidence: modelResult.confidence,
        confidence_percentage: modelResult.confidence_percentage,
        modelVersion: modelResult.model_version,
        imagePath: analysis.imagePath,
        createdAt: analysis.createdAt,
        // Include detailed predictions
        predictions: modelResult.predictions || [],
        // Include recommendations and fertilizers from Flask
        recommendation: modelResult.recommendation || 'No recommendations available',
        fertilizers: modelResult.fertilizers || []
      }
    });
  } catch (error) {
    console.error('[PLANT] Analysis error:', error.message);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        const safeCleanupPath = sanitizePath(req.file.path);
        fs.unlinkSync(safeCleanupPath);
      } catch (cleanupErr) {
        console.error('[PLANT] Failed to cleanup file:', cleanupErr.message);
      }
    }
    
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/plant/last - Get last 5 analyses for user
router.get('/last', authMiddleware, async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-userId');

    res.json({ success: true, analyses });
  } catch (error) {
    console.error('[PLANT] Error fetching analyses:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
