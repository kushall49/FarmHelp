const intentRouter = require('../core/intentRouter');
const smallTalk = require('../core/smallTalk');
const knowledgeBase = require('../core/knowledgeBase');
const aiService = require('../services/aiService');
const groqService = require('../services/groqService'); // 🚀 NEW: GROQ AI Service
const weatherService = require('../services/weatherService');
const soilService = require('../services/soilService');
const priceService = require('../services/priceService');
const diseaseService = require('../services/diseaseService');
const newsService = require('../services/newsService');
const mapService = require('../services/mapService');
const translateService = require('../services/translateService');

/**
 * Chatbot Controller - Main orchestrator for the chatbot system
 * Routes user messages to appropriate services based on intent detection
 * Now powered by GROQ AI + LangChain for intelligent responses!
 */
class ChatbotController {
  constructor() {
    // Conversation context storage (in-memory)
    this.conversationContexts = new Map();
    this.contextExpiryTime = 30 * 60 * 1000; // 30 minutes
    
    // Check GROQ service status
    this.groqEnabled = groqService.isReady();
    if (this.groqEnabled) {
      console.log('[CHATBOT-CONTROLLER] ✅ GROQ AI Service is READY!');
    } else {
      console.log('[CHATBOT-CONTROLLER] ⚠️  GROQ AI Service not configured. Add GROQ_API_KEY to .env');
    }
  }

  /**
   * Main handler for chat messages
   * @param {string} userId - User identifier
   * @param {string} message - User message
   * @returns {Object} { reply, intent, confidence }
   */
  async handleMessage(userId, message) {
    try {
      console.log(`[CHATBOT-CONTROLLER] User ${userId}: ${message}`);

      // Check for bad words
      if (smallTalk.containsBadWords(message)) {
        return {
          success: true,
          reply: smallTalk.getBadWordResponse(),
          intent: 'smalltalk',
          confidence: 1.0
        };
      }

      // Check for small talk first (quick responses)
      const smallTalkResponse = smallTalk.getResponse(message);
      if (smallTalkResponse) {
        return {
          success: true,
          reply: smallTalkResponse,
          intent: 'smalltalk',
          confidence: 1.0
        };
      }

      // Detect intent (with safe defaults)
      const detection = intentRouter.detectIntent(message) || {};
      const intent = detection.intent || 'fallback_ai';
      const confidence = typeof detection.confidence === 'number' ? detection.confidence : 0;
      console.log(`[CHATBOT-CONTROLLER] Detected intent: ${intent} (confidence: ${confidence})`);

      // Get conversation context
      const context = this._getContext(userId);

      // Route to appropriate service
      let reply;
      switch (intent) {
        case 'weather':
          reply = await this._handleWeather(message);
          break;

        case 'soil':
          reply = await this._handleSoil(message);
          break;

        case 'crop_price':
          reply = await this._handlePrice(message);
          break;

        case 'disease_detection':
          reply = await this._handleDisease(message);
          break;

        case 'agri_news':
          reply = await this._handleNews(message);
          break;

        case 'location_info':
          reply = await this._handleLocation(message);
          break;

        case 'translation':
          reply = await this._handleTranslation(message);
          break;

        case 'general_farming':
          reply = await this._handleGeneralFarming(message);
          break;

        case 'fallback_ai':
          reply = await this._handleFallbackAI(userId, message, context);
          break;

        default:
          reply = await this._handleFallbackAI(userId, message, context);
      }

      // Update context
      this._updateContext(userId, message, reply);

      return {
        success: true,
        reply,
        intent,
        confidence
      };

    } catch (error) {
      console.error('[CHATBOT-CONTROLLER] Error:', error);
      return {
        success: false,
        reply: '⚠️ Sorry, I encountered an error. Please try again.',
        intent: 'error',
        confidence: 0
      };
    }
  }

  /**
   * Handle weather queries
   */
  async _handleWeather(message) {
    try {
      // Extract location from message
      const locationMatch = message.match(/(?:in|at|for|of)\s+([a-z\s]+)/i);
      const location = locationMatch ? locationMatch[1].trim() : 'Delhi';

      if (message.includes('forecast')) {
        return await weatherService.getForecast(location);
      } else {
        return await weatherService.getWeather(location);
      }
    } catch (error) {
      console.error('[WEATHER-HANDLER] Error:', error.message);
      return 'Unable to fetch weather data. Please try again.';
    }
  }

  /**
   * Handle soil queries
   */
  async _handleSoil(message) {
    try {
      // Extract soil type or location
      const soilTypes = ['loamy', 'clay', 'sandy', 'black', 'red', 'alluvial'];
      const foundType = soilTypes.find(type => message.toLowerCase().includes(type));

      if (foundType) {
        const recommendations = soilService.getSoilRecommendations(foundType);
        return `🌱 **${foundType.toUpperCase()} SOIL:**\n\n**Best Crops:** ${recommendations.crops}\n\n**Management:** ${recommendations.management}\n\n**pH:** ${recommendations.ph}`;
      } else {
        // Try to find location
        const locationMatch = message.match(/(?:in|at|for|of)\s+([a-z\s]+)/i);
        const location = locationMatch ? locationMatch[1].trim() : 'general';
        return await soilService.getSoilData(location);
      }
    } catch (error) {
      console.error('[SOIL-HANDLER] Error:', error.message);
      return 'Unable to fetch soil data. Please try again.';
    }
  }

  /**
   * Handle crop price queries
   */
  async _handlePrice(message) {
    try {
      // Extract crop name from message
      const cropMatch = message.match(/(?:price|rate|cost|value)\s+(?:of|for)?\s*([a-z]+)/i) ||
                       message.match(/([a-z]+)\s+(?:price|rate|cost)/i);
      
      const crop = cropMatch ? cropMatch[1].trim() : '';

      if (message.includes('msp') || message.includes('support price')) {
        const msp = priceService.getMSP(crop);
        return msp || priceService.getCropPrices(crop);
      }

      return await priceService.getCropPrices(crop);
    } catch (error) {
      console.error('[PRICE-HANDLER] Error:', error.message);
      return 'Unable to fetch price data. Please try again.';
    }
  }

  /**
   * Handle disease queries
   */
  async _handleDisease(message) {
    try {
      return await diseaseService.detectDisease(message);
    } catch (error) {
      console.error('[DISEASE-HANDLER] Error:', error.message);
      return 'Unable to fetch disease information. Please try again.';
    }
  }

  /**
   * Handle news queries
   */
  async _handleNews(message) {
    try {
      if (message.includes('scheme') || message.includes('government')) {
        return newsService.getGovernmentSchemes();
      }

      // Extract topic if specified
      const topicMatch = message.match(/(?:about|on|for)\s+([a-z\s]+)/i);
      const topic = topicMatch ? topicMatch[1].trim() : 'agriculture india';

      return await newsService.getNews(topic);
    } catch (error) {
      console.error('[NEWS-HANDLER] Error:', error.message);
      return 'Unable to fetch news. Please try again.';
    }
  }

  /**
   * Handle location queries
   */
  async _handleLocation(message) {
    try {
      if (message.includes('mandi') || message.includes('market')) {
        const locationMatch = message.match(/(?:in|at|near|around)\s+([a-z\s]+)/i);
        const location = locationMatch ? locationMatch[1].trim() : 'general';
        return await mapService.findNearestMandi(location);
      }

      if (message.includes('office') || message.includes('department')) {
        return mapService.getAgricultureOffices();
      }

      // General location search
      const locationMatch = message.match(/(?:find|locate|show|where)\s+([a-z\s]+)/i);
      const location = locationMatch ? locationMatch[1].trim() : '';
      
      if (location) {
        return await mapService.getLocationInfo(location);
      }

      return mapService.getAgricultureOffices();
    } catch (error) {
      console.error('[LOCATION-HANDLER] Error:', error.message);
      return 'Unable to fetch location data. Please try again.';
    }
  }

  /**
   * Handle translation queries
   */
  async _handleTranslation(message) {
    try {
      if (message.includes('term') || message.includes('vocabulary')) {
        const langMatch = message.match(/in\s+(hindi|tamil|telugu|marathi|bengali|gujarati|kannada|malayalam|punjabi)/i);
        const lang = langMatch ? langMatch[1].toLowerCase() : 'hi';
        const langCode = { hindi: 'hi', tamil: 'ta', telugu: 'te', marathi: 'mr', bengali: 'bn', gujarati: 'gu', kannada: 'kn', malayalam: 'ml', punjabi: 'pa' }[lang] || 'hi';
        return translateService.getFarmingTerms(langCode);
      }

      return await translateService.handleTranslationQuery(message);
    } catch (error) {
      console.error('[TRANSLATION-HANDLER] Error:', error.message);
      return 'Unable to translate. Please try again.';
    }
  }

  /**
   * Handle general farming queries
   */
  async _handleGeneralFarming(userId, message) {
    try {
      // First: Check knowledge base for instant answers
      const answer = knowledgeBase.findBestMatch(message);
      
      if (answer) {
        console.log('[GENERAL-FARMING] Knowledge base match found');
        return answer;
      }

      // Second: Use GROQ AI if available
      if (this.groqEnabled) {
        console.log('[GENERAL-FARMING] Using GROQ AI');
        return await groqService.generateResponse(userId, message, this._getContext(userId));
      }

      // Third: Fallback to old AI service
      console.log('[GENERAL-FARMING] Using fallback AI');
      return await aiService.generateAIResponse(message, this._getContext(userId));
    } catch (error) {
      console.error('[GENERAL-FARMING-HANDLER] Error:', error.message);
      return 'Unable to find an answer. Please rephrase your question.';
    }
  }

  /**
   * Handle fallback with AI (GROQ preferred)
   */
  async _handleFallbackAI(userId, message, context) {
    try {
      // Try GROQ first (with tools for better results)
      if (this.groqEnabled) {
        console.log('[FALLBACK-AI] Using GROQ AI with tools');
        return await groqService.generateResponseWithTools(userId, message);
      }

      // Fallback to old AI service
      console.log('[FALLBACK-AI] Using legacy AI service');
      return await aiService.generateAIResponse(message, context);
    } catch (error) {
      console.error('[FALLBACK-AI-HANDLER] Error:', error.message);
      return "I'm not sure how to help with that. Try asking about:\n✅ Weather\n✅ Crop prices\n✅ Soil information\n✅ Plant diseases\n✅ Farming tips";
    }
  }

  /**
   * Get conversation context
   */
  _getContext(userId) {
    if (!this.conversationContexts.has(userId)) {
      this.conversationContexts.set(userId, {
        messages: [],
        lastActivity: Date.now()
      });
    }

    const context = this.conversationContexts.get(userId);
    
    // Check if context expired
    if (Date.now() - context.lastActivity > this.contextExpiryTime) {
      context.messages = [];
    }

    return context.messages;
  }

  /**
   * Update conversation context
   */
  _updateContext(userId, userMessage, botReply) {
    const context = this.conversationContexts.get(userId);
    
    context.messages.push({ role: 'user', content: userMessage });
    context.messages.push({ role: 'assistant', content: botReply });
    
    // Keep only last 5 exchanges (10 messages)
    if (context.messages.length > 10) {
      context.messages = context.messages.slice(-10);
    }
    
    context.lastActivity = Date.now();
  }

  /**
   * Clear context (for testing or user logout)
   */
  clearContext(userId) {
    this.conversationContexts.delete(userId);
  }
}

module.exports = new ChatbotController();
