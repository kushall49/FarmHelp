const { ChatGroq } = require("@langchain/groq");
const { ConversationChain } = require("langchain/chains");
const { BufferMemory } = require("langchain/memory");
const { PromptTemplate } = require("@langchain/core/prompts");
const { DynamicTool } = require("@langchain/core/tools");
const { AgentExecutor, createReactAgent } = require("langchain/agents");

// Import existing services
const weatherService = require('./weatherService');
const priceService = require('./priceService');
const soilService = require('./soilService');
const newsService = require('./newsService');

/**
 * GROQ AI Service with LangChain
 * Uses Llama 3.3 70B for intelligent farming assistance
 */
class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    this.conversationMemory = new Map(); // Store per-user memory
    
    // Primary model for complex reasoning
    this.primaryModel = null;
    
    // Fast model for simple queries
    this.fastModel = null;
    
    // Tools for the agent
    this.tools = [];
    
    // Initialize if API key exists
    if (this.apiKey) {
      this._initializeModels();
      this._initializeTools();
    } else {
      console.warn('[GROQ-SERVICE] No GROQ_API_KEY found. Please add to .env file.');
      console.warn('[GROQ-SERVICE] Get free API key at: https://console.groq.com/keys');
    }
  }

  /**
   * Initialize GROQ models
   */
  _initializeModels() {
    try {
      // Primary: Llama 3.3 70B - Best reasoning
      this.primaryModel = new ChatGroq({
        apiKey: this.apiKey,
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        maxTokens: 600,
        streaming: false,
      });

      // Fast: Llama 3.1 8B - Quick responses
      this.fastModel = new ChatGroq({
        apiKey: this.apiKey,
        model: "llama-3.1-8b-instant",
        temperature: 0.5,
        maxTokens: 400,
        streaming: false,
      });

      console.log('[GROQ-SERVICE] ✅ Models initialized successfully');
    } catch (error) {
      console.error('[GROQ-SERVICE] Failed to initialize models:', error.message);
    }
  }

  /**
   * Initialize LangChain tools for existing services
   */
  _initializeTools() {
    this.tools = [
      // Weather Tool
      new DynamicTool({
        name: "get_weather",
        description: "Get current weather and forecast for any location in India. Input should be a city name like 'Bangalore', 'Delhi', 'Mumbai'.",
        func: async (location) => {
          try {
            const weather = await weatherService.getWeather(location);
            return weather;
          } catch (error) {
            return `Unable to fetch weather for ${location}. Error: ${error.message}`;
          }
        }
      }),

      // Crop Price Tool
      new DynamicTool({
        name: "get_crop_price",
        description: "Get current market prices and MSP (Minimum Support Price) for crops. Input should be crop name like 'rice', 'wheat', 'cotton', 'tomato'.",
        func: async (cropName) => {
          try {
            const price = await priceService.getCropPrices(cropName);
            return price;
          } catch (error) {
            return `Unable to fetch price for ${cropName}. Error: ${error.message}`;
          }
        }
      }),

      // Soil Recommendations Tool
      new DynamicTool({
        name: "get_soil_info",
        description: "Get soil recommendations, best crops, and management tips for different soil types. Input should be soil type like 'loamy', 'clay', 'sandy', 'black', 'red'.",
        func: async (soilType) => {
          try {
            const soilInfo = soilService.getSoilRecommendations(soilType);
            return `🌱 ${soilType.toUpperCase()} SOIL:\n\nBest Crops: ${soilInfo.crops}\n\nManagement: ${soilInfo.management}\n\npH: ${soilInfo.ph}`;
          } catch (error) {
            return `Unable to fetch soil info for ${soilType}. Error: ${error.message}`;
          }
        }
      }),

      // Agriculture News Tool
      new DynamicTool({
        name: "get_agriculture_news",
        description: "Get latest agriculture news, government schemes, and farming updates for Indian farmers.",
        func: async () => {
          try {
            const news = newsService.getGovernmentSchemes();
            return news;
          } catch (error) {
            return `Unable to fetch news. Error: ${error.message}`;
          }
        }
      })
    ];

    console.log('[GROQ-SERVICE] ✅ Tools initialized:', this.tools.map(t => t.name).join(', '));
  }

  /**
   * Main handler - intelligent routing to appropriate model
   */
  async generateResponse(userId, message, context = []) {
    if (!this.apiKey) {
      return this._getFallbackResponse();
    }

    try {
      console.log(`[GROQ-SERVICE] Processing message for user ${userId}: "${message}"`);
      
      // Route to appropriate model based on complexity
      const isSimple = this._isSimpleQuery(message);
      const model = isSimple ? this.fastModel : this.primaryModel;
      
      console.log(`[GROQ-SERVICE] Using ${isSimple ? 'FAST' : 'SMART'} model`);

      // Get or create conversation memory for this user
      const memory = this._getMemory(userId);

      // Create farming expert prompt
      const prompt = this._createFarmingPrompt(message);

      // Create conversation chain
      const chain = new ConversationChain({
        llm: model,
        memory: memory,
        verbose: false,
      });

      // Get response
      const response = await chain.call({
        input: prompt
      });

      return response.response;

    } catch (error) {
      console.error('[GROQ-SERVICE] Error:', error);
      return this._getErrorResponse(error);
    }
  }

  /**
   * Generate response with tool usage (agent mode)
   */
  async generateResponseWithTools(userId, message) {
    if (!this.apiKey || this.tools.length === 0) {
      return this._getFallbackResponse();
    }

    try {
      console.log(`[GROQ-SERVICE] Agent mode for: "${message}"`);

      // Check if message likely needs tools
      const needsTools = this._needsTools(message);
      
      if (!needsTools) {
        // Direct response without tools
        return await this.generateResponse(userId, message);
      }

      // Use agent with tools
      const memory = this._getMemory(userId);
      
      const agentPrompt = PromptTemplate.fromTemplate(`You are FarmBot, an expert agricultural advisor for Indian farmers.

You have access to these tools:
{tools}

Use them when needed to provide accurate information.

User question: {input}

Think step by step and use tools if needed.

{agent_scratchpad}`);

      const agent = await createReactAgent({
        llm: this.primaryModel,
        tools: this.tools,
        prompt: agentPrompt,
      });

      const executor = new AgentExecutor({
        agent,
        tools: this.tools,
        verbose: true,
        maxIterations: 3,
      });

      const result = await executor.invoke({
        input: message
      });

      return result.output;

    } catch (error) {
      console.error('[GROQ-SERVICE] Agent error:', error);
      return await this.generateResponse(userId, message);
    }
  }

  /**
   * Check if query is simple (use fast model)
   */
  _isSimpleQuery(message) {
    const simplePatterns = [
      /^(hi|hello|hey|good morning|good evening)/i,
      /^(thanks|thank you|bye|goodbye)/i,
      /^(what is|define)/i,
      /^weather\s+in/i,
      /^price\s+of/i,
      /^(yes|no|ok|okay)$/i,
    ];

    return simplePatterns.some(pattern => pattern.test(message.trim()));
  }

  /**
   * Check if message needs tool usage
   */
  _needsTools(message) {
    const toolKeywords = [
      /weather|forecast|rain|temperature/i,
      /price|market|msp|rate|cost/i,
      /soil|loamy|clay|sandy/i,
      /news|scheme|government|subsidy/i,
    ];

    return toolKeywords.some(pattern => pattern.test(message));
  }

  /**
   * Create farming-focused prompt
   */
  _createFarmingPrompt(message) {
    const systemContext = `You are FarmBot, an expert agricultural advisor specializing in Indian farming.

Your expertise:
- Crop selection and rotation strategies
- Soil management and fertilizer recommendations  
- Irrigation and water management techniques
- Pest and disease identification and control
- Market prices and profitability analysis
- Government schemes and subsidies for farmers
- Regional farming practices across India (Punjab, Maharashtra, Karnataka, etc.)

Guidelines:
✅ Provide practical, actionable advice
✅ Use simple language (farmers may not be highly educated)
✅ Include specific numbers (quantities, timings, costs in INR)
✅ Mention regional variations when relevant
✅ Suggest both modern and traditional methods
✅ Always prioritize farmer's profit and sustainability
✅ Use emojis for better readability (🌾 🌱 💧 🐛 💰)

Keep responses concise (200-300 words max) but complete.

User question: ${message}

Your helpful response:`;

    return systemContext;
  }

  /**
   * Get or create conversation memory for user
   */
  _getMemory(userId) {
    if (!this.conversationMemory.has(userId)) {
      const memory = new BufferMemory({
        returnMessages: true,
        memoryKey: "history",
        inputKey: "input",
        outputKey: "response",
      });
      this.conversationMemory.set(userId, memory);
    }

    return this.conversationMemory.get(userId);
  }

  /**
   * Clear conversation memory for user
   */
  clearMemory(userId) {
    this.conversationMemory.delete(userId);
    console.log(`[GROQ-SERVICE] Cleared memory for user ${userId}`);
  }

  /**
   * Fallback response when no API key
   */
  _getFallbackResponse() {
    return `🤖 **FarmBot AI Assistant**

To enable intelligent AI responses, please add your GROQ API key:

1. Get free API key from: https://console.groq.com/keys
2. Add to backend/.env file:
   GROQ_API_KEY=your_key_here
3. Restart the backend server

I can still help with:
✅ Weather information
✅ Crop prices
✅ Soil recommendations  
✅ Government schemes
✅ Pre-loaded farming knowledge

What would you like to know?`;
  }

  /**
   * Error response
   */
  _getErrorResponse(error) {
    if (error.message?.includes('rate limit')) {
      return '⏳ Too many requests. Please wait a moment and try again.';
    }
    
    if (error.message?.includes('API key')) {
      return '🔑 Invalid GROQ API key. Please check your .env file configuration.';
    }

    return '⚠️ I encountered an error processing your request. Please try rephrasing your question or ask something else.';
  }

  /**
   * Check if service is ready
   */
  isReady() {
    return !!(this.apiKey && this.primaryModel && this.fastModel);
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      ready: this.isReady(),
      hasApiKey: !!this.apiKey,
      modelsInitialized: !!(this.primaryModel && this.fastModel),
      toolsCount: this.tools.length,
      activeConversations: this.conversationMemory.size,
    };
  }
}

module.exports = new GroqService();
