@echo off
REM ============================================
REM FarmHelp - Start All Services (Windows)
REM ============================================

echo.
echo ========================================
echo   Starting FarmHelp Services
echo ========================================
echo.

REM Kill any existing processes on ports 4000, 5000, 19000
echo [1/4] Cleaning up existing processes...
FOR /F "tokens=5" %%A IN ('netstat -ano ^| findstr ":4000" ^| findstr "LISTENING"') DO taskkill /F /PID %%A >nul 2>&1
FOR /F "tokens=5" %%A IN ('netstat -ano ^| findstr ":5000" ^| findstr "LISTENING"') DO taskkill /F /PID %%A >nul 2>&1
FOR /F "tokens=5" %%A IN ('netstat -ano ^| findstr ":19000" ^| findstr "LISTENING"') DO taskkill /F /PID %%A >nul 2>&1
echo    Done!
echo.

REM Start Backend (Node.js Express - Port 4000)
echo [2/4] Starting Backend Server (Port 4000)...
start "FarmHelp Backend" cmd /k "cd backend && node src/server-production.js"
timeout /t 3 /nobreak >nul
echo    Backend starting...
echo.

REM Start ML Service (Flask - Port 5000)
echo [3/4] Starting ML Service (Port 5000)...
start "FarmHelp ML Service" cmd /k "cd model-service && python app_simple.py"
timeout /t 3 /nobreak >nul
echo    ML Service starting...
echo.

REM Start Frontend (Expo React Native - Port 19000)
echo [4/4] Starting Frontend (Port 19000)...
start "FarmHelp Frontend" cmd /k "cd frontend && npx expo start --web"
timeout /t 3 /nobreak >nul
echo    Frontend starting...
echo.

echo ========================================
echo   All Services Started!
echo ========================================
echo.
echo   Backend:  http://localhost:4000
echo   ML API:   http://localhost:5000
echo   Frontend: http://localhost:19000
echo.
echo   - 3 terminal windows opened
echo   - Wait 30 seconds for all services to load
echo   - MongoDB starts automatically with backend
echo.
echo   Press Ctrl+C in each window to stop services
echo ========================================
echo.

REM Wait and check if services are running
timeout /t 10 /nobreak >nul
echo Checking service status...
echo.
netstat -ano | findstr "4000 5000 19000" | findstr "LISTENING"
echo.
echo If you see ports 4000, 5000, 19000 above, all services are running!
echo.
pause
