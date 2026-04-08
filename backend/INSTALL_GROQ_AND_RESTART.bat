@echo off
title FarmHelp - Install GROQ and Restart Backend
color 0A

echo.
echo ================================================
echo   Installing GROQ AI and Restarting Backend
echo ================================================
echo.

cd /d "%~dp0"

REM Step 1: Stop old backend
echo [1/4] Stopping old backend server...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":4000" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
timeout /t 2 /nobreak >nul
echo    Done!
echo.

REM Step 2: Install GROQ packages
echo [2/4] Installing GROQ AI packages...
cd backend
echo    This may take 1-2 minutes...
echo.
call npm install @langchain/groq langchain @langchain/core @langchain/community
echo.
if errorlevel 1 (
    echo    WARNING: Installation had errors!
    echo    Continuing anyway...
    echo.
) else (
    echo    SUCCESS! Packages installed.
    echo.
)

REM Step 3: Verify packages
echo [3/4] Verifying installation...
call npm list langchain @langchain/groq 2>nul
echo.

REM Step 4: Start backend
echo [4/4] Starting backend with GROQ AI...
echo.
echo ================================================
echo   WATCH FOR THIS MESSAGE:
echo   "GROQ AI Service is READY!"
echo ================================================
echo.
echo Starting in new window...
timeout /t 2 /nobreak >nul

start "FarmHelp-Backend-GROQ" cmd /k "cd /d "%~dp0backend" && echo. && echo ======================================== && echo    FarmHelp Backend with GROQ AI && echo ======================================== && echo. && node src/server-minimal.js"

echo.
echo Backend starting in new window!
echo.
echo Look for these messages:
echo   [GROQ-SERVICE] Models initialized successfully
echo   [CHATBOT-CONTROLLER] GROQ AI Service is READY!
echo   Server running on port 4000
echo.
echo If you see those, GROQ is working!
echo.
echo Press any key to close this window...
pause >nul
