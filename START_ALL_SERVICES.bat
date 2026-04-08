@echo off
echo =========================================
echo   FarmHelp - Complete System Startup
echo =========================================
echo.
echo This will start ALL services needed:
echo   1. ML Service (Port 5000) - Plant Disease Detection
echo   2. Backend (Port 4000) - API Server
echo   3. Frontend (Port 19000) - Web App
echo.
echo =========================================
echo.

REM Start ML Service in new window
echo [1/3] Starting ML Service (Port 5000)...
start "FarmHelp ML Service" cmd /k "cd model-service && python app.py"
timeout /t 3 /nobreak >nul
echo ✅ ML Service starting...
echo.

REM Start Backend in new window
echo [2/3] Starting Backend (Port 4000)...
start "FarmHelp Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
echo ✅ Backend starting...
echo.

REM Start Frontend in new window
echo [3/3] Starting Frontend (Port 19000)...
start "FarmHelp Frontend" cmd /k "cd frontend && npm start"
echo ✅ Frontend starting...
echo.

echo =========================================
echo   All Services Started!
echo =========================================
echo.
echo Check the new windows for each service:
echo   ✅ ML Service - Port 5000
echo   ✅ Backend - Port 4000  
echo   ✅ Frontend - Port 19000
echo.
echo Wait 10-15 seconds for all services to fully start
echo Then open: http://localhost:19000
echo.
echo To stop: Close all the service windows
echo.
pause
