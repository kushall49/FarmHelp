const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const PlantAnalysis = require('../models/PlantAnalysis');

// Flask service configuration
const FLASK_SERVICE_URL = process.env.FLASK_SERVICE_URL || 'http://localhost:5000';
const FLASK_TIMEOUT = parseInt(process.env.FLASK_TIMEOUT) || 30000; // 30 seconds
const MAX_RETRIES = parseInt(process.env.FLASK_MAX_RETRIES) || 3;
const RETRY_DELAY = parseInt(process.env.FLASK_RETRY_DELAY) || 2000; // 2 seconds

/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Call Flask ML service with retry logic
 */
async function callFlaskService(imagePath, retryCount = 0) {
  try {
    console.log(`[Flask Service] Attempt ${retryCount + 1}/${MAX_RETRIES + 1}`);
    
    // Create form data with image file
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));

    // Make request to Flask service
    const response = await axios.post(
      `${FLASK_SERVICE_URL}/analyze`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: FLASK_TIMEOUT,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    console.log('[Flask Service] Success:', response.data.disease);
    return response.data;

  } catch (error) {
    console.error(`[Flask Service] Error on attempt ${retryCount + 1}:`, error.message);

    // Check if we should retry
    const shouldRetry = retryCount < MAX_RETRIES && (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNRESET' ||
      (error.response && error.response.status >= 500)
    );

    if (shouldRetry) {
      console.log(`[Flask Service] Retrying in ${RETRY_DELAY}ms...`);
      await sleep(RETRY_DELAY);
      return callFlaskService(imagePath, retryCount + 1);
    }

    // No more retries, throw error
    throw error;
  }
}

/**
 * Analyze plant disease from uploaded image
 * POST /api/plant/analyze
 */
exports.analyzePlant = async (req, res) => {
  const startTime = Date.now();
  let analysis = null;

  try {
    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Validate image file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded'
      });
    }

    console.log(`[Plant Analysis] User: ${req.user.id}, File: ${req.file.originalname}`);

    // Create pending analysis record
    analysis = new PlantAnalysis({
      user: req.user.id,
      originalImage: {
        url: req.file.path, // Multer file path (or Cloudinary URL if using cloudinary-storage)
        publicId: req.file.filename,
        size: req.file.size,
        mimeType: req.file.mimetype
      },
      status: 'pending'
    });

    await analysis.save();
    console.log(`[Plant Analysis] Created analysis record: ${analysis._id}`);

    // Call Flask ML service
    let flaskResponse;
    let retryCount = 0;

    try {
      flaskResponse = await callFlaskService(req.file.path);
    } catch (flaskError) {
      console.error('[Plant Analysis] Flask service failed:', flaskError.message);

      // Update analysis with failure
      analysis.status = 'failed';
      analysis.metadata = {
        ...analysis.metadata,
        retryCount,
        failedAttempts: [{
          timestamp: new Date(),
          error: flaskError.message
        }]
      };
      await analysis.save();

      // Return error response
      return res.status(503).json({
        success: false,
        error: 'ML service unavailable',
        message: 'Plant analysis service is temporarily unavailable. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? flaskError.message : undefined
      });
    }

    // Parse Flask response
    const {
      crop,
      disease,
      confidence,
      predictions = [],
      recommendation,
      recommendations = {},
      fertilizers = {},
      gradcam,
      processing_time_ms,
      model_version
    } = flaskResponse;

    // Update analysis with results
    analysis.prediction = {
      crop,
      disease: {
        name: disease,
        severity: confidence > 0.8 ? 'mild' : confidence > 0.6 ? 'moderate' : 'severe'
      },
      confidence,
      confidencePercentage: Math.round(confidence * 100),
      topPredictions: predictions.slice(0, 5).map((pred, index) => ({
        disease: pred.disease || pred.class_name,
        confidence: pred.confidence,
        rank: index + 1
      }))
    };

    // Store treatment recommendations
    analysis.recommendations = {
      summary: recommendation || recommendations.summary,
      symptoms: recommendations.symptoms || [],
      treatments: {
        chemical: recommendations.chemical || [],
        organic: recommendations.organic || [],
        preventive: recommendations.preventive || []
      },
      urgency: confidence < 0.6 ? 'high' : confidence < 0.8 ? 'medium' : 'low'
    };

    // Store fertilizer recommendations
    if (fertilizers.recommendations && fertilizers.recommendations.length > 0) {
      analysis.fertilizers = {
        recommended: fertilizers.recommendations.map(fert => ({
          id: fert.id,
          name: fert.name,
          dosage: fert.dosage,
          notes: fert.notes,
          legalStatus: fert.legal || 'OK',
          safetyWarning: fert.safety_warning,
          applicationMethod: fert.application_method
        })),
        disclaimer: fertilizers.disclaimer,
        additionalAdvice: fertilizers.additional_advice || []
      };
    }

    // Store GradCAM if available
    if (gradcam) {
      analysis.gradcamImage = {
        base64: gradcam // Store as base64 (or upload to Cloudinary and store URL)
      };
    }

    // Store metadata
    analysis.metadata = {
      processingTimeMs: processing_time_ms || (Date.now() - startTime),
      modelVersion: model_version,
      flaskServiceUrl: FLASK_SERVICE_URL,
      retryCount
    };

    // Set final status
    analysis.status = confidence < 0.6 ? 'review_needed' : 'completed';

    // Save updated analysis
    await analysis.save();

    console.log(`[Plant Analysis] Completed: ${analysis._id} - ${disease} (${Math.round(confidence * 100)}%)`);

    // Prepare response (exclude large base64 data by default)
    const responseData = {
      success: true,
      analysisId: analysis._id,
      crop,
      disease,
      confidence,
      confidencePercentage: Math.round(confidence * 100),
      predictions: analysis.prediction.topPredictions,
      recommendations: analysis.recommendations,
      fertilizers: analysis.fertilizers,
      gradcam: gradcam, // Include in response for immediate display
      processingTimeMs: analysis.metadata.processingTimeMs,
      status: analysis.status,
      needsExpertReview: analysis.isLowConfidence
    };

    // If low confidence, add warning
    if (confidence < 0.6) {
      responseData.warning = 'Low confidence prediction. Expert review recommended.';
      responseData.expertReviewAvailable = true;
    }

    res.status(200).json(responseData);

  } catch (error) {
    console.error('[Plant Analysis] Unexpected error:', error);

    // Update analysis if created
    if (analysis) {
      analysis.status = 'failed';
      if (!analysis.metadata) analysis.metadata = {};
      analysis.metadata.failedAttempts = [{
        timestamp: new Date(),
        error: error.message
      }];
      await analysis.save();
    }

    res.status(500).json({
      success: false,
      error: 'Analysis failed',
      message: 'An error occurred during plant analysis',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    // Clean up uploaded file if needed
    if (req.file && req.file.path && !req.file.path.includes('cloudinary')) {
      try {
        fs.unlinkSync(req.file.path);
        console.log(`[Cleanup] Removed temporary file: ${req.file.path}`);
      } catch (err) {
        console.error(`[Cleanup] Failed to remove file:`, err.message);
      }
    }
  }
};

/**
 * Get user's analysis history
 * GET /api/plant/history
 */
exports.getAnalysisHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const analyses = await PlantAnalysis.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-gradcamImage.base64') // Exclude large base64
      .lean();

    const total = await PlantAnalysis.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      analyses,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });

  } catch (error) {
    console.error('[Plant Analysis] History error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analysis history'
    });
  }
};

/**
 * Get single analysis by ID
 * GET /api/plant/analysis/:id
 */
exports.getAnalysisById = async (req, res) => {
  try {
    const analysis = await PlantAnalysis.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }

    res.status(200).json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('[Plant Analysis] Get by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analysis'
    });
  }
};

/**
 * Request expert review for low-confidence prediction
 * POST /api/plant/analysis/:id/request-review
 */
exports.requestExpertReview = async (req, res) => {
  try {
    const analysis = await PlantAnalysis.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }

    await analysis.requestExpertReview();

    res.status(200).json({
      success: true,
      message: 'Expert review requested successfully',
      analysis
    });

  } catch (error) {
    console.error('[Plant Analysis] Request review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to request expert review'
    });
  }
};

/**
 * Add user feedback to analysis
 * POST /api/plant/analysis/:id/feedback
 */
exports.addFeedback = async (req, res) => {
  try {
    const { helpful, rating, comment } = req.body;

    const analysis = await PlantAnalysis.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }

    await analysis.addFeedback(helpful, rating, comment);

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('[Plant Analysis] Feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback'
    });
  }
};

/**
 * Get disease statistics
 * GET /api/plant/stats
 */
exports.getDiseaseStats = async (req, res) => {
  try {
    const stats = await PlantAnalysis.getDiseaseStats(req.user.id);

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('[Plant Analysis] Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
};

/**
 * Health check for Flask service
 * GET /api/plant/service-health
 */
exports.checkFlaskHealth = async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_SERVICE_URL}/health`, {
      timeout: 5000
    });

    res.status(200).json({
      success: true,
      flaskService: 'healthy',
      details: response.data
    });

  } catch (error) {
    res.status(503).json({
      success: false,
      flaskService: 'unavailable',
      error: error.message
    });
  }
};
