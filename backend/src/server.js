const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const plantRoutes = require('./routes/plant');
const machinesRoutes = require('./routes/machines');
// Temporarily comment out to test
// const chatbotRoutes = require('./routes/chatbot');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to database
connectDB();

// Health check
app.get('/', (req, res) => {
  res.json({ ok: true });
});

// Routes
app.use('/api/plant', plantRoutes);
app.use('/api/machines', machinesRoutes);
// app.use('/api/chatbot', chatbotRoutes);

// Temporary inline chatbot route for testing
app.post('/api/chatbot', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });
    
    // Import AI service inline
    const AIService = require('./services/ai');
    const reply = await AIService.chat(message);
    res.json({ reply });
  } catch (err) {
    console.error('[CHATBOT ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ success: false, error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[SERVER] Running on http://localhost:${PORT}`);
});
