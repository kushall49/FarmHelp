# FarmMate Backend - API Testing Guide

## ✅ Backend Status: **RUNNING SUCCESSFULLY**

Server is live at: `http://localhost:4000`

### MongoDB Connection
- ✅ Connected to MongoDB Atlas
- ✅ Sample crops seeded (Maize, Wheat, Rice)

### Available Endpoints

---

## 1. Health Check
**GET** `/`

**Response:**
```json
{
  "ok": true,
  "service": "FarmMate Backend"
}
```

**Test in browser:**
```
http://localhost:4000
```

---

## 2. Get Crop Recommendations
**GET** `/api/crops`

**Query Parameters:**
- `soil` - Soil type (e.g., `loam`, `clay`, `sandy`)
- `season` - Season (e.g., `summer`, `winter`, `monsoon`)
- `temp` - Temperature in Celsius (e.g., `25`)

**Example Request:**
```
http://localhost:4000/api/crops?soil=loam&season=summer&temp=25
```

**Expected Response:**
```json
{
  "results": [
    {
      "_id": "...",
      "name": "Maize",
      "soilTypes": ["loam", "sandy"],
      "seasons": ["summer"],
      "minTemp": 18,
      "maxTemp": 32
    }
  ]
}
```

**Test in browser:**
```
http://localhost:4000/api/crops?soil=loam&season=summer&temp=25
http://localhost:4000/api/crops?soil=clay&season=winter&temp=15
http://localhost:4000/api/crops?soil=clay&season=monsoon&temp=25
```

---

## 3. Upload Plant Image for Analysis
**POST** `/api/plant/upload-plant`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `image` (file) - Plant image file
- `userId` (string, optional) - User ID (defaults to 'anonymous')

**Response:**
```json
{
  "id": "...",
  "result": {
    "health": "unknown",
    "confidence": 0.5,
    "suggestions": [
      "Ensure proper watering",
      "Check for pests"
    ]
  }
}
```

**Note:** Currently returns mock data. To enable real AI analysis:
1. Add `OPENAI_API_KEY` to `.env`
2. Update `backend/src/services/ai.ts` with actual OpenAI Vision API endpoint

**Test with Postman or curl:**
```powershell
# PowerShell example (requires actual image file)
$uri = "http://localhost:4000/api/plant/upload-plant"
$filePath = "C:\path\to\plant-image.jpg"
curl.exe -X POST $uri -F "image=@$filePath" -F "userId=test-user"
```

---

## 4. Chatbot Assistant
**POST** `/api/chatbot`

**Content-Type:** `application/json`

**Body:**
```json
{
  "message": "What is the best crop for sandy soil?"
}
```

**Response:**
```json
{
  "reply": "Mock reply for: What is the best crop for sandy soil?"
}
```

**Note:** Currently returns mock replies. To enable real AI:
1. Add `OPENAI_API_KEY` to `.env`
2. The service will automatically use OpenAI Chat Completions API

**Test with curl:**
```powershell
curl.exe -X POST http://localhost:4000/api/chatbot `
  -H "Content-Type: application/json" `
  -d '{"message": "What crops grow best in summer?"}'
```

---

## 5. User Signup (Firebase)
**POST** `/api/auth/signup`

**Content-Type:** `application/json`

**Body:**
```json
{
  "email": "farmer@example.com",
  "password": "securePassword123",
  "displayName": "John Farmer"
}
```

**Response:**
```json
{
  "uid": "firebase-user-id",
  "email": "farmer@example.com"
}
```

**Note:** Requires Firebase Admin credentials in `.env`. Currently disabled (shows warning).

---

## 6. User Login (Firebase)
**POST** `/api/auth/login`

**Content-Type:** `application/json`

**Body:**
```json
{
  "idToken": "firebase-id-token-from-client"
}
```

**Response:**
```json
{
  "uid": "firebase-user-id",
  "email": "farmer@example.com"
}
```

**Note:** Requires Firebase Admin credentials. Frontend must send Firebase ID token after sign-in.

---

## Running the Backend

### Start Development Server
```powershell
cd C:\Users\kusha\OneDrive\Desktop\FarmHelp\backend
npm run dev
```

### Build for Production
```powershell
npm run build
npm start
```

### Seed Sample Crops
```powershell
npx ts-node seed/cropsSeed.ts
```

---

## Environment Variables

Required in `backend/.env`:

```bash
# Server
PORT=4000

# MongoDB (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/farmmate

# Firebase Admin (Optional - for auth endpoints)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# AI Provider (Optional - for real plant analysis and chatbot)
OPENAI_API_KEY=sk-...
AI_PROVIDER=openai
AI_MODEL=gpt-4o
```

---

## Next Steps

### To Test APIs Manually:
1. Use your browser for GET requests (health check, crops)
2. Use Postman, Thunder Client (VS Code), or curl for POST requests
3. Test image upload and chatbot endpoints

### To Enable AI Features:
1. Get OpenAI API key from https://platform.openai.com/
2. Add to `.env`: `OPENAI_API_KEY=sk-...`
3. Update `backend/src/services/ai.ts` with correct API endpoints
4. Restart server

### To Enable Firebase Auth:
1. Go to Firebase Console: https://console.firebase.google.com/
2. Create/select your project
3. Go to Project Settings → Service Accounts
4. Generate new private key (downloads JSON)
5. Copy values to `.env`
6. Restart server

---

## Current Status Summary

✅ **Working:**
- Express server running on port 4000
- MongoDB Atlas connected
- CORS enabled for frontend
- Crop recommendations API functional
- Sample crops seeded (Maize, Wheat, Rice)
- Error handling and logging
- TypeScript compilation

⚠️ **Mocked (needs API keys):**
- Plant health analysis (needs OpenAI key)
- Chatbot responses (needs OpenAI key)
- Firebase authentication (needs service account)

📝 **Ready for Frontend Integration:**
- All endpoints are ready to be called from the React Native app
- CORS is configured to accept requests from any origin (adjust for production)
- API responses are JSON formatted
