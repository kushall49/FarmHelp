# 🌿 Plant Analyzer - Production Architecture

## 📋 Overview

A **production-grade plant disease detection system** using:
- **Flask (Python)** - TensorFlow/EfficientNet model service
- **Node.js (Express)** - Backend API orchestrator
- **MongoDB** - Store analysis history and metadata
- **React Native** - Mobile/web frontend

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     REACT NATIVE FRONTEND                    │
│                    (Expo - Port 19000)                       │
│  - Upload plant image                                        │
│  - Display disease name + confidence                         │
│  - Show treatment recommendations                            │
│  - Display GradCAM heatmap                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
                       │ POST /api/plant/analyze
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    NODE.JS BACKEND API                       │
│                   (Express - Port 4000)                      │
│  1. Receive image from frontend                              │
│  2. Upload image to Cloudinary                               │
│  3. Forward image to Flask ML service                        │
│  4. Receive predictions from Flask                           │
│  5. Store analysis in MongoDB                                │
│  6. Return results to frontend                               │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP
                       │ POST /predict
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  FLASK ML MODEL SERVICE                      │
│                    (Python - Port 5000)                      │
│  1. Receive image                                            │
│  2. Preprocess (resize, normalize)                           │
│  3. Run EfficientNet inference                               │
│  4. Generate GradCAM visualization                           │
│  5. Get treatment recommendations                            │
│  6. Return JSON response                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                          │
│                   (MongoDB Atlas)                            │
│  Collection: plantanalyses                                   │
│  - User ID                                                   │
│  - Original image URL                                        │
│  - GradCAM heatmap URL                                       │
│  - Disease name                                              │
│  - Confidence score                                          │
│  - Treatment recommendations                                 │
│  - Timestamp                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Folder Structure

### **Complete Project Structure:**

```
FarmHelp/
│
├── model-service/                    ← Flask ML Service (NEW)
│   ├── app.py                        ← Main Flask app
│   ├── config.py                     ← Configuration
│   ├── requirements.txt              ← Python dependencies
│   ├── Dockerfile                    ← Docker container
│   ├── .dockerignore                 ← Docker ignore file
│   ├── .env                          ← Environment variables
│   │
│   ├── models/                       ← Model Management
│   │   ├── __init__.py
│   │   ├── model_loader.py           ← Load TensorFlow model
│   │   └── efficientnet_v2.h5        ← Trained model file
│   │
│   ├── core/                         ← Core ML Logic
│   │   ├── __init__.py
│   │   ├── preprocess.py             ← Image preprocessing
│   │   ├── predict.py                ← Inference logic
│   │   └── gradcam.py                ← GradCAM visualization
│   │
│   ├── services/                     ← Business Logic
│   │   ├── __init__.py
│   │   ├── image_service.py          ← Image handling
│   │   └── recommendation_service.py ← Treatment recommendations
│   │
│   ├── utils/                        ← Utilities
│   │   ├── __init__.py
│   │   ├── logger.py                 ← Logging
│   │   └── validators.py             ← Input validation
│   │
│   ├── data/                         ← Static Data
│   │   ├── disease_info.json         ← Disease descriptions
│   │   └── treatments.json           ← Treatment guidelines
│   │
│   └── tests/                        ← Unit Tests
│       ├── test_preprocess.py
│       ├── test_predict.py
│       └── test_api.py
│
├── backend/src/                      ← Node.js Backend (UPDATED)
│   ├── controllers/
│   │   └── plantAnalysisController.js ← New controller
│   ├── routes/
│   │   └── plantAnalysis.js          ← New route
│   ├── models/
│   │   └── PlantAnalysis.js          ← New MongoDB model
│   └── services/
│       └── mlService.js              ← Flask API client
│
├── frontend/src/screens/             ← React Native Frontend (UPDATED)
│   └── PlantAnalyzer.tsx             ← Enhanced UI
│
└── docker-compose.yml                ← Multi-container orchestration
```

---

## 🐍 Flask Model Service - Detailed Structure

### **model-service/ Folder:**

```
model-service/
│
├── 📄 app.py                         ← Flask application entry point
│   • Initialize Flask app
│   • Register blueprints
│   • Configure CORS
│   • Health check endpoint
│
├── 📄 config.py                      ← Configuration management
│   • Model paths
│   • Image settings (size, format)
│   • Confidence thresholds
│   • Environment-based config
│
├── 📄 requirements.txt               ← Python dependencies
│   tensorflow==2.15.0
│   flask==3.0.0
│   flask-cors==4.0.0
│   pillow==10.1.0
│   numpy==1.26.0
│   opencv-python==4.8.1
│   gunicorn==21.2.0
│
├── 📄 Dockerfile                     ← Docker container definition
├── 📄 .dockerignore                  ← Exclude from Docker build
├── 📄 .env                           ← Environment variables
│
├── 📁 models/                        ← Model Files
│   ├── __init__.py
│   ├── model_loader.py               ← Load and cache TensorFlow model
│   │   • load_model()
│   │   • get_model()
│   │   • validate_model()
│   └── efficientnet_v2.h5            ← Trained model (150MB)
│
├── 📁 core/                          ← Core ML Logic
│   ├── __init__.py
│   │
│   ├── preprocess.py                 ← Image preprocessing
│   │   • resize_image(img, target_size=(224,224))
│   │   • normalize_image(img)
│   │   • augment_image(img) [optional]
│   │   • validate_image(img)
│   │
│   ├── predict.py                    ← Inference engine
│   │   • predict_disease(image, model)
│   │   • get_top_k_predictions(preds, k=3)
│   │   • calculate_confidence(preds)
│   │   • format_prediction_response()
│   │
│   └── gradcam.py                    ← GradCAM heatmap generation
│       • generate_gradcam(model, image, layer_name)
│       • overlay_heatmap(original, heatmap)
│       • save_gradcam_image(gradcam, output_path)
│
├── 📁 services/                      ← Business Logic
│   ├── __init__.py
│   │
│   ├── image_service.py              ← Image handling
│   │   • decode_base64_image(base64_str)
│   │   • save_uploaded_image(file)
│   │   • convert_to_rgb(image)
│   │   • compress_image(image, quality=95)
│   │
│   └── recommendation_service.py     ← Treatment recommendations
│       • get_treatment_for_disease(disease_name)
│       • get_prevention_tips(disease_name)
│       • get_severity_level(confidence)
│       • format_recommendations()
│
├── 📁 utils/                         ← Utilities
│   ├── __init__.py
│   │
│   ├── logger.py                     ← Logging configuration
│   │   • setup_logger()
│   │   • log_prediction()
│   │   • log_error()
│   │
│   └── validators.py                 ← Input validation
│       • validate_image_file(file)
│       • validate_image_size(file)
│       • validate_image_format(file)
│       • sanitize_filename(filename)
│
├── 📁 data/                          ← Static Knowledge Base
│   ├── disease_info.json             ← Disease metadata
│   │   {
│   │     "Tomato_Late_Blight": {
│   │       "name": "Late Blight",
│   │       "description": "Fungal disease...",
│   │       "symptoms": ["..."],
│   │       "severity": "high"
│   │     }
│   │   }
│   │
│   └── treatments.json               ← Treatment database
│       {
│         "Tomato_Late_Blight": {
│           "chemical": ["Fungicide X"],
│           "organic": ["Copper spray"],
│           "preventive": ["Crop rotation"],
│           "emergency_actions": ["Remove infected plants"]
│         }
│       }
│
└── 📁 tests/                         ← Unit Tests
    ├── test_preprocess.py            ← Test preprocessing
    ├── test_predict.py               ← Test inference
    ├── test_gradcam.py               ← Test GradCAM
    └── test_api.py                   ← Test Flask endpoints
```

---

## 🔗 Data Flow Diagram

### **Complete Request Flow:**

```
┌──────────────┐
│   USER       │
│ (Frontend)   │
└──────┬───────┘
       │
       │ 1. Takes photo of plant leaf
       │
       ▼
┌──────────────────────────────────┐
│  REACT NATIVE FRONTEND           │
│  PlantAnalyzer.tsx               │
└──────┬───────────────────────────┘
       │
       │ 2. POST /api/plant/analyze
       │    { image: base64, userId: "..." }
       │
       ▼
┌──────────────────────────────────┐
│  NODE.JS BACKEND                 │
│  plantAnalysisController.js      │
│                                  │
│  Step A: Validate JWT token      │
│  Step B: Upload to Cloudinary    │
│  Step C: Get Cloudinary URL      │
└──────┬───────────────────────────┘
       │
       │ 3. POST http://flask:5000/predict
       │    { image_url: "https://..." }
       │    or
       │    { image: base64 }
       │
       ▼
┌──────────────────────────────────┐
│  FLASK ML SERVICE                │
│  app.py → predict_endpoint()     │
│                                  │
│  Step 1: Receive image           │
│  Step 2: Validate & decode       │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  PREPROCESS                      │
│  core/preprocess.py              │
│                                  │
│  • Resize to 224x224             │
│  • Normalize [0,1]               │
│  • Convert to RGB                │
│  • Add batch dimension           │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  MODEL INFERENCE                 │
│  core/predict.py                 │
│                                  │
│  • Load EfficientNet model       │
│  • model.predict(preprocessed)   │
│  • Get probabilities             │
│  • Extract top-3 predictions     │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  GRADCAM GENERATION              │
│  core/gradcam.py                 │
│                                  │
│  • Get last conv layer           │
│  • Compute gradients             │
│  • Generate heatmap              │
│  • Overlay on original image     │
│  • Save as base64                │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  GET RECOMMENDATIONS             │
│  services/recommendation.py      │
│                                  │
│  • Load disease_info.json        │
│  • Load treatments.json          │
│  • Format response               │
└──────┬───────────────────────────┘
       │
       │ 4. Return JSON:
       │    {
       │      "disease": "Tomato_Late_Blight",
       │      "confidence": 0.94,
       │      "predictions": [...],
       │      "gradcam_image": "base64...",
       │      "recommendations": {...}
       │    }
       │
       ▼
┌──────────────────────────────────┐
│  NODE.JS BACKEND                 │
│  plantAnalysisController.js      │
│                                  │
│  Step D: Receive Flask response  │
│  Step E: Upload GradCAM to Cloud │
│  Step F: Save to MongoDB         │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  MONGODB                         │
│  plantanalyses collection        │
│                                  │
│  {                               │
│    userId: ObjectId,             │
│    originalImage: "url",         │
│    gradcamImage: "url",          │
│    disease: "Late Blight",       │
│    confidence: 0.94,             │
│    predictions: [...],           │
│    recommendations: {...},       │
│    timestamp: Date               │
│  }                               │
└──────┬───────────────────────────┘
       │
       │ 5. Return to frontend:
       │    {
       │      "success": true,
       │      "data": {
       │        "disease": "Late Blight",
       │        "confidence": 94,
       │        "gradcam": "url",
       │        "treatment": "..."
       │      }
       │    }
       │
       ▼
┌──────────────────────────────────┐
│  REACT NATIVE FRONTEND           │
│  PlantAnalyzer.tsx               │
│                                  │
│  • Display disease name          │
│  • Show confidence bar           │
│  • Display GradCAM heatmap       │
│  • List treatment steps          │
│  • Save to history               │
└──────────────────────────────────┘
```

---

## 🔌 REST API Endpoints

### **1. Flask ML Service (Port 5000):**

#### **POST /predict**
Predict plant disease from image

**Request:**
```json
{
  "image": "base64_encoded_image_string",
  "return_gradcam": true,
  "top_k": 3
}
```

**Response:**
```json
{
  "success": true,
  "disease": "Tomato_Late_Blight",
  "confidence": 0.9432,
  "predictions": [
    {
      "disease": "Tomato_Late_Blight",
      "confidence": 0.9432,
      "probability": "94.32%"
    },
    {
      "disease": "Tomato_Early_Blight",
      "confidence": 0.0312,
      "probability": "3.12%"
    },
    {
      "disease": "Healthy",
      "confidence": 0.0156,
      "probability": "1.56%"
    }
  ],
  "gradcam_image": "base64_encoded_heatmap",
  "recommendations": {
    "disease_name": "Late Blight",
    "severity": "high",
    "description": "A serious fungal disease affecting tomato plants...",
    "symptoms": [
      "Dark spots on leaves",
      "White fuzzy growth on undersides",
      "Rapid leaf death"
    ],
    "treatment": {
      "chemical": [
        "Apply copper-based fungicide",
        "Use chlorothalonil spray"
      ],
      "organic": [
        "Remove infected leaves immediately",
        "Apply neem oil spray",
        "Improve air circulation"
      ],
      "preventive": [
        "Avoid overhead watering",
        "Practice crop rotation",
        "Use resistant varieties"
      ]
    },
    "urgency": "immediate_action_required"
  },
  "processing_time": "1.23s"
}
```

#### **GET /health**
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_name": "EfficientNetV2",
  "version": "1.0.0",
  "uptime": "3h 42m"
}
```

#### **POST /validate**
Validate image without prediction

**Request:**
```json
{
  "image": "base64_string"
}
```

**Response:**
```json
{
  "valid": true,
  "format": "JPEG",
  "size": "224x224",
  "file_size_kb": 45
}
```

---

### **2. Node.js Backend (Port 4000):**

#### **POST /api/plant/analyze**
Analyze plant disease (orchestrates Flask call)

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request:**
```json
{
  "image": "base64_encoded_image",
  "include_gradcam": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysisId": "64abc123...",
    "disease": "Tomato_Late_Blight",
    "diseaseName": "Late Blight",
    "confidence": 94.32,
    "severity": "high",
    "originalImage": "https://cloudinary.com/...",
    "gradcamImage": "https://cloudinary.com/...",
    "predictions": [...],
    "recommendations": {
      "treatment": [...],
      "preventive": [...]
    },
    "analyzedAt": "2025-01-21T10:30:00Z"
  }
}
```

#### **GET /api/plant/history**
Get user's analysis history

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "64abc123...",
      "disease": "Late Blight",
      "confidence": 94.32,
      "thumbnail": "url",
      "date": "2025-01-21"
    }
  ],
  "total": 15
}
```

#### **GET /api/plant/analysis/:id**
Get specific analysis details

**Response:**
```json
{
  "success": true,
  "data": {
    // Full analysis object
  }
}
```

#### **DELETE /api/plant/analysis/:id**
Delete analysis record

**Response:**
```json
{
  "success": true,
  "message": "Analysis deleted successfully"
}
```

---

## 📦 File Responsibilities

### **Flask Service Files:**

| File | Purpose | Key Functions |
|------|---------|---------------|
| `app.py` | Flask app entry point | • Initialize Flask<br>• Register routes<br>• Configure CORS<br>• Error handling |
| `config.py` | Configuration management | • Model paths<br>• Image settings<br>• Thresholds<br>• Env vars |
| `models/model_loader.py` | Model management | • `load_model()`<br>• `get_model()`<br>• Cache model in memory |
| `core/preprocess.py` | Image preprocessing | • `resize_image()`<br>• `normalize_image()`<br>• `validate_image()` |
| `core/predict.py` | Inference logic | • `predict_disease()`<br>• `get_top_k_predictions()`<br>• Format output |
| `core/gradcam.py` | Visualization | • `generate_gradcam()`<br>• `overlay_heatmap()`<br>• Save heatmap |
| `services/image_service.py` | Image utilities | • `decode_base64()`<br>• `save_image()`<br>• `compress_image()` |
| `services/recommendation_service.py` | Treatment logic | • `get_treatment()`<br>• Load disease DB<br>• Format recommendations |
| `utils/logger.py` | Logging | • Setup logger<br>• Log predictions<br>• Error tracking |
| `utils/validators.py` | Validation | • Validate image<br>• Check file size<br>• Sanitize inputs |

### **Node.js Backend Files:**

| File | Purpose | Key Functions |
|------|---------|---------------|
| `controllers/plantAnalysisController.js` | Orchestration | • Receive from frontend<br>• Call Flask API<br>• Save to MongoDB<br>• Return response |
| `routes/plantAnalysis.js` | API routes | • POST /analyze<br>• GET /history<br>• GET /analysis/:id |
| `models/PlantAnalysis.js` | MongoDB schema | • Define schema<br>• Indexes<br>• Methods |
| `services/mlService.js` | Flask client | • HTTP client to Flask<br>• Error handling<br>• Retry logic |

---

## 🐳 Docker Configuration

### **docker-compose.yml (Root):**

```yaml
version: '3.8'

services:
  # Flask ML Service
  ml-service:
    build: ./model-service
    container_name: farmhelp-ml
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - MODEL_PATH=/app/models/efficientnet_v2.h5
    volumes:
      - ./model-service/models:/app/models
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Node.js Backend
  backend:
    build: ./backend
    container_name: farmhelp-backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - ML_SERVICE_URL=http://ml-service:5000
      - CLOUDINARY_URL=${CLOUDINARY_URL}
    depends_on:
      - ml-service
    restart: unless-stopped

  # MongoDB (optional - use Atlas in prod)
  mongodb:
    image: mongo:7.0
    container_name: farmhelp-db
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=secret
    restart: unless-stopped

volumes:
  mongodb_data:

networks:
  default:
    name: farmhelp-network
```

---

## 📊 MongoDB Schema

### **PlantAnalysis Model:**

```javascript
const mongoose = require('mongoose');

const plantAnalysisSchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Images
  originalImage: {
    url: { type: String, required: true },
    publicId: String,
    size: Number,
    format: String
  },
  
  gradcamImage: {
    url: String,
    publicId: String
  },
  
  // Prediction results
  disease: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }
  },
  
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  
  // Top predictions
  predictions: [{
    disease: String,
    confidence: Number,
    probability: String
  }],
  
  // Treatment recommendations
  recommendations: {
    symptoms: [String],
    chemical: [String],
    organic: [String],
    preventive: [String],
    urgency: String
  },
  
  // Metadata
  processingTime: Number, // in seconds
  modelVersion: String,
  
  // User notes (optional)
  userNotes: String,
  
  // Location (optional)
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  }
  
}, {
  timestamps: true
});

// Indexes
plantAnalysisSchema.index({ createdAt: -1 });
plantAnalysisSchema.index({ user: 1, createdAt: -1 });
plantAnalysisSchema.index({ 'disease.id': 1 });

module.exports = mongoose.model('PlantAnalysis', plantAnalysisSchema);
```

---

## 🚀 Next Steps

1. **Create Flask service files** (I can generate all the code)
2. **Update Node.js backend** (Add new controller and routes)
3. **Update React Native frontend** (Enhanced UI)
4. **Docker setup** (Containerize everything)
5. **Deploy to cloud** (AWS/GCP/Azure)

Would you like me to create the actual code files now? I can generate:
- ✅ Complete Flask service (all 15+ files)
- ✅ Node.js controller and routes
- ✅ Updated PlantAnalyzer.tsx
- ✅ Docker files
- ✅ Deployment scripts

Let me know and I'll build it all! 🚀
