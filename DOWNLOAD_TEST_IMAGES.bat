@echo off
echo ============================================
echo   Plant Disease Test Images Downloader
echo ============================================
echo.

REM Create test-images folder
if not exist "test-images" mkdir "test-images"
cd test-images

echo [1/6] Downloading Tomato Late Blight image...
curl -L -o "tomato_late_blight.jpg" "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Tomato_late_blight.jpg/800px-Tomato_late_blight.jpg"

echo [2/6] Downloading Tomato Early Blight image...
curl -L -o "tomato_early_blight.jpg" "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Early_blight_on_tomato.jpg/800px-Early_blight_on_tomato.jpg"

echo [3/6] Downloading Powdery Mildew image...
curl -L -o "powdery_mildew.jpg" "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Powdery_mildew_on_pumpkin_leaves.jpg/800px-Powdery_mildew_on_pumpkin_leaves.jpg"

echo [4/6] Downloading Leaf Spot image...
curl -L -o "leaf_spot.jpg" "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Septoria_leaf_spot_on_tomato.jpg/800px-Septoria_leaf_spot_on_tomato.jpg"

echo [5/6] Downloading Rust Disease image...
curl -L -o "rust_disease.jpg" "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Bean_rust_on_common_bean_leaves.jpg/800px-Bean_rust_on_common_bean_leaves.jpg"

echo [6/6] Downloading Healthy Tomato Leaf...
curl -L -o "healthy_leaf.jpg" "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Tomato_plant.jpg/800px-Tomato_plant.jpg"

cd ..

echo.
echo ============================================
echo   Download Complete!
echo ============================================
echo.
echo Test images saved in: test-images\
echo.
echo Images downloaded:
echo   1. tomato_late_blight.jpg    - Critical disease
echo   2. tomato_early_blight.jpg   - Medium severity
echo   3. powdery_mildew.jpg        - Common fungal
echo   4. leaf_spot.jpg             - Bacterial/fungal
echo   5. rust_disease.jpg          - Fungal disease
echo   6. healthy_leaf.jpg          - Healthy plant
echo.
echo To test:
echo   1. Open your FarmHelp app
echo   2. Go to Plant Analyzer
echo   3. Upload any image from test-images folder
echo   4. Check the cure suggestions!
echo.
echo Opening test-images folder...
start test-images
echo.
pause
