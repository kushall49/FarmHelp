"""
Validation Utilities
Input validation for API requests
"""
import re
from typing import Tuple, Optional


def validate_file_extension(filename: str, allowed_extensions: set) -> bool:
    """
    Validate file extension
    
    Args:
        filename: Name of file
        allowed_extensions: Set of allowed extensions (e.g., {'png', 'jpg'})
        
    Returns:
        True if valid
    """
    if '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in allowed_extensions


def validate_base64_image(data: str) -> Tuple[bool, Optional[str]]:
    """
    Validate base64 image data
    
    Args:
        data: Base64 string (may include data URL prefix)
        
    Returns:
        (is_valid, error_message)
    """
    if not data or not isinstance(data, str):
        return False, "Image data must be a non-empty string"
    
    # Remove data URL prefix if present
    if data.startswith('data:'):
        if ';base64,' not in data:
            return False, "Invalid data URL format"
        data = data.split(';base64,')[1]
    
    # Check base64 format
    base64_pattern = re.compile(r'^[A-Za-z0-9+/]*={0,2}$')
    if not base64_pattern.match(data):
        return False, "Invalid base64 encoding"
    
    # Check minimum length (roughly 1KB)
    if len(data) < 1000:
        return False, "Image data too small"
    
    return True, None


def validate_confidence_threshold(threshold: float) -> bool:
    """
    Validate confidence threshold value
    
    Args:
        threshold: Confidence value
        
    Returns:
        True if valid (0.0 to 1.0)
    """
    return isinstance(threshold, (int, float)) and 0.0 <= threshold <= 1.0


def validate_top_k(top_k: int, max_classes: int = 100) -> bool:
    """
    Validate top-k predictions parameter
    
    Args:
        top_k: Number of top predictions
        max_classes: Maximum number of classes
        
    Returns:
        True if valid
    """
    return isinstance(top_k, int) and 1 <= top_k <= max_classes
