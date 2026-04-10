const express = require('express');
const router = express.Router();
const Operator = require('../models/Operator');
const ServiceRequest = require('../models/ServiceRequest');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// POST /api/services/operator/register
router.post('/operator/register', async (req, res) => {
  try {
    const { name, phone, equipmentType } = req.body;
    const userId = req.user._id || req.user.id;

    let operator = await Operator.findOne({ userId });
    
    if (operator) {
      operator.name = name;
      operator.phone = phone;
      operator.equipmentType = equipmentType;
      await operator.save();
    } else {
      operator = await Operator.create({
        userId,
        name,
        phone,
        equipmentType
      });
    }

    res.status(200).json({ success: true, operator });
  } catch (error) {
    console.error('Error registering operator:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// GET /api/services/operator/profile
router.get('/operator/profile', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const operator = await Operator.findOne({ userId });
    if (!operator) {
      return res.status(404).json({ success: false, message: 'Operator profile not found' });
    }
    res.status(200).json({ success: true, operator });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// POST /api/services/operator/toggle-online
router.post('/operator/toggle-online', async (req, res) => {
  try {
    const { isOnline, coordinates } = req.body;
    const userId = req.user._id || req.user.id;

    const operator = await Operator.findOne({ userId });
    if (!operator) {
      return res.status(404).json({ success: false, message: 'Operator not found' });
    }

    operator.isOnline = isOnline;
    if (coordinates && coordinates.length === 2) {
      operator.location = {
        type: 'Point',
        coordinates: coordinates
      };
    }
    
    await operator.save();

    res.status(200).json({ success: true, isOnline: operator.isOnline, location: operator.location });
  } catch (error) {
    console.error('Error toggling online status:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// GET /api/services/history
router.get('/history', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const operator = await Operator.findOne({ userId });
    
    const query = operator 
      ? { $or: [{ farmerId: userId }, { operatorId: operator._id }] }
      : { farmerId: userId };

    const history = await ServiceRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('operatorId')
      .populate('farmerId'); 

    res.status(200).json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// GET /api/services/active
router.get('/active', async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const operator = await Operator.findOne({ userId });

    const query = operator 
      ? { 
          $or: [{ farmerId: userId }, { operatorId: operator._id }], 
          status: { $in: ['SEARCHING', 'ACCEPTED', 'OTP_VERIFIED', 'IN_PROGRESS'] } 
        }
      : { 
          farmerId: userId, 
          status: { $in: ['SEARCHING', 'ACCEPTED', 'OTP_VERIFIED', 'IN_PROGRESS'] } 
        };

    const activeRequest = await ServiceRequest.findOne(query)
      .sort({ createdAt: -1 })
      .populate('operatorId');

    res.status(200).json({ success: true, request: activeRequest });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// POST /api/services/rate/:requestId
router.post('/rate/:requestId', async (req, res) => {
  try {
    const { rating } = req.body;
    const { requestId } = req.params;
    const userId = req.user._id || req.user.id;

    const request = await ServiceRequest.findById(requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.farmerId.toString() !== userId.toString()) return res.status(403).json({ success: false, message: 'Permission denied' });

    request.rating = rating;
    await request.save();

    if (request.operatorId) {
      const operator = await Operator.findById(request.operatorId);
      if (operator) {
        const currentTotal = operator.totalJobs || 0;
        const currentRating = operator.rating || 0;
        
        const totalRating = (currentRating * currentTotal) + rating;
        operator.totalJobs = currentTotal + 1;
        operator.rating = totalRating / operator.totalJobs;
        await operator.save();
      }
    }

    res.status(200).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
