import mongoose, { Schema } from 'mongoose';

const CropSchema = new Schema({
  name: { type: String, required: true },
  suitableSoils: { type: [String], default: [] }, // loam, clay, sandy, red, black, alluvial
  seasons: { type: [String], default: [] }, // summer, winter, monsoon, spring
  minTemp: { type: Number }, // Minimum temperature in Celsius
  maxTemp: { type: Number }, // Maximum temperature in Celsius
  minRainfall: { type: Number }, // Minimum rainfall in mm
  maxRainfall: { type: Number }, // Maximum rainfall in mm
  waterRequirement: { type: String }, // Low, Medium, High
  yieldPotential: { type: String }, // e.g., "20-30 quintals/acre"
  marketDemand: { type: String }, // High, Medium, Low
  soilScore: { type: Number, default: 5 }, // Weight for soil matching (1-10)
  seasonScore: { type: Number, default: 5 }, // Weight for season matching (1-10)
  tempScore: { type: Number, default: 5 }, // Weight for temperature matching (1-10)
  rainfallScore: { type: Number, default: 5 }, // Weight for rainfall matching (1-10)
  marketScore: { type: Number, default: 5 }, // Weight for market demand (1-10)
}, {
  timestamps: true
});

export default mongoose.model('Crop', CropSchema);
