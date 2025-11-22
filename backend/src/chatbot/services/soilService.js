const axios = require('axios');

/**
 * Soil Service - Provides soil information and analysis
 * Note: This is a mock service. Integrate with real soil API when available.
 */
class SoilService {
  constructor() {
    // Mock soil data for different regions
    this.soilDatabase = {
      'punjab': { type: 'Alluvial', ph: 7.2, nitrogen: 'Medium', phosphorus: 'Low', potassium: 'Medium' },
      'maharashtra': { type: 'Black', ph: 7.8, nitrogen: 'Medium', phosphorus: 'Medium', potassium: 'High' },
      'karnataka': { type: 'Red', ph: 6.5, nitrogen: 'Low', phosphorus: 'Medium', potassium: 'Low' },
      'tamil nadu': { type: 'Red/Black', ph: 6.8, nitrogen: 'Medium', phosphorus: 'Medium', potassium: 'Medium' },
      'uttar pradesh': { type: 'Alluvial', ph: 7.5, nitrogen: 'High', phosphorus: 'Medium', potassium: 'Medium' },
      'kerala': { type: 'Laterite', ph: 5.5, nitrogen: 'Low', phosphorus: 'Low', potassium: 'Low' },
      'rajasthan': { type: 'Arid/Sandy', ph: 8.0, nitrogen: 'Low', phosphorus: 'Low', potassium: 'Low' }
    };
  }

  /**
   * Get soil data for a region
   * @param {string} location - Region/State name
   * @returns {string} Soil information
   */
  async getSoilData(location = 'general') {
    try {
      console.log(`[SOIL-SERVICE] Fetching soil data for: ${location}`);

      const normalizedLocation = location.toLowerCase();
      
      // Check if we have data for this location
      for (const [region, data] of Object.entries(this.soilDatabase)) {
        if (normalizedLocation.includes(region)) {
          return this._formatSoilResponse(region, data);
        }
      }

      // Return general soil information
      return this._getGeneralSoilInfo();
    } catch (error) {
      console.error('[SOIL-SERVICE] Error:', error.message);
      return '⚠️ Unable to fetch soil data. Please try again.';
    }
  }

  /**
   * Get soil recommendations based on type
   */
  getSoilRecommendations(soilType) {
    const recommendations = {
      'loamy': {
        crops: 'Rice, Wheat, Cotton, Sugarcane, Vegetables',
        management: 'Add organic matter @ 10 tons/hectare. Minimal tillage needed.',
        ph: 'Ideal pH: 6-7'
      },
      'clay': {
        crops: 'Rice, Wheat, Gram, Soybean',
        management: 'Add organic matter & sand. Deep ploughing needed. Install drainage.',
        ph: 'pH: 7-8'
      },
      'sandy': {
        crops: 'Groundnut, Watermelon, Carrot, Potato',
        management: 'Add compost heavily. Frequent light irrigation. Mulching essential.',
        ph: 'pH: 6-7'
      },
      'black': {
        crops: 'Cotton, Soybean, Jowar, Wheat',
        management: 'Retains moisture excellently. Add gypsum if too sticky.',
        ph: 'pH: 7-8.5'
      },
      'red': {
        crops: 'Groundnut, Pulses, Millets, Cashew',
        management: 'Add lime to reduce acidity. Organic matter essential.',
        ph: 'pH: 5-6.5 (acidic)'
      },
      'alluvial': {
        crops: 'Rice, Wheat, Sugarcane, Vegetables',
        management: 'Very fertile. Regular NPK application needed.',
        ph: 'pH: 6-8'
      }
    };

    return recommendations[soilType.toLowerCase()] || recommendations['loamy'];
  }

  /**
   * Format soil response
   */
  _formatSoilResponse(region, data) {
    return `🌱 **Soil Information for ${region.toUpperCase()}:**

**Soil Type:** ${data.type}
**pH Level:** ${data.ph}
**Nutrient Status:**
  • Nitrogen (N): ${data.nitrogen}
  • Phosphorus (P): ${data.phosphorus}
  • Potassium (K): ${data.potassium}

**Recommended Crops:**
${this._getRecommendedCrops(data.type)}

**Management Tips:**
${this._getManagementTips(data.type)}

💡 **Tip:** Get a soil test done for accurate nutrient levels!`;
  }

  /**
   * Get recommended crops for soil type
   */
  _getRecommendedCrops(soilType) {
    const cropMap = {
      'Alluvial': '• Rice\n• Wheat\n• Sugarcane\n• Cotton\n• Vegetables',
      'Black': '• Cotton\n• Soybean\n• Jowar\n• Wheat\n• Sunflower',
      'Red': '• Groundnut\n• Pulses\n• Millets\n• Cashew\n• Cotton',
      'Laterite': '• Tea\n• Coffee\n• Cashew\n• Rubber\n• Coconut',
      'Arid/Sandy': '• Bajra\n• Jowar\n• Groundnut\n• Vegetables (with irrigation)',
      'Red/Black': '• Cotton\n• Pulses\n• Millets\n• Sugarcane'
    };

    return cropMap[soilType] || '• Consult local agriculture officer for best crops';
  }

  /**
   * Get management tips
   */
  _getManagementTips(soilType) {
    const tipsMap = {
      'Alluvial': '✅ Regular irrigation\n✅ Balanced NPK fertilizer\n✅ Crop rotation',
      'Black': '✅ Deep ploughing\n✅ Moisture retention excellent\n✅ Gypsum if sticky',
      'Red': '✅ Add lime (pH management)\n✅ Heavy organic matter\n✅ Micronutrients (Zn, B)',
      'Laterite': '✅ Mulching essential\n✅ Organic matter\n✅ Drip irrigation',
      'Arid/Sandy': '✅ Drip/sprinkler irrigation\n✅ Mulching\n✅ Green manuring',
      'Red/Black': '✅ Mixed soil benefits\n✅ Moderate irrigation\n✅ Regular FYM'
    };

    return tipsMap[soilType] || '✅ Get soil test\n✅ Add organic matter\n✅ Proper irrigation';
  }

  /**
   * General soil information
   */
  _getGeneralSoilInfo() {
    return `🌱 **General Soil Information:**

**Common Soil Types in India:**
1. **Alluvial Soil** (Most fertile - North India)
2. **Black Soil** (Cotton belt - Maharashtra, MP)
3. **Red Soil** (South India - TN, Karnataka)
4. **Laterite Soil** (High rainfall areas - Kerala)
5. **Desert/Arid Soil** (Rajasthan, Gujarat)

**Soil Testing Benefits:**
✅ Know nutrient levels
✅ Right fertilizer application
✅ Save costs
✅ Better yields

**Soil Health Card:**
Free soil testing by government! Contact local agriculture office.

💡 Specify your location for detailed soil information!`;
  }
}

module.exports = new SoilService();
