# 🤖 GROQ AI Chatbot Setup Guide

## 🚀 Overview

Your FarmBot chatbot is now powered by **GROQ AI + LangChain** for intelligent, context-aware responses!

### What's New:
- ✅ **Llama 3.3 70B** - Best-in-class reasoning model
- ✅ **Lightning Fast** - 500+ tokens/second (vs OpenAI's 20-50)
- ✅ **Context-Aware** - Remembers conversation history
- ✅ **Tool Integration** - Automatically uses weather, price, soil services
- ✅ **Smart Routing** - Fast model for simple questions, smart model for complex ones
- ✅ **FREE Tier** - Generous free quota to get started

---

## 📦 Installation

### Step 1: Install Required Packages

```bash
cd backend
npm install @langchain/groq langchain @langchain/core @langchain/community
```

### Step 2: Get GROQ API Key (FREE)

1. Visit: https://console.groq.com/keys
2. Sign up with GitHub/Google (takes 1 minute)
3. Click "Create API Key"
4. Copy the key (starts with `gsk_...`)

### Step 3: Add API Key to Environment

1. Open `backend/.env` file
2. Add this line:
   ```
   GROQ_API_KEY=gsk_your_actual_key_here
   ```
3. Save the file

### Step 4: Restart Backend

```bash
# Stop the backend (Ctrl+C)
# Then restart:
npm run dev
```

---

## ✅ Verify Installation

Look for these messages in console:

```
[GROQ-SERVICE] ✅ Models initialized successfully
[GROQ-SERVICE] ✅ Tools initialized: get_weather, get_crop_price, get_soil_info, get_agriculture_news
[CHATBOT-CONTROLLER] ✅ GROQ AI Service is READY!
```

---

## 🎯 How It Works

### Architecture:

```
User Question
     ↓
1. Check for small talk (hello, thanks, bye) → Instant response
     ↓
2. Detect intent (weather, price, soil, etc.) → Use specialized service
     ↓
3. Check knowledge base → Pre-written farming facts
     ↓
4. [NEW] GROQ AI with LangChain → Intelligent reasoning
     - Simple questions → Llama 3.1 8B Instant (ultra fast)
     - Complex questions → Llama 3.3 70B Versatile (smart reasoning)
     - Tool integration → Automatically fetches weather/prices/soil data
```

### Smart Model Selection:

**Fast Model (Llama 3.1 8B)** used for:
- Greetings: "Hello", "Hi"
- Simple queries: "What is rice farming?"
- Weather: "Weather in Bangalore"
- Prices: "Price of wheat"

**Smart Model (Llama 3.3 70B)** used for:
- Comparisons: "Cotton vs soybean profitability"
- Analysis: "Why are my tomato leaves yellow?"
- Planning: "Crop rotation strategy for 5 acres"
- Multi-step reasoning: "Best irrigation for loamy soil in Punjab"

---

## 🛠️ Advanced Configuration

### Change Models

Edit `backend/src/chatbot/services/groqService.js`:

```javascript
// Available GROQ models:
"llama-3.3-70b-versatile"   // Best reasoning (current)
"llama-3.1-70b-versatile"   // Very good
"llama-3.1-8b-instant"      // Ultra fast (current for simple queries)
"mixtral-8x7b-32768"        // Multi-lingual
"gemma2-9b-it"              // Efficient
```

### Adjust Temperature

Lower = More factual, Higher = More creative

```javascript
this.primaryModel = new ChatGroq({
  temperature: 0.7,  // Default (balanced)
  // temperature: 0.3,  // More factual for farming data
  // temperature: 0.9,  // More creative for advice
});
```

### Adjust Response Length

```javascript
this.primaryModel = new ChatGroq({
  maxTokens: 600,  // Default
  // maxTokens: 300,  // Shorter responses
  // maxTokens: 1000, // Longer explanations
});
```

---

## 📊 Testing

### Test Simple Query (Fast Model):

**Input:** "Weather in Delhi"

**Expected:** 
- Uses Llama 3.1 8B Instant
- Calls `get_weather` tool automatically
- Response in < 1 second

### Test Complex Query (Smart Model):

**Input:** "I have 10 acres of black soil with moderate rainfall. Should I grow cotton or soybean? Consider profit and risk."

**Expected:**
- Uses Llama 3.3 70B Versatile
- Deep reasoning with multiple factors
- Response in 2-3 seconds
- Detailed comparison with recommendations

### Test Tool Usage:

**Input:** "What's the tomato price and will rain affect it?"

**Expected:**
- Calls `get_crop_price` tool
- Calls `get_weather` tool
- Combines both in intelligent response

---

## 🐛 Troubleshooting

### Issue: "GROQ AI Service not configured"

**Solution:**
1. Check `.env` file has `GROQ_API_KEY=gsk_...`
2. Restart backend server
3. Check console for error messages

### Issue: "Invalid API key"

**Solution:**
1. Verify key starts with `gsk_`
2. No extra spaces or quotes in `.env`
3. Generate new key at console.groq.com

### Issue: "Rate limit exceeded"

**Solution:**
- Free tier limits: ~14,400 requests/day
- Upgrade at console.groq.com for higher limits
- Or add delay between requests

### Issue: Packages not installed

**Solution:**
```bash
cd backend
npm install @langchain/groq langchain @langchain/core @langchain/community
```

---

## 💡 Usage Examples

### Before GROQ (Scripted):

**User:** "My tomato plant has yellow leaves"
**Bot:** Generic disease info ❌

### After GROQ (Intelligent):

**User:** "My tomato plant has yellow leaves and white spots on stems"
**Bot:** "Based on your description, this sounds like **early blight** (fungal disease). Here's what to do:

1. **Immediate Action:**
   - Remove infected leaves
   - Destroy them (don't compost)
   
2. **Treatment:**
   - Apply copper-based fungicide
   - Mix 2-3g/liter water
   - Spray every 7-10 days
   
3. **Prevention:**
   - Improve air circulation
   - Avoid overhead watering
   - Water in morning only
   - Add mulch around base
   
4. **Products:** Mancozeb 75% WP or Copper Oxychloride

**Cost:** ~₹200-300 per acre

Would you like specific product recommendations?" ✅

---

## 📈 Performance Metrics

### GROQ vs OpenAI:

| Metric | GROQ (Llama 70B) | OpenAI (GPT-4) |
|--------|------------------|----------------|
| Speed | ~500 tokens/sec | ~20-50 tokens/sec |
| Cost (Free Tier) | 14,400 req/day | 3 req/min |
| Context Window | 128K tokens | 8K-128K tokens |
| Reasoning | Excellent | Excellent |
| Farming Knowledge | Very Good | Excellent |

### Recommendation:
- **GROQ** for production (speed + cost)
- **OpenAI** for advanced reasoning (optional backup)

---

## 🎓 Next Steps

1. ✅ Add GROQ API key
2. ✅ Test with sample questions
3. ✅ Monitor console logs
4. ✅ Adjust temperature/tokens if needed
5. ✅ Share with users and collect feedback
6. 📊 Monitor usage at console.groq.com

---

## 🤝 Support

- **GROQ Docs:** https://console.groq.com/docs
- **LangChain Docs:** https://js.langchain.com/docs
- **Get API Key:** https://console.groq.com/keys

---

**Built with ❤️ for Indian Farmers** 🌾

*Last Updated: April 2026*
