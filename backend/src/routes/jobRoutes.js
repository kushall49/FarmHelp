const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const jobRequestController = require('../controllers/jobRequestController');

// All routes require authentication
router.use(authMiddleware);

// Create new job request
router.post('/', jobRequestController.createJobRequest);

// Get all job requests (with filters)
router.get('/', jobRequestController.getJobRequests);

// Get single job request
router.get('/:id', jobRequestController.getJobRequestById);

// Update job request
router.put('/:id', jobRequestController.updateJobRequest);

// Delete job request
router.delete('/:id', jobRequestController.deleteJobRequest);

// Track response received
router.post('/:id/track-response', jobRequestController.trackResponse);

module.exports = router;
