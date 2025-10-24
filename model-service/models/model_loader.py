"""
TensorFlow Model Loader with Caching
Supports both .h5 and .tflite models
"""
import os
import logging
from pathlib import Path
from typing import Optional, Dict, Any
import numpy as np
import tensorflow as tf

logger = logging.getLogger(__name__)


class ModelLoader:
    """Singleton class to load and cache TensorFlow models"""
    
    _instance = None
    _model = None
    _model_info = {}
    _interpreter = None  # For TFLite models
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
        return cls._instance
    
    def load_model(self, model_path: str, model_type: str = 'h5') -> bool:
        """
        Load TensorFlow model into memory
        
        Args:
            model_path: Path to model file
            model_type: 'h5' or 'tflite'
            
        Returns:
            bool: True if loaded successfully
        """
        try:
            if self._model is not None and model_type == 'h5':
                logger.info("Model already loaded in cache")
                return True
            
            if self._interpreter is not None and model_type == 'tflite':
                logger.info("TFLite interpreter already loaded in cache")
                return True
            
            model_path = Path(model_path)
            if not model_path.exists():
                logger.error(f"Model file not found: {model_path}")
                return False
            
            logger.info(f"Loading {model_type.upper()} model from {model_path}...")
            
            if model_type == 'h5':
                self._model = tf.keras.models.load_model(
                    str(model_path),
                    compile=False  # Faster loading
                )
                
                # Store model metadata
                self._model_info = {
                    'type': 'h5',
                    'path': str(model_path),
                    'input_shape': self._model.input_shape,
                    'output_shape': self._model.output_shape,
                    'total_params': self._model.count_params(),
                    'layers': len(self._model.layers)
                }
                
                logger.info(f"✅ Model loaded successfully!")
                logger.info(f"   Input shape: {self._model_info['input_shape']}")
                logger.info(f"   Output shape: {self._model_info['output_shape']}")
                logger.info(f"   Total parameters: {self._model_info['total_params']:,}")
                
            elif model_type == 'tflite':
                self._interpreter = tf.lite.Interpreter(model_path=str(model_path))
                self._interpreter.allocate_tensors()
                
                # Get input and output details
                input_details = self._interpreter.get_input_details()[0]
                output_details = self._interpreter.get_output_details()[0]
                
                self._model_info = {
                    'type': 'tflite',
                    'path': str(model_path),
                    'input_shape': input_details['shape'].tolist(),
                    'output_shape': output_details['shape'].tolist(),
                    'input_index': input_details['index'],
                    'output_index': output_details['index']
                }
                
                logger.info(f"✅ TFLite model loaded successfully!")
                logger.info(f"   Input shape: {self._model_info['input_shape']}")
                logger.info(f"   Output shape: {self._model_info['output_shape']}")
            
            else:
                logger.error(f"Unsupported model type: {model_type}")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}", exc_info=True)
            return False
    
    def get_model(self):
        """Get cached Keras model"""
        if self._model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        return self._model
    
    def get_interpreter(self):
        """Get cached TFLite interpreter"""
        if self._interpreter is None:
            raise RuntimeError("TFLite interpreter not loaded. Call load_model() first.")
        return self._interpreter
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model metadata"""
        return self._model_info.copy()
    
    def predict(self, preprocessed_image: np.ndarray) -> np.ndarray:
        """
        Run inference on preprocessed image
        
        Args:
            preprocessed_image: Numpy array of shape (1, H, W, 3)
            
        Returns:
            Prediction probabilities array
        """
        try:
            if self._model_info.get('type') == 'h5':
                if self._model is None:
                    raise RuntimeError("Model not loaded")
                
                # Run prediction
                predictions = self._model.predict(preprocessed_image, verbose=0)
                return predictions[0]  # Return single prediction array
                
            elif self._model_info.get('type') == 'tflite':
                if self._interpreter is None:
                    raise RuntimeError("TFLite interpreter not loaded")
                
                # Set input tensor
                input_index = self._model_info['input_index']
                output_index = self._model_info['output_index']
                
                self._interpreter.set_tensor(input_index, preprocessed_image.astype(np.float32))
                
                # Run inference
                self._interpreter.invoke()
                
                # Get output tensor
                predictions = self._interpreter.get_tensor(output_index)
                return predictions[0]
                
            else:
                raise RuntimeError("Invalid model type")
                
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}", exc_info=True)
            raise
    
    def is_loaded(self) -> bool:
        """Check if model is loaded"""
        return self._model is not None or self._interpreter is not None
    
    def unload(self):
        """Unload model from memory"""
        self._model = None
        self._interpreter = None
        self._model_info = {}
        logger.info("Model unloaded from memory")


# Singleton instance
model_loader = ModelLoader()
