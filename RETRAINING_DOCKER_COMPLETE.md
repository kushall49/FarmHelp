# Active Learning & Retraining System - Complete Guide

## 🎓 **Active Learning System Architecture**

### **Overview**
The system continuously improves by collecting confirmed predictions and retraining the model periodically.

```
User Uploads Image → Model Predicts → Expert Reviews → Confirm Correct
                                                              ↓
                                                    Save to /data/confirmed/
                                                              ↓
                                            Accumulate 100+ confirmed images
                                                              ↓
                                               Trigger Retraining (Manual/Auto)
                                                              ↓
                                          Fine-tune model for 5 epochs
                                                              ↓
                                      Save as model_vYYYYMMDD_HHMMSS.h5
                                                              ↓
                                         Convert to .tflite (quantized)
                                                              ↓
                                        Update Flask service with new model
                                                              ↓
                                                  Improved predictions!
```

---

## 📁 **File Structure**

### **Backend (Node.js)**
```
backend/
├── src/
│   ├── controllers/
│   │   └── retrainingController.js    ✅ Retraining logic
│   └── routes/
│       └── retraining.js              ✅ Retraining endpoints
└── data/
    └── confirmed/                     📂 Confirmed images by disease
        ├── Tomato_Late_blight/
        ├── Potato_Early_blight/
        └── ...
```

### **ML Service (Flask)**
```
model-service/
├── retrain.py                         ✅ Retraining script
├── models/
│   ├── plant_disease_model.h5         Current production model
│   └── retrained/                     📂 Retrained versions
│       ├── plant_disease_model_v20251021_143022.h5
│       ├── plant_disease_model_v20251021_143022.tflite
│       └── class_labels_v20251021_143022.json
└── data/
    └── confirmed/                     📂 Shared with Node.js
```

---

## 🔧 **System Components**

### **1. Node.js Retraining Controller**

#### **Endpoints Created:**

```javascript
POST   /api/retrain/confirm-image/:analysisId
Body:  { confirmedDisease?: String }
```
- Saves analysis image to `/data/confirmed/{crop}_{disease}/`
- Marks analysis as `confirmedForTraining: true`
- Updates MongoDB with confirmed disease

```javascript
GET    /api/retrain/stats
```
- Returns count of confirmed images by disease
- Shows if ready for retraining (>= 100 images)
- Returns pending expert reviews

```javascript
POST   /api/retrain/trigger
Body:  { epochs?: Number, batchSize?: Number }
```
- Manually trigger retraining
- Calls Flask `/retrain` endpoint
- Returns new model version

```javascript
GET    /api/retrain/status
```
- Checks Flask retraining status
- Lists available model versions

#### **Auto-Retraining Scheduler:**

```javascript
// Schedule automatic retraining
exports.scheduleAutoRetraining = () => {
  // Runs every Sunday at 2 AM by default
  cron.schedule('0 2 * * 0', async () => {
    // Check if we have >= 100 confirmed images
    // If yes, trigger retraining automatically
  });
};
```

**Environment Variables:**
```bash
AUTO_RETRAIN_ENABLED=true
AUTO_RETRAIN_SCHEDULE=0 2 * * 0    # Cron format: Sunday 2 AM
MIN_IMAGES_FOR_RETRAIN=100
```

---

### **2. Flask Retraining Endpoints**

#### **Added to `app.py`:**

```python
@app.route('/retrain', methods=['POST'])
def retrain_model():
    """
    Retrain model with confirmed images
    Body: { confirmed_data_path, epochs, batch_size }
    """
    # 1. Load current production model
    # 2. Merge confirmed images with original dataset
    # 3. Fine-tune for N epochs (default: 5)
    # 4. Save as model_vYYYYMMDD_HHMMSS.h5
    # 5. Convert to .tflite
    # 6. Update model_loader with new model
    # 7. Return new model version info
```

```python
@app.route('/retrain-status', methods=['GET'])
def retrain_status():
    """
    Check available retrained models
    Returns: { available_versions: [...], current_model: ... }
    """
```

---

### **3. Retraining Script (`retrain.py`)**

#### **Key Class: `RetrainingSystem`**

```python
class RetrainingSystem:
    def __init__(self, base_model_path, confirmed_data_path, output_dir):
        # Initialize retraining system
        
    def load_base_model(self):
        # Load current production model (.h5)
        
    def merge_datasets(self, original_dataset_path=None):
        # Merge confirmed images with original PlantVillage
        # Or use only confirmed images for fine-tuning
        
    def prepare_dataset(self, dataset_path):
        # Create TensorFlow datasets (train/val split)
        
    def fine_tune_model(self, train_ds, val_ds, epochs=5):
        # Fine-tune with very low learning rate (1e-5)
        # Callbacks: ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
        
    def save_retrained_model(self, checkpoint_path, timestamp, class_names):
        # Save as .h5, .tflite, class_labels.json, metadata.json
        
    def run_retraining(self, original_dataset_path=None, epochs=5):
        # Complete pipeline: load → merge → train → save
```

#### **CLI Usage:**

```bash
python retrain.py \
  --base-model models/plant_disease_model.h5 \
  --confirmed-data ../backend/data/confirmed \
  --original-dataset data/PlantVillage \
  --epochs 5 \
  --output-dir models/retrained
```

---

## 🚀 **How to Use the Retraining System**

### **Workflow:**

#### **Step 1: Confirm Images (via API or Admin Panel)**

```bash
POST http://localhost:4000/api/retrain/confirm-image/507f1f77bcf86cd799439011
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "confirmedDisease": "Tomato_Late_blight"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Image confirmed and saved for retraining",
  "path": "/data/confirmed/Tomato_Late_blight/507f1f77bcf86cd799439011_1729512345.jpg",
  "disease": "Tomato_Late_blight"
}
```

#### **Step 2: Check Retraining Stats**

```bash
GET http://localhost:4000/api/retrain/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalConfirmedImages": 150,
    "imagesByDisease": {
      "Tomato_Late_blight": 45,
      "Tomato_Early_blight": 38,
      "Potato_Late_blight": 32,
      "Corn_Common_rust": 35
    },
    "pendingReviews": 12,
    "readyForRetraining": true,
    "minImagesRequired": 100
  }
}
```

#### **Step 3: Trigger Retraining (Manual)**

```bash
POST http://localhost:4000/api/retrain/trigger
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "epochs": 5,
  "batchSize": 32
}
```

**Response:**
```json
{
  "success": true,
  "message": "Retraining completed successfully",
  "result": {
    "version": "20251021_143022",
    "h5_path": "models/retrained/plant_disease_model_v20251021_143022.h5",
    "tflite_path": "models/retrained/plant_disease_model_v20251021_143022.tflite",
    "labels_path": "models/retrained/class_labels_v20251021_143022.json"
  },
  "training_time_seconds": 1847.23
}
```

#### **Step 4: Verify New Model Loaded**

```bash
GET http://localhost:5000/health
```

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_version": "20251021_143022",
  "timestamp": "2025-10-21T14:30:22Z"
}
```

---

### **Automatic Retraining (Cron Job)**

Add to `backend/src/index.ts`:

```typescript
import { scheduleAutoRetraining } from './controllers/retrainingController';

async function start() {
  // ... existing setup ...
  
  // Start auto-retraining scheduler
  scheduleAutoRetraining();
  
  // ... start server ...
}
```

**Schedule Configuration:**

```bash
# .env
AUTO_RETRAIN_ENABLED=true
AUTO_RETRAIN_SCHEDULE=0 2 * * 0    # Every Sunday at 2 AM
MIN_IMAGES_FOR_RETRAIN=100
```

**Cron Format:**
```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
0 2 * * 0    # Every Sunday at 2:00 AM
```

**Examples:**
- `0 0 * * *` - Daily at midnight
- `0 2 * * 1` - Every Monday at 2 AM
- `0 */6 * * *` - Every 6 hours
- `0 0 1 * *` - First day of each month

---

## 🐳 **Docker Configuration**

### **1. Flask ML Service Dockerfile**

```dockerfile
FROM python:3.9-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx libglib2.0-0 libsm6 libxext6 libxrender-dev libgomp1

# Install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create directories
RUN mkdir -p models data logs uploads

ENV FLASK_ENV=production
ENV MODEL_PATH=models/plant_disease_model.h5

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s CMD python -c "import requests; requests.get('http://localhost:5000/health', timeout=5)"

CMD ["python", "app.py"]
```

### **2. Node.js Backend Dockerfile**

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Install dependencies
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci --only=production

# Copy and build
COPY src/ ./src/
COPY prisma/ ./prisma/
RUN npm run build

# Create directories
RUN mkdir -p uploads/plants data/confirmed logs

ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s CMD node -e "const http = require('http'); http.get('http://localhost:8000/', (res) => process.exit(res.statusCode === 200 ? 0 : 1));"

CMD ["node", "dist/index.js"]
```

### **3. Docker Compose**

```yaml
version: '3.8'

services:
  ml-service:
    build: ./model-service
    container_name: farmhelp-ml-service
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - MODEL_PATH=models/plant_disease_model.h5
    volumes:
      - ml-models:/app/models              # Persist models
      - confirmed-data:/app/data/confirmed # Share with backend
      - ml-logs:/app/logs
    networks:
      - farmhelp-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "python", "-c", "import requests; requests.get('http://localhost:5000/health', timeout=5)"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

  backend:
    build: ./backend
    container_name: farmhelp-backend
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - FLASK_SERVICE_URL=http://ml-service:5000
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - AUTO_RETRAIN_ENABLED=true
      - AUTO_RETRAIN_SCHEDULE=0 2 * * 0
      - MIN_IMAGES_FOR_RETRAIN=100
    volumes:
      - backend-uploads:/app/uploads
      - confirmed-data:/app/data/confirmed # Shared with ML service
      - backend-logs:/app/logs
    networks:
      - farmhelp-network
    depends_on:
      - ml-service
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "..."]
      interval: 30s
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G

volumes:
  ml-models:        # Persist trained models
  ml-logs:
  ml-uploads:
  backend-uploads:
  backend-logs:
  confirmed-data:   # Shared between services

networks:
  farmhelp-network:
    driver: bridge
```

---

## 🚀 **Using Docker**

### **Build and Start:**

```bash
# Create .env file
cp .env.docker .env
# Edit .env with your MongoDB URI and JWT secret

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### **Retraining in Docker:**

```bash
# Trigger retraining via API
curl -X POST http://localhost:8000/api/retrain/trigger \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"epochs": 5, "batchSize": 32}'

# Docker will automatically:
# 1. Run retraining in ml-service container
# 2. Save new model to ml-models volume
# 3. Flask service loads new model automatically
# 4. No restart needed!
```

### **Model Persistence:**

```bash
# Backup models volume
docker run --rm -v farmhelp_ml-models:/models -v $(pwd):/backup \
  alpine tar czf /backup/models-backup.tar.gz -C /models .

# Restore models volume
docker run --rm -v farmhelp_ml-models:/models -v $(pwd):/backup \
  alpine tar xzf /backup/models-backup.tar.gz -C /models
```

---

## 📊 **Retraining Pseudocode**

```python
# PSEUDOCODE: Complete Retraining Pipeline

def retrain_model(confirmed_images_path, base_model_path, epochs=5):
    """
    Active learning retraining pipeline
    """
    
    # STEP 1: Load Current Production Model
    print("Loading base model...")
    model = keras.models.load_model(base_model_path)
    print(f"✓ Model loaded: {model.input_shape} → {model.output_shape}")
    
    # STEP 2: Count Confirmed Images
    print("\nCounting confirmed images...")
    confirmed_count = 0
    for disease_dir in os.listdir(confirmed_images_path):
        disease_path = os.path.join(confirmed_images_path, disease_dir)
        if os.path.isdir(disease_path):
            images = [f for f in os.listdir(disease_path) if f.endswith(('.jpg', '.png'))]
            confirmed_count += len(images)
            print(f"  {disease_dir}: {len(images)} images")
    
    if confirmed_count < MIN_IMAGES:
        raise ValueError(f"Not enough images: {confirmed_count} < {MIN_IMAGES}")
    
    print(f"✓ Total confirmed images: {confirmed_count}")
    
    # STEP 3: Prepare Dataset
    print("\nPreparing dataset...")
    train_ds, val_ds = prepare_tf_dataset(
        confirmed_images_path,
        image_size=(224, 224),
        batch_size=32,
        train_split=0.8
    )
    
    # STEP 4: Fine-Tune Model
    print(f"\nFine-tuning for {epochs} epochs...")
    model.compile(
        optimizer=Adam(learning_rate=1e-5),  # Very low LR
        loss='categorical_crossentropy',
        metrics=['accuracy', Precision(), Recall(), AUC()]
    )
    
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        callbacks=[
            ModelCheckpoint('best_model.h5', save_best_only=True),
            EarlyStopping(patience=3),
            ReduceLROnPlateau(factor=0.5, patience=2)
        ]
    )
    
    print(f"✓ Training complete!")
    print(f"  Final accuracy: {history.history['accuracy'][-1]:.4f}")
    print(f"  Val accuracy: {history.history['val_accuracy'][-1]:.4f}")
    
    # STEP 5: Save New Model Version
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    new_model_path = f"models/retrained/model_v{timestamp}.h5"
    model.save(new_model_path)
    print(f"✓ Saved model: {new_model_path}")
    
    # STEP 6: Convert to TFLite
    tflite_path = f"models/retrained/model_v{timestamp}.tflite"
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    tflite_model = converter.convert()
    
    with open(tflite_path, 'wb') as f:
        f.write(tflite_model)
    
    print(f"✓ Saved TFLite: {tflite_path}")
    
    # STEP 7: Return Metadata
    return {
        'version': timestamp,
        'h5_path': new_model_path,
        'tflite_path': tflite_path,
        'accuracy': float(history.history['val_accuracy'][-1]),
        'trained_images': confirmed_count,
        'epochs': epochs
    }
```

---

## ✅ **Testing Checklist**

- [ ] Start Node.js backend
- [ ] Start Flask ML service
- [ ] Analyze plant image (create analysis record)
- [ ] Confirm image for training
- [ ] Check confirmed image saved to `/data/confirmed/`
- [ ] Check retraining stats (>= 100 images)
- [ ] Trigger manual retraining
- [ ] Verify new model version created
- [ ] Test prediction with new model
- [ ] Build Docker images
- [ ] Start Docker Compose
- [ ] Test retraining in Docker
- [ ] Verify model persists after container restart

---

## 🎉 **Summary**

**Created:**
1. ✅ `retrainingController.js` - Confirm images, stats, trigger retraining
2. ✅ `retraining.js` - Retraining routes
3. ✅ `retrain.py` - Complete retraining pipeline
4. ✅ Flask `/retrain` and `/retrain-status` endpoints
5. ✅ Auto-retraining scheduler (cron job)
6. ✅ Dockerfile for Flask service
7. ✅ Dockerfile for Node.js backend
8. ✅ docker-compose.yml with volumes and networks
9. ✅ `.env.docker` template

**Features:**
- Active learning with confirmed images
- Automatic retraining (cron scheduled)
- Model versioning (timestamped)
- TFLite conversion
- Docker support with volume persistence
- Health checks
- Resource limits
- Automatic model reloading

**Your ML system now learns from user feedback and improves over time!** 🌱✨
