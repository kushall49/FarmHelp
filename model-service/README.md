# Flask ML Service - Plant Disease Detection

Production-grade Flask backend for the FarmHelp Plant Analyzer module.

## Features

✅ **TensorFlow/EfficientNet Model** - Classify 38+ plant diseases  
✅ **GradCAM Visualization** - Explainable AI with heatmap overlays  
✅ **Treatment Recommendations** - Chemical, organic, and preventive measures  
✅ **RESTful API** - JSON and file upload support  
✅ **Docker Ready** - Containerized deployment  
✅ **Modular Architecture** - Separated concerns for easy maintenance  

## Project Structure

```
model-service/
├── app.py                          # Flask application entry point
├── config.py                       # Configuration management
├── requirements.txt                # Python dependencies
├── Dockerfile                      # Docker container config
├── .env.example                    # Environment variables template
│
├── models/
│   ├── model_loader.py            # Model loading and caching
│   └── plant_disease_model.h5    # TensorFlow model (place here)
│
├── core/
│   ├── preprocess.py              # Image preprocessing pipeline
│   ├── predict.py                 # Inference engine
│   └── gradcam.py                 # GradCAM visualization
│
├── services/
│   └── recommendation_service.py  # Treatment recommendations
│
├── utils/
│   ├── logger.py                  # Logging utilities
│   └── validators.py              # Input validation
│
├── data/
│   ├── disease_info.json          # Disease information database
│   └── treatments.json            # Treatment recommendations database
│
└── tests/
    ├── test_preprocess.py
    ├── test_predict.py
    └── test_api.py
```

## Quick Start

### 1. Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy environment template
copy .env.example .env

# Edit .env with your settings
```

### 3. Add Your Model

Place your trained TensorFlow model at:
```
model-service/models/plant_disease_model.h5
```

Or update `MODEL_PATH` in `.env` to point to your model.

### 4. Run the Service

```bash
# Development mode
python app.py

# Production mode with Gunicorn
gunicorn --bind 0.0.0.0:5000 --workers 2 --threads 4 app:app
```

The service will start on `http://localhost:5000`

## API Endpoints

### POST /analyze

Analyze plant image for disease detection.

**Request (JSON):**
```json
{
  "image": "base64_encoded_image_string",
  "return_gradcam": true,
  "top_k": 3
}
```

**Request (File Upload):**
```bash
curl -X POST http://localhost:5000/analyze \
  -F "file=@leaf_image.jpg" \
  -F "return_gradcam=true" \
  -F "top_k=3"
```

**Response:**
```json
{
  "success": true,
  "crop": "Tomato",
  "disease": "Late Blight",
  "confidence": 0.94,
  "confidence_percentage": "94.00%",
  "predictions": [
    {
      "crop": "Tomato",
      "disease": "Late Blight",
      "confidence": 0.94,
      "percentage": "94.00%"
    }
  ],
  "recommendation": "Apply copper-based fungicide...",
  "recommendations": {
    "severity": "high",
    "symptoms": [...],
    "chemical_treatment": "...",
    "organic_treatment": "...",
    "preventive_measures": [...]
  },
  "gradcam": "data:image/jpeg;base64,...",
  "processing_time_ms": 234.56
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "uptime_seconds": 12345,
  "model_loaded": true,
  "model_info": {
    "type": "h5",
    "input_shape": [null, 224, 224, 3],
    "total_params": 5432123
  }
}
```

### POST /retrain

Placeholder for model retraining (not yet implemented).

## Docker Deployment

### Build Image

```bash
docker build -t farmhelp-ml-service .
```

### Run Container

```bash
docker run -d \
  -p 5000:5000 \
  -v $(pwd)/models:/app/models \
  -v $(pwd)/logs:/app/logs \
  -e FLASK_ENV=production \
  --name farmhelp-ml \
  farmhelp-ml-service
```

### Docker Compose

See `docker-compose.yml` in project root for complete orchestration.

## Development

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-cov

# Run tests
pytest tests/

# Run with coverage
pytest --cov=. tests/
```

### Adding New Diseases

1. Update class labels in `core/predict.py` (DEFAULT_CLASS_LABELS)
2. Add disease info to `data/disease_info.json`
3. Add treatments to `data/treatments.json`
4. Retrain model with new classes

### Customizing GradCAM

Edit `config.py`:
```python
GRADCAM_LAYER = 'your_target_layer_name'
```

## Configuration

Key environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `FLASK_ENV` | `development` | Environment (development/production) |
| `PORT` | `5000` | Port to run service |
| `MODEL_PATH` | `models/plant_disease_model.h5` | Path to model file |
| `MODEL_TYPE` | `h5` | Model type (h5/tflite) |
| `ENABLE_GRADCAM` | `True` | Enable GradCAM visualization |
| `MAX_IMAGE_SIZE_MB` | `10` | Maximum image upload size |
| `LOG_LEVEL` | `INFO` | Logging level |

## Performance Optimization

- **Model Caching**: Model loaded once at startup
- **Batch Processing**: Process images in batches for efficiency
- **Worker Threads**: Configure via `MAX_WORKERS` in config
- **Image Optimization**: Automatic resize to 224x224

## Troubleshooting

### Model Not Loading

**Error**: `Model file not found`

**Solution**: Place your trained model at `models/plant_disease_model.h5` or update `MODEL_PATH`

### Import Errors

**Error**: `ImportError: No module named 'tensorflow'`

**Solution**: Install dependencies: `pip install -r requirements.txt`

### GradCAM Fails

**Error**: `GradCAM generation failed`

**Solution**: Check `GRADCAM_LAYER` points to valid convolutional layer

### Memory Issues

**Error**: `MemoryError` or OOM

**Solution**: Reduce `MAX_WORKERS` or use smaller model

## Architecture

See `PLANT_ANALYZER_ARCHITECTURE.md` in project root for complete architecture documentation.

## Integration with Node.js Backend

The Flask service is called by the Node.js backend:

```
React Native → Node.js (port 4000) → Flask (port 5000) → TensorFlow
```

See `backend/controllers/plantAnalysisController.js` for integration code.

## License

Part of the FarmHelp project.

## Support

For issues or questions, check:
- Architecture docs: `PLANT_ANALYZER_ARCHITECTURE.md`
- Node.js integration: `backend/controllers/plantAnalysisController.js`
- Frontend: `frontend/src/screens/PlantAnalyzer.tsx`
