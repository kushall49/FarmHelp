import mongoose, { Schema } from 'mongoose';

const PlantAnalysisSchema = new Schema({
  userId: { type: String, required: true },
  imageUrl: { type: String, required: true },
  result: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('PlantAnalysis', PlantAnalysisSchema);
