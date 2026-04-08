# 🚀 FarmHelp - Complete Start Guide

## ⚡ ONE COMMAND TO START EVERYTHING!

Just run:
```powershell
.\start-all.ps1
```

This will automatically:
1. ✅ Stop any running services on ports 4000, 5000, 19000
2. ✅ Check Python installation (for ML Service)
3. ✅ Install GROQ AI packages
4. ✅ Verify GROQ API key
5. ✅ Install frontend packages if needed
6. ✅ **Start ML Service** (Port 5000) - Plant Disease AI
7. ✅ **Start Backend** (Port 4000) - API Server with GROQ chatbot
8. ✅ **Start Frontend** (Port 19000) - React Native Web App

---

## 📱 What Will Happen?

### THREE windows will open:

1. **ML Service Window** (Magenta)
   - Port: 5000
   - Look for: `Running on http://127.0.0.1:5000`
   - This is the plant disease detection AI

2. **Backend Window** (Cyan)
   - Port: 4000
   - Look for: `GROQ AI Service is READY!`
   - This is your API server with chatbot

3. **Frontend Window** (Green)
   - Port: 19000 (or 8081)
   - Look for: `Metro waiting on exp://`
   - This is your web app

---

## ⏱️ Wait Time

- The script waits **45 seconds** then opens your browser to `http://localhost:19000`
- If you see an error, wait another 30 seconds and refresh
- Or check the frontend window for the actual URL
- Or press `w` in the frontend window to start web server

---

## 🧪 Testing Plant Analyzer

1. Make sure **all 3 windows are running**
2. Open the app at `http://localhost:19000`
3. Navigate to **Plant Analyzer**
4. Upload a test image from the `test-images` folder
5. Get disease detection + cure suggestions! 🎉

### Test Images Available:
- `test-images/late-blight.jpg` - Tomato disease
- `test-images/early-blight.jpg` - Tomato disease
- `test-images/powdery-mildew.jpg` - Common disease
- `test-images/leaf-spot.jpg` - Bacterial disease
- `test-images/rust.jpg` - Fungal disease
- `test-images/healthy-leaf.jpg` - Healthy plant

---

## 🔧 Service URLs (for testing)

| Service | URL | What to Check |
|---------|-----|---------------|
| ML Service | http://127.0.0.1:5000/health | Should return: `{"status": "healthy"}` |
| Backend | http://localhost:4000/api/crops | Should return crop data |
| Frontend | http://localhost:19000 | Should show FarmHelp app |

---

## ⚠️ Troubleshooting

### ML Service not starting?
- **Check Python:** Run `python --version` in PowerShell
- **Need:** Python 3.8 or higher
- **Install from:** https://python.org
- **After install:** Restart PowerShell and run `.\start-all.ps1` again

### Port already in use?
- The script automatically kills processes on ports 4000, 5000, 19000
- If it still fails, manually run:
  ```powershell
  Get-NetTCPConnection -LocalPort 5000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
  ```

### GROQ chatbot not working?
- Check backend window for `GROQ AI Service is READY!`
- If not, check `backend\.env` has: `GROQ_API_KEY=gsk_...`

### Plant Analyzer error: "connect ECONNREFUSED 127.0.0.1:5000"?
- **ML Service is not running!**
- Check the ML Service window (Magenta)
- Should show: `Running on http://127.0.0.1:5000`
- If not, Python might not be installed

---

## 🎯 Features You Can Test

1. **AI Chatbot** (GROQ AI)
   - Ask farming questions
   - Get weather info
   - Get crop prices
   - Get agriculture news

2. **Plant Analyzer**
   - Upload plant photos
   - Get disease detection
   - Get cure suggestions (organic + chemical)
   - Get prevention tips

3. **Multi-Language**
   - Switch between English, Hindi, Kannada
   - All UI updates instantly

4. **Dark Mode**
   - Toggle dark/light mode
   - All screens support both themes

---

## 📂 Project Structure

```
FarmHelp/
├── model-service/     # Flask ML Service (Port 5000)
│   └── app.py         # Plant disease detection AI
├── backend/           # Node.js API Server (Port 4000)
│   └── src/
│       └── server-minimal.js  # Main server with GROQ chatbot
├── frontend/          # React Native Web App (Port 19000)
│   └── src/
│       └── screens/   # All app screens
└── start-all.ps1      # 🚀 ONE COMMAND TO START ALL!
```

---

## 🎉 You're All Set!

Just run `.\start-all.ps1` and everything starts automatically!

---

## 📞 Need Help?

Check these files:
- `TROUBLESHOOTING.md` - Common issues
- `FIX_PLANT_ANALYZER.md` - Plant Analyzer specific
- `PLANT_ANALYZER_COMPLETE.md` - Feature documentation
- `TEST_IMAGES_GUIDE.md` - Testing guide

---

Made with ❤️ for farmers everywhere! 🌾
