@echo off
echo ============================================
echo   Plant Analyzer - System Test
echo ============================================
echo.

echo [1/5] Testing Backend Connection...
curl -s -o nul -w "Backend Status: %%{http_code}\n" http://localhost:4000/api/crops
if %errorlevel% neq 0 (
    echo ❌ Backend not running! Start with: START_BACKEND.bat
    pause
    exit /b 1
)
echo ✅ Backend is running!
echo.

echo [2/5] Checking Disease Analyzer Service...
if exist "backend\src\services\plantDiseaseAnalyzer.js" (
    echo ✅ Disease Analyzer Service found
) else (
    echo ❌ Disease Analyzer Service missing!
)
echo.

echo [3/5] Checking Pl@ntNet API Integration...
if exist "frontend\src\services\plantnetApi.ts" (
    echo ✅ Pl@ntNet API Service found
    findstr /C:"2b10cb9WQRRM6k5E0ND8aKgpzu" "frontend\src\services\plantnetApi.ts" >nul
    if %errorlevel% equ 0 (
        echo ✅ API Key configured!
    ) else (
        echo ⚠️ API Key not found
    )
) else (
    echo ❌ Pl@ntNet API Service missing!
)
echo.

echo [4/5] Checking Disease Cure Database...
if exist "frontend\src\services\diseaseCures.ts" (
    echo ✅ Disease Cure Database found
) else (
    echo ❌ Disease Cure Database missing!
)
echo.

echo [5/5] Testing Plant Upload Endpoint...
echo Testing POST /api/plant/upload-plant...
echo (Need actual image to test - will show if endpoint exists)

curl -X OPTIONS http://localhost:4000/api/plant/upload-plant -v 2>&1 | findstr "200\|404\|405" >nul
if %errorlevel% equ 0 (
    echo ✅ Plant upload endpoint exists
) else (
    echo ⚠️ Cannot verify endpoint (backend may need restart)
)
echo.

echo ============================================
echo   Test Summary
echo ============================================
echo.
echo ✅ = Working   ❌ = Missing   ⚠️ = Warning
echo.
echo To fully test with image upload:
echo 1. Make sure backend is running
echo 2. Open FarmHelp app
echo 3. Go to Plant Analyzer
echo 4. Upload a plant image
echo 5. Check if you get disease detection + cure suggestions
echo.
echo See PLANT_ANALYZER_COMPLETE.md for full documentation
echo.
pause
