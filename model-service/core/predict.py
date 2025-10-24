"""
Prediction Engine
Run inference and format results
"""
import time
import logging
from typing import Dict, List, Tuple, Any
import numpy as np
from models.model_loader import model_loader

logger = logging.getLogger(__name__)


def softmax(logits):
    """Numerically stable softmax - supports 1D or 2D arrays."""
    arr = np.asarray(logits, dtype=np.float64)
    if arr.ndim == 1:
        exps = np.exp(arr - np.max(arr))
        return exps / np.sum(exps)
    else:
        exps = np.exp(arr - np.max(arr, axis=1, keepdims=True))
        return exps / np.sum(exps, axis=1, keepdims=True)


def to_percentage(prob):
    """Convert probability [0,1] to percentage [0,100] clamped and rounded."""
    try:
        p = float(prob)
    except Exception:
        p = 0.0
    p = max(0.0, min(1.0, p))
    return round(p * 100.0, 2)


def normalize_output(output):
    """
    Normalize model output.
    - Accepts logits or probabilities (1D vector for classes).
    - Returns dict: { 'probs': [...], 'confidence_raw': float [0..1], 'confidence_pct': float [0..100], 'applied_softmax': bool }
    """
    arr = np.asarray(output, dtype=np.float64)

    applied_softmax = False
    probs = None

    # Heuristic: if 1D and sums ~1 and all values in [0,1], treat as probabilities.
    if arr.ndim == 1:
        s = float(np.sum(arr))
        if (0.99 <= s <= 1.01) and np.all(arr >= -1e-6) and np.all(arr <= 1.000001):
            probs = arr
        else:
            probs = softmax(arr)
            applied_softmax = True
    else:
        # If batch, pick first example's behavior; always softmax for safety
        probs = softmax(arr) if arr.ndim == 2 else softmax(arr.flatten())
        applied_softmax = True

    # ensure numerical safety
    probs = np.clip(probs, 0.0, 1.0)
    probs = probs / np.sum(probs) if np.sum(probs) > 0 else probs

    top_prob = float(np.max(probs)) if probs.size > 0 else 0.0
    pct = to_percentage(top_prob)

    logger.debug("normalize_output: sum=%s applied_softmax=%s top_prob=%s pct=%s", np.sum(arr), applied_softmax, top_prob, pct)

    return {
        'probs': probs.tolist(),
        'confidence_raw': top_prob,     # probability in [0,1]
        'confidence_pct': pct,         # percentage in [0,100]
        'applied_softmax': applied_softmax
    }


class DiseaseClassifier:
    """Handle disease classification and result formatting"""
    
    def __init__(self, class_labels: List[str]):
        """
        Initialize classifier
        
        Args:
            class_labels: List of class names corresponding to model outputs
        """
        self.class_labels = class_labels
        self.num_classes = len(class_labels)
    
    def predict(self, preprocessed_image: np.ndarray, top_k: int = 3) -> Dict[str, Any]:
        """
        Run prediction on preprocessed image
        
        Args:
            preprocessed_image: Preprocessed image array (1, H, W, 3)
            top_k: Number of top predictions to return
            
        Returns:
            Dictionary with prediction results
        """
        try:
            start_time = time.time()
            
            # Run model inference
            raw_output = model_loader.predict(preprocessed_image)
            
            # Normalize output (handles both logits and probabilities)
            normalized = normalize_output(raw_output)
            predictions = np.array(normalized['probs'])
            
            logger.info(f"🔬 Model output normalized: applied_softmax={normalized['applied_softmax']}, "
                       f"top_confidence={normalized['confidence_raw']:.4f} ({normalized['confidence_pct']:.2f}%)")
            
            # Get top-k predictions
            top_indices = np.argsort(predictions)[-top_k:][::-1]
            top_confidences = predictions[top_indices]
            
            # Format predictions
            top_predictions = []
            for idx, conf in zip(top_indices, top_confidences):
                # Parse class label (format: "crop_disease")
                class_name = self.class_labels[idx]
                crop, disease = self._parse_class_name(class_name)
                
                # Ensure confidence is between 0 and 1
                conf_clamped = float(np.clip(conf, 0, 1))
                conf_percent = conf_clamped * 100
                
                top_predictions.append({
                    'class_id': int(idx),
                    'class_name': class_name,
                    'crop': crop,
                    'disease': disease,
                    'confidence': conf_clamped,  # Raw probability [0,1]
                    'confidence_percent': round(conf_percent, 2),  # Percentage [0,100]
                    'percentage': f"{conf_percent:.2f}%"
                })
            
            # Primary prediction (highest confidence)
            primary = top_predictions[0]
            
            inference_time = time.time() - start_time
            
            result = {
                'success': True,
                'crop': primary['crop'],
                'disease': primary['disease'],
                'confidence': primary['confidence_percent'],  # Percentage value [0-100]
                'confidence_raw': primary['confidence'],  # Raw probability [0-1]
                'confidence_percentage': primary['percentage'],  # Formatted string
                'class_id': primary['class_id'],
                'class_name': primary['class_name'],
                'predictions': top_predictions,  # Use 'predictions' for consistency
                'processing_time_ms': round(inference_time * 1000, 2),
                'model_info': model_loader.get_model_info()
            }
            
            logger.info(f"✅ Prediction: {primary['crop']} - {primary['disease']} (confidence={primary['confidence_percent']:.2f}%, raw={primary['confidence']:.4f})")
            logger.info(f"⏱️  Processing time: {result['processing_time_ms']}ms")
            
            return result
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': str(e),
                'crop': None,
                'disease': None,
                'confidence': 0.0
            }
    
    def _parse_class_name(self, class_name: str) -> Tuple[str, str]:
        """
        Parse class name into crop and disease
        
        Args:
            class_name: Format "crop_disease" or just "disease"
            
        Returns:
            (crop, disease) tuple
        """
        try:
            if '_' in class_name:
                parts = class_name.split('_', 1)
                return parts[0].title(), parts[1].replace('_', ' ').title()
            else:
                return "Unknown", class_name.replace('_', ' ').title()
        except:
            return "Unknown", class_name
    
    def format_response(self, prediction_result: Dict[str, Any], 
                       gradcam_base64: str = None,
                       recommendations: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Format final API response
        
        Args:
            prediction_result: Result from predict()
            gradcam_base64: Base64 encoded GradCAM image
            recommendations: Treatment recommendations
            
        Returns:
            Formatted response dictionary
        """
        response = {
            'success': prediction_result['success'],
            'crop': prediction_result['crop'],
            'disease': prediction_result['disease'],
            'confidence': prediction_result['confidence'],
            'confidence_percentage': prediction_result['confidence_percentage'],
            'predictions': prediction_result['predictions'],  # Changed from 'top_predictions'
            'processing_time_ms': prediction_result['processing_time_ms']
        }
        
        if gradcam_base64:
            response['gradcam'] = gradcam_base64
        
        if recommendations:
            response['recommendation'] = recommendations.get('summary', 'No specific recommendation available')
            response['recommendations'] = recommendations
        
        return response


# Default plant disease class labels (38 classes)
DEFAULT_CLASS_LABELS = [
    'apple_black_rot', 'apple_cedar_rust', 'apple_healthy', 'apple_scab',
    'blueberry_healthy',
    'cherry_healthy', 'cherry_powdery_mildew',
    'corn_cercospora_leaf_spot', 'corn_common_rust', 'corn_healthy', 'corn_northern_leaf_blight',
    'grape_black_rot', 'grape_esca', 'grape_healthy', 'grape_leaf_blight',
    'orange_haunglongbing',
    'peach_bacterial_spot', 'peach_healthy',
    'pepper_bacterial_spot', 'pepper_healthy',
    'potato_early_blight', 'potato_healthy', 'potato_late_blight',
    'raspberry_healthy',
    'soybean_healthy',
    'squash_powdery_mildew',
    'strawberry_healthy', 'strawberry_leaf_scorch',
    'tomato_bacterial_spot', 'tomato_early_blight', 'tomato_healthy',
    'tomato_late_blight', 'tomato_leaf_mold', 'tomato_septoria_leaf_spot',
    'tomato_spider_mites', 'tomato_target_spot', 'tomato_mosaic_virus',
    'tomato_yellow_leaf_curl_virus'
]


def create_classifier(class_labels: List[str] = None) -> DiseaseClassifier:
    """
    Factory function to create classifier instance
    
    Args:
        class_labels: List of class names, uses default if None
        
    Returns:
        DiseaseClassifier instance
    """
    if class_labels is None:
        class_labels = DEFAULT_CLASS_LABELS
    return DiseaseClassifier(class_labels)
