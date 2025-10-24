const fs = require('fs');
const path = require('path');
const axios = require('axios');
const PlantAnalysis = require('../models/PlantAnalysis');
const cron = require('node-cron');

const FLASK_SERVICE_URL = process.env.FLASK_SERVICE_URL || 'http://localhost:5000';
const CONFIRMED_DATA_PATH = path.join(__dirname, '../../data/confirmed');
const MIN_IMAGES_FOR_RETRAIN = parseInt(process.env.MIN_IMAGES_FOR_RETRAIN) || 100;

/**
 * Ensure confirmed data directory exists
 */
function ensureConfirmedDataDir() {
  if (!fs.existsSync(CONFIRMED_DATA_PATH)) {
    fs.mkdirSync(CONFIRMED_DATA_PATH, { recursive: true });
    console.log('[Retraining] Created confirmed data directory:', CONFIRMED_DATA_PATH);
  }
}

/**
 * Save confirmed image to training dataset
 * POST /api/retrain/confirm-image/:analysisId
 */
exports.confirmImage = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const { confirmedDisease } = req.body; // User/expert can override disease label

    // Get analysis record
    const analysis = await PlantAnalysis.findById(analysisId);
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      });
    }

    // Use confirmed disease or original prediction
    const disease = confirmedDisease || analysis.prediction.disease.name;
    const crop = analysis.prediction.crop;

    // Create directory structure: /confirmed/{crop}_{disease}/
    const labelDir = path.join(CONFIRMED_DATA_PATH, `${crop}_${disease}`.replace(/\s+/g, '_'));
    if (!fs.existsSync(labelDir)) {
      fs.mkdirSync(labelDir, { recursive: true });
    }

    // Copy image to confirmed dataset
    const sourceImagePath = analysis.originalImage.url;
    const timestamp = Date.now();
    const fileName = `${analysis._id}_${timestamp}.jpg`;
    const destImagePath = path.join(labelDir, fileName);

    // Copy file if it exists locally
    if (fs.existsSync(sourceImagePath)) {
      fs.copyFileSync(sourceImagePath, destImagePath);
      console.log(`[Retraining] Confirmed image saved: ${destImagePath}`);

      // Update analysis record
      analysis.metadata = {
        ...analysis.metadata,
        confirmedForTraining: true,
        confirmedDisease: disease,
        confirmedAt: new Date()
      };
      await analysis.save();

      res.status(200).json({
        success: true,
        message: 'Image confirmed and saved for retraining',
        path: destImagePath,
        disease
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Source image not found'
      });
    }

  } catch (error) {
    console.error('[Retraining] Confirm image error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm image'
    });
  }
};

/**
 * Get retraining statistics
 * GET /api/retrain/stats
 */
exports.getRetrainingStats = async (req, res) => {
  try {
    ensureConfirmedDataDir();

    // Count confirmed images by disease
    const stats = {};
    let totalImages = 0;

    const categories = fs.readdirSync(CONFIRMED_DATA_PATH);
    for (const category of categories) {
      const categoryPath = path.join(CONFIRMED_DATA_PATH, category);
      if (fs.statSync(categoryPath).isDirectory()) {
        const files = fs.readdirSync(categoryPath);
        const imageCount = files.filter(f => 
          f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png')
        ).length;
        
        stats[category] = imageCount;
        totalImages += imageCount;
      }
    }

    // Get pending confirmations
    const pendingCount = await PlantAnalysis.countDocuments({
      'expertReview.requested': true,
      'expertReview.reviewedAt': { $exists: false }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalConfirmedImages: totalImages,
        imagesByDisease: stats,
        pendingReviews: pendingCount,
        readyForRetraining: totalImages >= MIN_IMAGES_FOR_RETRAIN,
        minImagesRequired: MIN_IMAGES_FOR_RETRAIN
      }
    });

  } catch (error) {
    console.error('[Retraining] Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch retraining stats'
    });
  }
};

/**
 * Trigger manual retraining
 * POST /api/retrain/trigger
 */
exports.triggerRetraining = async (req, res) => {
  try {
    // Check if we have enough images
    const statsResponse = await axios.get(`${req.protocol}://${req.get('host')}/api/retrain/stats`);
    const stats = statsResponse.data.stats;

    if (!stats.readyForRetraining) {
      return res.status(400).json({
        success: false,
        error: 'Not enough confirmed images for retraining',
        currentImages: stats.totalConfirmedImages,
        required: stats.minImagesRequired
      });
    }

    console.log('[Retraining] Triggering retraining with', stats.totalConfirmedImages, 'images');

    // Call Flask retraining endpoint
    const flaskResponse = await axios.post(
      `${FLASK_SERVICE_URL}/retrain`,
      {
        confirmed_data_path: CONFIRMED_DATA_PATH,
        epochs: req.body.epochs || 5,
        batch_size: req.body.batchSize || 32
      },
      {
        timeout: 3600000 // 1 hour timeout for training
      }
    );

    console.log('[Retraining] Retraining completed:', flaskResponse.data);

    res.status(200).json({
      success: true,
      message: 'Retraining completed successfully',
      result: flaskResponse.data
    });

  } catch (error) {
    console.error('[Retraining] Trigger error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger retraining',
      details: error.response?.data || error.message
    });
  }
};

/**
 * Check retraining status
 * GET /api/retrain/status
 */
exports.getRetrainingStatus = async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_SERVICE_URL}/retrain-status`, {
      timeout: 5000
    });

    res.status(200).json({
      success: true,
      status: response.data
    });

  } catch (error) {
    console.error('[Retraining] Status check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check retraining status'
    });
  }
};

/**
 * Schedule automatic retraining (called on server startup)
 */
exports.scheduleAutoRetraining = () => {
  const enabled = process.env.AUTO_RETRAIN_ENABLED === 'true';
  const schedule = process.env.AUTO_RETRAIN_SCHEDULE || '0 2 * * 0'; // Default: 2 AM every Sunday

  if (!enabled) {
    console.log('[Retraining] Auto-retraining is disabled');
    return;
  }

  console.log(`[Retraining] Scheduling auto-retraining: ${schedule}`);

  cron.schedule(schedule, async () => {
    try {
      console.log('[Retraining] Auto-retraining job started');

      // Check if we have enough images
      const response = await axios.get(`http://localhost:${process.env.PORT || 4000}/api/retrain/stats`);
      const stats = response.data.stats;

      if (stats.readyForRetraining) {
        console.log('[Retraining] Starting automatic retraining with', stats.totalConfirmedImages, 'images');
        
        await axios.post(
          `${FLASK_SERVICE_URL}/retrain`,
          {
            confirmed_data_path: CONFIRMED_DATA_PATH,
            epochs: 5,
            batch_size: 32
          },
          {
            timeout: 3600000
          }
        );

        console.log('[Retraining] Auto-retraining completed successfully');
      } else {
        console.log('[Retraining] Not enough images for retraining:', stats.totalConfirmedImages, '/', stats.minImagesRequired);
      }

    } catch (error) {
      console.error('[Retraining] Auto-retraining job failed:', error);
    }
  });

  console.log('[Retraining] Auto-retraining scheduler initialized');
};

// Initialize confirmed data directory on module load
ensureConfirmedDataDir();
