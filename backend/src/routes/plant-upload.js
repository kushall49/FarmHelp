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
    console.log('[PLANT-UPLOAD] Headers:', req.headers);
    console.log('[PLANT-UPLOAD] Body keys:', Object.keys(req.body));
    console.log('[PLANT-UPLOAD] File received:', req.file ? 'YES' : 'NO');
    
    if (!req.file) {
      console.log('[PLANT-UPLOAD] ❌ ERROR: No file in request');
      console.log('[PLANT-UPLOAD] Request body:', req.body);
      return res.status(400).json({ error: 'No image uploaded' });
    }
    
    console.log('[PLANT-UPLOAD] Processing image upload:', req.file.originalname);
    console.log('[PLANT-UPLOAD] File size:', req.file.size, 'bytes');
    console.log('[PLANT-UPLOAD] MIME type:', req.file.mimetype);
    console.log('[PLANT-UPLOAD] User ID:', req.body.userId);
    
    const buffer = req.file.buffer;
    
    // Send to AI service (which calls Flask ML service)
    console.log('[PLANT-UPLOAD] Calling AI service...');
    const result = await AIService.analyzePlant(buffer);
    
    console.log('[PLANT-UPLOAD] AI service response:', JSON.stringify(result, null, 2));

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
    console.error('[PLANT-UPLOAD] ❌ Error:', err.message);
    console.error('[PLANT-UPLOAD] Stack:', err.stack);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
