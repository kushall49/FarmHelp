# 🚀 HOW TO START FARMHELP APP

## ⚡ QUICK START (Copy-Paste These Commands)

### **Step 1: Open TWO PowerShell/Terminal Windows**

---

### **Terminal 1 - Backend Server:**

```powershell
cd C:\Users\kusha\OneDrive\Desktop\FarmHelp\backend
node src/server-minimal.js
```

**Wait for:**
```
🚀 FarmHelp Backend Server Started
✓ MongoDB Connected Successfully!
```

**Keep this terminal running!** ✅

---

### **Terminal 2 - Frontend Server:**

```powershell
cd C:\Users\kusha\OneDrive\Desktop\FarmHelp\frontend
npx expo start
```

**Wait for the QR code to appear, then:**

**Press `w` key** to open web browser

**OR manually open:** http://localhost:19000

**Keep this terminal running too!** ✅

---

## 🎯 What You'll See

### Backend Terminal:
```
[✓] Server URL: http://localhost:4000
[✓] MongoDB Connected Successfully!
```

### Frontend Terminal:
```
› Web is waiting on http://localhost:19000
› Press w │ open web
```

### Browser:
- Login screen will appear
- After login, you'll see Community feed
- Posts will load from MongoDB

---

## 🐛 If Posts Don't Show:

1. **Check backend terminal** - should see:
   ```
   [2025-10-18...] GET /api/community
   ```

2. **Check browser console** (F12) - look for errors

3. **Test backend directly:**
   ```powershell
   Invoke-RestMethod -Uri http://localhost:4000/api/community -UseBasicParsing
   ```

---

## 📸 To Test Image Upload:

1. **Login to the app**
2. **Click "+" button** (bottom-right corner)
3. **Fill in post details**
4. **Click "📷 Add Photo"**
5. **Select image**
6. **Click "Publish Post"**
7. **Watch backend terminal:**
   ```
   📝 POST /api/community
   Uploaded file: { path: 'https://res.cloudinary.com/dy5532ghs/...' }
   ✅ Post created!
   ```
8. **Refresh feed** → Image appears! 🎉

---

## ⚠️ IMPORTANT NOTES:

1. **NEVER close the terminal windows** while using the app
2. **Backend must be running on port 4000**
3. **Frontend must be running on port 19000**
4. **Both must run simultaneously**
5. **If Expo asks about port, choose the offered port and update API_URL if needed**

---

## 🔧 If Something Goes Wrong:

### Problem: Port already in use
```powershell
# Kill all node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
# Wait 2 seconds, then restart servers
```

### Problem: Posts not loading
- Check if backend is running
- Check browser console (F12) for errors
- Verify http://localhost:4000 is accessible

### Problem: Images not uploading
- Check Cloudinary credentials in `backend/.env`
- Should be: `CLOUDINARY_CLOUD_NAME=dy5532ghs`
- Watch backend logs for Cloudinary errors

---

## ✅ SUCCESS CHECKLIST:

- [ ] Backend running on http://localhost:4000
- [ ] Frontend running on http://localhost:19000
- [ ] Browser shows login screen
- [ ] Can login successfully
- [ ] Community feed loads
- [ ] Can see existing posts
- [ ] Can create new posts
- [ ] Can upload images with posts
- [ ] Images appear in feed

---

**NOW GO START BOTH SERVERS IN SEPARATE TERMINALS!** 🚀
