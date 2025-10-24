"""
Simple Plant Disease Classification Model Training Script
Train on PlantVillage dataset - Windows-compatible (no Unicode chars)
"""
import os
import sys
import json
import argparse
from pathlib import Path
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2
import numpy as np

print("="*60)
print("Plant Disease Model Training")
print("="*60)

# Parse arguments
parser = argparse.ArgumentParser()
parser.add_argument('--dataset', type=str, required=True, help='Path to dataset')
parser.add_argument('--epochs', type=int, default=20, help='Number of epochs')
parser.add_argument('--batch-size', type=int, default=32, help='Batch size')
args = parser.parse_args()

print(f"Dataset: {args.dataset}")
print(f"Epochs: {args.epochs}")
print(f"Batch size: {args.batch_size}")
print("="*60)

# Configuration
IMG_SIZE = (224, 224)
BATCH_SIZE = args.batch_size
EPOCHS = args.epochs

# Get absolute path
script_dir = Path(__file__).parent
DATASET_PATH = script_dir / args.dataset
if not DATASET_PATH.exists():
    print(f"ERROR: Dataset not found at {DATASET_PATH}")
    sys.exit(1)

# Create output directories
Path('models').mkdir(exist_ok=True)
Path('logs').mkdir(exist_ok=True)

# Load dataset
print("\n[1/6] Loading dataset...")
train_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=0.2,
    subset="training",
    seed=123,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    color_mode='rgb'
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=0.2,
    subset="validation",
    seed=123,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    color_mode='rgb'
)

class_names = train_ds.class_names
num_classes = len(class_names)
print(f"[OK] Found {num_classes} classes")
print(f"Classes: {', '.join(class_names[:5])}...")

# Optimize performance
AUTOTUNE = tf.data.AUTOTUNE

# Normalization layer
normalization_layer = layers.Rescaling(1./255)

train_ds = train_ds.map(lambda x, y: (normalization_layer(x), y))
val_ds = val_ds.map(lambda x, y: (normalization_layer(x), y))

train_ds = train_ds.cache().prefetch(buffer_size=AUTOTUNE)
val_ds = val_ds.cache().prefetch(buffer_size=AUTOTUNE)

# Data augmentation
print("\n[2/6] Creating data augmentation...")
data_augmentation = keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.2),
    layers.RandomZoom(0.2),
])

# Build model
print("\n[3/6] Building model...")
base_model = MobileNetV2(
    include_top=False,
    weights='imagenet',
    input_shape=(224, 224, 3)
)
base_model.trainable = False  # Freeze base model

inputs = keras.Input(shape=(224, 224, 3))
x = data_augmentation(inputs)
# No preprocessing needed - already normalized
x = base_model(x, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.Dropout(0.3)(x)
x = layers.Dense(256, activation='relu')(x)
x = layers.Dropout(0.3)(x)
outputs = layers.Dense(num_classes, activation='softmax')(x)

model = keras.Model(inputs, outputs)

print(f"[OK] Model created with {num_classes} output classes")
print(f"Total parameters: {model.count_params():,}")

# Compile model
print("\n[4/6] Compiling model...")
model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)
print("[OK] Model compiled")

# Callbacks
callbacks = [
    keras.callbacks.ModelCheckpoint(
        'models/best_model.keras',
        save_best_only=True,
        monitor='val_accuracy',
        verbose=1
    ),
    keras.callbacks.EarlyStopping(
        monitor='val_loss',
        patience=3,
        restore_best_weights=True,
        verbose=1
    ),
    keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=2,
        verbose=1
    ),
    keras.callbacks.CSVLogger('logs/training.log')
]

# Train model
print("\n[5/6] Training model (Phase 1 - Frozen base)...")
print("="*60)

history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    callbacks=callbacks
)

print("\n[OK] Phase 1 training complete!")

# Fine-tune
print("\n[5b/6] Fine-tuning (unfreezing top layers)...")
base_model.trainable = True

# Freeze all layers except last 30%
for layer in base_model.layers[:-int(len(base_model.layers)*0.3)]:
    layer.trainable = False

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.0001),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

history_fine = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=5,
    callbacks=callbacks
)

print("[OK] Fine-tuning complete!")

# Save models
print("\n[6/6] Saving models...")

# Save Keras model
model.save('models/plant_disease_model.keras')
print("[OK] Saved: models/plant_disease_model.keras")

# Save in H5 format for compatibility
model.save('models/plant_disease_model.h5')
print("[OK] Saved: models/plant_disease_model.h5")

# Save class labels
with open('models/class_labels.json', 'w') as f:
    json.dump({'classes': class_names}, f, indent=2)
print("[OK] Saved: models/class_labels.json")

# Convert to TFLite
print("\nConverting to TFLite (mobile format)...")
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

with open('models/plant_disease_model.tflite', 'wb') as f:
    f.write(tflite_model)

tflite_size = len(tflite_model) / (1024 * 1024)
print(f"[OK] Saved: models/plant_disease_model.tflite ({tflite_size:.1f} MB)")

# Final evaluation
print("\n"+"="*60)
print("Final Evaluation")
print("="*60)
val_loss, val_acc = model.evaluate(val_ds)
print(f"Validation Accuracy: {val_acc*100:.2f}%")
print(f"Validation Loss: {val_loss:.4f}")

print("\n"+"="*60)
print("Training Complete!")
print("="*60)
print(f"Model saved to: models/plant_disease_model.h5")
print(f"TFLite model: models/plant_disease_model.tflite")
print(f"Class labels: models/class_labels.json")
print(f"Training logs: logs/training.log")
print("="*60)
