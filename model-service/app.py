"""
Flask ML Service for Plant Disease Detection
Main application entry point
"""
import os
import time
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

# Import configuration
from config import get_config, Config

# Import core modules
from models.model_loader import model_loader
from core.preprocess import preprocessor
from core.predict import create_classifier
from core.gradcam import gradcam
from services.recommendation_service import recommendation_service
from services.fertilizer_recommender import fertilizer_recommender
from utils.logger import setup_logging
from utils.validators import validate_base64_image, validate_top_k

# Initialize Flask app
app = Flask(__name__)

# Load configuration
env = os.getenv('FLASK_ENV', 'development')
config_class = get_config(env)
app.config.from_object(config_class)

# Validate configuration
config_class.validate()

# Setup logging
setup_logging(
    log_level=config_class.LOG_LEVEL,
    log_dir=str(config_class.LOGS_DIR) if config_class.LOG_LEVEL == 'DEBUG' else None
)
logger = logging.getLogger(__name__)

# Enable CORS
CORS(app, resources={
    r"/*": {
        "origins": config_class.CORS_ORIGINS,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize classifier
classifier = None

# Track service uptime
service_start_time = time.time()


@app.before_request
def log_request():
    """Log incoming requests"""
    logger.debug(f"{request.method} {request.path} from {request.remote_addr}")


@app.after_request
def log_response(response):
    """Log outgoing responses"""
    logger.debug(f"Response status: {response.status_code}")
    return response


@app.errorhandler(Exception)
def handle_error(error):
    """Global error handler"""
    logger.error(f"Error: {str(error)}", exc_info=True)
    
    if isinstance(error, HTTPException):
        return jsonify({
            'success': False,
            'error': error.description,
            'status_code': error.code
        }), error.code
    
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'message': str(error)
    }), 500


@app.route('/', methods=['GET'])
def index():
    """Root endpoint - service information"""
    return jsonify({
        'service': 'FarmHelp Plant Disease Detection ML Service',
        'version': '1.0.0',
        'status': 'running',
        'model_loaded': model_loader.is_loaded(),
        'endpoints': {
            'POST /analyze': 'Analyze plant image for disease detection',
            'GET /health': 'Health check endpoint',
            'POST /retrain': 'Model retraining endpoint (placeholder)'
        },
        'documentation': 'See PLANT_ANALYZER_ARCHITECTURE.md'
    })


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    try:
        uptime_seconds = int(time.time() - service_start_time)
        health_status = {
            'status': 'healthy',
            'uptime_seconds': uptime_seconds,
            'uptime_formatted': _format_uptime(uptime_seconds),
            'model_loaded': model_loader.is_loaded(),
            'environment': env,
            'timestamp': time.time()
        }
        
        if model_loader.is_loaded():
            health_status['model_info'] = model_loader.get_model_info()
        
        return jsonify(health_status), 200
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500


@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Main endpoint for plant disease analysis
    
    Request body (JSON):
        {
            "image": "base64_encoded_image_string",
            "return_gradcam": true,
            "top_k": 3
        }
    
    OR file upload:
        multipart/form-data with 'file' field
    
    Response:
        {
            "success": true,
            "crop": "Tomato",
            "disease": "Late Blight",
            "confidence": 0.94,
            "confidence_percentage": "94.00%",
            "predictions": [...],
            "recommendation": "Apply copper-based fungicide...",
            "recommendations": {...},
            "gradcam": "data:image/jpeg;base64,...",
            "processing_time_ms": 234.56
        }
    """
    try:
        start_time = time.time()
        
        # Check if model is loaded
        if not model_loader.is_loaded():
            return jsonify({
                'success': False,
                'error': 'Model not loaded. Please check server logs.'
            }), 503
        
        # Parse request
        image_array = None
        original_image = None
        return_gradcam = True
        top_k = 3
        
        # Check for file upload
        if 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                return jsonify({
                    'success': False,
                    'error': 'No file selected'
                }), 400
            
            # Decode file
            original_image = preprocessor.decode_file(file)
            if original_image is None:
                return jsonify({
                    'success': False,
                    'error': 'Failed to decode image file'
                }), 400
            
            # Get parameters from form data
            return_gradcam = request.form.get('return_gradcam', 'true').lower() == 'true'
            top_k = int(request.form.get('top_k', 3))
        
        # Check for JSON body
        elif request.is_json:
            data = request.get_json()
            
            # Validate image data
            image_data = data.get('image')
            if not image_data:
                return jsonify({
                    'success': False,
                    'error': 'Missing required field: image'
                }), 400
            
            is_valid, error_msg = validate_base64_image(image_data)
            if not is_valid:
                return jsonify({
                    'success': False,
                    'error': f'Invalid image data: {error_msg}'
                }), 400
            
            # Decode base64 image
            original_image = preprocessor.decode_image(image_data)
            if original_image is None:
                return jsonify({
                    'success': False,
                    'error': 'Failed to decode base64 image'
                }), 400
            
            # Get parameters
            return_gradcam = data.get('return_gradcam', True)
            top_k = data.get('top_k', 3)
        
        else:
            return jsonify({
                'success': False,
                'error': 'Request must be JSON or multipart/form-data'
            }), 400
        
        # Validate top_k
        if not validate_top_k(top_k):
            return jsonify({
                'success': False,
                'error': 'Invalid top_k value (must be 1-10)'
            }), 400
        
        logger.info(f"Processing image: shape={original_image.shape}, gradcam={return_gradcam}, top_k={top_k}")
        
        # Preprocess image
        preprocessed = preprocessor.preprocess(original_image, normalize_method='imagenet')
        
        # Run prediction
        global classifier
        prediction_result = classifier.predict(preprocessed, top_k=top_k)
        
        if not prediction_result['success']:
            return jsonify(prediction_result), 500
        
        # Generate GradCAM if requested
        gradcam_base64 = None
        if return_gradcam and Config.ENABLE_GRADCAM:
            try:
                gradcam_base64 = gradcam.generate_and_overlay(
                    original_image=original_image,
                    preprocessed_image=preprocessed,
                    class_idx=prediction_result['class_id'],
                    alpha=0.4
                )
                if gradcam_base64:
                    logger.info("GradCAM generated successfully")
            except Exception as e:
                logger.warning(f"GradCAM generation failed: {str(e)}")
        
        # Get treatment recommendations
        recommendations = recommendation_service.get_recommendation(
            crop=prediction_result['crop'],
            disease=prediction_result['disease'],
            confidence=prediction_result['confidence']
        )
        
        # Get fertilizer recommendations
        fertilizers = fertilizer_recommender.get_recommendations(
            crop=prediction_result['crop'],
            disease=prediction_result['disease'],
            top_n=3
        )
        
        # Format final response
        response = classifier.format_response(
            prediction_result=prediction_result,
            gradcam_base64=gradcam_base64,
            recommendations=recommendations
        )
        
        # Add fertilizer recommendations
        response['fertilizers'] = fertilizers
        
        # Add total processing time
        total_time = time.time() - start_time
        response['total_processing_time_ms'] = round(total_time * 1000, 2)
        
        logger.info(f"✅ Analysis complete: {response['crop']} - {response['disease']} " +
                   f"({response['confidence_percentage']}) in {response['total_processing_time_ms']}ms")
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Analysis failed',
            'message': str(e)
        }), 500


@app.route('/retrain', methods=['POST'])
def retrain():
    """
    Placeholder endpoint for model retraining
    
    Future implementation:
    - Accept new training data
    - Trigger model retraining pipeline
    - Update model weights
    - Reload model in memory
    
    Request body:
        {
            "training_data_path": "/path/to/new/data",
            "epochs": 10,
            "batch_size": 32
        }
    """
    logger.info("Retrain endpoint called (placeholder)")
    
    return jsonify({
        'success': False,
        'message': 'Model retraining endpoint is not yet implemented',
        'status': 'coming_soon',
        'implementation_notes': [
            'This endpoint will allow model updates with new training data',
            'Training pipeline integration required',
            'Consider using background job queue for long-running training',
            'Add authentication and authorization'
        ]
    }), 501


def _format_uptime(seconds: int) -> str:
    """Format uptime in human-readable format"""
    days, remainder = divmod(seconds, 86400)
    hours, remainder = divmod(remainder, 3600)
    minutes, seconds = divmod(remainder, 60)
    
    parts = []
    if days > 0:
        parts.append(f"{days}d")
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0:
        parts.append(f"{minutes}m")
    parts.append(f"{seconds}s")
    
    return " ".join(parts)


def initialize_model():
    """Load model at startup"""
    global classifier
    
    logger.info("=" * 60)
    logger.info("Initializing FarmHelp ML Service...")
    logger.info("=" * 60)
    
    try:
        # Load TensorFlow model
        model_path = Config.MODELS_DIR / Config.MODEL_PATH.split('/')[-1]
        logger.info(f"Loading model from: {model_path}")
        
        success = model_loader.load_model(str(model_path), model_type=Config.MODEL_TYPE)
        
        if success:
            logger.info("✅ Model loaded successfully!")
            
            # Load class labels from JSON file
            import json
            class_labels_path = Config.MODELS_DIR / 'class_labels.json'
            if class_labels_path.exists():
                with open(class_labels_path, 'r') as f:
                    labels_data = json.load(f)
                    class_labels = labels_data.get('classes', [])
                logger.info(f"✅ Loaded {len(class_labels)} class labels from {class_labels_path}")
            else:
                logger.warning(f"⚠️  Class labels file not found at {class_labels_path}, using defaults")
                class_labels = None
            
            # Create classifier with loaded class labels
            classifier = create_classifier(class_labels=class_labels)
            logger.info(f"✅ Classifier initialized with {len(classifier.class_labels)} classes")
            
            return True
        else:
            logger.error("❌ Failed to load model")
            logger.warning("⚠️  Service will start but /analyze endpoint will return 503")
            logger.warning("⚠️  Please place your trained model at:")
            logger.warning(f"     {model_path}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Model initialization failed: {str(e)}", exc_info=True)
        logger.warning("⚠️  Service will start in degraded mode")
        return False


@app.route('/retrain', methods=['POST'])
def retrain_model():
    """
    Retrain model with confirmed images
    POST /retrain
    Body: { confirmed_data_path, epochs?, batch_size? }
    """
    start_time = time.time()
    
    try:
        data = request.get_json()
        confirmed_data_path = data.get('confirmed_data_path')
        epochs = data.get('epochs', 5)
        batch_size = data.get('batch_size', 32)
        
        if not confirmed_data_path:
            return jsonify({
                'success': False,
                'error': 'confirmed_data_path is required'
            }), 400
        
        logger.info(f"[Retraining] Starting retraining with {confirmed_data_path}")
        
        # Import retraining module
        from retrain import RetrainingSystem
        
        # Get current model path
        current_model_path = str(Config.MODELS_DIR / Config.MODEL_PATH.split('/')[-1])
        
        # Initialize retraining system
        system = RetrainingSystem(
            base_model_path=current_model_path,
            confirmed_data_path=confirmed_data_path,
            output_dir='models/retrained'
        )
        
        # Run retraining
        result = system.run_retraining(epochs=epochs)
        
        # Update global model_loader with new model
        logger.info(f"[Retraining] Loading new model: {result['h5_path']}")
        model_loader.load_model(result['h5_path'])
        
        elapsed_time = time.time() - start_time
        
        return jsonify({
            'success': True,
            'message': 'Retraining completed successfully',
            'result': result,
            'training_time_seconds': round(elapsed_time, 2)
        }), 200
        
    except Exception as e:
        logger.error(f"[Retraining] Error: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/retrain-status', methods=['GET'])
def retrain_status():
    """
    Check retraining status and available model versions
    GET /retrain-status
    """
    try:
        import os
        from pathlib import Path
        
        retrained_models_dir = Path('models/retrained')
        
        if not retrained_models_dir.exists():
            return jsonify({
                'success': True,
                'status': 'No retraining history',
                'available_versions': []
            }), 200
        
        # List available retrained models
        versions = []
        for file in retrained_models_dir.glob('plant_disease_model_v*.h5'):
            version = file.stem.replace('plant_disease_model_v', '')
            versions.append({
                'version': version,
                'path': str(file),
                'size_mb': round(file.stat().st_size / (1024 * 1024), 2)
            })
        
        versions.sort(key=lambda x: x['version'], reverse=True)
        
        return jsonify({
            'success': True,
            'status': 'Ready',
            'current_model': str(Config.MODELS_DIR / Config.MODEL_PATH.split('/')[-1]),
            'available_versions': versions,
            'total_versions': len(versions)
        }), 200
        
    except Exception as e:
        logger.error(f"[Retraining] Status check error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    # Initialize model before starting server
    initialize_model()
    
    logger.info("=" * 60)
    logger.info(f"Starting Flask server on {Config.HOST}:{Config.PORT}")
    logger.info(f"Environment: {env}")
    logger.info(f"Debug mode: {Config.DEBUG}")
    logger.info(f"CORS origins: {Config.CORS_ORIGINS}")
    logger.info("=" * 60)
    
    # Run Flask app
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG,
        threaded=True
    )
