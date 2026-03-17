const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const SavedCrop = require('../models/SavedCrop');

// GET / - Get all saved crops for the current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const savedCrops = await SavedCrop.find({ user: userId }).sort({ savedAt: -1 });
    res.json({ success: true, data: savedCrops });
  } catch (err) {
    console.error('[SAVED CROPS GET ERROR]', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch saved crops' });
  }
});

// POST / - Save a crop for the current user
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { name, score, seasons, suitableSoils, yieldPotential, marketDemand } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Crop name is required' });
    }

    const savedCrop = await SavedCrop.create({
      user: userId,
      name,
      score,
      seasons,
      suitableSoils,
      yieldPotential,
      marketDemand
    });

    res.status(201).json({ success: true, data: savedCrop });
  } catch (err) {
    console.error('[SAVED CROPS POST ERROR]', err.message);
    res.status(500).json({ success: false, error: 'Failed to save crop' });
  }
});

// DELETE /:id - Remove a saved crop
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const crop = await SavedCrop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ success: false, error: 'Saved crop not found' });
    }

    if (crop.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this crop' });
    }

    await SavedCrop.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Crop removed from saved list' });
  } catch (err) {
    console.error('[SAVED CROPS DELETE ERROR]', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete saved crop' });
  }
});

module.exports = router;
