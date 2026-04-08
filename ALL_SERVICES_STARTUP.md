# 🚀 All Services Startup - Complete Documentation

## 📋 Overview

The `start-all.ps1` script now starts **ALL THREE services** your FarmHelp app needs:

1. **ML Service** (Port 5000) - Plant disease detection AI (Flask/Python)
2. **Backend** (Port 4000) - API server with GROQ chatbot (Node.js)
3. **Frontend** (Port 19000) - Web application (React Native Web)

---

## ✨ What's New?

### ✅ Now Includes ML Service!

Previous version only started Backend + Frontend.  
**NEW:** Now also starts the ML Service required for Plant Analyzer!

### Changes Made:

1. **Checks for Python** - Verifies Python is installed before starting ML Service
2. **Starts ML Service first** - Ensures it's ready before backend needs it
3. **Better error messages** - Shows clear warnings if Python is missing
4. **Color-coded windows** - Each service has its own color:
   - 🟣 Magenta = ML Service
   - 🔵 Cyan = Backend
   - 🟢 Green = Frontend

---

## 🎬 Service Startup Order

```
[1/7] Stop existing services (4000, 5000, 19000)
[2/7] Check Python installation
[3/7] Install GROQ AI packages
[4/7] Verify GROQ API key
[5/7] Check frontend packages
[6/7] Start ML Service (5000) ← NEW!
[7/7] Start Backend (4000)
[8/8] Start Frontend (19000)
```

---

## 🔍 Window Titles

Each window has a custom title so you can identify them:

| Window Title | Service | Port |
|-------------|---------|------|
| `FarmHelp - ML Service` | Plant Disease AI | 5000 |
| `FarmHelp - Backend` | API Server | 4000 |
| `FarmHelp - Frontend` | Web App | 19000 |

---

## 🎨 Color Coding

Each service window has color-coded output:

- **ML Service:** Magenta text - `[ML SERVICE] Starting Flask app...`
- **Backend:** Cyan text - `[BACKEND] Starting Node.js server...`
- **Frontend:** Cyan text - `[FRONTEND] Starting Expo...`

---

## ⚠️ Python Requirement

### ML Service requires Python 3.8+

The script checks for Python and:
- ✅ **If Python found:** Starts ML Service normally
- ⚠️ **If Python missing:** Shows warning but continues (Backend + Frontend still work)

### Warning Message:
```
WARNING: Python not found!
ML Service will not work. Install Python 3.8+ from python.org
WARNING: Plant Analyzer will not work!
```

---

## 📊 Service Dependencies

```mermaid
Frontend (19000)
    ↓
Backend (4000)
    ↓
ML Service (5000)
    ↓
Python 3.8+
```

- Frontend calls Backend APIs
- Backend calls ML Service for plant analysis
- ML Service needs Python to run
- **All 3 must be running for Plant Analyzer to work!**

---

## 🔧 Health Checks

After starting, you can verify each service:

### ML Service (Port 5000)
```bash
curl http://127.0.0.1:5000/health
# Should return: {"status": "healthy"}
```

### Backend (Port 4000)
```bash
curl http://localhost:4000/api/crops
# Should return crop data JSON
```

### Frontend (Port 19000)
```bash
# Open browser to http://localhost:19000
# Should show FarmHelp app
```

---

## 💡 Usage Examples

### Normal Start (All Services)
```powershell
.\start-all.ps1
# Starts ML + Backend + Frontend
```

### If Python Not Installed
The script will:
1. Show warning about Python
2. Skip ML Service
3. Start Backend + Frontend anyway
4. You can still use the chatbot!
5. Plant Analyzer won't work until you install Python

---

## 🐛 Common Issues

### Issue: "ML Service window closes immediately"
**Solution:**
- Check Python is installed: `python --version`
- Check model-service folder exists
- Check model-service/app.py exists

### Issue: "Backend shows 'connect ECONNREFUSED 127.0.0.1:5000'"
**Solution:**
- ML Service is not running
- Check ML Service window is still open
- Should show: `Running on http://127.0.0.1:5000`

### Issue: "Port 5000 already in use"
**Solution:**
```powershell
Get-NetTCPConnection -LocalPort 5000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

---

## 📁 Files Modified

### Updated File:
- `start-all.ps1` - Now includes ML Service startup

### New Files:
- `COMPLETE_START_GUIDE.md` - User-friendly guide
- `ALL_SERVICES_STARTUP.md` - This technical doc

### Related Files:
- `START_ML_SERVICE.bat` - Standalone ML Service starter
- `START_ALL_SERVICES.bat` - Batch version (3 separate windows)
- `FIX_PLANT_ANALYZER.md` - Troubleshooting guide

---

## 🎯 Success Criteria

All three windows should show:

✅ **ML Service Window:**
```
[ML SERVICE] Starting Flask app on port 5000...
 * Running on http://127.0.0.1:5000
```

✅ **Backend Window:**
```
[BACKEND] Starting Node.js server...
✅ MongoDB Connected Successfully
✅ GROQ AI Service is READY!
Server running on port 4000
```

✅ **Frontend Window:**
```
[FRONTEND] Starting Expo...
Metro waiting on exp://...
```

---

## 🚀 Next Steps

1. Wait 45 seconds for all services to load
2. Browser opens automatically to http://localhost:19000
3. Test AI Chatbot (ask farming questions)
4. Test Plant Analyzer (upload test images)
5. Enjoy your fully functional FarmHelp app! 🎉

---

## 📞 Support

Check these files for help:
- `COMPLETE_START_GUIDE.md` - Quick start
- `TROUBLESHOOTING.md` - Common problems
- `FIX_PLANT_ANALYZER.md` - Plant Analyzer issues
- `PLANT_ANALYZER_COMPLETE.md` - Feature details

---

**Last Updated:** April 8, 2026  
**Version:** 2.0 (ML Service Integration)
