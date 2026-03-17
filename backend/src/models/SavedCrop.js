const mongoose = require('mongoose');

const savedCropSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  score: Number,
  seasons: [String],
  suitableSoils: [String],
  yieldPotential: String,
  marketDemand: String,
  savedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SavedCrop', savedCropSchema);
