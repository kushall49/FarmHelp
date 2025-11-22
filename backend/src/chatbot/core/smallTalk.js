/**
 * Small Talk - Predefined responses for casual conversations
 */
class SmallTalk {
  constructor() {
    this.responses = {
      greetings: [
        "Hello! 👋 I'm your farming assistant. How can I help you today?",
        "Hi there! 🌱 Ready to help with your farming queries!",
        "Namaste! 🙏 Ask me anything about farming, crops, weather, or market prices!",
        "Hey! 👨‍🌾 I'm here to assist with all your agriculture needs!"
      ],
      farewell: [
        "Goodbye! 👋 Happy farming! Feel free to return anytime.",
        "Take care! 🌱 Wishing you a bountiful harvest!",
        "See you! Come back if you need any farming advice.",
        "Bye! 👋 May your fields prosper!"
      ],
      thanks: [
        "You're welcome! 😊 Happy to help!",
        "Glad I could assist! 🌱 Feel free to ask more questions.",
        "Anytime! That's what I'm here for! 👨‍🌾",
        "My pleasure! 🙏 Keep growing!"
      ],
      how_are_you: [
        "I'm doing great, thank you! 🌱 Ready to help with your farming needs!",
        "All good! 😊 More importantly, how are your crops doing?",
        "I'm here and ready to assist! 💪 What can I help you with?",
        "Functioning perfectly! 🤖 How can I support your farming today?"
      ],
      who_are_you: [
        "I'm FarmHelp AI! 🤖 Your intelligent farming assistant powered by AI. I can help with crop recommendations, weather, prices, disease detection, and much more!",
        "I'm your agriculture companion! 👨‍🌾 Ask me about crops, weather, soil, market prices, or any farming-related questions!",
        "I'm FarmHelp Bot! 🌱 Built to support farmers with AI-powered advice on agriculture, livestock, and farm management!"
      ],
      what_can_you_do: [
        "I can help you with:\n✅ Crop recommendations\n✅ Weather forecasts\n✅ Market prices\n✅ Soil information\n✅ Disease detection\n✅ Agriculture news\n✅ Location & mandis\n✅ Translation\n✅ General farming advice\n\nJust ask me anything! 🌱",
        "Lots of things! 😊\n• Weather updates\n• Crop prices\n• Soil health\n• Plant disease diagnosis\n• Farming tips\n• Government schemes\n• News & updates\n\nWhat would you like to know? 👨‍🌾"
      ],
      joke: [
        "Why did the farmer win an award? Because he was outstanding in his field! 😄🌾",
        "What do you call a sleeping bull? A bulldozer! 😴🐂",
        "Why did the scarecrow become a successful neurosurgeon? He was outstanding in his field! 🧠🌾",
        "What did the farmer say when he lost his tractor? Where's my tractor?! 🚜😅",
        "Why don't farmers tell secrets in cornfields? Too many ears around! 🌽👂"
      ],
      motivation: [
        "\"The farmer is the only man in our economy who buys everything at retail, sells everything at wholesale, and pays the freight both ways.\" - John F. Kennedy 💪",
        "Keep going! 🌱 Every seed you plant is an investment in the future!",
        "Agriculture is the most healthful, most useful, and most noble employment of man! 👨‍🌾",
        "Remember: The best fertilizer is the farmer's shadow on the land! 🌾☀️",
        "You're not just a farmer - you're feeding the nation! 🇮🇳 Keep up the great work!"
      ],
      confused: [
        "I didn't quite understand that. Could you rephrase? 🤔",
        "Hmm, I'm not sure what you mean. Try asking about crops, weather, prices, or farming tips! 🌱",
        "Sorry, I didn't get that. You can ask me about:\n• Weather\n• Crop prices\n• Soil info\n• Diseases\n• Farming tips",
        "Could you clarify? I'm here to help with farming-related questions! 👨‍🌾"
      ],
      bad_words: [
        "Let's keep it respectful! 🙏 I'm here to help with farming questions.",
        "Please use polite language. How can I assist you with farming today? 🌱",
        "I understand you might be frustrated. Let's focus on solving your farming needs! 👨‍🌾"
      ]
    };
  }

  /**
   * Get response for small talk
   * @param {string} message - User message
   * @returns {string|null} Small talk response or null
   */
  getResponse(message) {
    const normalized = message.toLowerCase().trim();

    // Greetings
    if (this._matches(normalized, ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good evening', 'good afternoon'])) {
      return this._random(this.responses.greetings);
    }

    // Farewell
    if (this._matches(normalized, ['bye', 'goodbye', 'see you', 'take care', 'exit'])) {
      return this._random(this.responses.farewell);
    }

    // Thanks
    if (this._matches(normalized, ['thank', 'thanks', 'dhanyavaad', 'shukriya'])) {
      return this._random(this.responses.thanks);
    }

    // How are you
    if (this._matches(normalized, ['how are you', 'how r u', 'whatsup', "what's up", 'kaise ho'])) {
      return this._random(this.responses.how_are_you);
    }

    // Who are you
    if (this._matches(normalized, ['who are you', 'what are you', 'your name', 'who r u'])) {
      return this._random(this.responses.who_are_you);
    }

    // What can you do
    if (this._matches(normalized, ['what can you do', 'help me', 'capabilities', 'features', 'how can you help'])) {
      return this._random(this.responses.what_can_you_do);
    }

    // Joke
    if (this._matches(normalized, ['joke', 'funny', 'make me laugh', 'tell joke'])) {
      return this._random(this.responses.joke);
    }

    // Motivation
    if (this._matches(normalized, ['motivate', 'inspire', 'quote', 'motivation', 'feel bad', 'depressed'])) {
      return this._random(this.responses.motivation);
    }

    // No match
    return null;
  }

  /**
   * Check if message matches any patterns
   */
  _matches(message, patterns) {
    return patterns.some(pattern => message.includes(pattern));
  }

  /**
   * Get random response from array
   */
  _random(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Check for bad words
   */
  containsBadWords(message) {
    const badWords = ['fuck', 'shit', 'damn', 'hell', 'stupid', 'idiot', 'bastard', 'bitch'];
    const normalized = message.toLowerCase();
    return badWords.some(word => normalized.includes(word));
  }

  /**
   * Get bad word response
   */
  getBadWordResponse() {
    return this._random(this.responses.bad_words);
  }
}

module.exports = new SmallTalk();
