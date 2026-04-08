@echo off
title FarmHelp - Complete Setup & Start
color 0A

echo.
echo =========================================================
echo        FarmHelp - Complete Setup
echo =========================================================
echo.

cd /d "%~dp0"

REM Step 1: Kill all existing processes
echo [1/6] Stopping any running services...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":4000" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":19000" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8081" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
echo    Done!
echo.

REM Step 2: Install GROQ packages
echo [2/6] Installing GROQ AI packages in backend...
cd backend
echo    Running: npm install @langchain/groq langchain @langchain/core @langchain/community
call npm install @langchain/groq langchain @langchain/core @langchain/community --no-audit --prefer-offline >nul 2>&1
if errorlevel 1 (
    echo    WARNING: Some packages may not have installed. Continuing...
) else (
    echo    Success! GROQ AI packages installed.
)
cd ..
echo.

REM Step 3: Verify GROQ API Key
echo [3/6] Checking GROQ API Key...
findstr /C:"GROQ_API_KEY=gsk_" backend\.env >nul
if errorlevel 1 (
    echo    WARNING: GROQ_API_KEY not found in .env file!
    echo    Chatbot will use fallback AI.
) else (
    echo    Success! GROQ API Key found.
)
echo.

REM Step 4: Install frontend packages if needed
echo [4/6] Checking frontend packages...
cd frontend
if not exist node_modules (
    echo    Installing frontend packages...
    call npm install >nul 2>&1
    echo    Done!
) else (
    echo    Frontend packages already installed.
)
cd ..
echo.

REM Step 5: Start Backend
echo [5/6] Starting Backend Server (Port 4000)...
start "FarmHelp-Backend" cmd /k "cd /d "%~dp0backend" && echo [BACKEND] Starting... && node src/server-minimal.js"
timeout /t 5 /nobreak >nul
echo    Backend started! Check its window for GROQ status.
echo.

REM Step 6: Start Frontend  
echo [6/6] Starting Frontend (Port 19000)...
start "FarmHelp-Frontend" cmd /k "cd /d "%~dp0frontend" && echo [FRONTEND] Starting Expo... && npx expo start"
timeout /t 3 /nobreak >nul
echo    Frontend started!
echo.

echo =========================================================
echo        Setup Complete - Services Starting!
echo =========================================================
echo.
echo   Two windows have opened:
echo   1. Backend  (Check for: "GROQ AI Service is READY")
echo   2. Frontend (Wait for: "Metro waiting on exp://")
echo.
echo   IMPORTANT:
echo   - Wait 30-60 seconds for everything to load
echo   - Frontend will show a QR code and URLs
echo   - Look for "Metro waiting on exp://" message
echo   - Then you can press 'w' in frontend window for web
echo.
echo   OR wait for URLs to appear and open:
echo   http://localhost:19000
echo.
echo   If port 19000 doesn't work, check the frontend window
echo   for the actual port (might be 8081 or different)
echo.
echo =========================================================
echo.
echo   Waiting 45 seconds before opening browser...
timeout /t 45 /nobreak
echo.
echo   Opening browser...
start http://localhost:19000
echo.
echo   If browser shows error:
echo   1. Wait another 30 seconds
echo   2. Check frontend window for actual URL
echo   3. Press 'w' in frontend window to start web server
echo.
echo   Press any key to close this window...
pause >nul
