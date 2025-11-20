# 🚀 FarmHelp - Quick Start Scripts

All services start in parallel with **one command**!

---

## 📦 What Gets Started

1. **Backend** (Node.js Express) → Port 4000
2. **ML Service** (Flask/Python) → Port 5000  
3. **Frontend** (Expo React Native) → Port 19000
4. **MongoDB** → Starts automatically with backend

---

## ✅ Windows Usage

### Method 1: PowerShell (Recommended)
```powershell
# Start all services
.\start-all.ps1

# Stop all services
.\stop-all.ps1
```

### Method 2: Command Prompt (.bat)
```cmd
start-all.bat

stop-all.bat
```

### First-Time Setup (Windows)
If you get "execution policy" error:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

---

## ✅ Mac/Linux Usage

### Make scripts executable (first time only)
```bash
chmod +x start-all.sh stop-all.sh
```

### Start all services
```bash
./start-all.sh
```

### Stop all services
```bash
./stop-all.sh
```

---

## 📋 What Happens

**Windows (.ps1 / .bat)**:
- Opens 3 separate terminal windows
- Backend, ML, Frontend run in parallel
- Each service has its own window
- Close windows OR run `stop-all` to stop

**Mac/Linux (.sh)**:
- Runs all services in background
- Logs saved to `./logs/` folder
- Process IDs saved to `.service-pids`
- Run `stop-all.sh` to stop

---

## ⏱️ Startup Timeline

| Time | Service | Status |
|------|---------|--------|
| 0s | Script starts | Kills old processes |
| 3s | Backend starts | Port 4000 opening |
| 6s | ML Service starts | Port 5000 opening |
| 9s | Frontend starts | Port 19000 opening |
| 30s | **All Ready** | Open browser! |

---

## 🌐 Access URLs

After 30 seconds:

- **Frontend**: http://localhost:19000 (or http://localhost:8081)
- **Backend API**: http://localhost:4000/api
- **ML API**: http://localhost:5000/predict

---

## 🛠️ Troubleshooting

### "Port already in use"
The script automatically kills processes on ports 4000, 5000, 19000. If it still fails:

**Windows**:
```powershell
netstat -ano | findstr "4000 5000 19000"
# Find PID, then:
taskkill /F /PID <PID>
```

**Mac/Linux**:
```bash
lsof -ti:4000,5000,19000 | xargs kill -9
```

---

### Python Virtual Environment Not Found (Mac/Linux)
The script auto-creates `.venv` if missing. Or manually:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r model-service/requirements.txt
```

---

### Services Not Starting
Check individual logs:

**Windows**: Look at the 3 terminal windows

**Mac/Linux**: 
```bash
tail -f logs/backend.log
tail -f logs/flask.log
tail -f logs/frontend.log
```

---

## 📁 Files Created

```
FarmHelp/
├── start-all.bat      # Windows batch script
├── start-all.ps1      # Windows PowerShell (recommended)
├── start-all.sh       # Mac/Linux bash script
├── stop-all.bat       # Windows stop script
├── stop-all.ps1       # Windows PowerShell stop
├── stop-all.sh        # Mac/Linux stop script
└── STARTUP_GUIDE.md   # This file
```

---

## 🎯 Quick Commands Cheat Sheet

### Windows PowerShell
```powershell
# Start everything
.\start-all.ps1

# Stop everything  
.\stop-all.ps1

# Check if running
netstat -ano | findstr "4000 5000 19000"
```

### Mac/Linux
```bash
# Start everything
./start-all.sh

# Stop everything
./stop-all.sh

# Check if running
lsof -ti:4000,5000,19000
```

---

## ✨ Features

✅ **Parallel Startup** - All services start simultaneously  
✅ **Auto Port Cleanup** - Kills old processes automatically  
✅ **Cross-Platform** - Works on Windows, Mac, Linux  
✅ **Easy Stop** - One command to stop everything  
✅ **Status Check** - Shows which ports are listening  
✅ **No Manual Steps** - MongoDB, dependencies auto-start  

---

## 🔥 One-Command Development

```powershell
# Windows
.\start-all.ps1

# Mac/Linux  
./start-all.sh
```

**Wait 30 seconds → Open browser → Start developing!** 🎉

---

**Last Updated**: November 19, 2025  
**Platform**: Windows 11 / macOS / Linux
