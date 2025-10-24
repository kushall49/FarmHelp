const mongoose = require('mongoose');

const serviceListingSchema = new mongoose.Schema({
  // Provider information (embedded for faster queries)
  provider: {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    avatar: { 
      type: String 
    },
    isVerified: { 
      type: Boolean, 
      default: false 
    },
    rating: { 
      type: Number, 
      default: 0 
    }
  },
  
  // Service details
  serviceType: {
    type: String,
    required: true,
    enum: [
      'Tractor',
      'Harvester',
      'Ploughing',
      'Seeding',
      'Irrigation Setup',
      'Pesticide Spraying',
      'Farm Labor',
      'Transport',
      'Equipment Rental',
      'Other'
    ]
  },
  
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // Hyper-local location (most critical for farmers)
  location: {
    district: {
      type: String,
      required: true,
      trim: true
    },
    taluk: {
      type: String,
      required: true,
      trim: true
    },
    village: {
      type: String,
      trim: true
    }
  },
  
  // Contact
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  
  // Pricing
  rate: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      enum: ['per hour', 'per day', 'per acre', 'fixed'],
      default: 'per day'
    }
  },
  
  // Images (Cloudinary URLs)
  images: [{
    type: String
  }],
  
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  
  callsReceived: {
    type: Number,
    default: 0
  }
  
}, {
  timestamps: true
});

// Indexes for hyper-local filtering (CRITICAL)
serviceListingSchema.index({ 'location.district': 1, serviceType: 1 });
serviceListingSchema.index({ 'location.district': 1, 'location.taluk': 1 });
serviceListingSchema.index({ 'provider.userId': 1 });
serviceListingSchema.index({ isAvailable: 1, 'location.district': 1 });
serviceListingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ServiceListing', serviceListingSchema);
