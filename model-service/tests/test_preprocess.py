"""
Test image preprocessing
"""
import pytest
import numpy as np
from core.preprocess import ImagePreprocessor


def test_resize_image():
    """Test image resizing"""
    preprocessor = ImagePreprocessor(target_size=(224, 224))
    
    # Create random image
    image = np.random.randint(0, 255, (512, 512, 3), dtype=np.uint8)
    
    # Resize
    resized = preprocessor.resize_image(image)
    
    assert resized.shape == (224, 224, 3)
    assert resized.dtype == np.uint8


def test_normalize_imagenet():
    """Test ImageNet normalization"""
    preprocessor = ImagePreprocessor()
    
    # Create test image
    image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    
    # Normalize
    normalized = preprocessor.normalize_image(image, method='imagenet')
    
    assert normalized.dtype == np.float32
    assert normalized.shape == (224, 224, 3)


def test_normalize_standard():
    """Test standard [0, 1] normalization"""
    preprocessor = ImagePreprocessor()
    
    image = np.array([[[0, 128, 255]]], dtype=np.uint8)
    normalized = preprocessor.normalize_image(image, method='standard')
    
    assert normalized[0, 0, 0] == 0.0
    assert normalized[0, 0, 2] == 1.0


def test_validate_image():
    """Test image validation"""
    preprocessor = ImagePreprocessor()
    
    # Valid image
    valid_image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    is_valid, error = preprocessor.validate_image(valid_image)
    assert is_valid
    assert error is None
    
    # Invalid: too small
    small_image = np.random.randint(0, 255, (10, 10, 3), dtype=np.uint8)
    is_valid, error = preprocessor.validate_image(small_image)
    assert not is_valid
    assert 'too small' in error.lower()
    
    # Invalid: wrong channels
    wrong_channels = np.random.randint(0, 255, (224, 224, 4), dtype=np.uint8)
    is_valid, error = preprocessor.validate_image(wrong_channels)
    assert not is_valid
    assert 'channels' in error.lower()


def test_preprocess_pipeline():
    """Test complete preprocessing pipeline"""
    preprocessor = ImagePreprocessor(target_size=(224, 224))
    
    # Create test image
    image = np.random.randint(0, 255, (512, 512, 3), dtype=np.uint8)
    
    # Preprocess
    preprocessed = preprocessor.preprocess(image, normalize_method='imagenet')
    
    assert preprocessed.shape == (1, 224, 224, 3)
    assert preprocessed.dtype == np.float32


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
