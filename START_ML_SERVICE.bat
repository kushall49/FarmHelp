@echo off
echo =========================================
echo   Starting Plant Disease ML Service
echo =========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found! Please install Python 3.8+
    pause
    exit /b 1
)

echo ✅ Python found!
python --version
echo.

echo [1/3] Navigating to model-service...
cd model-service

echo [2/3] Installing requirements (if needed)...
if exist "requirements.txt" (
    pip install -r requirements.txt --quiet
    echo ✅ Requirements installed
) else (
    echo ⚠️ No requirements.txt found
)

echo.
echo [3/3] Starting Flask ML Service on port 5000...
echo.
echo =========================================
echo   ML Service Starting...
echo =========================================
echo.
echo The service will run on: http://127.0.0.1:5000
echo.
echo Keep this window open while using Plant Analyzer!
echo Press Ctrl+C to stop the service
echo.
echo =========================================
echo.

REM Start the Flask app
python app.py

pause
