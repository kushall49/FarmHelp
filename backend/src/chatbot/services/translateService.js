const axios = require('axios');

/**
 * Translation Service - Multilingual support
 * Integrates with LibreTranslate (free) or Google Translate
 */
class TranslateService {
  constructor() {
    // Using LibreTranslate free API
    this.apiUrl = 'https://libretranslate.de/translate';
    
    // Supported languages for farming
    this.supportedLanguages = {
      'en': 'English',
      'hi': 'Hindi',
      'ta': 'Tamil',
      'te': 'Telugu',
      'mr': 'Marathi',
      'bn': 'Bengali',
      'gu': 'Gujarati',
      'kn': 'Kannada',
      'ml': 'Malayalam',
      'pa': 'Punjabi'
    };
  }

  /**
   * Translate text
   * @param {string} text - Text to translate
   * @param {string} targetLang - Target language code
   * @param {string} sourceLang - Source language (auto-detect if empty)
   * @returns {string} Translated text
   */
  async translate(text, targetLang = 'hi', sourceLang = 'en') {
    try {
      console.log(`[TRANSLATE-SERVICE] Translating to ${targetLang}: ${text}`);

      const response = await axios.post(this.apiUrl, {
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      if (response.data && response.data.translatedText) {
        return this._formatTranslationResponse(text, response.data.translatedText, sourceLang, targetLang);
      } else {
        return this._getFallbackTranslation(text, targetLang);
      }
    } catch (error) {
      console.error('[TRANSLATE-SERVICE] Error:', error.message);
      return this._getFallbackTranslation(text, targetLang);
    }
  }

  /**
   * Detect language from query and translate
   */
  async handleTranslationQuery(query) {
    try {
      // Extract target language from query
      const langMatch = query.match(/to\s+(hindi|tamil|telugu|marathi|bengali|gujarati|kannada|malayalam|punjabi|english)/i);
      
      if (!langMatch) {
        return this._getLanguageHelp();
      }

      const targetLangName = langMatch[1].toLowerCase();
      const targetLang = this._getLangCode(targetLangName);

      // Extract text to translate
      const textMatch = query.match(/translate\s+(?:to\s+\w+\s+)?[:"']?(.*?)[:"']?$/i) ||
                       query.match(/[:"'](.*?)[:"']\s+to\s+\w+/i);

      if (textMatch && textMatch[1]) {
        return await this.translate(textMatch[1].trim(), targetLang);
      }

      return `Please provide text to translate. Example: "translate to Hindi: good morning"`;
    } catch (error) {
      console.error('[TRANSLATE-SERVICE] Query handling error:', error.message);
      return this._getLanguageHelp();
    }
  }

  /**
   * Get farming terms in multiple languages
   */
  getFarmingTerms(language = 'hi') {
    const terms = {
      'hi': {
        'farmer': 'किसान (Kisan)',
        'crop': 'फसल (Fasal)',
        'seed': 'बीज (Beej)',
        'irrigation': 'सिंचाई (Sinchai)',
        'fertilizer': 'खाद (Khaad)',
        'harvest': 'कटाई (Katai)',
        'soil': 'मिट्टी (Mitti)',
        'weather': 'मौसम (Mausam)'
      },
      'ta': {
        'farmer': 'விவசாயி (Vivasayi)',
        'crop': 'பயிர் (Payir)',
        'seed': 'விதை (Vithai)',
        'irrigation': 'நீர்ப்பாசனம் (Neerpaasanam)',
        'fertilizer': 'உரம் (Uram)',
        'harvest': 'அறுவடை (Aruvadai)',
        'soil': 'மண் (Mann)',
        'weather': 'வானிலை (Vaanilai)'
      },
      'te': {
        'farmer': 'రైతు (Raitu)',
        'crop': 'పంట (Panta)',
        'seed': 'విత్తనం (Vittanam)',
        'irrigation': 'నీటిపారుదల (Neetiparudala)',
        'fertilizer': 'ఎరువు (Eruvu)',
        'harvest': 'కోత (Kota)',
        'soil': 'మట్టి (Matti)',
        'weather': 'వాతావరణం (Vaatavaranam)'
      }
    };

    const langTerms = terms[language] || terms['hi'];
    
    let response = `📚 **Common Farming Terms in ${this.supportedLanguages[language]}:**\n\n`;
    
    Object.entries(langTerms).forEach(([eng, local]) => {
      response += `• ${eng}: ${local}\n`;
    });

    return response;
  }

  /**
   * Format translation response
   */
  _formatTranslationResponse(original, translated, sourceLang, targetLang) {
    return `🌐 **Translation:**

**Original (${this.supportedLanguages[sourceLang]}):**
${original}

**Translated (${this.supportedLanguages[targetLang]}):**
${translated}

💡 Need more translations? Just ask!`;
  }

  /**
   * Get language code from name
   */
  _getLangCode(langName) {
    const mapping = {
      'hindi': 'hi',
      'tamil': 'ta',
      'telugu': 'te',
      'marathi': 'mr',
      'bengali': 'bn',
      'gujarati': 'gu',
      'kannada': 'kn',
      'malayalam': 'ml',
      'punjabi': 'pa',
      'english': 'en'
    };

    return mapping[langName.toLowerCase()] || 'hi';
  }

  /**
   * Fallback translations for common farming phrases
   */
  _getFallbackTranslation(text, targetLang) {
    const fallbacks = {
      'hi': {
        'good morning': 'सुप्रभात (Suprabhat)',
        'thank you': 'धन्यवाद (Dhanyavaad)',
        'how are you': 'आप कैसे हैं? (Aap kaise hain?)',
        'hello': 'नमस्ते (Namaste)',
        'farmer': 'किसान (Kisan)',
        'crop': 'फसल (Fasal)'
      }
    };

    const langFallbacks = fallbacks[targetLang] || {};
    const translation = langFallbacks[text.toLowerCase()];

    if (translation) {
      return this._formatTranslationResponse(text, translation, 'en', targetLang);
    }

    return `⚠️ Translation service temporarily unavailable. Supported languages: Hindi, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi.

Try: "translate to Hindi: good morning"`;
  }

  /**
   * Language help message
   */
  _getLanguageHelp() {
    return `🌐 **Translation Service:**

**Supported Languages:**
• Hindi (हिंदी)
• Tamil (தமிழ்)
• Telugu (తెలుగు)
• Marathi (मराठी)
• Bengali (বাংলা)
• Gujarati (ગુજરાતી)
• Kannada (ಕನ್ನಡ)
• Malayalam (മലയാളം)
• Punjabi (ਪੰਜਾਬੀ)

**How to Use:**
"translate to Hindi: good morning"
"translate to Tamil: how to grow rice"

**Get Farming Terms:**
"farming terms in Hindi"

💡 Try translating a phrase now!`;
  }
}

module.exports = new TranslateService();
