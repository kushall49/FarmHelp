const express = require('express');
const AIService = require('../services/ai');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });
    const reply = await AIService.chat(message);
    res.json({ reply });
  } catch (err) {
    console.error('[CHATBOT ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
