@echo off
echo ================================================
echo  Restarting Backend with GROQ AI Integration
echo ================================================
echo.

REM Kill existing backend processes on port 4000
echo [1/2] Stopping existing backend...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo    Done!
echo.

REM Start backend
echo [2/2] Starting backend with GROQ AI...
cd backend
start "FarmHelp Backend - GROQ AI" cmd /k "node src\server-minimal.js"
echo    Backend started!
echo.

echo ================================================
echo  Backend is starting in a new window
echo  Check for: "GROQ AI Service is READY"
echo ================================================
echo.
pause
