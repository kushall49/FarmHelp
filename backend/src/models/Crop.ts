import mongoose, { Schema } from 'mongoose';

const CropSchema = new Schema({
  name: { type: String, required: true },
  soilTypes: { type: [String], default: [] },
  seasons: { type: [String], default: [] },
  minTemp: { type: Number },
  maxTemp: { type: Number }
});

export default mongoose.model('Crop', CropSchema);
