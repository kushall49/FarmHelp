const axios = require('axios');

/**
 * Price Service - Provides crop market prices
 * Integrates with government eNAM API or mock data
 */
class PriceService {
  constructor() {
    // Mock price data (Replace with real API)
    this.priceDatabase = {
      'rice': { price: '2800-3200', unit: 'quintal', market: 'Delhi Mandi', trend: 'stable' },
      'wheat': { price: '2400-2600', unit: 'quintal', market: 'Punjab Mandi', trend: 'rising' },
      'cotton': { price: '6500-7000', unit: 'quintal', market: 'Maharashtra', trend: 'falling' },
      'sugarcane': { price: '310-350', unit: 'quintal', market: 'UP', trend: 'stable' },
      'maize': { price: '1900-2100', unit: 'quintal', market: 'Karnataka', trend: 'rising' },
      'soybean': { price: '4500-4800', unit: 'quintal', market: 'MP Mandi', trend: 'stable' },
      'groundnut': { price: '5500-6000', unit: 'quintal', market: 'Gujarat', trend: 'rising' },
      'tomato': { price: '20-35', unit: 'kg', market: 'Local Market', trend: 'volatile' },
      'potato': { price: '15-25', unit: 'kg', market: 'UP', trend: 'falling' },
      'onion': { price: '30-45', unit: 'kg', market: 'Maharashtra', trend: 'rising' }
    };

    // MSP (Minimum Support Price) data
    this.mspData = {
      'rice': '2183',
      'wheat': '2275',
      'cotton': '6620',
      'sugarcane': '315',
      'maize': '2090',
      'soybean': '4600'
    };
  }

  /**
   * Get crop prices
   * @param {string} crop - Crop name
   * @returns {string} Price information
   */
  async getCropPrices(crop = '') {
    try {
      console.log(`[PRICE-SERVICE] Fetching prices for: ${crop}`);

      const normalizedCrop = crop.toLowerCase().trim();

      // Search for specific crop
      for (const [cropName, data] of Object.entries(this.priceDatabase)) {
        if (normalizedCrop.includes(cropName) || cropName.includes(normalizedCrop)) {
          return this._formatPriceResponse(cropName, data);
        }
      }

      // Return general price information
      return this._getGeneralPriceInfo();
    } catch (error) {
      console.error('[PRICE-SERVICE] Error:', error.message);
      return '⚠️ Unable to fetch price data. Please try again.';
    }
  }

  /**
   * Get MSP (Minimum Support Price)
   */
  getMSP(crop) {
    const normalizedCrop = crop.toLowerCase();
    
    for (const [cropName, msp] of Object.entries(this.mspData)) {
      if (normalizedCrop.includes(cropName)) {
        return `💰 **MSP for ${cropName.toUpperCase()}:** ₹${msp}/quintal (Government declared)`;
      }
    }

    return null;
  }

  /**
   * Format price response
   */
  _formatPriceResponse(crop, data) {
    const trendEmoji = {
      'rising': '📈',
      'falling': '📉',
      'stable': '➡️',
      'volatile': '📊'
    };

    let response = `💰 **Market Price for ${crop.toUpperCase()}:**

**Current Price:** ₹${data.price}/${data.unit}
**Market:** ${data.market}
**Trend:** ${trendEmoji[data.trend]} ${data.trend.toUpperCase()}

`;

    // Add MSP if available
    const msp = this.getMSP(crop);
    if (msp) {
      response += `${msp}\n\n`;
    }

    response += `**Marketing Tips:**
✅ Check daily mandi rates on e-NAM portal
✅ Avoid distress sale immediately after harvest
✅ Proper grading & packaging gets better prices
✅ Consider storage for off-season rates
✅ FPOs (Farmer Producer Organizations) get better prices

📱 **e-NAM Portal:** https://www.enam.gov.in
📞 **Call:** 1800-270-0224 for mandi rates`;

    return response;
  }

  /**
   * General price information
   */
  _getGeneralPriceInfo() {
    return `💰 **Crop Market Prices:**

**Major Crops (Latest Rates):**
• Rice: ₹2800-3200/quintal
• Wheat: ₹2400-2600/quintal
• Cotton: ₹6500-7000/quintal
• Maize: ₹1900-2100/quintal
• Soybean: ₹4500-4800/quintal

**Vegetables:**
• Tomato: ₹20-35/kg
• Potato: ₹15-25/kg
• Onion: ₹30-45/kg

**How to Check Prices:**
1. **e-NAM Portal** - Real-time mandi rates
2. **Kisan Call Center** - 1800-180-1551
3. **Mobile Apps** - Kisan Suvidha, AgriMarket

💡 Specify a crop name to get detailed pricing!`;
  }
}

module.exports = new PriceService();
