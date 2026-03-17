"""
Active Learning & Retraining System
Merges confirmed images with existing dataset and fine-tunes the model
"""

import os
import sys
import json
import shutil
from datetime import datetime
from pathlib import Path
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, Model
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, CSVLogger
import numpy as np

# Import from existing training script
from train_model import PlantDiseaseModel, TrainingConfig

class RetrainingSystem:
    def __init__(self, base_model_path, confirmed_data_path, output_dir='models/retrained'):
        """
        Initialize retraining system
        
        Args:
            base_model_path: Path to current production model (.h5)
            confirmed_data_path: Path to confirmed images directory
            output_dir: Output directory for retrained models
        """
        self.base_model_path = base_model_path
        self.confirmed_data_path = Path(confirmed_data_path)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.config = TrainingConfig()
        self.model = None
        self.training_history = None
        
    def load_base_model(self):
        """Load existing production model"""
        print(f"Loading base model from: {self.base_model_path}")
        
        if not os.path.exists(self.base_model_path):
            raise FileNotFoundError(f"Base model not found: {self.base_model_path}")
        
        self.model = keras.models.load_model(self.base_model_path)
        print(f"✓ Model loaded successfully")
        print(f"  Input shape: {self.model.input_shape}")
        print(f"  Output classes: {self.model.output_shape[-1]}")
        
    def merge_datasets(self, original_dataset_path=None):
        """
        Merge confirmed images with original dataset
        
        Args:
            original_dataset_path: Path to original PlantVillage dataset (optional)
        """
        print("\n==========================================================")
        print("Merging Confirmed Images with Training Dataset")
        print("==========================================================")
        
        # Validate and sanitize original_dataset_path to prevent path traversal
        if original_dataset_path:
            # Ensure it's an absolute path and doesn't contain path traversal patterns
            original_dataset_path = os.path.abspath(original_dataset_path)
            if '..' in original_dataset_path or not os.path.exists(original_dataset_path):
                raise ValueError(f"Invalid or non-existent dataset path: {original_dataset_path}")
        
        # Count confirmed images
        confirmed_count = 0
        for disease_dir in self.confirmed_data_path.iterdir():
            if disease_dir.is_dir():
                images = list(disease_dir.glob('*.jpg')) + list(disease_dir.glob('*.jpeg')) + list(disease_dir.glob('*.png'))
                confirmed_count += len(images)
                print(f"  {disease_dir.name}: {len(images)} images")
        
        print(f"\n✓ Total confirmed images: {confirmed_count}")
        
        if confirmed_count == 0:
            raise ValueError("No confirmed images found for retraining")
        
        # If original dataset provided, merge them
        if original_dataset_path:
            merged_path = self.output_dir / 'merged_dataset'
            merged_path.mkdir(exist_ok=True)
            
            print(f"\nMerging with original dataset: {original_dataset_path}")
            
            # Copy original dataset
            if os.path.exists(original_dataset_path):
                for disease_dir in Path(original_dataset_path).iterdir():
                    if disease_dir.is_dir():
                        dest_dir = merged_path / disease_dir.name
                        if not dest_dir.exists():
                            shutil.copytree(disease_dir, dest_dir)
            
            # Add confirmed images
            for disease_dir in self.confirmed_data_path.iterdir():
                if disease_dir.is_dir():
                    dest_dir = merged_path / disease_dir.name
                    dest_dir.mkdir(exist_ok=True)
                    
                    for img in disease_dir.glob('*'):
                        if img.suffix.lower() in ['.jpg', '.jpeg', '.png']:
                            shutil.copy2(img, dest_dir / img.name)
            
            return str(merged_path)
        else:
            # Use only confirmed images for fine-tuning
            return str(self.confirmed_data_path)
    
    def prepare_dataset(self, dataset_path):
        """
        Prepare TensorFlow dataset for retraining
        
        Args:
            dataset_path: Path to merged dataset
            
        Returns:
            train_ds, val_ds, class_names
        """
        print("\n==========================================================")
        print("Preparing Dataset for Retraining")
        print("==========================================================")
        
        # Load dataset
        full_ds = tf.keras.preprocessing.image_dataset_from_directory(
            dataset_path,
            image_size=self.config.IMAGE_SIZE,
            batch_size=self.config.BATCH_SIZE,
            label_mode='categorical',
            shuffle=True,
            seed=42
        )
        
        class_names = full_ds.class_names
        print(f"✓ Found {len(class_names)} disease classes")
        
        # Split into train/val
        total_batches = tf.data.experimental.cardinality(full_ds).numpy()
        train_size = int(self.config.TRAIN_SPLIT * total_batches)
        
        train_ds = full_ds.take(train_size)
        val_ds = full_ds.skip(train_size)
        
        # Calculate dataset sizes
        train_samples = train_size * self.config.BATCH_SIZE
        val_samples = (total_batches - train_size) * self.config.BATCH_SIZE
        
        print(f"✓ Training samples: {train_samples}")
        print(f"✓ Validation samples: {val_samples}")
        
        # Optimize performance
        AUTOTUNE = tf.data.AUTOTUNE
        train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
        val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)
        
        return train_ds, val_ds, class_names
    
    def fine_tune_model(self, train_ds, val_ds, epochs=5):
        """
        Fine-tune model on new data
        
        Args:
            train_ds: Training dataset
            val_ds: Validation dataset
            epochs: Number of fine-tuning epochs
        """
        print("\n==========================================================")
        print(f"Fine-Tuning Model ({epochs} epochs)")
        print("==========================================================")
        
        # Compile model with lower learning rate for fine-tuning
        self.model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=1e-5),  # Very low LR for fine-tuning
            loss='categorical_crossentropy',
            metrics=[
                'accuracy',
                keras.metrics.Precision(name='precision'),
                keras.metrics.Recall(name='recall'),
                keras.metrics.AUC(name='auc')
            ]
        )
        
        # Prepare callbacks
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        checkpoint_path = self.output_dir / f'model_v{timestamp}.h5'
        
        callbacks = [
            ModelCheckpoint(
                filepath=str(checkpoint_path),
                monitor='val_accuracy',
                save_best_only=True,
                mode='max',
                verbose=1
            ),
            EarlyStopping(
                monitor='val_loss',
                patience=3,
                restore_best_weights=True,
                verbose=1
            ),
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=2,
                min_lr=1e-7,
                verbose=1
            ),
            CSVLogger(str(self.output_dir / f'retraining_log_{timestamp}.csv'))
        ]
        
        # Train model
        history = self.model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=epochs,
            callbacks=callbacks,
            verbose=1
        )
        
        self.training_history = history
        print(f"\n✓ Fine-tuning complete!")
        print(f"  Final training accuracy: {history.history['accuracy'][-1]:.4f}")
        print(f"  Final validation accuracy: {history.history['val_accuracy'][-1]:.4f}")
        
        return checkpoint_path, timestamp
    
    def save_retrained_model(self, checkpoint_path, timestamp, class_names):
        """
        Save retrained model in multiple formats
        
        Args:
            checkpoint_path: Path to best checkpoint
            timestamp: Timestamp for version
            class_names: List of class names
        """
        print("\n==========================================================")
        print("Saving Retrained Model")
        print("==========================================================")
        
        # Load best weights
        best_model = keras.models.load_model(checkpoint_path)
        
        # Save as .h5
        h5_path = self.output_dir / f'plant_disease_model_v{timestamp}.h5'
        best_model.save(h5_path)
        print(f"✓ Saved Keras model: {h5_path}")
        
        # Convert to TFLite with quantization
        tflite_path = self.output_dir / f'plant_disease_model_v{timestamp}.tflite'
        converter = tf.lite.TFLiteConverter.from_keras_model(best_model)
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        tflite_model = converter.convert()
        
        with open(tflite_path, 'wb') as f:
            f.write(tflite_model)
        
        tflite_size = os.path.getsize(tflite_path) / (1024 * 1024)
        print(f"✓ Saved TFLite model: {tflite_path}")
        print(f"  Size: {tflite_size:.2f} MB")
        
        # Save class labels
        labels_path = self.output_dir / f'class_labels_v{timestamp}.json'
        with open(labels_path, 'w') as f:
            json.dump({
                'classes': class_names,
                'num_classes': len(class_names),
                'version': timestamp,
                'retrained': True
            }, f, indent=2)
        print(f"✓ Saved class labels: {labels_path}")
        
        # Save metadata
        metadata_path = self.output_dir / f'retraining_metadata_{timestamp}.json'
        with open(metadata_path, 'w') as f:
            json.dump({
                'version': timestamp,
                'base_model': str(self.base_model_path),
                'retrained_at': datetime.now().isoformat(),
                'num_classes': len(class_names),
                'final_accuracy': float(self.training_history.history['accuracy'][-1]),
                'final_val_accuracy': float(self.training_history.history['val_accuracy'][-1]),
                'h5_model': str(h5_path),
                'tflite_model': str(tflite_path),
                'class_labels': str(labels_path)
            }, f, indent=2)
        print(f"✓ Saved metadata: {metadata_path}")
        
        return {
            'version': timestamp,
            'h5_path': str(h5_path),
            'tflite_path': str(tflite_path),
            'labels_path': str(labels_path),
            'metadata_path': str(metadata_path)
        }
    
    def run_retraining(self, original_dataset_path=None, epochs=5):
        """
        Complete retraining pipeline
        
        Args:
            original_dataset_path: Path to original dataset (optional)
            epochs: Number of fine-tuning epochs
            
        Returns:
            Dictionary with paths to retrained model files
        """
        print("\\n" + "="*60)
        print("PLANT DISEASE MODEL RETRAINING SYSTEM")
        print("="*60)
        
        # Validate and sanitize original_dataset_path if provided
        if original_dataset_path:
            original_dataset_path = os.path.abspath(original_dataset_path)
            if '..' in original_dataset_path or not os.path.exists(original_dataset_path):
                raise ValueError(f"Invalid or non-existent original dataset path: {original_dataset_path}")
        
        # Step 1: Load base model
        self.load_base_model()
        
        # Step 2: Merge datasets
        dataset_path = self.merge_datasets(original_dataset_path)
        
        # Step 3: Prepare dataset
        train_ds, val_ds, class_names = self.prepare_dataset(dataset_path)
        
        # Step 4: Fine-tune model
        checkpoint_path, timestamp = self.fine_tune_model(train_ds, val_ds, epochs)
        
        # Step 5: Save retrained model
        result = self.save_retrained_model(checkpoint_path, timestamp, class_names)
        
        print("\n" + "="*60)
        print("RETRAINING COMPLETE! 🎉")
        print("="*60)
        print(f"\nNew model version: {result['version']}")
        print(f"TFLite model ready for deployment: {result['tflite_path']}")
        print("\nTo use this model in production:")
        print(f"1. Copy {result['h5_path']} to model-service/models/")
        print(f"2. Update MODEL_PATH in .env")
        print(f"3. Restart Flask service")
        
        return result


def main():
    """CLI for retraining"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Retrain plant disease model with confirmed images')
    parser.add_argument('--base-model', type=str, required=True,
                        help='Path to current production model (.h5)')
    parser.add_argument('--confirmed-data', type=str, required=True,
                        help='Path to confirmed images directory')
    parser.add_argument('--original-dataset', type=str, default=None,
                        help='Path to original PlantVillage dataset (optional)')
    parser.add_argument('--epochs', type=int, default=5,
                        help='Number of fine-tuning epochs (default: 5)')
    parser.add_argument('--output-dir', type=str, default='models/retrained',
                        help='Output directory for retrained models')
    
    args = parser.parse_args()
    
    # Run retraining
    system = RetrainingSystem(
        base_model_path=args.base_model,
        confirmed_data_path=args.confirmed_data,
        output_dir=args.output_dir
    )
    
    result = system.run_retraining(
        original_dataset_path=args.original_dataset,
        epochs=args.epochs
    )
    
    print("\nRetraining result:", json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
