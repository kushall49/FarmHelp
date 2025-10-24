const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const plantAnalysisController = require('../controllers/plantAnalysisController');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/plants/'); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'plant-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - only accept images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: 'Image must be less than 10MB'
      });
    }
    return res.status(400).json({
      success: false,
      error: 'Upload error',
      message: err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      error: 'Upload error',
      message: err.message
    });
  }
  next();
};

/**
 * @route   POST /api/plant/analyze
 * @desc    Analyze plant disease from uploaded image
 * @access  Private
 */
router.post(
  '/analyze',
  protect,
  upload.single('image'),
  handleMulterError,
  plantAnalysisController.analyzePlant
);

/**
 * @route   GET /api/plant/history
 * @desc    Get user's analysis history
 * @access  Private
 * @query   ?limit=20&page=1
 */
router.get(
  '/history',
  protect,
  plantAnalysisController.getAnalysisHistory
);

/**
 * @route   GET /api/plant/analysis/:id
 * @desc    Get single analysis by ID
 * @access  Private
 */
router.get(
  '/analysis/:id',
  protect,
  plantAnalysisController.getAnalysisById
);

/**
 * @route   POST /api/plant/analysis/:id/request-review
 * @desc    Request expert review for low-confidence prediction
 * @access  Private
 */
router.post(
  '/analysis/:id/request-review',
  protect,
  plantAnalysisController.requestExpertReview
);

/**
 * @route   POST /api/plant/analysis/:id/feedback
 * @desc    Add user feedback to analysis
 * @access  Private
 * @body    { helpful: Boolean, rating: Number, comment: String }
 */
router.post(
  '/analysis/:id/feedback',
  protect,
  plantAnalysisController.addFeedback
);

/**
 * @route   GET /api/plant/stats
 * @desc    Get disease statistics for user
 * @access  Private
 */
router.get(
  '/stats',
  protect,
  plantAnalysisController.getDiseaseStats
);

/**
 * @route   GET /api/plant/service-health
 * @desc    Check Flask ML service health
 * @access  Private
 */
router.get(
  '/service-health',
  protect,
  plantAnalysisController.checkFlaskHealth
);

module.exports = router;
