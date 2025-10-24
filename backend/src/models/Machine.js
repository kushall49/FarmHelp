const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // e.g., 'tractor', 'harvester'
  ratePerHour: { type: Number, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Geospatial index for location queries
machineSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Machine', machineSchema);
