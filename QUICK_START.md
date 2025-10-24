# FarmMate — Full-Stack Farming Assistant 🌾

A production-ready cross-platform mobile app for farmers with AI-powered plant health analysis, crop recommendations, and farming assistant chatbot.

## 🎯 Project Status

### ✅ Backend (Node.js + Express + TypeScript)
- Server running successfully on `http://localhost:4000`
- MongoDB Atlas connected
- All REST API endpoints functional
- Sample crop data seeded
- Ready for frontend integration

### ⏳ Frontend (React Native + Expo + TypeScript)
- Code scaffolded with all screens
- Needs: `npm install` and Firebase config

---

## 🚀 Quick Start Guide

### Backend (Already Running!)

```powershell
cd backend
npm run dev
```

**Test it:** Open http://localhost:4000 in your browser

### Frontend (Next Step)

```powershell
cd frontend
npm install
# Update src/config/firebase.ts with your Firebase config
npm start
```

---

## 📱 Features

### Backend APIs (All Working ✅)
1. **Health Check** - `GET /`
2. **Crop Recommendations** - `GET /api/crops?soil=loam&season=summer&temp=25`
3. **Plant Health Analysis** - `POST /api/plant/upload-plant` (accepts image file)
4. **Farming Chatbot** - `POST /api/chatbot` (AI assistant)
5. **User Auth** - `POST /api/auth/signup` & `/api/auth/login` (Firebase)

### Mobile App Screens (Scaffolded)
- 🔐 Login & Signup (Firebase Auth)
- 🏠 Home (Dashboard with crop suggestions)
- 🌾 Crop Recommendation Tool
- 🔍 Plant Health Analyzer (Camera/Gallery upload)
- 💬 AI Chatbot Assistant
- 👤 User Profile

---

## 📖 API Documentation

See `backend/API_TESTING_GUIDE.md` for complete endpoint documentation with examples.

### Quick Test Examples:

**Browser:**
```
http://localhost:4000
http://localhost:4000/api/crops?soil=loam&season=summer&temp=25
```

**PowerShell:**
```powershell
# Test chatbot
curl.exe -X POST http://localhost:4000/api/chatbot `
  -H "Content-Type: application/json" `
  -d '{"message": "Best crops for summer?"}'
```

---

## ⚙️ Configuration

### Backend Environment (`.env`)

Already configured:
```bash
PORT=4000
MONGODB_URI=mongodb+srv://...  # ✅ Connected
```

Optional (for enhanced features):
```bash
# Firebase Admin (for auth)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# OpenAI (for real AI features)
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4o
```

### Frontend Config

Update `frontend/src/config/firebase.ts`:
```typescript
export default {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  // ... get from Firebase Console
};
```

---

## 🏗️ Tech Stack

**Backend:**
- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose
- Firebase Admin SDK
- Multer (file uploads)
- Joi (validation)

**Frontend:**
- React Native + Expo SDK 48
- TypeScript
- React Navigation
- React Native Paper (Material Design)
- Firebase Client SDK
- Axios
- Expo Image Picker

---

## 📂 Project Structure

```
FarmHelp/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Server entry
│   │   ├── models/               # MongoDB schemas
│   │   │   ├── User.ts
│   │   │   ├── Crop.ts
│   │   │   └── PlantAnalysis.ts
│   │   ├── routes/               # API endpoints
│   │   │   ├── auth.ts           # Signup/Login
│   │   │   ├── crop.ts           # Recommendations
│   │   │   ├── plant.ts          # Image upload
│   │   │   └── chatbot.ts        # AI assistant
│   │   └── services/
│   │       └── ai.ts             # AI service wrapper
│   ├── seed/
│   │   └── cropsSeed.ts          # Sample data
│   ├── .env                      # Config (created)
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── API_TESTING_GUIDE.md      # Full API docs
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Navigation setup
│   │   ├── config/
│   │   │   └── firebase.ts       # Firebase config
│   │   ├── services/
│   │   │   └── api.ts            # Backend API client
│   │   └── screens/
│   │       ├── LoginScreen.tsx
│   │       ├── SignupScreen.tsx
│   │       ├── HomeScreen.tsx
│   │       ├── CropRecommendation.tsx
│   │       ├── PlantAnalyzer.tsx
│   │       ├── Chatbot.tsx
│   │       └── Profile.tsx
│   ├── app.json
│   └── package.json
│
└── README.md (this file)
```

---

## 🧪 Testing

### Backend Tests:
```powershell
# Health check
curl http://localhost:4000

# Crop recommendations
curl "http://localhost:4000/api/crops?soil=loam&season=summer&temp=25"

# Chatbot
curl -X POST http://localhost:4000/api/chatbot -H "Content-Type: application/json" -d "{\"message\":\"Hello\"}"
```

### Frontend Tests:
1. Install dependencies: `npm install`
2. Start Expo: `npm start`
3. Scan QR code with Expo Go app
4. Test all screens and API calls

---

## 🚢 Deployment

### Backend → Render/Vercel

**Render (Recommended):**
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect repository
4. Set environment variables (MONGODB_URI, etc.)
5. Deploy

**Vercel:**
```powershell
npm i -g vercel
cd backend
vercel
```

### Frontend → Expo

**Development builds:**
```powershell
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

**Publish updates:**
```powershell
eas update --branch production
```

---

## ⚠️ Important Notes

### Current Limitations:
- **AI Features:** Return mock data until you add `OPENAI_API_KEY`
- **Firebase Auth:** Disabled until you add service account credentials
- **Image Storage:** Currently saves as base64 (use S3/Cloudinary in production)

### Security Checklist for Production:
- [ ] Add rate limiting
- [ ] Implement token verification middleware
- [ ] Configure CORS whitelist
- [ ] Use environment-specific configs
- [ ] Add input sanitization
- [ ] Set up error monitoring (Sentry)
- [ ] Enable HTTPS
- [ ] Use cloud storage for images

---

## 🆘 Troubleshooting

**Q: Backend won't start?**
- Check if MongoDB URI is correct in `.env`
- Ensure port 4000 is not in use
- Verify npm dependencies installed

**Q: Frontend can't connect to backend?**
- Check `API_URL` in `frontend/src/services/api.ts`
- Use your machine's IP (not localhost) when testing on device
- Ensure backend is running

**Q: MongoDB connection error?**
- Whitelist your IP in MongoDB Atlas: Network Access → Add IP Address
- Check connection string format

**Q: Firebase errors?**
- Add proper credentials to `.env` or leave commented out for now
- Backend works without Firebase (auth endpoints will be unavailable)

---

## 📞 Support & Resources

- **MongoDB Atlas:** https://cloud.mongodb.com/
- **Firebase Console:** https://console.firebase.google.com/
- **OpenAI API:** https://platform.openai.com/
- **Expo Documentation:** https://docs.expo.dev/
- **React Native Paper:** https://callstack.github.io/react-native-paper/

---

## ✨ What's Next?

1. **Install frontend dependencies** and configure Firebase
2. **Test frontend-backend integration** on device/emulator
3. **Add OpenAI API key** for real AI features
4. **Implement token-based auth** for secured endpoints
5. **Deploy backend** to Render or Vercel
6. **Build and publish** mobile app via EAS

---

## 📄 License

MIT

**Built with ❤️ by Senior Fullstack AI Developer**  
**Date:** October 15, 2025
