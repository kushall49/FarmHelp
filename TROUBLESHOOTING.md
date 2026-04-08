# 🚨 FarmHelp - Troubleshooting Guide

## Problem: "localhost:19000 refused to connect"

This means the frontend hasn't started yet or is still loading.

---

## ✅ SOLUTION - Use This New Script:

### **Double-click: `SETUP_AND_START.bat`**

This new script will:
1. ✅ Stop all old processes
2. ✅ Install GROQ AI packages automatically
3. ✅ Verify GROQ API key
4. ✅ Install frontend packages if needed
5. ✅ Start backend and frontend properly
6. ✅ Wait 45 seconds before opening browser

---

## 🔍 If Still Not Working:

### Check Frontend Window

After running `SETUP_AND_START.bat`, look at the **FarmHelp-Frontend** window.

#### ✅ Good Signs:
```
Metro waiting on exp://192.168.x.x:19000
Logs for your project will appear below. Press Ctrl+C to exit.

› Press w │ open web
› Press a │ open Android
› Press i │ open iOS simulator
```

If you see this, **press 'w'** to start web server!

#### ❌ Bad Signs:
```
Error: Cannot find module '@expo/...'
npm ERR! ...
```

If you see errors, the frontend packages aren't installed.

**Fix:**
```bash
cd frontend
npm install
npm start
```

---

## 📋 Manual Step-by-Step (If Scripts Don't Work):

### Step 1: Install GROQ Packages
```bash
cd backend
npm install @langchain/groq langchain @langchain/core @langchain/community
```

### Step 2: Start Backend
```bash
cd backend
node src/server-minimal.js
```

Look for:
```
[GROQ-SERVICE] ✅ Models initialized successfully
[CHATBOT-CONTROLLER] ✅ GROQ AI Service is READY!
Server running on port 4000
```

### Step 3: Start Frontend (New Terminal)
```bash
cd frontend
npx expo start
```

Wait for:
```
Metro waiting on exp://...
```

Then press **'w'** for web!

---

## 🎯 Common Issues & Fixes

### Issue 1: "Port 4000 already in use"
**Fix:**
```bash
# Windows
netstat -ano | findstr :4000
taskkill /F /PID [PID_NUMBER]
```

### Issue 2: "Port 19000 already in use"
**Fix:**
```bash
# Windows
netstat -ano | findstr :19000
taskkill /F /PID [PID_NUMBER]
```

### Issue 3: "Module not found" errors
**Fix:**
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Issue 4: GROQ not working
**Check:**
1. Is `GROQ_API_KEY` in `backend/.env`?
2. Does it start with `gsk_`?
3. Look for `✅ GROQ AI Service is READY!` in backend console

---

## 🔧 Nuclear Option (Clean Restart)

If nothing works, try this:

```bash
# 1. Stop everything (close all terminals)

# 2. Delete node_modules
cd backend
rmdir /s /q node_modules
cd ../frontend
rmdir /s /q node_modules

# 3. Reinstall everything
cd ../backend
npm install
cd ../frontend
npm install

# 4. Start fresh
cd ..
.\SETUP_AND_START.bat
```

---

## ✅ Success Checklist

- [ ] Backend window shows: "Server running on port 4000"
- [ ] Backend window shows: "✅ GROQ AI Service is READY!"
- [ ] Frontend window shows: "Metro waiting on exp://..."
- [ ] Pressed 'w' in frontend window
- [ ] Browser opens to http://localhost:19000
- [ ] App loads and you see the home screen

---

## 💡 Pro Tips

1. **Always wait 30-60 seconds** after starting services
2. **Check the console windows** for actual URLs (might not be 19000)
3. **Frontend URL changes** - it might be 8081, 19000, or 19001
4. **Press 'w' in frontend console** to force web start
5. **GROQ needs API key** - won't work without it

---

## 🆘 Still Stuck?

### Check These Files:
- `backend/.env` - Should have `GROQ_API_KEY=gsk_...`
- `backend/package.json` - Should have langchain packages
- `frontend/package.json` - Should have expo packages

### Check These Ports:
```bash
netstat -ano | findstr ":4000"   # Backend
netstat -ano | findstr ":19000"  # Frontend
netstat -ano | findstr ":5000"   # ML Service
```

All should show "LISTENING"

---

**Created:** April 2026  
**For:** FarmHelp with GROQ AI Integration
