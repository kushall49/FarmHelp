const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const serviceController = require('../controllers/serviceController');

// All routes require authentication
router.use(authMiddleware);

// Create new service listing
router.post('/', serviceController.createServiceListing);

// Get all service listings (with filters)
router.get('/', serviceController.getServiceListings);

// Get single service listing
router.get('/:id', serviceController.getServiceListingById);

// Update service listing
router.put('/:id', serviceController.updateServiceListing);

// Delete service listing
router.delete('/:id', serviceController.deleteServiceListing);

// Track call received
router.post('/:id/track-call', serviceController.trackCall);

module.exports = router;
