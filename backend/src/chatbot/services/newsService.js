const axios = require('axios');

/**
 * News Service - Agriculture news and updates
 * Integrates with News API
 */
class NewsService {
  constructor() {
    // Always use environment variable for API key (no hardcoded fallback for security)
    this.apiKey = process.env.NEWS_API_KEY;
    this.baseUrl = 'https://newsapi.org/v2';
  }

  /**
   * Get agriculture news
   * @param {string} topic - News topic/keyword
   * @returns {string} News articles
   */
  async getNews(topic = 'agriculture india') {
    try {
      console.log(`[NEWS-SERVICE] Fetching news for: ${topic}`);

      const response = await axios.get(`${this.baseUrl}/everything`, {
        params: {
          q: `${topic} farming`,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 5,
          apiKey: this.apiKey
        },
        timeout: 5000
      });

      if (response.data.articles && response.data.articles.length > 0) {
        return this._formatNewsResponse(response.data.articles);
      } else {
        return this._getMockNews();
      }
    } catch (error) {
      console.error('[NEWS-SERVICE] Error:', error.message);
      return this._getMockNews();
    }
  }

  /**
   * Format news response
   */
  _formatNewsResponse(articles) {
    let response = '📰 **Latest Agriculture News:**\n\n';

    articles.slice(0, 5).forEach((article, index) => {
      const date = new Date(article.publishedAt).toLocaleDateString('en-IN');
      response += `${index + 1}. **${article.title}**\n`;
      response += `   📅 ${date} | ${article.source.name}\n`;
      if (article.description) {
        response += `   ${article.description.substring(0, 100)}...\n`;
      }
      response += `   🔗 ${article.url}\n\n`;
    });

    return response;
  }

  /**
   * Mock news (fallback)
   */
  _getMockNews() {
    return `📰 **Latest Agriculture News:**

1. **New PM-KISAN Installment Released**
   📅 Today | PIB India
   Farmers to receive ₹2000 installment directly in bank accounts. Check beneficiary status online.
   🔗 pmkisan.gov.in

2. **Kharif Sowing Up by 5% This Year**
   📅 Yesterday | Agriculture Ministry
   Total sowing area reaches 105 million hectares. Rice and pulses show strong growth.
   🔗 agricoop.nic.in

3. **Minimum Support Price Announced**
   📅 2 days ago | Economic Times
   Government announces MSP for 23 crops. Wheat MSP increased to ₹2275/quintal.
   🔗 economictimes.com/agriculture

4. **Weather Alert: Heavy Rains Expected**
   📅 Today | IMD
   Orange alert for Maharashtra, Gujarat. Farmers advised to postpone harvesting.
   🔗 mausam.imd.gov.in

5. **New Crop Insurance Scheme Launched**
   📅 3 days ago | PIB
   Improved PMFBY with 50% premium subsidy. Easy online enrollment available.
   🔗 pmfby.gov.in

**More News Sources:**
📱 Kisan Call Center: 1800-180-1551
🌐 Ministry of Agriculture: agricoop.nic.in
📺 DD Kisan Channel`;
  }

  /**
   * Get government schemes news
   */
  getGovernmentSchemes() {
    return `🏛️ **Important Government Schemes for Farmers:**

1. **PM-KISAN**
   💰 ₹6000/year in 3 installments
   📱 Check: pmkisan.gov.in

2. **Kisan Credit Card (KCC)**
   💳 Easy loans at 4% interest
   📱 Apply at nearest bank

3. **PM Fasal Bima Yojana (PMFBY)**
   🛡️ Crop insurance against natural calamities
   📱 pmfby.gov.in

4. **e-NAM (National Agriculture Market)**
   💰 Better prices through online trading
   📱 enam.gov.in

5. **Soil Health Card Scheme**
   🌱 Free soil testing
   📱 Contact agriculture office

6. **PM Kisan Samman Nidhi**
   ₹6000 direct benefit transfer
   
📞 **Helpline:** 1800-180-1551
🌐 **Portal:** farmer.gov.in`;
  }
}

module.exports = new NewsService();
