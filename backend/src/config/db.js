const mongoose = require('mongoose');

async function connect() {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI || MONGO_URI === 'REPLACE_ME') {
      console.warn('[DB] MONGO_URI not configured. Set it in .env');
      return;
    }
    await mongoose.connect(MONGO_URI);
    console.log('[DB] MongoDB connected');
  } catch (error) {
    console.error('[DB] Connection error:', error.message);
    process.exit(1);
  }
}

module.exports = connect;
