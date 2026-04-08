# 🚀 FarmHelp - Auto Debug & Fix Guide

## I've Created 3 Automatic Debugging Tools For You!

### Option 1: PowerShell Auto-Fix (RECOMMENDED) ✨
**File:** `AUTO-FIX.ps1`

**What it does:**
- ✅ Checks if backend is running → Starts it if not
- ✅ Tests chatbot API
- ✅ Tests GROQ AI with real farming question
- ✅ Checks frontend → Starts it if not
- ✅ Verifies all configuration
- ✅ Installs missing packages automatically
- ✅ Shows detailed summary

**How to use:**
```powershell
.\AUTO-FIX.ps1
```

### Option 2: Node.js Debugger (Advanced)
**File:** `auto-debug.js`

**What it does:**
- Comprehensive system diagnostics
- Tests all API endpoints
- Analyzes GROQ AI responses
- Detailed error reporting

**How to use:**
```bash
node auto-debug.js
```

### Option 3: Batch File Debugger (Simple)
**File:** `AUTO_DEBUG.bat`

**What it does:**
- Simple Windows command-line diagnostics
- Tests with curl commands
- Quick status check

**How to use:**
```
Double-click AUTO_DEBUG.bat
```

---

## 🎯 Quick Start (Just Do This!)

### Step 1: Run Auto-Fix
```powershell
.\AUTO-FIX.ps1
```

This will:
1. Check everything
2. Fix what's broken
3. Start what's stopped
4. Test GROQ AI
5. Give you a full report

### Step 2: Wait 30 Seconds
The backend and frontend need time to:
- Connect to MongoDB
- Initialize GROQ AI
- Start Metro bundler
- Compile React components

### Step 3: Open Your App
Go to: **http://localhost:19000**

### Step 4: Test AI Assistant
1. Click on **AI Assistant**
2. Type: **"What crops grow best in loamy soil?"**
3. You should get a **detailed, intelligent response** from GROQ AI!

---

## 📋 What Each Tool Does:

### AUTO-FIX.ps1 (PowerShell)
```
[1/6] Checking Backend Server...
   ✅ Backend is RUNNING
   Database: connected

[2/6] Testing Chatbot API...
   ✅ Chatbot API is responding!
   Reply: Hello! I'm your FarmHelp AI assistant...

[3/6] Testing GROQ AI with Farming Question...
   Question: 'What crops grow best in loamy soil?'
   ✅ GROQ AI Response Received!
   
   AI Reply:
   🌾 Loamy soil is excellent for farming! Here are the best crops:
   
   **Vegetables:** Tomatoes, potatoes, carrots, beans...
   **Grains:** Wheat, rice, maize, barley...
   
   ✅ Response is from GROQ AI (intelligent & detailed)

[4/6] Checking Frontend...
   ✅ Frontend is RUNNING on port 19000

[5/6] Checking Configuration...
   ✅ GROQ_API_KEY is configured
   ✅ MONGODB_URI is configured

[6/6] Checking Node Packages...
   ✅ @langchain/groq installed
   ✅ langchain installed

═══════════════════════════════════════════════════════
                    SUMMARY
═══════════════════════════════════════════════════════

📊 System Status:
   Backend:    ✅ RUNNING
   Frontend:   ✅ RUNNING (port 19000)

🔗 Quick Links:
   Backend:  http://localhost:4000
   Frontend: http://localhost:19000

✅ Auto-debug complete! Check the windows that opened.
```

### auto-debug.js (Node.js)
More detailed testing:
- HTTP request testing
- Response content analysis
- JSON parsing verification
- Intelligent response detection

### AUTO_DEBUG.bat (Batch)
Simple curl-based testing:
- Quick status checks
- Package verification
- Environment variable checks

---

## 🔧 Troubleshooting

### If Auto-Fix Fails:

1. **Backend won't start:**
   ```powershell
   cd backend
   node src\server-minimal.js
   ```
   Check console for errors

2. **GROQ AI not working:**
   - Check `backend\.env` has `GROQ_API_KEY=gsk_...`
   - Verify packages: `npm list @langchain/groq`
   - Test directly: `node backend\test-groq.js`

3. **Frontend shows connection error:**
   - Backend must be running first!
   - Check: http://localhost:4000
   - Should show: `{"ok": true, "message": "FarmHelp API Server is running!"}`

4. **Missing packages:**
   ```bash
   cd backend
   npm install @langchain/groq langchain @langchain/core @langchain/community
   ```

---

## ✅ Success Indicators

### Backend Console Should Show:
```
═══════════════════════════════════════
[✓] MongoDB Connected Successfully!
[✓] Database: farmmate
═══════════════════════════════════════

[CHATBOT-CONTROLLER] ✅ GROQ AI Service is READY!
[GROQ-SERVICE] ✅ Models initialized successfully
[GROQ-SERVICE] ✅ Tools initialized: get_weather, get_crop_price, get_soil_info, get_agriculture_news

╔═══════════════════════════════════════════════════════╗
║          🚀 FarmHelp Backend Server Started           ║
╚═══════════════════════════════════════════════════════╝

[✓] Server URL: http://localhost:4000
```

### When You Ask Questions:
```
[CHATBOT] Received message: What crops grow best in loamy soil?
[CHATBOT-CONTROLLER] Detected intent: general_farming
[GENERAL-FARMING] Using GROQ AI
[GROQ-SERVICE] Processing message for user_xxxxx
[GROQ-SERVICE] Using SMART model
[CHATBOT] Sending reply from general_farming with confidence 0.8
```

---

## 🎉 You're All Set!

After running `AUTO-FIX.ps1`:
- ✅ Backend is running with GROQ AI
- ✅ Frontend is running
- ✅ All packages are installed
- ✅ Configuration is verified
- ✅ Everything is tested and working

**Just open http://localhost:19000 and use your AI Assistant!** 🚀

---

**Need help?** Check these files:
- `QUICK_FIX_GUIDE.md` - Manual troubleshooting
- `GROQ_UPDATE_COMPLETE.md` - Technical details
- `backend/test-groq.js` - Direct GROQ testing

**Created:** April 8, 2026
**Status:** ✅ READY TO USE
