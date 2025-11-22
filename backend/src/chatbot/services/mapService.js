const axios = require('axios');

/**
 * Map Service - Location and mapping services
 * Integrates with OpenStreetMap/Google Maps
 */
class MapService {
  constructor() {
    this.geocodeUrl = 'https://nominatim.openstreetmap.org';
    this.userAgent = 'FarmHelp/1.0';
  }

  /**
   * Get location information
   * @param {string} query - Location query
   * @returns {string} Location information
   */
  async getLocationInfo(query) {
    try {
      console.log(`[MAP-SERVICE] Searching for: ${query}`);

      const response = await axios.get(`${this.geocodeUrl}/search`, {
        params: {
          q: query + ' India',
          format: 'json',
          limit: 3
        },
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: 5000
      });

      if (response.data && response.data.length > 0) {
        return this._formatLocationResponse(response.data);
      } else {
        return `❌ Location "${query}" not found. Please try with a more specific name.`;
      }
    } catch (error) {
      console.error('[MAP-SERVICE] Error:', error.message);
      return '⚠️ Unable to fetch location data. Please try again.';
    }
  }

  /**
   * Find nearest mandi/market
   */
  async findNearestMandi(location) {
    try {
      // Mock data - Replace with real mandi API
      const mandis = {
        'delhi': ['Azadpur Mandi', 'Ghazipur Mandi', 'Okhla Mandi'],
        'mumbai': ['Vashi APMC', 'Dadar Market', 'Crawford Market'],
        'bangalore': ['KR Market', 'Yeshwanthpur APMC', 'Malleswaram Market'],
        'pune': ['Market Yard Gultekdi', 'Hadapsar Market'],
        'chennai': ['Koyambedu Market', 'Madhavaram Market']
      };

      const normalizedLocation = location.toLowerCase();
      
      for (const [city, markets] of Object.entries(mandis)) {
        if (normalizedLocation.includes(city)) {
          return this._formatMandiResponse(city, markets);
        }
      }

      return `📍 **Nearby Mandis/Markets:**

To find mandis near you:
1. Visit e-NAM portal: https://www.enam.gov.in
2. Use "Market" section
3. Select your state and district

Or contact your local agriculture office:
📞 Kisan Call Center: 1800-180-1551

💡 Specify your city for specific mandi locations!`;
    } catch (error) {
      console.error('[MAP-SERVICE] Mandi search error:', error.message);
      return 'Unable to find nearby mandis.';
    }
  }

  /**
   * Format location response
   */
  _formatLocationResponse(locations) {
    let response = '📍 **Location Found:**\n\n';

    locations.slice(0, 3).forEach((loc, index) => {
      response += `${index + 1}. **${loc.display_name}**\n`;
      response += `   📍 Coordinates: ${loc.lat}, ${loc.lon}\n`;
      response += `   🗺️ [View on Map](https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lon})\n\n`;
    });

    response += `**Navigation:**
🚗 Google Maps: https://maps.google.com
🗺️ OpenStreetMap: https://www.openstreetmap.org`;

    return response;
  }

  /**
   * Format mandi response
   */
  _formatMandiResponse(city, markets) {
    let response = `📍 **Mandis/Markets in ${city.toUpperCase()}:**\n\n`;

    markets.forEach((market, index) => {
      response += `${index + 1}. ${market}\n`;
    });

    response += `\n**Facilities Available:**
✅ Wholesale trading
✅ Quality grading
✅ Online auction (e-NAM)
✅ Cold storage (at some locations)
✅ Banking services

**Tips for Getting Better Prices:**
• Visit mandi on peak trading days
• Get your produce properly graded
• Join FPO (Farmer Producer Organization)
• Check e-NAM rates before selling

🌐 **e-NAM Portal:** https://www.enam.gov.in
📞 **Helpline:** 1800-270-0224`;

    return response;
  }

  /**
   * Get agriculture office locations
   */
  getAgricultureOffices() {
    return `🏢 **Agriculture Department Offices:**

**How to Find:**
1. Visit your district collectorate
2. Look for "Agriculture Department" section
3. Or search: "[Your District] Agriculture Office"

**Services Available:**
✅ Soil testing
✅ Seeds & fertilizers (subsidized)
✅ Farm equipment on rent
✅ Agricultural loans guidance
✅ Crop insurance enrollment
✅ Training programs

**Key Contacts:**
📞 Kisan Call Center: 1800-180-1551
🌐 State Agriculture Portal
💻 agricoop.nic.in

💡 Provide your district name for specific office location!`;
  }
}

module.exports = new MapService();
