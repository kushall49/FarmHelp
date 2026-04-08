@echo off
title FarmHelp Starter
color 0A

echo.
echo =========================================================
echo        FarmHelp - Starting All Services
echo =========================================================
echo.

REM Change to script directory
cd /d "%~dp0"

echo [INFO] Project directory: %CD%
echo.

REM Kill any existing processes on these ports
echo [1/5] Cleaning up old processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":4000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":19000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8081" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo       Done!
echo.

REM Start Backend
echo [2/5] Starting Backend Server (Port 4000)...
start "FarmHelp-Backend" /MIN cmd /k "cd /d "%~dp0backend" && echo Starting Backend... && node src/server-minimal.js"
timeout /t 3 /nobreak >nul
echo       Backend starting...
echo.

REM Start ML Service (use simple version for reliability)
echo [3/5] Starting ML Service (Port 5000)...
start "FarmHelp-ML" /MIN cmd /k "cd /d "%~dp0model-service" && echo Starting ML Service... && python app_simple.py"
timeout /t 3 /nobreak >nul
echo       ML Service starting...
echo.

REM Start Frontend
echo [4/5] Starting Frontend (Port 8081)...
start "FarmHelp-Frontend" cmd /k "cd /d "%~dp0frontend" && echo Starting Frontend... && npx expo start --web --port 8081"
timeout /t 3 /nobreak >nul
echo       Frontend starting...
echo.

echo [5/5] Waiting for services to initialize...
timeout /t 15 /nobreak >nul
echo.

echo =========================================================
echo        All Services Starting!
echo =========================================================
echo.
echo   URLS:
echo   -------------------------------------------------------
echo   Frontend:   http://localhost:8081  (OPEN THIS!)
echo   Backend:    http://localhost:4000
echo   ML Service: http://localhost:5000
echo   -------------------------------------------------------
echo.
echo   Three windows should have opened.
echo   Wait ~30 seconds for everything to load.
echo.
echo   The Frontend window will show "Compiled successfully"
echo   when ready. Then open http://localhost:8081
echo.
echo   Press any key to open the app in browser...
echo =========================================================

pause >nul
start http://localhost:8081
echo.
echo   Browser opened! If page shows error, wait 30 more seconds.
echo   Press any key to close this window...
pause >nul
