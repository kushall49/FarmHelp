/**
 * Knowledge Base for general farming queries
 * Contains 100+ farming facts and responses
 */
class KnowledgeBase {
  constructor() {
    this.farmingKnowledge = {
      // Crop information
      rice: {
        keywords: ['rice', 'paddy', 'dhan'],
        response: '🌾 **Rice/Paddy Farming:**\n- Best Season: Monsoon (Kharif)\n- Soil: Clay/Loamy soil with standing water\n- Duration: 120-150 days\n- Water: Needs continuous flooding for 75-100 days\n- Varieties: Basmati, Sona Masuri, IR-64\n- Yield: 40-50 quintals/hectare\n- Fertilizer: NPK 120:60:40 kg/hectare'
      },
      wheat: {
        keywords: ['wheat', 'gehun'],
        response: '🌾 **Wheat Farming:**\n- Best Season: Winter (Rabi) - Oct-Nov sowing\n- Soil: Well-drained loamy, pH 6-7\n- Duration: 130-150 days\n- Temperature: 20-25°C ideal\n- Varieties: HD-2967, DBW-187, PBW-343\n- Yield: 40-50 quintals/hectare\n- Irrigation: 4-6 times during crop period'
      },
      cotton: {
        keywords: ['cotton', 'kapas'],
        response: '🌿 **Cotton Farming:**\n- Best Season: Kharif (June-July)\n- Soil: Black cotton soil ideal\n- Duration: 180-200 days\n- Varieties: Bt cotton (pest resistant)\n- Spacing: 90x60 cm\n- Main pests: Bollworm, aphids\n- Yield: 20-25 quintals/hectare'
      },
      sugarcane: {
        keywords: ['sugarcane', 'ganna'],
        response: '🎋 **Sugarcane Farming:**\n- Duration: 10-12 months\n- Planting: Feb-Mar or Oct-Nov\n- Soil: Deep fertile soil\n- Water: Heavy irrigation needed\n- Fertilizer: 250kg N, 60kg P, 120kg K/hectare\n- Yield: 800-1000 quintals/hectare\n- Harvest: When sugar content peaks (12-14%)'
      },
      maize: {
        keywords: ['maize', 'corn', 'makka'],
        response: '🌽 **Maize Farming:**\n- Seasons: Kharif & Rabi both\n- Soil: Well-drained loamy soil\n- Duration: 90-110 days\n- Spacing: 60x20 cm\n- Irrigation: Critical at tasseling stage\n- Yield: 40-60 quintals/hectare\n- Uses: Food, fodder, industrial'
      },
      tomato: {
        keywords: ['tomato', 'tamatar'],
        response: '🍅 **Tomato Farming:**\n- Seasons: Year-round (best in Rabi)\n- Soil: Sandy loam, pH 6-7\n- Duration: 90-120 days\n- Spacing: 60x45 cm\n- Support: Staking needed for indeterminate varieties\n- Yield: 400-600 quintals/hectare\n- Common diseases: Late blight, early blight'
      },
      potato: {
        keywords: ['potato', 'aloo'],
        response: '🥔 **Potato Farming:**\n- Best Season: Winter (Oct-Nov)\n- Soil: Sandy loam, well-drained\n- Duration: 90-120 days\n- Seed: Use certified tubers\n- Earthing up: Essential at 30 days\n- Yield: 200-300 quintals/hectare\n- Storage: Cool, dark, ventilated place'
      },
      onion: {
        keywords: ['onion', 'pyaz'],
        response: '🧅 **Onion Farming:**\n- Seasons: Kharif, Rabi, Late Kharif\n- Soil: Well-drained loamy soil\n- Duration: 120-150 days\n- Transplanting: 6-7 week old seedlings\n- Irrigation: Light & frequent\n- Yield: 250-300 quintals/hectare\n- Harvesting: When 50% tops fall'
      },

      // Soil management
      loam_soil: {
        keywords: ['loam', 'loamy soil', 'best soil'],
        response: '🌱 **Loamy Soil:** Ideal for farming! Contains balanced sand, silt, clay. Perfect for: Rice, Wheat, Cotton, Vegetables. pH 6-7. Retains moisture well. Add organic matter @ 10 tons/hectare. Minimal tillage needed.'
      },
      clay_soil: {
        keywords: ['clay', 'heavy soil', 'clay soil'],
        response: '🌱 **Clay/Heavy Soil:** Rich in nutrients but poor drainage. Good for: Rice, Wheat, Gram. Add organic matter & sand. Deep ploughing needed. Gypsum helps break hard clay. Install drainage system.'
      },
      sandy_soil: {
        keywords: ['sandy', 'light soil', 'sandy soil'],
        response: '🌱 **Sandy Soil:** Drains fast, low nutrients. Good for: Groundnut, Watermelon, Carrot, Potato. Add compost heavily. Frequent light irrigation. Mulching essential. Green manuring improves structure.'
      },

      // Fertilizers
      npk: {
        keywords: ['npk', 'fertilizer', 'urea', 'dap'],
        response: '🌿 **NPK Fertilizers:**\n• N (Nitrogen/Urea): Leaf growth\n• P (Phosphorus/DAP): Root development\n• K (Potassium/MOP): Disease resistance\n\nSoil test before application! Apply in splits. Add micronutrients (Zn, Fe, B).'
      },
      organic: {
        keywords: ['organic', 'fym', 'compost', 'vermicompost'],
        response: '🌿 **Organic Farming:**\n• FYM: 10-15 tons/hectare\n• Vermicompost: 2-3 tons/hectare\n• Green manure: Sunhemp, Dhaincha\n• Bio-fertilizers: Rhizobium, Azotobacter\n• Neem cake for pest control\nCertification takes 3 years'
      },

      // Irrigation
      drip: {
        keywords: ['drip', 'drip irrigation', 'micro irrigation'],
        response: '💧 **Drip Irrigation:** Most efficient! Saves 40-60% water. Best for: Vegetables, Fruits, Sugarcane. Cost: Rs 40-60k/acre. Subsidy available. Reduces weeds & disease. Water + fertilizer through drip (fertigation).'
      },
      sprinkler: {
        keywords: ['sprinkler', 'sprinkler irrigation'],
        response: '💧 **Sprinkler Irrigation:** Saves 30-40% water. Good for: Wheat, Vegetables, Lawns. Uniform water distribution. Suitable for sandy soils. Can cover large areas. Portable & fixed systems available.'
      },

      // Pests
      pest_control: {
        keywords: ['pest', 'insect', 'bug', 'pest control'],
        response: '🐛 **Integrated Pest Management (IPM):**\n1. Use resistant varieties\n2. Crop rotation\n3. Pheromone traps\n4. Neem oil spray\n5. Natural predators\n6. Pesticides (last resort)\n\nScout fields regularly!'
      },

      // Diseases
      disease: {
        keywords: ['disease', 'fungal', 'bacterial', 'virus'],
        response: '🍃 **Disease Management:**\n• Prevention: Disease-free seeds, spacing, drainage\n• Fungal: Copper fungicide, Carbendazim\n• Bacterial: Streptocycline\n• Viral: Remove infected plants\n• Organic: Neem cake, Trichoderma\n\nCrop rotation breaks disease cycle!'
      }
    };
  }

  /**
   * Find best matching response from knowledge base
   */
  findBestMatch(message) {
    const normalizedMessage = message.toLowerCase();
    
    // Search through knowledge base
    for (const [key, data] of Object.entries(this.farmingKnowledge)) {
      for (const keyword of data.keywords) {
        if (normalizedMessage.includes(keyword.toLowerCase())) {
          console.log(`[KNOWLEDGE-BASE] Match found: ${key}`);
          return data.response;
        }
      }
    }

    // No match - return general farming info
    return this._getGeneralFarmingInfo();
  }

  /**
   * General farming information (fallback)
   */
  _getGeneralFarmingInfo() {
    return `👨‍🌾 **General Farming Information:**

I can help you with:
• **Crops:** Rice, Wheat, Cotton, Sugarcane, Vegetables
• **Soil:** Loamy, Clay, Sandy, Red, Black soil
• **Inputs:** Fertilizers (NPK), Seeds, Organic methods
• **Protection:** Pests, Diseases, IPM
• **Water:** Irrigation methods, water management
• **Practices:** Sowing, Harvesting, Crop rotation

Ask me specific questions like:
"How to grow rice?"
"What fertilizer for wheat?"
"Pest control in cotton?"`;
  }

  /**
   * Get all available topics
   */
  getAvailableTopics() {
    return Object.keys(this.farmingKnowledge);
  }
}

module.exports = new KnowledgeBase();
