const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  name: { type: String, required: true },
  suitableSoils: { type: [String], default: [] },
  seasons: { type: [String], default: [] },
  minTemp: { type: Number },
  maxTemp: { type: Number },
  minRainfall: { type: Number },
  maxRainfall: { type: Number },
  waterRequirement: { type: String },
  yieldPotential: { type: String },
  marketDemand: { type: String },
  soilScore: { type: Number, default: 5 },
  seasonScore: { type: Number, default: 5 },
  tempScore: { type: Number, default: 5 },
  rainfallScore: { type: Number, default: 5 },
  marketScore: { type: Number, default: 5 },
}, {
  timestamps: true
});

module.exports = mongoose.model('Crop', CropSchema);
