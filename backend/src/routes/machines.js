const express = require('express');
const authMiddleware = require('../middleware/auth');
const Machine = require('../models/Machine');

const router = express.Router();

// POST /api/machines/list - List a machine for rental
router.post('/list', authMiddleware, async (req, res) => {
  try {
    const { type, ratePerHour, longitude, latitude } = req.body;

    if (!type || !ratePerHour || longitude === undefined || latitude === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: type, ratePerHour, longitude, latitude' 
      });
    }

    const machine = await Machine.create({
      ownerId: req.user.id,
      type,
      ratePerHour,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      available: true
    });

    console.log('[MACHINES] Machine listed:', machine._id);
    res.json({ success: true, machine });
  } catch (error) {
    console.error('[MACHINES] Error listing machine:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/machines/nearby - Find nearby machines
router.get('/nearby', async (req, res) => {
  try {
    const { lng, lat, radius = 5000 } = req.query; // radius in meters, default 5km

    if (!lng || !lat) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required query params: lng, lat' 
      });
    }

    const machines = await Machine.find({
      available: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    }).populate('ownerId', 'name phone');

    console.log('[MACHINES] Found nearby machines:', machines.length);
    res.json({ success: true, machines });
  } catch (error) {
    console.error('[MACHINES] Error finding nearby machines:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/machines/book - Book a machine
router.post('/book', authMiddleware, async (req, res) => {
  try {
    const { machineId, hours } = req.body;

    if (!machineId || !hours) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: machineId, hours' 
      });
    }

    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ success: false, error: 'Machine not found' });
    }

    if (!machine.available) {
      return res.status(400).json({ success: false, error: 'Machine not available' });
    }

    // Simple booking stub - in production, integrate payment gateway
    const totalCost = machine.ratePerHour * hours;

    console.log('[MACHINES] Booking created for machine:', machineId);
    res.json({ 
      success: true, 
      booking: {
        machineId: machine._id,
        type: machine.type,
        hours,
        totalCost,
        message: 'Booking stub - integrate payment gateway for production'
      }
    });
  } catch (error) {
    console.error('[MACHINES] Error booking machine:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
