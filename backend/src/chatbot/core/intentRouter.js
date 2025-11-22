/**
 * Intent Router - Classifies user messages into intents
 * Uses keyword matching and pattern recognition
 */
class IntentRouter {
  constructor() {
    this.intents = {
      smalltalk: {
        keywords: ['hello', 'hi', 'hey', 'how are you', 'what are you doing', 'who are you', 
                   'joke', 'thanks', 'thank you', 'bye', 'goodbye', 'are you there', 'sup'],
        patterns: [/^(hi|hello|hey)(\s|!|\?|$)/i, /how are you/i, /tell me a joke/i, /are you (there|ok)/i]
      },
      weather: {
        keywords: ['weather', 'temperature', 'rain', 'forecast', 'climate', 'sunny', 'cloudy', 
                   'monsoon', 'rainfall', 'humidity', 'hot', 'cold'],
        patterns: [/weather (in|at|for)/i, /what('s| is) the (weather|temperature)/i, 
                   /will it rain/i, /(temperature|climate) (today|tomorrow)/i]
      },
      soil: {
        keywords: ['soil', 'ph', 'fertility', 'soil type', 'loam', 'clay', 'sandy', 'soil test',
                   'soil health', 'soil quality', 'nitrogen', 'phosphorus', 'potassium', 'npk'],
        patterns: [/soil (type|test|quality|health)/i, /check (my )?soil/i, 
                   /what soil/i, /(loam|clay|sandy) soil/i]
      },
      crop_price: {
        keywords: ['price', 'market', 'cost', 'rate', 'mandi', 'sell', 'buy', 'trading',
                   'commodity', 'wholesale', 'retail'],
        patterns: [/(crop|wheat|rice|cotton) price/i, /market (price|rate)/i, 
                   /how much (for|is)/i, /mandi (rate|price)/i]
      },
      disease_detection: {
        keywords: ['disease', 'pest', 'infection', 'bug', 'insect', 'fungus', 'virus',
                   'blight', 'rot', 'wilt', 'leaf spot', 'cure', 'treatment', 'symptom'],
        patterns: [/(plant|crop) disease/i, /pest (control|management)/i, 
                   /how to (cure|treat)/i, /disease (in|on)/i]
      },
      agri_news: {
        keywords: ['news', 'latest', 'update', 'information', 'report', 'article',
                   'agriculture news', 'farming news', 'agri update'],
        patterns: [/(agriculture|farming|agri) news/i, /latest (news|update)/i, 
                   /what('s| is) new/i, /news (about|on)/i]
      },
      location_info: {
        keywords: ['location', 'where', 'map', 'near me', 'nearby', 'around', 'find',
                   'shop', 'store', 'dealer', 'market nearby'],
        patterns: [/where (is|can i find)/i, /(near|around) me/i, 
                   /show me (the )?map/i, /location of/i]
      },
      translation: {
        keywords: ['translate', 'translation', 'language', 'hindi', 'tamil', 'telugu',
                   'kannada', 'marathi', 'bengali', 'meaning'],
        patterns: [/translate (to|in|into)/i, /what (is|does) .+ mean in/i, 
                   /how do you say .+ in/i, /language (translation|change)/i]
      },
      general_farming: {
        keywords: ['crop', 'farming', 'agriculture', 'cultivation', 'harvest', 'sowing',
                   'irrigation', 'fertilizer', 'seed', 'field', 'farm', 'grow', 'plant'],
        patterns: [/how to (grow|plant|cultivate)/i, /best (crop|seed|fertilizer)/i, 
                   /(when|what time) to (sow|plant|harvest)/i, /farming (method|technique)/i]
      }
    };
  }

  /**
   * Detect intent from user message
   * @param {string} message - User's message
   * @returns {string} - Detected intent
   */
  detectIntent(message) {
    if (!message || typeof message !== 'string') {
      return 'fallback_ai';
    }

    const normalizedMessage = message.toLowerCase().trim();

    // Check each intent
    for (const [intent, config] of Object.entries(this.intents)) {
      // Check patterns first (more specific)
      if (config.patterns) {
        for (const pattern of config.patterns) {
          if (pattern.test(normalizedMessage)) {
            console.log(`[INTENT-ROUTER] Detected intent: ${intent} (pattern match)`);
            return intent;
          }
        }
      }

      // Check keywords
      if (config.keywords) {
        for (const keyword of config.keywords) {
          if (normalizedMessage.includes(keyword.toLowerCase())) {
            console.log(`[INTENT-ROUTER] Detected intent: ${intent} (keyword: ${keyword})`);
            return intent;
          }
        }
      }
    }

    // No intent matched - use fallback
    console.log('[INTENT-ROUTER] No specific intent detected, using fallback_ai');
    return 'fallback_ai';
  }

  /**
   * Get confidence score for detected intent (0-1)
   */
  getIntentConfidence(message, intent) {
    const normalizedMessage = message.toLowerCase().trim();
    const config = this.intents[intent];
    
    if (!config) return 0;

    let score = 0;
    let totalChecks = 0;

    // Check patterns
    if (config.patterns) {
      totalChecks += config.patterns.length;
      for (const pattern of config.patterns) {
        if (pattern.test(normalizedMessage)) {
          score += 1;
        }
      }
    }

    // Check keywords
    if (config.keywords) {
      totalChecks += config.keywords.length;
      for (const keyword of config.keywords) {
        if (normalizedMessage.includes(keyword.toLowerCase())) {
          score += 0.5;
        }
      }
    }

    return totalChecks > 0 ? Math.min(score / totalChecks, 1) : 0;
  }

  /**
   * Get all possible intents with confidence scores
   */
  getAllIntents(message) {
    const results = {};
    
    for (const intent of Object.keys(this.intents)) {
      results[intent] = this.getIntentConfidence(message, intent);
    }

    // Sort by confidence
    return Object.entries(results)
      .sort(([, a], [, b]) => b - a)
      .map(([intent, confidence]) => ({ intent, confidence }));
  }
}

module.exports = new IntentRouter();
