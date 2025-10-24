import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Crop from '../src/models/Crop';

dotenv.config();

const crops = [
  { name: 'Maize', soilTypes: ['loam', 'sandy'], seasons: ['summer'], minTemp: 18, maxTemp: 32 },
  { name: 'Wheat', soilTypes: ['clay', 'loam'], seasons: ['winter'], minTemp: 5, maxTemp: 25 },
  { name: 'Rice', soilTypes: ['clay'], seasons: ['monsoon'], minTemp: 20, maxTemp: 35 }
];

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI required');
  await mongoose.connect(process.env.MONGODB_URI);
  await Crop.deleteMany({});
  await Crop.insertMany(crops);
  console.log('Seeded crops');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
