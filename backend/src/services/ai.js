const axios = require('axios');
const FormData = require('form-data');

// API Configuration
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || '';
const FLASK_ML_SERVICE_URL = process.env.FLASK_ML_SERVICE_URL || 'http://127.0.0.1:5000';

// We'll use a conversational model that's more reliable
const CHAT_MODEL = 'tiiuae/falcon-7b-instruct';

const AIService = {
  /**
   * Analyze plant image using Flask ML service
   * @param {Buffer} buffer - Image buffer
   * @returns {Object} Analysis result
   */
  async analyzePlant(buffer) {
    try {
      console.log('[AI-SERVICE] Creating form data for Flask ML service...');
      console.log('[AI-SERVICE] Buffer size:', buffer.length, 'bytes');
      
      // Create form data with image file
      const formData = new FormData();
      // FormData needs a stream or buffer with proper options
      formData.append('file', buffer, {
        filename: 'plant_image.jpg',
        contentType: 'image/jpeg',
        knownLength: buffer.length
      });
      formData.append('return_gradcam', 'true');
      formData.append('top_k', '3');

      console.log(`[AI-SERVICE] Calling Flask ML service at ${FLASK_ML_SERVICE_URL}/analyze...`);
      console.log('[AI-SERVICE] Form headers:', formData.getHeaders());
      
      // Call Flask ML service
      const response = await axios.post(`${FLASK_ML_SERVICE_URL}/analyze`, formData, {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 30000, // 30 second timeout
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      console.log('[AI-SERVICE] Flask response status:', response.status);
      console.log('[AI-SERVICE] Flask response success:', response.data.success);

      // Return the analysis result
      if (response.data && response.data.success) {
        console.log('[AI-SERVICE] ✅ Analysis successful');
        console.log('[AI-SERVICE] Crop:', response.data.crop, 'Disease:', response.data.disease);
        return {
          crop: response.data.crop,
          disease: response.data.disease,
          confidence: response.data.confidence,
          confidence_percentage: response.data.confidence_percentage,
          predictions: response.data.predictions,
          recommendation: response.data.recommendation,
          recommendations: response.data.recommendations,
          fertilizers: response.data.fertilizers,
          gradcam: response.data.gradcam,
          processing_time_ms: response.data.total_processing_time_ms
        };
      } else {
        console.error('[AI-SERVICE] ML service returned unsuccessful response');
        throw new Error('ML service returned unsuccessful response');
      }
    } catch (error) {
      console.error('[AI-SERVICE] ❌ Error calling Flask ML service:', error.message);
      if (error.response) {
        console.error('[AI-SERVICE] Response status:', error.response.status);
        console.error('[AI-SERVICE] Response data:', JSON.stringify(error.response.data));
      }
      if (error.code) {
        console.error('[AI-SERVICE] Error code:', error.code);
      }
      
      // Return fallback response if ML service fails
      return {
        crop: 'Unknown',
        disease: 'Service Unavailable',
        confidence: 0.0,
        confidence_percentage: '0.00%',
        predictions: [],
        recommendation: 'Plant disease detection service is currently unavailable. Please try again later.',
        recommendations: {},
        fertilizers: [],
        error: error.message
      };
    }
  },

  async chat(message) {
    // Try real AI first if API key exists
    if (HUGGINGFACE_API_KEY) {
      try {
        return await this.chatWithRealAI(message);
      } catch (error) {
        console.error('[AI] Real AI failed, using smart responses:', error.message);
        return this.getSmartFarmingResponse(message);
      }
    }
    
    // Fallback to smart responses
    return this.getSmartFarmingResponse(message);
  },

  async chatWithRealAI(message) {
    console.log(`[AI] Attempting real AI response for: "${message}"`);
    
    // Create farming-focused prompt
    const prompt = `<|system|>You are an expert farming assistant with knowledge of Indian agriculture. Provide practical, concise advice.
<|user|>${message}
<|assistant|>`;

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${CHAT_MODEL}`,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          return_full_text: false,
          stop: ["<|user|>", "<|system|>"]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('[AI] Response received from HuggingFace');
    
    // Parse response
    let reply = '';
    if (Array.isArray(response.data)) {
      reply = response.data[0]?.generated_text || '';
    } else if (response.data.generated_text) {
      reply = response.data.generated_text;
    }

    reply = reply.trim();

    // If empty or too short, use smart response
    if (!reply || reply.length < 15) {
      throw new Error('Response too short');
    }

    console.log('[AI] ✅ Real AI response generated successfully');
    return reply;
  },

  /**
   * Smart context-aware farming responses
   * These are much better than simple keyword matching
   */
  getSmartFarmingResponse(message) {
    const msg = message.toLowerCase();
    console.log(`[AI] Using smart offline response for: "${message}"`);

    // Crop-specific queries
    if (msg.includes('rice') || msg.includes('paddy')) {
      return '🌾 Rice farming tips: Best in monsoon (Kharif). Needs standing water for 75-100 days. Prepare field with 2-3 ploughs, transplant 20-25 day old seedlings. Apply NPK fertilizer in 3 splits. Watch for blast disease and stem borer pests. Expected yield: 40-50 quintals/hectare.';
    }
    
    if (msg.includes('wheat')) {
      return '🌾 Wheat farming: Ideal Rabi crop (Oct-Nov sowing). Needs well-drained loamy soil, pH 6-7. Sow after rice harvest when temp is 20-25°C. Varieties: HD-2967, DBW-187. Apply DAP at sowing, Urea in 2-3 doses. Irrigate 4-6 times. Harvest at golden yellow stage after 130-150 days.';
    }

    if (msg.includes('cotton')) {
      return '🌿 Cotton cultivation: Kharif crop, needs 180-200 days. Black cotton soil ideal. Varieties: Bt cotton (insect resistant). Space: 90x60cm. Critical irrigation at flowering & boll formation. Main pests: bollworm, aphids (use IPM). Pick cotton when bolls open fully. Yield: 20-25 quintals/hectare.';
    }

    if (msg.includes('sugarcane')) {
      return '🎋 Sugarcane farming: Long duration crop (10-12 months). Plant Feb-Mar or Oct-Nov. Needs deep fertile soil & assured irrigation. Plant sets with 2-3 buds at 90cm rows. Heavy feeder - needs 250kg N, 60kg P, 120kg K per hectare. Earthing up at 90-120 days essential. Harvest when sugar content peaks.';
    }

    // Monsoon crops
    if (msg.includes('monsoon') || msg.includes('kharif') || msg.includes('rainy season')) {
      return '🌧️ Best Kharif/Monsoon crops (June-October): Rice, Cotton, Jowar, Bajra, Maize, Soybean, Groundnut, Pulses (Arhar, Moong, Urad). These crops need good rainfall. Ensure proper drainage to prevent waterlogging. Sow after first good rain when soil has enough moisture.';
    }

    // Winter crops
    if (msg.includes('winter') || msg.includes('rabi')) {
      return '❄️ Best Rabi/Winter crops (Oct-March): Wheat, Gram, Pea, Barley, Mustard, Potato, Onion, Garlic. These crops need cool weather. Prepare land after monsoon. Irrigation essential as there\'s no rain. These crops give good returns with less pest problems.';
    }

    // Summer crops
    if (msg.includes('summer') || msg.includes('zaid')) {
      return '☀️ Best Zaid/Summer crops (March-June): Watermelon, Muskmelon, Cucumber, Bottle gourd, Pumpkin, Tomato (hybrid varieties). These crops need irrigation. Mulching helps conserve moisture. Use shade nets for seedlings. Harvest early morning for better market quality.';
    }

    // Soil queries
    if (msg.includes('loamy') || msg.includes('loam soil')) {
      return '🌱 Loamy soil (Best for farming): Ideal mix of sand, silt, clay. pH 6-7 best. Crops: Almost all crops thrive - Rice, Wheat, Cotton, Vegetables, Sugarcane. Retains moisture well but drains excess. Add organic matter (compost, FYM) @ 10 tons/hectare. Minimal tillage needed. Very fertile!';
    }

    if (msg.includes('clay') || msg.includes('heavy soil')) {
      return '🌱 Clay/Heavy soil: Retains water, nutrient-rich but poor drainage. Good for: Rice, Wheat, Gram, Soybean. Add organic matter & sand to improve. Deep ploughing needed. Don\'t work when wet (becomes sticky). Gypsum application helps break hard clay. Needs good drainage system.';
    }

    if (msg.includes('sandy') || msg.includes('light soil')) {
      return '🌱 Sandy/Light soil: Drains fast, warms quickly, easy to work. Low nutrients & water retention. Good for: Groundnut, Watermelon, Carrot, Potato. Add compost/FYM heavily. Frequent light irrigation needed. Mulching essential. Green manuring (sunhemp) improves structure. Add clay if possible.';
    }

    if (msg.includes('red soil') || msg.includes('laterite')) {
      return '🌱 Red soil: Common in South India. Acidic (pH 5-6), iron-rich. Good for: Groundnut, Pulses, Millets, Cashew, Tea, Coffee. Add lime to reduce acidity. Organic matter essential. Drains well but low fertility. Apply micronutrients (Zn, B). Works well with drip irrigation.';
    }

    if (msg.includes('black soil') || msg.includes('regur')) {
      return '🌱 Black soil (Regur): Rich in clay, retains moisture excellently. Perfect for: Cotton (hence called "black cotton soil"), Soybean, Jowar, Wheat. High in iron, lime, calcium. Swells when wet, cracks when dry. Needs minimal irrigation. Add gypsum if too sticky. Very fertile!';
    }

    // Fertilizer queries
    if (msg.includes('fertiliz') || msg.includes('npk') || msg.includes('nutrient')) {
      return '🌿 Fertilizer guide: NPK = Nitrogen-Phosphorus-Potassium. Nitrogen (Urea): For leaf growth, apply in splits. Phosphorus (DAP/SSP): For roots, apply at sowing. Potassium (MOP): For fruits/disease resistance. Soil test essential! Also add micronutrients (Zn, Fe, B). Organic option: FYM 10 tons + Vermicompost 2 tons/hectare.';
    }

    // Pest control
    if (msg.includes('pest') || msg.includes('insect') || msg.includes('attack')) {
      return '🐛 Integrated Pest Management (IPM): 1) Use pest-resistant varieties 2) Crop rotation 3) Remove affected parts 4) Pheromone traps 5) Neem oil spray (organic) 6) Introduce natural predators (ladybugs for aphids) 7) If needed, use recommended pesticides (follow label). Always scout fields regularly!';
    }

    // Disease queries
    if (msg.includes('disease') || msg.includes('fungus') || msg.includes('blight') || msg.includes('rot')) {
      return '🍃 Disease management: Prevention better than cure! Use disease-free seeds, proper spacing, avoid waterlogging, ensure sunlight. For fungal diseases: Copper fungicide, Carbendazim. For bacterial: Streptocycline. Remove infected plants immediately. Crop rotation breaks disease cycle. Organic: Neem cake, Trichoderma.';
    }

    // Water/irrigation
    if (msg.includes('irrigation') || msg.includes('water') || msg.includes('drip')) {
      return '💧 Irrigation methods: Drip irrigation (Best! Saves 40% water, Rs 40-60k/acre) - For orchards, vegetables. Sprinkler (Saves 30% water) - For wheat, cotton. Flood irrigation (Traditional) - For rice. Water at critical stages: Flowering, grain filling. Check soil moisture before irrigating (finger test 3-4 inch deep).';
    }

    // Weather/climate
    if (msg.includes('weather') || msg.includes('climate') || msg.includes('temperature')) {
      return '🌦️ Weather impact on farming: Temperature affects germination & growth. Frost damages crops. Unseasonal rain at harvest = loss. Strong winds = lodging in cereals. Follow IMD weather forecasts. Use weather-based agro-advisories. Crop insurance protects against weather risks. Mulching helps temperature control.';
    }

    // Seeds
    if (msg.includes('seed') || msg.includes('variety') || msg.includes('hybrid')) {
      return '🌱 Seed selection: Buy certified seeds from govt agencies/authorized dealers. Choose varieties suited to your region & season. Hybrids give 20-30% more yield but can\'t reuse seeds. Check seed germination before sowing. Treat seeds with fungicide (Thiram/Captan) before sowing. Store in cool, dry place.';
    }

    // Organic farming
    if (msg.includes('organic') || msg.includes('natural') || msg.includes('chemical-free')) {
      return '🌿 Organic farming: Use FYM, vermicompost, green manure instead of chemicals. Pest control: Neem oil, panchagavya, bio-pesticides. Certification takes 3 years. Initially lower yield but better prices. Soil health improves over time. Market demand high. Good for vegetable farming & exports.';
    }

    // Market/price
    if (msg.includes('market') || msg.includes('price') || msg.includes('sell')) {
      return '💰 Marketing tips: Check daily mandi rates (e-NAM portal). Avoid distress sale at harvest. FPOs (Farmer Producer Orgs) get better rates. Direct marketing removes middlemen. Grade & clean produce. Proper packaging attracts buyers. Contract farming with companies ensures fixed price. Storage helps get better off-season rates.';
    }

    // Loan/subsidy
    if (msg.includes('loan') || msg.includes('subsidy') || msg.includes('scheme') || msg.includes('government')) {
      return '🏛️ Govt support: Kisan Credit Card (KCC) - Low interest loans. PM-KISAN - Rs 6000/year direct transfer. Crop insurance (PM Fasal Bima Yojana). Subsidies on seeds, fertilizers, equipment. Soil health card free. E-NAM platform. Contact local Krishi Vigyan Kendra (KVK) or agriculture officer for schemes in your area.';
    }

    // Equipment/machinery
    if (msg.includes('tractor') || msg.includes('equipment') || msg.includes('machinery') || msg.includes('implement')) {
      return '🚜 Farm mechanization: Tractors (20-50 HP based on land). Custom Hiring Centers provide equipment on rent. Power tillers for small farms. Seed drills for precise sowing. Combine harvesters (rent at harvest). Sprayers (manual/power). Subsidy available on implements. Join farmer cooperatives to share equipment costs.';
    }

    // General farming query
    if (msg.includes('crop') || msg.includes('plant') || msg.includes('grow') || msg.includes('cultivat')) {
      return '👨‍🌾 Farming basics: Choose crop based on: Soil type, Climate, Water availability, Market demand. Prepare land properly (2-3 ploughs). Use quality seeds. Apply farmyard manure before sowing. Follow proper spacing. Timely weeding essential (2-3 times). Integrated nutrient & pest management. Harvest at right maturity. What specific crop interests you?';
    }

    // Default intelligent response
    return `👨‍🌾 Hello! I'm your FarmHelp AI assistant. I can provide detailed guidance on:

• Crop recommendations (rice, wheat, cotton, vegetables)
• Soil management (loamy, clay, sandy, red, black soil)
• Pest & disease control
• Irrigation methods
• Fertilizer application
• Seasonal farming (Kharif, Rabi, Zaid)
• Organic farming techniques
• Government schemes & subsidies

Please ask me a specific question like:
"What crops grow best in monsoon season?"
"How to manage pests in cotton?"
"What fertilizer for wheat crop?"

What would you like to know?`;
  }
};

module.exports = AIService;
