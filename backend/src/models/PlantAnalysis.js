const mongoose = require('mongoose');

/**
 * PlantAnalysis Schema
 * Stores plant disease analysis results from ML service
 */
const plantAnalysisSchema = new mongoose.Schema({
  // User who requested the analysis (flexible: ObjectId or string)
  user: {
    type: mongoose.Schema.Types.Mixed, // Flexible type - accepts ObjectId or string
    ref: 'User',
    required: false, // Allow anonymous users
    index: true,
    validate: {
      validator: function(v) {
        // Accept valid ObjectId, string, null, or undefined
        return v === null || v === undefined || mongoose.isValidObjectId(v) || typeof v === 'string';
      },
      message: props => `${props.value} is not a valid user identifier!`
    },
    default: 'anonymous'
  },

  // Original image details
  originalImage: {
    url: {
      type: String,
      required: true
    },
    publicId: String, // Cloudinary public_id if using Cloudinary
    size: Number,
    mimeType: String
  },

  // GradCAM visualization image (optional)
  gradcamImage: {
    url: String,
    base64: String // Store base64 if not uploading to Cloudinary
  },

  // Prediction results
  prediction: {
    crop: {
      type: String,
      required: true,
      index: true
    },
    disease: {
      id: String,
      name: {
        type: String,
        required: true,
        index: true
      },
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe', 'healthy'],
        default: 'moderate'
      }
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
      index: true, // For filtering low-confidence predictions
      set: function(val) {
        // Clamp between 0 and 1, handle negative values from model
        const n = Number(val) || 0;
        return Math.max(0, Math.min(1, Math.abs(n)));
      }
    },
    confidencePercentage: {
      type: Number,
      min: 0,
      max: 100,
      set: function(val) {
        // Clamp between 0 and 100, handle negative values
        const n = Number(val) || 0;
        return Math.max(0, Math.min(100, Math.abs(n)));
      }
    },
    // Top 5 predictions from model
    topPredictions: [{
      disease: String,
      confidence: Number,
      rank: Number
    }]
  },

  // Treatment recommendations
  recommendations: {
    summary: String,
    symptoms: [String],
    treatments: {
      chemical: [String],
      organic: [String],
      preventive: [String]
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  },

  // Fertilizer recommendations
  fertilizers: {
    recommended: [{
      id: String,
      name: String,
      dosage: String,
      notes: String,
      legalStatus: {
        type: String,
        enum: ['OK', 'RESTRICTED', 'UNKNOWN'],
        default: 'OK'
      },
      safetyWarning: String,
      applicationMethod: String
    }],
    disclaimer: String,
    additionalAdvice: [String]
  },

  // Processing metadata
  metadata: {
    processingTimeMs: Number,
    modelVersion: String,
    flaskServiceUrl: String,
    retryCount: {
      type: Number,
      default: 0
    },
    failedAttempts: [{
      timestamp: Date,
      error: String
    }]
  },

  // Analysis status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'review_needed'],
    default: 'pending',
    index: true
  },

  // For low-confidence predictions
  expertReview: {
    requested: {
      type: Boolean,
      default: false
    },
    requestedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    expertNotes: String,
    correctedDisease: String
  },

  // User feedback
  feedback: {
    helpful: Boolean,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  }

}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for common queries
plantAnalysisSchema.index({ user: 1, createdAt: -1 });
plantAnalysisSchema.index({ 'prediction.disease.name': 1 });
plantAnalysisSchema.index({ 'prediction.confidence': 1 });
plantAnalysisSchema.index({ status: 1, createdAt: -1 });
plantAnalysisSchema.index({ 'expertReview.requested': 1, 'expertReview.reviewedAt': 1 });

// Virtual for confidence percentage
plantAnalysisSchema.virtual('confidencePercent').get(function() {
  return Math.round(this.prediction.confidence * 100);
});

// Virtual for checking if confidence is low
plantAnalysisSchema.virtual('isLowConfidence').get(function() {
  return this.prediction.confidence < 0.6;
});

// Virtual for checking if expert review is needed
plantAnalysisSchema.virtual('needsExpertReview').get(function() {
  return this.prediction.confidence < 0.6 && !this.expertReview.requested;
});

// Pre-save middleware to calculate confidence percentage
plantAnalysisSchema.pre('save', function(next) {
  if (this.prediction && this.prediction.confidence !== undefined) {
    this.prediction.confidencePercentage = Math.round(this.prediction.confidence * 100);
    
    // Auto-set status based on confidence
    if (this.prediction.confidence < 0.6 && this.status === 'pending') {
      this.status = 'review_needed';
    } else if (this.status === 'pending') {
      this.status = 'completed';
    }
  }
  next();
});

// Instance method to request expert review
plantAnalysisSchema.methods.requestExpertReview = function() {
  this.expertReview.requested = true;
  this.expertReview.requestedAt = new Date();
  this.status = 'review_needed';
  return this.save();
};

// Instance method to add feedback
plantAnalysisSchema.methods.addFeedback = function(helpful, rating, comment) {
  this.feedback = {
    helpful,
    rating,
    comment,
    submittedAt: new Date()
  };
  return this.save();
};

// Static method to get user analysis history
plantAnalysisSchema.statics.getUserHistory = function(userId, limit = 10) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-gradcamImage.base64'); // Exclude large base64 data
};

// Static method to get analyses needing review
plantAnalysisSchema.statics.getNeedingReview = function() {
  return this.find({
    status: 'review_needed',
    'expertReview.requested': true,
    'expertReview.reviewedAt': { $exists: false }
  }).sort({ createdAt: -1 });
};

// Static method to get disease statistics
plantAnalysisSchema.statics.getDiseaseStats = async function(userId = null) {
  const match = userId ? { user: mongoose.Types.ObjectId(userId) } : {};
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$prediction.disease.name',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$prediction.confidence' },
        crops: { $addToSet: '$prediction.crop' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
};

const PlantAnalysis = mongoose.model('PlantAnalysis', plantAnalysisSchema);

module.exports = PlantAnalysis;
