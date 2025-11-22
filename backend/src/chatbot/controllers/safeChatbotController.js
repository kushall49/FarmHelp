/**
 * Safe Chatbot Controller Wrapper
 * Wraps the main chatbot controller with error handling to prevent server crashes
 */

class SafeChatbotController {
  constructor() {
    this.chatbotController = null;
    this.initializationError = null;
    
    // Try to load the main controller (it exports an instance, not a class)
    try {
      this.chatbotController = require('./chatbotController');
      
      // Verify it has the handleMessage method
      if (typeof this.chatbotController.handleMessage === 'function') {
        console.log('[SAFE-CHATBOT] Controller initialized successfully');
      } else {
        throw new Error('Controller does not have handleMessage method');
      }
    } catch (error) {
      this.initializationError = error;
      console.error('[SAFE-CHATBOT] Failed to initialize controller:', error.message);
      console.log('[SAFE-CHATBOT] Will use fallback responses');
    }
  }

  /**
   * Handle message with safety wrapper
   */
  async handleMessage(userId, message) {
    // If controller failed to load, use fallback
    if (!this.chatbotController || this.initializationError) {
      return this._getFallbackResponse(message);
    }

    try {
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 8000)
      );

      const responsePromise = this.chatbotController.handleMessage(userId, message);
      
      const result = await Promise.race([responsePromise, timeoutPromise]);
      
      // Validate response structure
      if (result && typeof result === 'object' && result.reply) {
        return {
          success: true,
          reply: result.reply,
          intent: result.intent || 'general',
          confidence: result.confidence || 0.7
        };
      } else {
        console.warn('[SAFE-CHATBOT] Invalid response structure:', result);
        return this._getFallbackResponse(message);
      }

    } catch (error) {
      console.error('[SAFE-CHATBOT] Error handling message:', error.message);
      return this._getFallbackResponse(message);
    }
  }

  /**
   * Simple fallback responses (pattern matching)
   */
  _getFallbackResponse(message) {
    const msg = message.toLowerCase();
    
    const patterns = [
      {
        keywords: ['weather', 'temperature', 'climate', 'rain', 'forecast'],
        response: '🌤️ **Weather Information**\n\nTo get accurate weather information, please specify your location. I can help you with current conditions and forecasts.'
      },
      {
        keywords: ['crop', 'farming', 'recommend', 'plant', 'grow', 'cultivation'],
        response: '🌾 **Crop Recommendations**\n\nI can help you choose the right crops! Please tell me:\n• Your soil type (loamy, clay, sandy)\n• Current season\n• Your location\n\nThis will help me give you better recommendations!'
      },
      {
        keywords: ['disease', 'pest', 'infection', 'problem', 'leaf', 'spot'],
        response: '🔍 **Plant Disease Detection**\n\nFor accurate disease diagnosis, please use our Plant Health Analyzer feature:\n1. Take a clear photo of the affected plant\n2. Upload it through the app\n3. Get instant AI-powered diagnosis\n\nI can also provide general advice if you describe the symptoms!'
      },
      {
        keywords: ['price', 'market', 'rate', 'sell', 'buy', 'mandi', 'msp'],
        response: '💰 **Crop Pricing Information**\n\nPlease specify which crop you\'re interested in, and I\'ll help you with:\n• Current market prices\n• MSP (Minimum Support Price)\n• Price trends\n• Best time to sell'
      },
      {
        keywords: ['soil', 'fertility', 'nutrient', 'ph', 'testing'],
        response: '🌱 **Soil Information**\n\nI can help you with soil management! Tell me:\n• Your soil type (loamy, clay, sandy, etc.)\n• What you want to grow\n• Any specific issues\n\nI\'ll provide recommendations for improving soil health and crop selection.'
      },
      {
        keywords: ['hello', 'hi', 'hey', 'greetings', 'namaste'],
        response: '👋 **Hello! Welcome to FarmHelp!**\n\nI\'m your AI farming assistant. I can help you with:\n\n🌾 Crop recommendations\n🌡️ Weather forecasts\n🔍 Disease diagnosis\n💰 Market prices\n🌱 Soil advice\n📰 Agricultural news\n\nWhat would you like to know?'
      },
      {
        keywords: ['thank', 'thanks', 'appreciate', 'grateful'],
        response: '😊 You\'re very welcome! I\'m here to help anytime you need farming advice. Good luck with your crops! 🌾'
      },
      {
        keywords: ['bye', 'goodbye', 'see you', 'later'],
        response: '👋 Goodbye! Take care of your crops and come back anytime you need advice. Happy farming! 🌱'
      },
      {
        keywords: ['help', 'what can you do', 'features', 'capabilities'],
        response: '🤖 **I can help you with:**\n\n✅ Weather forecasts and climate info\n✅ Crop recommendations based on soil\n✅ Plant disease identification\n✅ Market prices and MSP\n✅ Soil testing and management\n✅ Agricultural news updates\n✅ General farming questions\n\nJust ask me anything!'
      }
    ];

    // Find matching pattern
    for (const pattern of patterns) {
      if (pattern.keywords.some(keyword => msg.includes(keyword))) {
        return {
          success: true,
          reply: pattern.response,
          intent: 'pattern_match',
          confidence: 0.85
        };
      }
    }

    // Default response
    return {
      success: true,
      reply: '🌾 **FarmHelp Assistant**\n\nI\'m here to help with farming questions! You can ask me about:\n\n• Weather and climate\n• Crop selection and recommendations\n• Plant diseases and pests\n• Soil management\n• Market prices\n• Agricultural news\n\nWhat would you like to know?',
      intent: 'fallback',
      confidence: 0.5
    };
  }
}

// Export singleton instance
module.exports = new SafeChatbotController();
