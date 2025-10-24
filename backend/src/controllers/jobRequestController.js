const JobRequest = require('../models/JobRequest');
const User = require('../models/User');

// Create a new job request
exports.createJobRequest = async (req, res) => {
  try {
    console.log('[JOBS] Creating job request...');
    console.log('[JOBS] User ID:', req.user?.id);
    console.log('[JOBS] Request body:', JSON.stringify(req.body, null, 2));
    
    const userId = req.user.id;
    
    const {
      serviceNeeded,
      title,
      description,
      district,
      taluk,
      village,
      dateNeeded,
      budgetMin,
      budgetMax,
      phoneNumber
    } = req.body;
    
    // Validate required fields
    if (!serviceNeeded || !title || !description || !district || !taluk || !dateNeeded || !phoneNumber) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields',
        required: ['serviceNeeded', 'title', 'description', 'district', 'taluk', 'dateNeeded', 'phoneNumber']
      });
    }
    
    // Get farmer details from User model
    const user = await User.findById(userId);
    if (!user) {
      console.error('[JOBS] User not found:', userId);
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    console.log('[JOBS] Found user:', user.username);
    
    // Create job request
    const jobRequest = new JobRequest({
      farmer: {
        userId: user._id,
        name: user.displayName || user.username || user.name,
        avatar: user.avatar,
        isVerified: user.isVerifiedFarmer || false
      },
      serviceNeeded,
      title,
      description,
      location: {
        district,
        taluk,
        village: village || ''
      },
      dateNeeded: new Date(dateNeeded),
      budget: {
        min: budgetMin || 0,
        max: budgetMax || 0
      },
      phoneNumber
    });
    
    await jobRequest.save();
    
    console.log('[JOBS] Job request created:', jobRequest._id);
    
    res.status(201).json({
      success: true,
      data: jobRequest,
      message: 'Job request created successfully'
    });
    
  } catch (error) {
    console.error('[JOBS] Create job request error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create job request',
      details: error.message 
    });
  }
};

// Get job requests with hyper-local filtering
exports.getJobRequests = async (req, res) => {
  try {
    console.log('[JOBS] Fetching job requests...');
    console.log('[JOBS] Query params:', req.query);
    console.log('[JOBS] User ID:', req.user?.id);
    
    const { 
      district, 
      taluk, 
      serviceNeeded, 
      isOpen,
      page = 1, 
      limit = 20 
    } = req.query;
    
    // Build filter query
    const filter = {};
    
    // District-based filtering
    if (district && district !== 'All Districts') {
      filter['location.district'] = new RegExp(district, 'i');
    }
    
    if (taluk) {
      filter['location.taluk'] = new RegExp(taluk, 'i');
    }
    
    if (serviceNeeded && serviceNeeded !== 'All') {
      filter.serviceNeeded = serviceNeeded;
    }
    
    if (isOpen !== undefined) {
      filter.isOpen = isOpen === 'true' || isOpen === true;
    }
    
    console.log('[JOBS] Filter:', JSON.stringify(filter, null, 2));
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [jobs, total] = await Promise.all([
      JobRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      JobRequest.countDocuments(filter)
    ]);
    
    console.log('[JOBS] Found job requests:', jobs.length);
    console.log('[JOBS] Total count:', total);
    
    res.json({
      success: true,
      data: jobs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('[JOBS] Get job requests error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch job requests',
      details: error.message 
    });
  }
};

// Get single job request by ID
exports.getJobRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await JobRequest.findById(id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job request not found' });
    }
    
    // Increment view count
    job.views += 1;
    await job.save();
    
    res.json({
      success: true,
      data: job
    });
    
  } catch (error) {
    console.error('Get job request error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch job request',
      details: error.message 
    });
  }
};

// Update job request
exports.updateJobRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const job = await JobRequest.findById(id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job request not found' });
    }
    
    // Check ownership
    if (job.farmer.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this job request' });
    }
    
    // Update fields
    const {
      serviceNeeded,
      title,
      description,
      district,
      taluk,
      village,
      dateNeeded,
      budgetMin,
      budgetMax,
      phoneNumber,
      isOpen
    } = req.body;
    
    if (serviceNeeded) job.serviceNeeded = serviceNeeded;
    if (title) job.title = title;
    if (description) job.description = description;
    if (district) job.location.district = district;
    if (taluk) job.location.taluk = taluk;
    if (village !== undefined) job.location.village = village;
    if (dateNeeded) job.dateNeeded = new Date(dateNeeded);
    if (budgetMin !== undefined) job.budget.min = budgetMin;
    if (budgetMax !== undefined) job.budget.max = budgetMax;
    if (phoneNumber) job.phoneNumber = phoneNumber;
    if (isOpen !== undefined) job.isOpen = isOpen;
    
    await job.save();
    
    res.json({
      success: true,
      data: job
    });
    
  } catch (error) {
    console.error('Update job request error:', error);
    res.status(500).json({ 
      error: 'Failed to update job request',
      details: error.message 
    });
  }
};

// Delete job request
exports.deleteJobRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const job = await JobRequest.findById(id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job request not found' });
    }
    
    // Check ownership
    if (job.farmer.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this job request' });
    }
    
    await JobRequest.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Job request deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete job request error:', error);
    res.status(500).json({ 
      error: 'Failed to delete job request',
      details: error.message 
    });
  }
};

// Track response received
exports.trackResponse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await JobRequest.findById(id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job request not found' });
    }
    
    job.responsesReceived += 1;
    await job.save();
    
    res.json({
      success: true,
      message: 'Response tracked'
    });
    
  } catch (error) {
    console.error('Track response error:', error);
    res.status(500).json({ 
      error: 'Failed to track response',
      details: error.message 
    });
  }
};
