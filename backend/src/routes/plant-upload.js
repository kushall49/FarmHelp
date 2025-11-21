const express = require('express');
const multer = require('multer');
const PlantAnalysis = require('../models/PlantAnalysis');
const AIService = require('../services/ai');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload plant image and analyze
router.post('/upload-plant', upload.single('image'), async (req, res) => {
  try {
    console.log('[PLANT-UPLOAD] === NEW REQUEST ===');
    console.log('[PLANT-UPLOAD] Timestamp:', new Date().toISOString());
    console.log('[PLANT-UPLOAD] Headers:', req.headers);
    console.log('[PLANT-UPLOAD] Body keys:', Object.keys(req.body));
    console.log('[PLANT-UPLOAD] File received:', req.file ? 'YES' : 'NO');
    
    // PRODUCTION: Validate file presence
    if (!req.file) {
      console.log('[PLANT-UPLOAD] ❌ ERROR: No file in request');
      console.log('[PLANT-UPLOAD] Request body:', req.body);
      return res.status(400).json({ 
        success: false,
        error: 'No image file provided',
        error_code: 'NO_FILE',
        layer: 'backend',
        timestamp: Date.now()
      });
    }
    
    const file = req.file;
    
    // PRODUCTION: Validate MIME type (accept only images)
    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validMimeTypes.includes(file.mimetype)) {
      console.error('[PLANT-UPLOAD] ❌ Invalid MIME type:', file.mimetype);
      return res.status(400).json({ 
        success: false,
        error: `Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WEBP images are supported.`,
        error_code: 'INVALID_MIME',
        layer: 'backend',
        timestamp: Date.now(),
        details: {
          received_mime: file.mimetype,
          allowed_mimes: validMimeTypes
        }
      });
    }

    // PRODUCTION: Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.error('[PLANT-UPLOAD] ❌ File too large:', file.size, 'bytes');
      return res.status(400).json({ 
        success: false,
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: 10MB.`,
        error_code: 'FILE_TOO_LARGE',
        layer: 'backend',
        timestamp: Date.now(),
        details: {
          file_size_bytes: file.size,
          file_size_mb: (file.size / 1024 / 1024).toFixed(2),
          max_size_mb: 10
        }
      });
    }

    // PRODUCTION: Log validated file details
    console.log('[PLANT-UPLOAD] ✅ File validated successfully:');
    console.log('[PLANT-UPLOAD] Processing image upload:', file.originalname);
    console.log('[PLANT-UPLOAD] File size:', file.size, 'bytes (', (file.size / 1024 / 1024).toFixed(2), 'MB)');
    console.log('[PLANT-UPLOAD] MIME type:', file.mimetype);
    console.log('[PLANT-UPLOAD] User ID:', req.body.userId);
    
    const buffer = req.file.buffer;
    
    // Send to AI service (which calls Flask ML service)
    console.log('[PLANT-UPLOAD] Calling AI service...');
    const startTime = Date.now();
    const result = await AIService.analyzePlant(buffer, file.mimetype);
    const processingTime = Date.now() - startTime;
    
    console.log('[PLANT-UPLOAD] ✅ AI service responded in', processingTime, 'ms');
    console.log('[PLANT-UPLOAD] AI service response:', JSON.stringify(result, null, 2));

    // PRODUCTION: Validate AI service response
    if (!result || typeof result !== 'object') {
      console.error('[PLANT-UPLOAD] ❌ Invalid AI service response:', result);
      return res.status(500).json({ 
        success: false,
        error: 'AI service returned invalid response',
        error_code: 'INVALID_AI_RESPONSE',
        layer: 'backend',
        timestamp: Date.now()
      });
    }

    // Handle AI service errors
    if (result.success === false || result.error) {
      console.error('[PLANT-UPLOAD] ❌ AI service error:', result.error);
      return res.status(500).json({ 
        success: false,
        error: result.error || 'AI analysis failed',
        error_code: result.error_code || 'AI_SERVICE_ERROR',
        layer: result.layer || 'ml_service',
        timestamp: Date.now()
      });
    }

    // Create base64 data URL for storage
    const imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Get or create anonymous user
    const User = require('../models/User');
    let userId = req.body.userId;
    
    if (!userId || userId === 'anonymous' || userId === 'test-user') {
      // Find or create anonymous user
      let anonymousUser = await User.findOne({ email: 'anonymous@farmhelp.local' });
      if (!anonymousUser) {
        anonymousUser = await User.create({
          email: 'anonymous@farmhelp.local',
          username: 'anonymous',
          displayName: 'Anonymous User'
        });
        console.log('[PLANT-UPLOAD] Created anonymous user:', anonymousUser._id);
      }
      userId = anonymousUser._id;
    }

    // Format data to match PlantAnalysis schema
    const analysisData = {
      user: userId,
      originalImage: {
        url: imageUrl,
        size: req.file.size,
        mimeType: req.file.mimetype
      },
      prediction: {
        crop: result.crop || 'Unknown',
        disease: {
          name: result.disease || 'Unknown',
          severity: 'moderate' // Could be derived from confidence
        },
        confidence: result.confidence || 0,
        confidencePercentage: parseFloat(result.confidence_percentage) || 0,
        topPredictions: (result.predictions || []).map((pred, idx) => ({
          disease: pred.class_name || pred.class || 'Unknown',
          confidence: pred.confidence || 0,
          rank: idx + 1
        }))
      },
      recommendations: {
        summary: result.recommendation || 'No recommendations available',
        treatments: {
          chemical: [],
          organic: [],
          preventive: []
        }
      },
      fertilizers: {
        recommended: (() => {
          // Handle both array and object with recommendations property
          const ferts = result.fertilizers?.recommendations || result.fertilizers || [];
          return Array.isArray(ferts) ? ferts.map(fert => ({
            name: fert.name || fert,
            dosage: fert.dosage || 'As per manufacturer guidelines',
            legalStatus: 'OK'
          })) : [];
        })()
      },
      mlMetadata: {
        serviceUrl: 'http://localhost:5000',
        processingTimeMs: result.processing_time_ms || 0
      }
    };

    // Add GradCAM if available
    if (result.gradcam) {
      analysisData.gradcamImage = {
        base64: result.gradcam
      };
    }

    // Save analysis to database
    console.log('[PLANT-UPLOAD] Saving to database...');
    const record = await PlantAnalysis.create(analysisData);
    
    console.log('[PLANT-UPLOAD] ✅ Analysis saved to database:', record._id);

    // Return simplified response
    res.json({ 
      success: true,
      id: record._id, 
      result: {
        crop: result.crop,
        disease: result.disease,
        confidence: result.confidence,
        confidence_percentage: result.confidence_percentage,
        predictions: result.predictions,
        recommendation: result.recommendation,
        recommendations: result.recommendations,
        fertilizers: result.fertilizers,
        gradcam: result.gradcam,
        processing_time_ms: result.processing_time_ms
      }
    });
  } catch (err) {
    console.error('[PLANT-UPLOAD] ❌ Fatal error:', err.message);
    console.error('[PLANT-UPLOAD] Stack:', err.stack);
    
    // PRODUCTION: Return standardized error response
    res.status(500).json({ 
      success: false,
      error: err.message || 'Internal server error during plant analysis',
      error_code: 'SERVER_ERROR',
      layer: 'backend',
      timestamp: Date.now(),
      details: {
        error_type: err.name,
        error_message: err.message
      }
    });
  }
});

module.exports = router;
