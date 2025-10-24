"""
GradCAM (Gradient-weighted Class Activation Mapping)
Generate heatmap visualizations to explain model predictions
"""
import base64
import io
import logging
from typing import Optional, Tuple
import numpy as np
import cv2
import tensorflow as tf
from PIL import Image
from models.model_loader import model_loader

logger = logging.getLogger(__name__)


class GradCAM:
    """Generate GradCAM heatmaps for model interpretability"""
    
    def __init__(self, target_layer_name: str = None):
        """
        Initialize GradCAM
        
        Args:
            target_layer_name: Name of convolutional layer to visualize
                              If None, uses last conv layer
        """
        self.target_layer_name = target_layer_name
        self.grad_model = None
    
    def _find_target_layer(self, model) -> str:
        """
        Find the last convolutional layer in the model
        
        Args:
            model: Keras model
            
        Returns:
            Layer name
        """
        try:
            # Search from end to start for Conv2D layer
            for layer in reversed(model.layers):
                if isinstance(layer, tf.keras.layers.Conv2D):
                    logger.info(f"Using layer '{layer.name}' for GradCAM")
                    return layer.name
            
            # Fallback: use last layer before global pooling
            for layer in reversed(model.layers):
                if 'conv' in layer.name.lower():
                    logger.info(f"Using layer '{layer.name}' for GradCAM (fallback)")
                    return layer.name
            
            raise ValueError("No suitable convolutional layer found")
            
        except Exception as e:
            logger.error(f"Failed to find target layer: {str(e)}")
            raise
    
    def _build_grad_model(self, model, layer_name: str):
        """
        Build gradient model for GradCAM
        
        Args:
            model: Original Keras model
            layer_name: Name of target layer
            
        Returns:
            Gradient model
        """
        try:
            # Create model that maps input to target layer output and predictions
            grad_model = tf.keras.models.Model(
                inputs=model.input,
                outputs=[
                    model.get_layer(layer_name).output,
                    model.output
                ]
            )
            return grad_model
            
        except Exception as e:
            logger.error(f"Failed to build gradient model: {str(e)}")
            raise
    
    def generate(self, image: np.ndarray, class_idx: int = None) -> Optional[np.ndarray]:
        """
        Generate GradCAM heatmap
        
        Args:
            image: Preprocessed image (1, H, W, 3)
            class_idx: Target class index (uses predicted class if None)
            
        Returns:
            Heatmap as numpy array (H, W) with values in [0, 1], or None if failed
        """
        try:
            model = model_loader.get_model()
            
            # Find target layer if not specified
            if self.target_layer_name is None:
                self.target_layer_name = self._find_target_layer(model)
            
            # Build gradient model
            if self.grad_model is None:
                self.grad_model = self._build_grad_model(model, self.target_layer_name)
            
            # Convert to tensor
            img_tensor = tf.convert_to_tensor(image, dtype=tf.float32)
            
            # Forward pass with gradient tape
            with tf.GradientTape() as tape:
                tape.watch(img_tensor)
                conv_outputs, predictions = self.grad_model(img_tensor)
                
                # If no class specified, use predicted class
                if class_idx is None:
                    class_idx = tf.argmax(predictions[0])
                
                # Get class prediction score
                class_channel = predictions[:, class_idx]
            
            # Compute gradients of class score w.r.t. conv output
            grads = tape.gradient(class_channel, conv_outputs)
            
            # Global average pooling of gradients
            pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
            
            # Weight feature maps by gradients
            conv_outputs = conv_outputs[0]
            pooled_grads = pooled_grads.numpy()
            conv_outputs = conv_outputs.numpy()
            
            for i in range(len(pooled_grads)):
                conv_outputs[:, :, i] *= pooled_grads[i]
            
            # Create heatmap
            heatmap = np.mean(conv_outputs, axis=-1)
            
            # Normalize to [0, 1]
            heatmap = np.maximum(heatmap, 0)  # ReLU
            if heatmap.max() > 0:
                heatmap /= heatmap.max()
            
            logger.debug(f"GradCAM heatmap generated: shape={heatmap.shape}, range=[{heatmap.min():.3f}, {heatmap.max():.3f}]")
            
            return heatmap
            
        except Exception as e:
            logger.error(f"GradCAM generation failed: {str(e)}", exc_info=True)
            return None
    
    def overlay_heatmap(self, original_image: np.ndarray, heatmap: np.ndarray,
                       alpha: float = 0.4, colormap: int = cv2.COLORMAP_JET) -> np.ndarray:
        """
        Overlay heatmap on original image
        
        Args:
            original_image: Original image (H, W, 3) in RGB, values [0, 255]
            heatmap: GradCAM heatmap (H_h, W_h) with values [0, 1]
            alpha: Transparency of heatmap overlay
            colormap: OpenCV colormap
            
        Returns:
            Overlayed image as numpy array (H, W, 3)
        """
        try:
            # Resize heatmap to match original image size
            h, w = original_image.shape[:2]
            heatmap_resized = cv2.resize(heatmap, (w, h))
            
            # Convert heatmap to RGB
            heatmap_uint8 = np.uint8(255 * heatmap_resized)
            heatmap_colored = cv2.applyColorMap(heatmap_uint8, colormap)
            
            # Convert BGR to RGB (OpenCV uses BGR)
            heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
            
            # Ensure original image is uint8
            if original_image.dtype != np.uint8:
                original_image = np.uint8(original_image)
            
            # Overlay
            overlayed = cv2.addWeighted(original_image, 1 - alpha, heatmap_colored, alpha, 0)
            
            return overlayed
            
        except Exception as e:
            logger.error(f"Failed to overlay heatmap: {str(e)}")
            return original_image
    
    def generate_and_overlay(self, original_image: np.ndarray, 
                            preprocessed_image: np.ndarray,
                            class_idx: int = None,
                            alpha: float = 0.4) -> Optional[str]:
        """
        Generate GradCAM and return as base64 encoded image
        
        Args:
            original_image: Original image (H, W, 3) in RGB
            preprocessed_image: Preprocessed image for model (1, H, W, 3)
            class_idx: Target class index
            alpha: Overlay transparency
            
        Returns:
            Base64 encoded JPEG image string, or None if failed
        """
        try:
            # Generate heatmap
            heatmap = self.generate(preprocessed_image, class_idx)
            if heatmap is None:
                return None
            
            # Overlay on original image
            overlayed = self.overlay_heatmap(original_image, heatmap, alpha)
            
            # Convert to base64
            base64_str = self._image_to_base64(overlayed)
            
            logger.info("GradCAM overlay generated successfully")
            return base64_str
            
        except Exception as e:
            logger.error(f"Failed to generate GradCAM overlay: {str(e)}")
            return None
    
    def _image_to_base64(self, image: np.ndarray, format: str = 'JPEG') -> str:
        """
        Convert numpy array to base64 string
        
        Args:
            image: Image array (H, W, 3)
            format: Image format ('JPEG' or 'PNG')
            
        Returns:
            Base64 encoded string
        """
        try:
            # Convert to PIL Image
            pil_image = Image.fromarray(image.astype(np.uint8))
            
            # Save to bytes buffer
            buffer = io.BytesIO()
            pil_image.save(buffer, format=format, quality=95)
            buffer.seek(0)
            
            # Encode to base64
            image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
            # Add data URL prefix
            mime_type = 'image/jpeg' if format == 'JPEG' else 'image/png'
            return f"data:{mime_type};base64,{image_base64}"
            
        except Exception as e:
            logger.error(f"Failed to convert image to base64: {str(e)}")
            raise


# Singleton instance
gradcam = GradCAM()
