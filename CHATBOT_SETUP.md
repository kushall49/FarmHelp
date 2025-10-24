# 🤖 FarmMate Chatbot - Hugging Face Integration Guide

## Overview
The FarmMate chatbot now uses **Hugging Face's free Inference API** instead of OpenAI. This gives you access to powerful open-source AI models completely free!

## 🚀 Quick Setup

### 1. Get Your Free Hugging Face API Key
1. Go to [https://huggingface.co/join](https://huggingface.co/join) and create a free account
2. Go to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
3. Click "New token" → Give it a name (e.g., "FarmMate") → Select "Read" access
4. Copy the token (starts with `hf_...`)

### 2. Add API Key to Backend
Open `backend/.env` and add your key:
```env
HUGGINGFACE_API_KEY=hf_your_token_here
```

### 3. Restart Backend Server
```bash
cd backend
node src/server.js
```

## 🤖 Recommended Chatbot Models

### Best Models for Farming Assistant:

#### 1. **microsoft/DialoGPT-medium** (DEFAULT - RECOMMENDED ✅)
- **Speed**: ⚡ Fast (2-5 seconds)
- **Quality**: Good conversational ability
- **Use Case**: General farming Q&A, quick responses
- **API Limits**: Free, no approval needed
- **Best For**: Getting started, testing

```env
CHAT_MODEL=microsoft/DialoGPT-medium
```

#### 2. **facebook/blenderbot-400M-distill**
- **Speed**: ⚡ Fast (2-4 seconds)
- **Quality**: Better context understanding
- **Use Case**: Detailed farming conversations
- **API Limits**: Free, no approval needed
- **Best For**: More natural conversations

```env
CHAT_MODEL=facebook/blenderbot-400M-distill
```

#### 3. **mistralai/Mistral-7B-Instruct-v0.1** (POWERFUL 🔥)
- **Speed**: 🐢 Slower (10-20 seconds first load)
- **Quality**: Excellent, very knowledgeable
- **Use Case**: Complex farming advice, detailed answers
- **API Limits**: Free but may need token approval
- **Best For**: Production use with best quality

```env
CHAT_MODEL=mistralai/Mistral-7B-Instruct-v0.1
```

#### 4. **tiiuae/falcon-7b-instruct**
- **Speed**: 🐢 Slower (10-15 seconds)
- **Quality**: Great instruction following
- **Use Case**: Step-by-step farming guidance
- **API Limits**: Free, may need approval

```env
CHAT_MODEL=tiiuae/falcon-7b-instruct
```

#### 5. **google/flan-t5-large**
- **Speed**: ⚡ Fast (3-6 seconds)
- **Quality**: Good for factual questions
- **Use Case**: Quick facts, crop info
- **API Limits**: Free, no approval needed

```env
CHAT_MODEL=google/flan-t5-large
```

## 🎯 Model Selection Guide

### Choose Based On Your Needs:

**Just Testing / Learning?**
→ Use `microsoft/DialoGPT-medium` (already set as default)

**Need Fast Responses?**
→ Use `facebook/blenderbot-400M-distill` or `google/flan-t5-large`

**Want Best Quality Answers?**
→ Use `mistralai/Mistral-7B-Instruct-v0.1` (requires HF account with accepted license)

**For Production App?**
→ Start with `facebook/blenderbot-400M-distill`, upgrade to Mistral later

## 💡 Features

### 1. Smart Farming Responses
The chatbot is configured with farming context and can answer questions about:
- 🌾 Crop recommendations and selection
- 🌱 Soil management and fertilizers
- 🐛 Pest and disease control
- 💧 Irrigation and water management
- 🌦️ Weather and seasonal planning
- 🌿 Organic farming practices
- 📊 Yield optimization

### 2. Fallback Responses
Even **without an API key**, the chatbot works with intelligent mock responses based on keywords, so users always get helpful information!

### 3. Model Loading Detection
When a model is being loaded (first use), users see: "🔄 The AI model is loading (takes ~20 seconds on first use). Please try again in a moment!"

## 🔧 How It Works

### Backend Flow:
1. User sends message from app → `/api/chatbot`
2. Backend adds farming context to message
3. Sends to Hugging Face Inference API
4. Returns formatted response
5. If API fails → uses smart fallback responses

### Configuration Options:
```javascript
// In ai.js service
parameters: {
  max_new_tokens: 200,      // Response length
  temperature: 0.7,         // Creativity (0.0-1.0)
  top_p: 0.9,              // Diversity
  do_sample: true,         // Enable sampling
  return_full_text: false  // Only new text
}
```

## 📊 API Limits & Costs

### Free Tier (Inference API):
- ✅ **Cost**: $0 (completely free!)
- ✅ **Rate Limit**: ~1000 requests/hour per model
- ✅ **Models**: Access to 100,000+ models
- ⏱️ **Cold Start**: 10-30 seconds (first request)
- ⚡ **Warm**: 2-10 seconds (subsequent requests)

### Tips to Stay Free:
1. Use lightweight models (DialoGPT, BlenderBot)
2. Cache common responses (future enhancement)
3. Use mock responses for testing
4. Implement request debouncing in frontend

## 🛠️ Testing Your Setup

### 1. Without API Key (Mock Mode):
The chatbot will work with pre-programmed responses based on keywords.

Test messages:
- "What crops grow in loamy soil?"
- "How do I control pests?"
- "Tell me about irrigation"

### 2. With API Key (AI Mode):
Real AI responses from Hugging Face models.

Test messages:
- "I have clay soil and it's summer season. What should I plant?"
- "My tomato plants have yellow leaves. What's wrong?"
- "How much water does rice need during monsoon?"

## 📱 Testing in the App

1. Start backend: `cd backend && node src/server.js`
2. Start frontend: `cd frontend && npx expo start --web`
3. Open app → Navigate to "AI Assistant" (🤖 icon)
4. Type a farming question and hit send!

## 🔍 Troubleshooting

### "Model is loading" message?
- First request takes 20-30 seconds
- Wait and try again
- Model stays warm for ~15 minutes

### Getting error responses?
- Check API key is correct in `.env`
- Verify key has "Read" permission
- Some models need license acceptance on HF website
- Fallback responses will still work!

### Want better responses?
- Upgrade model to Mistral or Falcon
- Add more context in the system prompt
- Adjust temperature parameter (higher = creative)

## 🚀 Recommended Next Steps

1. **Get HF API key** and add to `.env`
2. **Test with default model** (DialoGPT)
3. **Try different models** to find best fit
4. **Monitor response quality** and switch if needed
5. **Consider premium models** for production

## 🌟 Advanced: Custom Agriculture Models

Want even better farming advice? Search Hugging Face Hub for:
- Agriculture-specific models
- Plant disease detection models
- Crop recommendation models
- Regional language models (Hindi, Telugu, etc.)

Example: `your-username/farming-assistant-model`

## 📞 Support

- Hugging Face Docs: https://huggingface.co/docs/api-inference
- Model Hub: https://huggingface.co/models
- Inference API Status: https://status.huggingface.co

---

**Made with 💚 for Indian Farmers**
