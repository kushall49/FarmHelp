const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// 1. Get Job History for a User (Farmer or Provider)
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const jobs = await prisma.jobRequest.findMany({
      where: {
        OR: [
          { farmerId: userId },
          { providerId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Get Price Estimate (Mock logic for Rapido-style surge/pricing)
router.post('/estimate', async (req, res) => {
  try {
    const { category, distanceKm } = req.body;
    let baseRate = 0;
    
    switch(category) {
      case 'TRACTOR': baseRate = 500; break; // ₹500/hr or per km
      case 'HARVESTER': baseRate = 1200; break;
      case 'LABOR': baseRate = 300; break;
      default: baseRate = 100;
    }

    const estimatedPrice = baseRate + (distanceKm * 50); // Just a mock formula
    res.json({ success: true, baseRate, estimatedPrice });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Cancel Job (If nobody accepted or farmer changes mind)
router.put('/cancel/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const currentJob = await prisma.jobRequest.findUnique({ where: { id: jobId }});
    
    if (currentJob.status !== 'SEARCHING' && currentJob.status !== 'ACCEPTED') {
      return res.status(400).json({ success: false, message: "Cannot cancel a job in progress." });
    }

    const cancelledJob = await prisma.jobRequest.update({
      where: { id: jobId },
      data: { status: 'CANCELLED' }
    });

    res.json({ success: true, job: cancelledJob });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;