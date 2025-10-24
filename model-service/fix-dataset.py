"""
Find and remove corrupted images from PlantVillage dataset
"""
import os
from pathlib import Path
from PIL import Image

dataset_path = Path("C:/Users/kusha/OneDrive/Desktop/FarmHelp/model-service/data/PlantVillage")
corrupted_files = []
total_files = 0

print("Scanning for corrupted images...")
print("="*60)

for disease_folder in dataset_path.iterdir():
    if not disease_folder.is_dir():
        continue
    
    print(f"\nChecking: {disease_folder.name}")
    folder_count = 0
    
    for img_file in disease_folder.glob("*"):
        if img_file.suffix.lower() not in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']:
            print(f"  [SKIP] Non-image file: {img_file.name}")
            continue
        
        total_files += 1
        folder_count += 1
        
        try:
            # Try to open and verify the image
            with Image.open(img_file) as img:
                img.verify()  # Verify it's not corrupted
            
            # Re-open to check if it can be loaded
            with Image.open(img_file) as img:
                img.load()
                
        except Exception as e:
            print(f"  [CORRUPTED] {img_file.name}: {str(e)[:50]}")
            corrupted_files.append(img_file)
    
    print(f"  Checked: {folder_count} files")

print("\n" + "="*60)
print(f"Total files scanned: {total_files}")
print(f"Corrupted files found: {len(corrupted_files)}")

if corrupted_files:
    print("\n" + "="*60)
    print("CORRUPTED FILES:")
    print("="*60)
    for f in corrupted_files:
        print(f"  {f}")
    
    print("\n" + "="*60)
    response = input("Delete these corrupted files? (yes/no): ")
    
    if response.lower() == 'yes':
        for f in corrupted_files:
            try:
                f.unlink()
                print(f"[DELETED] {f.name}")
            except Exception as e:
                print(f"[ERROR] Could not delete {f.name}: {e}")
        print(f"\n[OK] Removed {len(corrupted_files)} corrupted files")
    else:
        print("\n[SKIPPED] No files deleted")
else:
    print("\n[OK] No corrupted files found!")

print("\n" + "="*60)
print("Done! You can now run training again.")
print("="*60)
