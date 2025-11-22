const ServiceListing = require('../models/ServiceListing');
const User = require('../models/User');

// Create a new service listing
exports.createServiceListing = async (req, res) => {
  try {
    console.log('[SERVICES] Creating service listing...');
    console.log('[SERVICES] req.user:', JSON.stringify(req.user, null, 2));
    console.log('[SERVICES] User ID:', req.user?.id);
    console.log('[SERVICES] Request body:', JSON.stringify(req.body, null, 2));
    
    const userId = req.user.id;
    
    if (!userId) {
      console.error('[SERVICES] No user ID in request!');
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required - no user ID found' 
      });
    }
    
    const {
      serviceType,
      title,
      description,
      district,
      taluk,
      village,
      phoneNumber,
      rateAmount,
      rateUnit,
      images
    } = req.body;
    
    // Validate required fields
    if (!serviceType || !title || !description || !district || !taluk || !phoneNumber || !rateAmount) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields',
        required: ['serviceType', 'title', 'description', 'district', 'taluk', 'phoneNumber', 'rateAmount']
      });
    }
    
    // Get provider details from User model
    const user = await User.findById(userId);
    if (!user) {
      console.error('[SERVICES] User not found:', userId);
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    console.log('[SERVICES] Found user:', user.username);
    
    // Create service listing
    const serviceListing = new ServiceListing({
      provider: {
        userId: user._id,
        name: user.displayName || user.username || user.name,
        avatar: user.avatar,
        isVerified: user.isVerifiedProvider || false,
        rating: user.averageRating || 0
      },
      serviceType,
      title,
      description,
      location: {
        district,
        taluk,
        village: village || ''
      },
      phoneNumber,
      rate: {
        amount: rateAmount,
        unit: rateUnit || 'per day'
      },
      images: images || []
    });
    
    await serviceListing.save();
    
    console.log('[SERVICES] Service listing created:', serviceListing._id);
    
    res.status(201).json({
      success: true,
      data: serviceListing,
      message: 'Service listing created successfully'
    });
    
  } catch (error) {
    console.error('[SERVICES] Create service listing error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create service listing',
      details: error.message 
    });
  }
};

// Get service listings with hyper-local filtering
exports.getServiceListings = async (req, res) => {
  try {
    console.log('[SERVICES] Fetching service listings...');
    console.log('[SERVICES] Query params:', req.query);
    console.log('[SERVICES] User ID:', req.user?.id);
    
    const { 
      district, 
      taluk, 
      serviceType, 
      isAvailable,
      page = 1, 
      limit = 20 
    } = req.query;
    
    // Utility to escape special regex characters to prevent ReDoS
    const escapeRegex = (str) => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };
    
    // Build filter query
    const filter = {};
    
    // CRITICAL: District-based filtering with sanitized input
    if (district && district !== 'All Districts') {
      filter['location.district'] = new RegExp(escapeRegex(district), 'i');
    }
    
    if (taluk) {
      filter['location.taluk'] = new RegExp(escapeRegex(taluk), 'i');
    }
    
    if (serviceType && serviceType !== 'All') {
      filter.serviceType = serviceType;
    }
    
    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === 'true' || isAvailable === true;
    }
    
    console.log('[SERVICES] Filter:', JSON.stringify(filter, null, 2));
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [listings, total] = await Promise.all([
      ServiceListing.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ServiceListing.countDocuments(filter)
    ]);
    
    console.log('[SERVICES] Found listings:', listings.length);
    console.log('[SERVICES] Total count:', total);
    
    res.json({
      success: true,
      data: listings,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('[SERVICES] Get service listings error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch service listings',
      details: error.message 
    });
  }
};

// Get single service listing by ID
exports.getServiceListingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const listing = await ServiceListing.findById(id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Service listing not found' });
    }
    
    // Increment view count
    listing.views += 1;
    await listing.save();
    
    res.json({
      success: true,
      data: listing
    });
    
  } catch (error) {
    console.error('Get service listing error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch service listing',
      details: error.message 
    });
  }
};

// Update service listing
exports.updateServiceListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const listing = await ServiceListing.findById(id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Service listing not found' });
    }
    
    // Check ownership
    if (listing.provider.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }
    
    // Update fields
    const {
      serviceType,
      title,
      description,
      district,
      taluk,
      village,
      phoneNumber,
      rateAmount,
      rateUnit,
      images,
      isAvailable
    } = req.body;
    
    if (serviceType) listing.serviceType = serviceType;
    if (title) listing.title = title;
    if (description) listing.description = description;
    if (district) listing.location.district = district;
    if (taluk) listing.location.taluk = taluk;
    if (village !== undefined) listing.location.village = village;
    if (phoneNumber) listing.phoneNumber = phoneNumber;
    if (rateAmount) listing.rate.amount = rateAmount;
    if (rateUnit) listing.rate.unit = rateUnit;
    if (images) listing.images = images;
    if (isAvailable !== undefined) listing.isAvailable = isAvailable;
    
    await listing.save();
    
    res.json({
      success: true,
      data: listing
    });
    
  } catch (error) {
    console.error('Update service listing error:', error);
    res.status(500).json({ 
      error: 'Failed to update service listing',
      details: error.message 
    });
  }
};

// Delete service listing
exports.deleteServiceListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const listing = await ServiceListing.findById(id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Service listing not found' });
    }
    
    // Check ownership
    if (listing.provider.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }
    
    await ServiceListing.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Service listing deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete service listing error:', error);
    res.status(500).json({ 
      error: 'Failed to delete service listing',
      details: error.message 
    });
  }
};

// Track call received
exports.trackCall = async (req, res) => {
  try {
    const { id } = req.params;
    
    const listing = await ServiceListing.findById(id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Service listing not found' });
    }
    
    listing.callsReceived += 1;
    await listing.save();
    
    res.json({
      success: true,
      message: 'Call tracked'
    });
    
  } catch (error) {
    console.error('Track call error:', error);
    res.status(500).json({ 
      error: 'Failed to track call',
      details: error.message 
    });
  }
};
