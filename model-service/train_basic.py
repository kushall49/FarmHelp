"""
Ultra Simple Plant Disease Training - No fancy features
Just basic training that WORKS on Windows
"""
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

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
print("Plant Disease Model Training - SIMPLE VERSION")
print("="*60)

# Parse arguments
parser = argparse.ArgumentParser()
parser.add_argument('--dataset', type=str, required=True)
parser.add_argument('--epochs', type=int, default=20)
parser.add_argument('--batch-size', type=int, default=32)
args = parser.parse_args()

# Get absolute path
script_dir = Path(__file__).parent
DATASET_PATH = str(script_dir / args.dataset)

if not Path(DATASET_PATH).exists():
    print(f"ERROR: Dataset not found at {DATASET_PATH}")
    sys.exit(1)

print(f"Dataset: {DATASET_PATH}")
print(f"Epochs: {args.epochs}")
print(f"Batch size: {args.batch_size}")
print("="*60)

# Configuration
IMG_SIZE = (224, 224)
BATCH_SIZE = args.batch_size
EPOCHS = args.epochs

# Create output dir
Path('models').mkdir(exist_ok=True)

# Load dataset - NO AUGMENTATION
print("\nLoading dataset...")
train_ds = keras.utils.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=0.2,
    subset="training",
    seed=123,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode='int'  # Use integer labels
)

val_ds = keras.utils.image_dataset_from_directory(
    DATASET_PATH,
    validation_split=0.2,
    subset="validation",
    seed=123,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode='int'
)

class_names = train_ds.class_names
num_classes = len(class_names)
print(f"[OK] Found {num_classes} classes: {', '.join(class_names[:3])}...")

# Normalize images
normalization = layers.Rescaling(1./255)
train_ds = train_ds.map(lambda x, y: (normalization(x), y))
val_ds = val_ds.map(lambda x, y: (normalization(x), y))

# Prefetch
AUTOTUNE = tf.data.AUTOTUNE
train_ds = train_ds.prefetch(buffer_size=AUTOTUNE)
val_ds = val_ds.prefetch(buffer_size=AUTOTUNE)

# Build simple model
print("\nBuilding model...")
base_model = MobileNetV2(input_shape=(224, 224, 3), include_top=False, weights='imagenet')
base_model.trainable = False

model = keras.Sequential([
    layers.Input(shape=(224, 224, 3)),
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dropout(0.2),
    layers.Dense(num_classes)
])

print(f"[OK] Model ready with {num_classes} classes")
print(f"Total parameters: {model.count_params():,}")

# Compile
print("\nCompiling...")
model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss=keras.losses.SparseCategoricalCrossentropy(from_logits=True),
    metrics=['accuracy']
)
print("[OK] Compiled")

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
        verbose=1
    )
]

# Train
print("\n" + "="*60)
print(f"Training for {EPOCHS} epochs...")
print("="*60 + "\n")

history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    callbacks=callbacks,
    verbose=1
)

print("\n[OK] Training complete!")

# Save model
print("\nSaving models...")
model.save('models/plant_disease_model.keras')
print("[OK] Saved: models/plant_disease_model.keras")

model.save('models/plant_disease_model.h5')
print("[OK] Saved: models/plant_disease_model.h5")

# Save labels
with open('models/class_labels.json', 'w') as f:
    json.dump({'classes': class_names}, f, indent=2)
print("[OK] Saved: models/class_labels.json")

# Convert to TFLite
print("\nConverting to TFLite...")
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

with open('models/plant_disease_model.tflite', 'wb') as f:
    f.write(tflite_model)

size_mb = len(tflite_model) / (1024 * 1024)
print(f"[OK] Saved: models/plant_disease_model.tflite ({size_mb:.1f} MB)")

# Final evaluation
print("\n" + "="*60)
print("Final Evaluation")
print("="*60)
loss, acc = model.evaluate(val_ds, verbose=0)
print(f"Validation Accuracy: {acc*100:.2f}%")
print(f"Validation Loss: {loss:.4f}")

print("\n" + "="*60)
print("TRAINING COMPLETE!")
print("="*60)
print(f"Models saved in: {script_dir / 'models'}")
print("Files created:")
print("  - plant_disease_model.h5")
print("  - plant_disease_model.tflite")
print("  - class_labels.json")
print("="*60)
