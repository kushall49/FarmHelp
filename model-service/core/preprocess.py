"""
Image Preprocessing Pipeline
Resize, normalize, and validate images for model input
"""
import io
import base64
import logging
from typing import Tuple, Optional
import numpy as np
from PIL import Image
import cv2

logger = logging.getLogger(__name__)


class ImagePreprocessor:
    """Handle all image preprocessing operations"""
    
    def __init__(self, target_size: Tuple[int, int] = (224, 224)):
        """
        Initialize preprocessor
        
        Args:
            target_size: Target image size (height, width)
        """
        self.target_size = target_size
        self.allowed_formats = {'PNG', 'JPEG', 'JPG', 'WEBP'}
        self.max_size_mb = 10
    
    def decode_image(self, image_data: str) -> Optional[np.ndarray]:
        """
        Decode base64 image string to numpy array
        
        Args:
            image_data: Base64 encoded image string
            
        Returns:
            Numpy array (H, W, 3) in RGB format, or None if failed
        """
        try:
            # Remove data URL prefix if present
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            # Decode base64
            image_bytes = base64.b64decode(image_data)
            
            # Check file size
            size_mb = len(image_bytes) / (1024 * 1024)
            if size_mb > self.max_size_mb:
                logger.warning(f"Image too large: {size_mb:.2f}MB (max {self.max_size_mb}MB)")
                return None
            
            # Open with PIL
            image = Image.open(io.BytesIO(image_bytes))
            
            # Validate format
            if image.format not in self.allowed_formats:
                logger.warning(f"Invalid image format: {image.format}")
                return None
            
            # Convert to RGB
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convert to numpy array
            image_array = np.array(image)
            
            logger.info(f"Image decoded: {image_array.shape}, format: {image.format}")
            return image_array
            
        except Exception as e:
            logger.error(f"Failed to decode image: {str(e)}", exc_info=True)
            return None
    
    def decode_file(self, file_storage) -> Optional[np.ndarray]:
        """
        Decode uploaded file to numpy array
        
        Args:
            file_storage: Flask FileStorage object
            
        Returns:
            Numpy array (H, W, 3) in RGB format, or None if failed
        """
        try:
            # Read file bytes
            image_bytes = file_storage.read()
            
            # Check file size
            size_mb = len(image_bytes) / (1024 * 1024)
            if size_mb > self.max_size_mb:
                logger.warning(f"Image too large: {size_mb:.2f}MB (max {self.max_size_mb}MB)")
                return None
            
            # Open with PIL
            image = Image.open(io.BytesIO(image_bytes))
            
            # Validate format
            if image.format not in self.allowed_formats:
                logger.warning(f"Invalid image format: {image.format}")
                return None
            
            # Convert to RGB
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convert to numpy array
            image_array = np.array(image)
            
            logger.info(f"File decoded: {image_array.shape}, format: {image.format}")
            return image_array
            
        except Exception as e:
            logger.error(f"Failed to decode file: {str(e)}", exc_info=True)
            return None
    
    def resize_image(self, image: np.ndarray) -> np.ndarray:
        """
        Resize image to target size
        
        Args:
            image: Numpy array (H, W, 3)
            
        Returns:
            Resized numpy array (target_H, target_W, 3)
        """
        try:
            # Use PIL for high-quality resize
            pil_image = Image.fromarray(image)
            resized = pil_image.resize(self.target_size, Image.Resampling.LANCZOS)
            return np.array(resized)
            
        except Exception as e:
            logger.error(f"Failed to resize image: {str(e)}")
            # Fallback to OpenCV
            return cv2.resize(image, self.target_size, interpolation=cv2.INTER_LINEAR)
    
    def normalize_image(self, image: np.ndarray, method: str = 'imagenet') -> np.ndarray:
        """
        Normalize image pixel values
        
        Args:
            image: Numpy array (H, W, 3) with values in [0, 255]
            method: Normalization method ('imagenet', 'standard', 'minmax')
            
        Returns:
            Normalized numpy array
        """
        try:
            image = image.astype(np.float32)
            
            if method == 'imagenet':
                # ImageNet normalization (EfficientNet standard)
                mean = np.array([123.675, 116.28, 103.53])
                std = np.array([58.395, 57.12, 57.375])
                image = (image - mean) / std
                
            elif method == 'standard':
                # Scale to [0, 1]
                image = image / 255.0
                
            elif method == 'minmax':
                # Scale to [-1, 1]
                image = (image / 127.5) - 1.0
                
            else:
                raise ValueError(f"Unknown normalization method: {method}")
            
            return image
            
        except Exception as e:
            logger.error(f"Failed to normalize image: {str(e)}")
            raise
    
    def validate_image(self, image: np.ndarray) -> Tuple[bool, Optional[str]]:
        """
        Validate image dimensions and format
        
        Args:
            image: Numpy array
            
        Returns:
            (is_valid, error_message)
        """
        try:
            if image is None:
                return False, "Image is None"
            
            if not isinstance(image, np.ndarray):
                return False, "Image must be numpy array"
            
            if len(image.shape) != 3:
                return False, f"Image must be 3D array, got shape {image.shape}"
            
            if image.shape[2] != 3:
                return False, f"Image must have 3 channels (RGB), got {image.shape[2]}"
            
            if image.shape[0] < 32 or image.shape[1] < 32:
                return False, f"Image too small: {image.shape[:2]}"
            
            if image.shape[0] > 4096 or image.shape[1] > 4096:
                return False, f"Image too large: {image.shape[:2]}"
            
            return True, None
            
        except Exception as e:
            return False, f"Validation error: {str(e)}"
    
    def preprocess(self, image: np.ndarray, normalize_method: str = 'imagenet') -> np.ndarray:
        """
        Complete preprocessing pipeline
        
        Args:
            image: Raw image numpy array (H, W, 3)
            normalize_method: Normalization method
            
        Returns:
            Preprocessed image ready for model input (1, H, W, 3)
        """
        try:
            # Validate
            is_valid, error_msg = self.validate_image(image)
            if not is_valid:
                raise ValueError(f"Image validation failed: {error_msg}")
            
            # Resize
            resized = self.resize_image(image)
            
            # Normalize
            normalized = self.normalize_image(resized, method=normalize_method)
            
            # Add batch dimension
            batched = np.expand_dims(normalized, axis=0)
            
            logger.debug(f"Preprocessing complete: {batched.shape}, dtype: {batched.dtype}")
            return batched
            
        except Exception as e:
            logger.error(f"Preprocessing failed: {str(e)}", exc_info=True)
            raise


# Singleton instance
preprocessor = ImagePreprocessor()
