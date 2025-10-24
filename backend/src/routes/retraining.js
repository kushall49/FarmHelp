const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const retrainingController = require('../controllers/retrainingController');

/**
 * @route   POST /api/retrain/confirm-image/:analysisId
 * @desc    Confirm image for training dataset
 * @access  Private (Admin/Expert only in production)
 * @body    { confirmedDisease?: String }
 */
router.post(
  '/confirm-image/:analysisId',
  protect,
  retrainingController.confirmImage
);

/**
 * @route   GET /api/retrain/stats
 * @desc    Get retraining statistics
 * @access  Private
 */
router.get(
  '/stats',
  protect,
  retrainingController.getRetrainingStats
);

/**
 * @route   POST /api/retrain/trigger
 * @desc    Manually trigger retraining
 * @access  Private (Admin only in production)
 * @body    { epochs?: Number, batchSize?: Number }
 */
router.post(
  '/trigger',
  protect,
  retrainingController.triggerRetraining
);

/**
 * @route   GET /api/retrain/status
 * @desc    Check retraining status
 * @access  Private
 */
router.get(
  '/status',
  protect,
  retrainingController.getRetrainingStatus
);

module.exports = router;
