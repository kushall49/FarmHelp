const mongoose = require('mongoose');

const jobRequestSchema = new mongoose.Schema({
  // Farmer information (who needs the service)
  farmer: {
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
    }
  },
  
  // Service needed
  serviceNeeded: {
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
  
  // Hyper-local location
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
  
  // When service is needed
  dateNeeded: {
    type: Date,
    required: true
  },
  
  // Budget (optional)
  budget: {
    min: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      min: 0
    }
  },
  
  // Contact
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  
  // Status
  isOpen: {
    type: Boolean,
    default: true
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  
  responsesReceived: {
    type: Number,
    default: 0
  }
  
}, {
  timestamps: true
});

// Indexes for hyper-local filtering
jobRequestSchema.index({ 'location.district': 1, serviceNeeded: 1 });
jobRequestSchema.index({ 'location.district': 1, 'location.taluk': 1 });
jobRequestSchema.index({ 'farmer.userId': 1 });
jobRequestSchema.index({ isOpen: 1, 'location.district': 1 });
jobRequestSchema.index({ dateNeeded: 1 });
jobRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('JobRequest', jobRequestSchema);
