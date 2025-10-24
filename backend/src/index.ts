import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';

import authRoutes from './routes/auth';
import plantRoutes from './routes/plant';
import cropRoutes from './routes/crop';
import chatbotRoutes from './routes/chatbot';
const plantAnalysisRoutes = require('./routes/plantAnalysis');
const retrainingRoutes = require('./routes/retraining');
const { scheduleAutoRetraining } = require('./controllers/retrainingController');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not set');
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB');

    app.use('/api/auth', authRoutes);
    app.use('/api/plant', plantRoutes);
    app.use('/api/plant', plantAnalysisRoutes); // ML service routes
    app.use('/api/retrain', retrainingRoutes); // Retraining routes
    app.use('/api/crops', cropRoutes);
    app.use('/api/chatbot', chatbotRoutes);

    // Initialize auto-retraining scheduler
    scheduleAutoRetraining();

    app.get('/', (_req, res) => res.json({ ok: true, service: 'FarmMate Backend' }));

    app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    throw error;
  }
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});
