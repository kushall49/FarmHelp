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
    """
    Global error handler - PRODUCTION VERSION
    Ensures ALL errors return JSON with proper Content-Type header
    """
    logger.error(f"[ERROR-HANDLER] Caught exception: {str(error)}", exc_info=True)
    
    # PRODUCTION: Build standardized error response
    error_response = {
        'success': False,
        'error': str(error),
        'error_code': 'SERVER_ERROR',
        'layer': 'ml_service',
        'timestamp': int(time.time() * 1000)
    }
    
    status_code = 500
    
    if isinstance(error, HTTPException):
        error_response['error'] = error.description
        error_response['error_code'] = f'HTTP_{error.code}'
        status_code = error.code
    
    # PRODUCTION: Explicitly set Content-Type header
    response = jsonify(error_response)
    response.headers['Content-Type'] = 'application/json'
    response.status_code = status_code
    
    logger.error(f"[ERROR-HANDLER] Returning JSON error response with status {status_code}")
    return response


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
    PRODUCTION: Main endpoint for plant disease analysis
    Ensures JSON-only responses with explicit Content-Type headers
    
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
    logger.info('[FLASK] === NEW ANALYZE REQUEST ===')
    logger.info(f'[FLASK] Timestamp: {time.strftime("%Y-%m-%d %H:%M:%S")}')
    logger.info(f'[FLASK] Content-Type: {request.content_type}')
    logger.info(f'[FLASK] Remote IP: {request.remote_addr}')
    
    try:
        start_time = time.time()
        
        # PRODUCTION: Check if model is loaded
        if not model_loader.is_loaded():
            logger.error('[FLASK] ❌ Model not loaded')
            response = jsonify({
                'success': False,
                'error': 'ML model not loaded. Please check server logs.',
                'error_code': 'MODEL_NOT_LOADED',
                'layer': 'ml_service',
                'timestamp': int(time.time() * 1000)
            })
            response.headers['Content-Type'] = 'application/json'
            response.status_code = 503
            return response
        
        # Parse request
        image_array = None
        original_image = None
        return_gradcam = True
        top_k = 3
        filename = 'unknown'
        file_size = 0
        
        # Check for file upload (multipart/form-data)
        if 'file' in request.files:
            logger.info('[FLASK] Detected multipart/form-data request')
            file = request.files['file']
            filename = file.filename
            
            if file.filename == '':
                logger.error('[FLASK] ❌ Empty filename')
                response = jsonify({
                    'success': False,
                    'error': 'No file selected',
                    'error_code': 'NO_FILE_SELECTED',
                    'layer': 'ml_service',
                    'timestamp': int(time.time() * 1000)
                })
                response.headers['Content-Type'] = 'application/json'
                response.status_code = 400
                return response
            
            # Read file to get size
            file_content = file.read()
            file_size = len(file_content)
            file.seek(0)  # Reset file pointer
            
            logger.info(f'[FLASK] File details:')
            logger.info(f'  - Filename: {filename}')
            logger.info(f'  - Size: {file_size} bytes ({file_size / 1024 / 1024:.2f} MB)')
            logger.info(f'  - Content-Type: {file.content_type}')
            
            # Decode file
            logger.info('[FLASK] Decoding image file...')
            decode_start = time.time()
            original_image = preprocessor.decode_file(file)
            decode_time = (time.time() - decode_start) * 1000
            
            if original_image is None:
                logger.error('[FLASK] ❌ Failed to decode image file')
                response = jsonify({
                    'success': False,
                    'error': 'Failed to decode image file. Ensure it is a valid JPEG, PNG, or WEBP image.',
                    'error_code': 'DECODE_FAILED',
                    'layer': 'ml_service',
                    'timestamp': int(time.time() * 1000),
                    'details': {
                        'filename': filename,
                        'size_bytes': file_size
                    }
                })
                response.headers['Content-Type'] = 'application/json'
                response.status_code = 400
                return response
            
            logger.info(f'[FLASK] ✅ Image decoded in {decode_time:.2f}ms')
            logger.info(f'[FLASK] Image shape: {original_image.shape}')
            
            # Get parameters from form data
            return_gradcam = request.form.get('return_gradcam', 'true').lower() == 'true'
            top_k = int(request.form.get('top_k', 3))
        
        # Check for JSON body
        elif request.is_json:
            logger.info('[FLASK] Detected JSON request')
            data = request.get_json()
            
            # Validate image data
            image_data = data.get('image')
            if not image_data:
                logger.error('[FLASK] ❌ Missing image field in JSON')
                response = jsonify({
                    'success': False,
                    'error': 'Missing required field: image',
                    'error_code': 'MISSING_IMAGE',
                    'layer': 'ml_service',
                    'timestamp': int(time.time() * 1000)
                })
                response.headers['Content-Type'] = 'application/json'
                response.status_code = 400
                return response
            
            file_size = len(image_data)
            logger.info(f'[FLASK] Base64 data length: {file_size} characters')
            
            is_valid, error_msg = validate_base64_image(image_data)
            if not is_valid:
                logger.error(f'[FLASK] ❌ Invalid base64 image: {error_msg}')
                response = jsonify({
                    'success': False,
                    'error': f'Invalid image data: {error_msg}',
                    'error_code': 'INVALID_BASE64',
                    'layer': 'ml_service',
                    'timestamp': int(time.time() * 1000)
                })
                response.headers['Content-Type'] = 'application/json'
                response.status_code = 400
                return response
            
            # Decode base64 image
            logger.info('[FLASK] Decoding base64 image...')
            decode_start = time.time()
            original_image = preprocessor.decode_image(image_data)
            decode_time = (time.time() - decode_start) * 1000
            
            if original_image is None:
                logger.error('[FLASK] ❌ Failed to decode base64 image')
                response = jsonify({
                    'success': False,
                    'error': 'Failed to decode base64 image',
                    'error_code': 'BASE64_DECODE_FAILED',
                    'layer': 'ml_service',
                    'timestamp': int(time.time() * 1000)
                })
                response.headers['Content-Type'] = 'application/json'
                response.status_code = 400
                return response
            
            logger.info(f'[FLASK] ✅ Image decoded in {decode_time:.2f}ms')
            logger.info(f'[FLASK] Image shape: {original_image.shape}')
            
            # Get parameters
            return_gradcam = data.get('return_gradcam', True)
            top_k = data.get('top_k', 3)
            filename = 'base64_image'
        
        else:
            logger.error('[FLASK] ❌ Invalid request content type')
            response = jsonify({
                'success': False,
                'error': 'Request must be JSON or multipart/form-data',
                'error_code': 'INVALID_CONTENT_TYPE',
                'layer': 'ml_service',
                'timestamp': int(time.time() * 1000),
                'details': {
                    'received_content_type': request.content_type
                }
            })
            response.headers['Content-Type'] = 'application/json'
            response.status_code = 400
            return response
        
        # Validate top_k
        if not validate_top_k(top_k):
            logger.error(f'[FLASK] ❌ Invalid top_k value: {top_k}')
            response = jsonify({
                'success': False,
                'error': 'Invalid top_k value (must be 1-10)',
                'error_code': 'INVALID_TOP_K',
                'layer': 'ml_service',
                'timestamp': int(time.time() * 1000)
            })
            response.headers['Content-Type'] = 'application/json'
            response.status_code = 400
            return response
        
        logger.info(f'[FLASK] Parameters: return_gradcam={return_gradcam}, top_k={top_k}')
        
        logger.info(f"[FLASK] Processing image: shape={original_image.shape}, gradcam={return_gradcam}, top_k={top_k}")
        
        # Preprocess image
        logger.info('[FLASK] Preprocessing image...')
        preprocess_start = time.time()
        preprocessed = preprocessor.preprocess(original_image, normalize_method='imagenet')
        preprocess_time = (time.time() - preprocess_start) * 1000
        logger.info(f'[FLASK] ✅ Preprocessing complete in {preprocess_time:.2f}ms')
        
        # Run prediction
        logger.info('[FLASK] Running model inference...')
        inference_start = time.time()
        global classifier
        prediction_result = classifier.predict(preprocessed, top_k=top_k)
        inference_time = (time.time() - inference_start) * 1000
        
        if not prediction_result['success']:
            logger.error('[FLASK] ❌ Prediction failed')
            response = jsonify(prediction_result)
            response.headers['Content-Type'] = 'application/json'
            response.status_code = 500
            return response
        
        logger.info(f'[FLASK] ✅ Inference complete in {inference_time:.2f}ms')
        logger.info(f'[FLASK] Predicted: {prediction_result["crop"]} - {prediction_result["disease"]}')
        
        # Generate GradCAM if requested
        gradcam_base64 = None
        gradcam_time = 0
        if return_gradcam and Config.ENABLE_GRADCAM:
            try:
                logger.info('[FLASK] Generating GradCAM...')
                gradcam_start = time.time()
                gradcam_base64 = gradcam.generate_and_overlay(
                    original_image=original_image,
                    preprocessed_image=preprocessed,
                    class_idx=prediction_result['class_id'],
                    alpha=0.4
                )
                gradcam_time = (time.time() - gradcam_start) * 1000
                if gradcam_base64:
                    logger.info(f"[FLASK] ✅ GradCAM generated in {gradcam_time:.2f}ms")
            except Exception as e:
                logger.warning(f"[FLASK] ⚠️ GradCAM generation failed: {str(e)}")
        
        # Get treatment recommendations
        logger.info('[FLASK] Fetching recommendations...')
        recommendations = recommendation_service.get_recommendation(
            crop=prediction_result['crop'],
            disease=prediction_result['disease'],
            confidence=prediction_result['confidence']
        )
        
        # Get fertilizer recommendations
        logger.info('[FLASK] Fetching fertilizer recommendations...')
        fertilizers = fertilizer_recommender.get_recommendations(
            crop=prediction_result['crop'],
            disease=prediction_result['disease'],
            top_n=3
        )
        
        # Format final response
        response_data = classifier.format_response(
            prediction_result=prediction_result,
            gradcam_base64=gradcam_base64,
            recommendations=recommendations
        )
        
        # Add fertilizer recommendations
        response_data['fertilizers'] = fertilizers
        
        # Add detailed timing information
        total_time = time.time() - start_time
        response_data['total_processing_time_ms'] = round(total_time * 1000, 2)
        response_data['timing_breakdown'] = {
            'decode_ms': round(decode_time, 2) if 'decode_time' in locals() else 0,
            'preprocess_ms': round(preprocess_time, 2),
            'inference_ms': round(inference_time, 2),
            'gradcam_ms': round(gradcam_time, 2),
            'total_ms': round(total_time * 1000, 2)
        }
        
        logger.info(f"[FLASK] ✅ Analysis complete: {response_data['crop']} - {response_data['disease']} " +
                   f"({response_data['confidence_percentage']}) in {response_data['total_processing_time_ms']}ms")
        logger.info('[FLASK] === ANALYSIS COMPLETE ===')
        
        # PRODUCTION: Return JSON with explicit Content-Type header
        response = jsonify(response_data)
        response.headers['Content-Type'] = 'application/json'
        response.status_code = 200
        return response
        
    except Exception as e:
        logger.error(f"[FLASK] ❌ Fatal error in analyze endpoint: {str(e)}", exc_info=True)
        
        # PRODUCTION: Return standardized error response
        response = jsonify({
            'success': False,
            'error': 'Analysis failed due to internal error',
            'error_code': 'ANALYSIS_ERROR',
            'error_details': str(e),
            'layer': 'ml_service',
            'timestamp': int(time.time() * 1000)
        })
        response.headers['Content-Type'] = 'application/json'
        response.status_code = 500
        return response


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
        
        # Validate and sanitize confirmed_data_path to prevent path traversal
        confirmed_data_path = os.path.abspath(confirmed_data_path)
        if '..' in confirmed_data_path or not os.path.exists(confirmed_data_path):
            return jsonify({
                'success': False,
                'error': 'Invalid or non-existent confirmed_data_path'
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
