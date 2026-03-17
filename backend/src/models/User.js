const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  // Email-based auth fields
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  displayName: {
    type: String,
    trim: true
  },
  
  // Profile fields
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  farmSize: {
    type: String,
    default: ''
  },
  expertise: {
    type: [String],
    default: []
  },
  
  // Services Marketplace fields
  isVerifiedFarmer: { 
    type: Boolean, 
    default: false 
  },
  isVerifiedProvider: { 
    type: Boolean, 
    default: false 
  },
  
  // Rating system for service providers
  ratings: [{
    byUser: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    byUserName: { 
      type: String, 
      required: true 
    },
    byUserAvatar: { 
      type: String 
    },
    rating: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 5 
    },
    comment: { 
      type: String, 
      trim: true, 
      maxlength: 500 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  averageRating: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 5 
  },
  
  // Phone-based auth fields (for backward compatibility)
  phone: { type: String, unique: true, sparse: true },
  name: { type: String },
  passwordHash: { type: String },
  
  // Common fields
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

// Indexes for faster lookups
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ username: 1 });
userSchema.index({ isVerifiedProvider: 1 });
userSchema.index({ averageRating: -1 });

// Instance method to recalculate average rating
userSchema.methods.recalculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    return;
  }
  
  const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10; // Round to 1 decimal
};

// Static helper for creating test user and JWT
userSchema.statics.createTestUser = async function() {
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  // Create or find test user (for development/testing only)
  let user = await this.findOne({ phone: '9999999999' });
  if (!user) {
    // Use bcrypt to hash a test password from environment variable
    const bcrypt = require('bcrypt');
    const testPassword = process.env.DEV_TEST_PASSWORD;
    if (!testPassword) {
      throw new Error('DEV_TEST_PASSWORD environment variable is required');
    }
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    user = await this.create({
      phone: '9999999999',
      name: 'Test Farmer',
      passwordHash: hashedPassword
    });
    console.log('[Auth] Created test user with secure password');
  }

  // Generate JWT
  const token = jwt.sign(
    { id: user._id, phone: user.phone, name: user.name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  return { user, token };
};

module.exports = mongoose.model('User', userSchema);
