const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

router.post('/message', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'message required' });

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const systemPrompt = `You are FarmBot, an expert AI assistant for Indian farmers. You help with:
- Crop selection and cultivation advice
- Disease identification and treatment
- Weather-based farming recommendations
- Market prices and selling strategies
- Irrigation, fertilizer, and pest management
- Government schemes for farmers
Always give practical, actionable advice. Keep responses concise (2-3 paragraphs max). Use simple language. When relevant, mention specific Indian states/regions. Respond in English but use Hindi agricultural terms when helpful (e.g., Kharif, Rabi, Zaid).`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages,
      max_tokens: 512,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response. Please try again.';
    res.json({ success: true, reply });
  } catch (err) {
    console.error('[CHAT ERROR]', err.message);
    res.status(500).json({ success: false, error: 'Chat service unavailable', reply: "I'm having trouble connecting right now. Please try again in a moment." });
  }
});

module.exports = router;
