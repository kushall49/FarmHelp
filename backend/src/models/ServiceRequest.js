const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  farmerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  operatorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Operator',
    default: null
  },
  equipmentType: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['SEARCHING', 'ACCEPTED', 'OTP_VERIFIED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'SEARCHING'
  },
  farmerLocation: {
    type: { 
      type: String, 
      enum: ['Point'], 
      default: 'Point' 
    },
    coordinates: { 
      type: [Number], 
      required: true 
    } // [longitude, latitude]
  },
  otp: { 
    type: String 
  },
  otpExpiry: { 
    type: Date 
  },
  startTime: { 
    type: Date 
  },
  endTime: { 
    type: Date 
  },
  rating: { 
    type: Number 
  }
}, { timestamps: true });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);