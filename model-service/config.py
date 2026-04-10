"""
Configuration Management for Flask ML Service
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration class"""
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:4000,http://localhost:19000').split(',')
    
    # Model Configuration
    MODEL_PATH = os.getenv('MODEL_PATH', 'models/plant_disease_model.h5')
    MODEL_TYPE = os.getenv('MODEL_TYPE', 'h5')  # 'h5' or 'tflite'
    INPUT_SIZE = (224, 224)  # Model input size
    TOP_K_PREDICTIONS = int(os.getenv('TOP_K_PREDICTIONS', 3))
    
    # Image Processing
    MAX_IMAGE_SIZE_MB = int(os.getenv('MAX_IMAGE_SIZE_MB', 10))
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
    
    # GradCAM Configuration
    ENABLE_GRADCAM = os.getenv('ENABLE_GRADCAM', 'True').lower() == 'true'
    GRADCAM_LAYER = os.getenv('GRADCAM_LAYER', 'top_conv')  # Layer name for GradCAM
    
    # Performance
    MODEL_CACHE_ENABLED = True
    MAX_WORKERS = int(os.getenv('MAX_WORKERS', 4))
    REQUEST_TIMEOUT = int(os.getenv('REQUEST_TIMEOUT', 30))
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # Paths
    BASE_DIR = Path(__file__).parent
    DATA_DIR = BASE_DIR / 'data'
    MODELS_DIR = BASE_DIR / 'models'
    LOGS_DIR = BASE_DIR / 'logs'
    
    # Disease Information Database
    DISEASE_INFO_PATH = DATA_DIR / 'disease_info.json'
    TREATMENTS_PATH = DATA_DIR / 'treatments.json'
    
    @classmethod
    def validate(cls):
        """Validate critical configuration"""
        if not cls.MODELS_DIR.exists():
            cls.MODELS_DIR.mkdir(parents=True, exist_ok=True)
        if not cls.LOGS_DIR.exists():
            cls.LOGS_DIR.mkdir(parents=True, exist_ok=True)
        if not cls.DATA_DIR.exists():
            cls.DATA_DIR.mkdir(parents=True, exist_ok=True)
        
        model_path = cls.MODELS_DIR / cls.MODEL_PATH.split('/')[-1]
        if not model_path.exists():
            print(f"⚠️  Warning: Model file not found at {model_path}")
            print(f"   Please place your trained model at: {model_path}")
        
        return True


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    LOG_LEVEL = 'WARNING'
    SECRET_KEY = os.getenv('SECRET_KEY')  # Must be set in production
    
    @classmethod
    def validate(cls):
        super().validate()
        if cls.SECRET_KEY == 'dev-secret-key-change-in-production':
            print("Warning: SECRET_KEY not set in production; using fallback value.")
        return True


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    MODEL_CACHE_ENABLED = False


# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config(env=None):
    """Get configuration based on environment"""
    if env is None:
        env = os.getenv('FLASK_ENV', 'development')
    return config.get(env, config['default'])
