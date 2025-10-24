# 🌾 FarmHelp - AI-Powered Agricultural Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.9-blue.svg)](https://www.python.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.72-61DAFB.svg)](https://reactnative.dev/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.13-FF6F00.svg)](https://www.tensorflow.org/)

> **Complete agricultural assistance platform featuring AI plant disease detection, marketplace, community features, and intelligent chatbot**

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 22.x+
- Python 3.9+
- MongoDB Atlas account
- Docker (optional, for containerized deployment)

### **1. Clone & Install**

```bash
# Clone repository
git clone https://github.com/yourusername/farmhelp.git
cd farmhelp

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run build
npm start

# ML Service setup (new terminal)
cd model-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python train_model.py --dataset data/PlantVillage --epochs 20
python app.py

# Frontend setup (new terminal)
cd frontend
npm install
npm start
```

### **2. Quick Test**

```bash
# Test backend
curl http://localhost:4000/

# Test ML service
curl http://localhost:5000/health

# Register user and upload plant image
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123!"}'

# Copy token from response, then:
curl -X POST http://localhost:4000/api/plant/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@path/to/plant_leaf.jpg"
```

---

## ✨ Features

### 🔬 **AI Plant Disease Detection**
- **38+ Disease Classes**: Tomato, Potato, Corn, Pepper, Grape, Apple, Cherry, Peach, Strawberry
- **Real-Time Analysis**: 3-5 second response time
- **EfficientNetB0 Architecture**: Pre-trained on ImageNet, fine-tuned on PlantVillage
- **Confidence Scoring**: Transparent 0-100% confidence with top-3 predictions
- **GradCAM Visualization**: See exactly where the AI detected symptoms
- **Mobile Optimized**: TensorFlow Lite quantized model (150MB → 12MB)

### 💊 **Smart Fertilizer Recommendations**
- **35+ Fertilizers**: NPK formulations, organics, fungicides, insecticides
- **Disease-Specific Matching**: Automatic recommendations based on diagnosis
- **Detailed Guidance**: Dosage, application method, safety warnings, timing
- **Legal Compliance**: Status indicators and regulatory notes
- **Safety First**: Prominent disclaimers encouraging expert consultation

### 🔄 **Active Learning & Retraining**
- **Confirmed Images Pipeline**: Experts validate predictions → added to training set
- **Automated Retraining**: Runs weekly (Sunday 2 AM) when threshold met (100+ images)
- **Manual Triggering**: Admin-initiated retraining on demand
- **Model Versioning**: Timestamp-based naming (`model_v20251021_143022.h5`)
- **Fine-Tuning**: Merge confirmed images with base dataset → 5 epochs at LR 1e-5
- **Zero-Downtime**: New model loads automatically without service restart
- **Training Reports**: JSON reports with accuracy, precision, recall, F1 metrics

### 🚜 **Services Marketplace**
- Find tractors, harvesters, equipment rentals
- Post job requests for agricultural services
- Hyper-local filtering (district, taluk, village)
- Provider ratings and reviews
- Direct communication with call tracking

### 👥 **Community Forum**
- Instagram-style feed for farmers
- Share experiences, tips, success stories
- Q&A system with upvoting
- Image sharing and engagement
- Searchable knowledge base

### 🤖 **AI Chatbot**
- Natural language agricultural advice
- Powered by Groq API
- Context-aware conversations
- 24/7 availability

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FARMHELP PLATFORM                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐     ┌──────────────┐     ┌─────────────┐ │
│  │  React Native │────▶│  Node.js API │────▶│  MongoDB    │ │
│  │  Frontend     │     │  (Express)   │     │  Atlas      │ │
│  │  (Expo)       │     │  Port: 4000  │     │             │ │
│  └──────────────┘     └───────┬──────┘     └─────────────┘ │
│                                │                              │
│                                │ HTTP POST                    │
│                                │ (with retry)                 │
│                                ▼                              │
│                       ┌──────────────┐                        │
│                       │  Flask ML    │                        │
│                       │  Service     │                        │
│                       │  Port: 5000  │                        │
│                       └───────┬──────┘                        │
│                               │                               │
│                       ┌───────▼──────┐                        │
│                       │  TensorFlow  │                        │
│                       │  EfficientNet│                        │
│                       │  + GradCAM   │                        │
│                       └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### **Disease Detection Flow**

```
User captures leaf → Upload to Node.js → Forward to Flask
                                            ↓
                                   Preprocess (224×224)
                                            ↓
                                   EfficientNetB0 inference
                                            ↓
                                   Generate GradCAM
                                            ↓
                              Match fertilizers from DB
                                            ↓
                              Save to MongoDB (PlantAnalysis)
                                            ↓
                       Return disease + confidence + fertilizers + GradCAM
```

### **Active Learning Flow**

```
Expert confirms → Copy to /data/confirmed/{disease}/
                                 ↓
                  Update MongoDB status='confirmed'
                                 ↓
              Scheduler checks stats (Sunday 2 AM)
                                 ↓
              If images >= 100 → Trigger retrain
                                 ↓
              Flask executes retrain.py:
              - Merge confirmed + PlantVillage
              - Fine-tune 5 epochs, LR 1e-5
              - Save model_v{timestamp}.h5
              - Convert to .tflite
              - Generate report JSON
                                 ↓
              Auto-reload new model (no restart)
```

---

## 🛠️ Tech Stack

**Frontend:** React Native 0.72, Expo SDK 48, TypeScript, React Navigation, React Native Paper  
**Backend:** Node.js 22, Express, MongoDB + Mongoose, JWT + bcrypt, Multer, node-cron  
**ML Service:** Python 3.9, Flask 2.3, TensorFlow 2.13, EfficientNetB0, OpenCV (GradCAM)  
**Database:** MongoDB Atlas (Cloud NoSQL)  
**Storage:** Cloudinary (images), Local FS (models, confirmed images)  
**Deployment:** Docker + docker-compose, PM2 (optional)

---

## 📁 Project Structure

```
farmhelp/
├── frontend/                    # React Native mobile app
│   ├── src/screens/
│   │   ├── PlantAnalyzer.tsx   # AI disease detection screen
│   │   ├── ServicesMarketplace.tsx
│   │   ├── CommunityFeed.tsx
│   │   └── ChatBot.tsx
│   └── src/services/api.ts     # Axios client with auth
│
├── backend/                     # Node.js Express API
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── plantAnalysisController.js
│   │   │   └── retrainingController.js  # Active learning (600+ lines)
│   │   ├── routes/
│   │   │   ├── plant-analysis.js
│   │   │   └── retraining.js
│   │   └── index.ts            # Entry point + scheduler
│   ├── uploads/                # User images (temp)
│   └── data/confirmed/         # Training images by disease
│
├── model-service/               # Flask ML microservice
│   ├── app.py                   # Main Flask app
│   ├── train_model.py           # Initial training script
│   ├── retrain.py               # Active learning pipeline (700+ lines)
│   ├── services/
│   │   ├── inference_service.py
│   │   └── fertilizer_recommender.py  # Fertilizer matching (400+ lines)
│   ├── data/
│   │   ├── PlantVillage/       # Base training dataset (12GB)
│   │   ├── confirmed/          # Confirmed images from users
│   │   └── fertilizers/
│   │       ├── fertilizers.csv # 35+ fertilizers
│   │       └── disease_fertilizer_map.json
│   └── models/
│       ├── plant_disease_model.h5       # Main model (150MB)
│       ├── plant_disease_model.tflite   # Mobile model (12MB)
│       └── retrained/          # Versioned models
│
├── docker-compose.yml           # Multi-container orchestration
├── FarmHelp_API_Collection.postman_collection.json  # API tests
├── README.md                    # This file
└── PROJECT_OVERVIEW.md          # Comprehensive documentation
```

---

## 📚 API Documentation

### **Base URL**: `http://localhost:4000`

### **Authentication**
```
POST   /api/auth/register        - Create account
POST   /api/auth/login           - Get JWT token
GET    /api/auth/me              - Get current user
```

### **Plant Disease Analysis**
```
POST   /api/plant/analyze                    - Upload image for analysis
GET    /api/plant/history                    - Get analysis history (paginated)
GET    /api/plant/analysis/:id               - Get specific analysis
POST   /api/plant/analysis/:id/feedback      - Add feedback
POST   /api/plant/analysis/:id/request-review - Request expert review
```

### **Retraining System**
```
POST   /api/retrain/confirm-image/:analysisId  - Confirm image for training
GET    /api/retrain/stats                      - Get confirmed images stats
POST   /api/retrain/trigger                    - Trigger retraining (admin)
GET    /api/retrain/status                     - Get model versions
```

**Postman Collection**: Import `FarmHelp_API_Collection.postman_collection.json` for complete testing suite with examples and automated tests.

---

## 🐳 Deployment

### **Docker Compose (Recommended)**

```bash
# 1. Configure environment
cp .env.docker .env
nano .env  # Add MongoDB URI, JWT secret

# 2. Build and start
docker-compose build
docker-compose up -d

# 3. Check health
docker-compose ps
docker-compose logs -f ml-service

# 4. Test endpoints
curl http://localhost:5000/health
curl http://localhost:8000/

# 5. Stop
docker-compose down
```

### **Manual Deployment**

**Backend:**
```bash
cd backend
npm run build
npm install -g pm2
pm2 start dist/index.js --name farmhelp-backend
pm2 save
```

**Flask:**
```bash
cd model-service
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## 🧪 Testing

### **API Tests (Postman)**

```bash
# Install Newman
npm install -g newman

# Run collection
newman run FarmHelp_API_Collection.postman_collection.json
```

### **End-to-End Test**

1. **Register User** → Get JWT token
2. **Upload Plant Image** → Get disease prediction
3. **Confirm Prediction** → Image added to training set
4. **Check Stats** → Verify confirmed image count
5. **Trigger Retrain** → New model created
6. **Upload Another Image** → Test improved model

---

## 🎯 Quick Commands

```bash
# Backend
cd backend && npm start          # Start API (port 4000)
cd backend && npm run dev        # Dev mode with auto-reload
cd backend && npm test           # Run tests

# ML Service
cd model-service && python app.py                    # Start Flask (port 5000)
cd model-service && python train_model.py --dataset data/PlantVillage --epochs 20
cd model-service && python retrain.py --confirmed-dir data/confirmed --epochs 5

# Frontend
cd frontend && npm start         # Start Expo (port 19000)

# Docker
docker-compose up -d             # Start all services
docker-compose logs -f ml-service # View logs
docker-compose ps                # Check health
docker-compose down              # Stop all
```

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: add feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Create Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

---

## 📞 Contact

- **Issues**: [GitHub Issues](https://github.com/yourusername/farmhelp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/farmhelp/discussions)
- **Email**: support@farmhelp.com

---

## 🤖 AI Assistant Continuation Prompt

**For ChatGPT/Claude/GitHub Copilot:**

> I'm working on **FarmHelp**, an agricultural platform with AI plant disease detection, marketplace, community features, and chatbot. The system uses React Native (frontend), Node.js + Express (backend), Flask + TensorFlow (ML service), and MongoDB (database).
>
> **Current Status:**
> - ✅ Full ML pipeline (training, inference, GradCAM, fertilizer recommendations)
> - ✅ Active learning system (confirm images → auto-retrain → model versioning)
> - ✅ Docker deployment (docker-compose with shared volumes)
> - ✅ API testing suite (Postman collection)
> - ✅ Complete documentation
>
> **Key Files:**
> - `backend/src/controllers/retrainingController.js` (600+ lines)
> - `model-service/retrain.py` (700+ lines)
> - `model-service/services/fertilizer_recommender.py` (400+ lines)
> - `frontend/src/screens/PlantAnalyzer.tsx`
> - `docker-compose.yml`
>
> **Tech Stack:**
> Frontend: React Native 0.72, Expo, TypeScript
> Backend: Node.js 22, Express, MongoDB, JWT, Multer, node-cron
> ML: Flask, TensorFlow 2.13, EfficientNetB0, OpenCV (GradCAM)
>
> **Next Features:**
> 1. Multi-language support (i18n)
> 2. Offline mode (on-device inference)
> 3. Pest detection
> 4. Weather-based recommendations
> 5. Soil health analysis
>
> **Documentation**: `README.md`, `PROJECT_OVERVIEW.md`, `docs/` folder
>
> Let's continue building FarmHelp! What would you like to work on?

---

**Made with ❤️ for farmers everywhere** 🌾
