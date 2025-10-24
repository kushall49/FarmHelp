const User = require('../models/User');

// Rate a service provider
exports.rateProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;
    
    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Get provider
    const provider = await User.findById(providerId);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    // Check if provider is actually a verified provider
    if (!provider.isVerifiedProvider) {
      return res.status(400).json({ error: 'User is not a service provider' });
    }
    
    // Can't rate yourself
    if (userId === providerId) {
      return res.status(400).json({ error: 'Cannot rate yourself' });
    }
    
    // Get current user details
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user already rated this provider
    const existingRatingIndex = provider.ratings.findIndex(
      r => r.byUser.toString() === userId
    );
    
    if (existingRatingIndex !== -1) {
      // Update existing rating
      provider.ratings[existingRatingIndex].rating = rating;
      provider.ratings[existingRatingIndex].comment = comment || '';
      provider.ratings[existingRatingIndex].createdAt = Date.now();
    } else {
      // Add new rating
      provider.ratings.push({
        byUser: userId,
        byUserName: currentUser.displayName || currentUser.username || currentUser.name,
        byUserAvatar: currentUser.avatar,
        rating,
        comment: comment || '',
        createdAt: Date.now()
      });
    }
    
    // Recalculate average rating
    provider.recalculateAverageRating();
    
    await provider.save();
    
    res.json({
      success: true,
      data: {
        averageRating: provider.averageRating,
        totalRatings: provider.ratings.length
      },
      message: existingRatingIndex !== -1 ? 'Rating updated successfully' : 'Rating added successfully'
    });
    
  } catch (error) {
    console.error('Rate provider error:', error);
    res.status(500).json({ 
      error: 'Failed to rate provider',
      details: error.message 
    });
  }
};

// Get ratings for a provider
exports.getProviderRatings = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const provider = await User.findById(providerId);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    // Sort ratings by most recent
    const ratings = provider.ratings.sort((a, b) => b.createdAt - a.createdAt);
    
    // Pagination
    const skip = (page - 1) * limit;
    const paginatedRatings = ratings.slice(skip, skip + parseInt(limit));
    
    res.json({
      success: true,
      data: {
        ratings: paginatedRatings,
        averageRating: provider.averageRating,
        totalRatings: provider.ratings.length
      },
      pagination: {
        total: provider.ratings.length,
        page: parseInt(page),
        pages: Math.ceil(provider.ratings.length / limit)
      }
    });
    
  } catch (error) {
    console.error('Get provider ratings error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch provider ratings',
      details: error.message 
    });
  }
};
