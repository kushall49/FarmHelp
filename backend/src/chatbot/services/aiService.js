const axios = require('axios');

/**
 * AI Service using HuggingFace Inference API
 * Provides natural language responses for smalltalk and fallback scenarios
 */
class AIService {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY || '';
    this.model = 'microsoft/DialoGPT-medium'; // Good for conversation
    this.fallbackModel = 'google/flan-t5-small'; // Lightweight fallback
    this.timeout = 15000; // 15 seconds
  }

  /**
   * Generate smalltalk response for casual conversations
   */
  async generateSmallTalkResponse(message, context = []) {
    console.log('[AI-SMALLTALK] Generating response for:', message);
    
    try {
      // Build conversation context (last 3 exchanges)
      const conversationHistory = context.slice(-6).join('\n');
      const prompt = conversationHistory ? `${conversationHistory}\nUser: ${message}\nBot:` : message;

      if (!this.apiKey) {
        console.log('[AI-SMALLTALK] No API key, using predefined responses');
        return this._getPredefinedSmallTalk(message);
      }

      const response = await this._callHuggingFace(this.model, prompt, {
        max_length: 100,
        temperature: 0.8,
        do_sample: true,
        top_p: 0.92
      });

      return response || this._getPredefinedSmallTalk(message);
    } catch (error) {
      console.error('[AI-SMALLTALK] Error:', error.message);
      return this._getPredefinedSmallTalk(message);
    }
  }

  /**
   * Generate AI response for general farming queries (fallback)
   */
  async generateAIResponse(message, context = []) {
    console.log('[AI-FALLBACK] Generating response for:', message);
    
    try {
      if (!this.apiKey) {
        return this._getGenericFarmingResponse();
      }

      const prompt = `Answer this farming question concisely: ${message}`;
      
      const response = await this._callHuggingFace(this.fallbackModel, prompt, {
        max_length: 200,
        temperature: 0.7
      });

      return response || this._getGenericFarmingResponse();
    } catch (error) {
      console.error('[AI-FALLBACK] Error:', error.message);
      return this._getGenericFarmingResponse();
    }
  }

  /**
   * Call HuggingFace Inference API
   */
  async _callHuggingFace(model, input, parameters = {}) {
    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          inputs: input,
          parameters: parameters
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: this.timeout
        }
      );

      // Parse response based on model type
      if (Array.isArray(response.data)) {
        return response.data[0]?.generated_text?.trim() || '';
      } else if (response.data.generated_text) {
        return response.data.generated_text.trim();
      } else if (response.data[0]?.generated_text) {
        return response.data[0].generated_text.trim();
      }

      return '';
    } catch (error) {
      if (error.response?.status === 503) {
        console.warn('[AI] Model is loading, will retry...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        throw error;
      }
      throw error;
    }
  }

  /**
   * Predefined smalltalk responses (no API needed)
   */
  _getPredefinedSmallTalk(message) {
    const msg = message.toLowerCase();
    
    const responses = {
      hello: ['Hello! How can I help you today?', 'Hi there! What can I do for you?', 'Hey! How are you doing?'],
      hi: ['Hi! How can I assist you?', 'Hello! What do you need help with?', 'Hey there! 👋'],
      'how are you': ['I\'m doing great, thank you! How can I help you?', 'I\'m fine! Ready to assist you with farming questions.', 'I\'m good! What would you like to know?'],
      'who are you': ['I\'m FarmBot, your AI farming assistant. I can help with crop advice, weather, soil info, and more!', 'I\'m your intelligent farming companion, here to help with all agriculture-related questions!'],
      'what are you doing': ['I\'m here to help you with farming queries! Ask me anything about crops, weather, soil, or pests.', 'Just waiting to assist you with your farming questions!'],
      joke: ['Why did the scarecrow win an award? Because he was outstanding in his field! 🌾😄', 'What do you call a cow with no legs? Ground beef! 🐄😂', 'Why don\'t farmers tell secrets in cornfields? Too many ears! 🌽👂'],
      thanks: ['You\'re welcome! Happy to help! 😊', 'Anytime! Let me know if you need anything else.', 'Glad I could help! 🌾'],
      bye: ['Goodbye! Come back anytime you need farming advice! 👋', 'See you later! Good luck with your farming! 🌱', 'Bye! Take care of your crops! 🌾']
    };

    // Match keywords
    for (const [key, replies] of Object.entries(responses)) {
      if (msg.includes(key)) {
        return replies[Math.floor(Math.random() * replies.length)];
      }
    }

    return 'I\'m here to help! Ask me about crops, weather, soil, pests, or any farming topic! 🌾';
  }

  /**
   * Generic farming response (ultimate fallback)
   */
  _getGenericFarmingResponse() {
    return `I'm FarmBot, your AI farming assistant! I can help you with:
    
🌾 Crop recommendations
🌤️ Weather information
🌱 Soil analysis
💰 Crop prices
🐛 Disease detection
📰 Agriculture news
📍 Location services
🌍 Translation

What would you like to know?`;
  }
}

module.exports = new AIService();
