const mongoose = require('mongoose');

const operatorSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  equipmentType: { 
    type: String, 
    required: true // "Tractor", "Harvester", "Ploughing", etc.
  },
  isOnline: { 
    type: Boolean, 
    default: false 
  },
  location: {
    type: { 
      type: String, 
      enum: ['Point'], 
      default: 'Point' 
    },
    coordinates: { 
      type: [Number], 
      default: [0, 0] 
    } // [longitude, latitude]
  },
  rating: { 
    type: Number, 
    default: 0 
  },
  totalJobs: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

// Create 2dsphere index for $near geo-queries
operatorSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Operator', operatorSchema);