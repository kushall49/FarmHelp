const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const ratingController = require('../controllers/ratingController');

// All routes require authentication
router.use(authMiddleware);

// Rate a service provider
router.post('/rate/:providerId', ratingController.rateProvider);

// Get ratings for a provider
router.get('/ratings/:providerId', ratingController.getProviderRatings);

module.exports = router;
