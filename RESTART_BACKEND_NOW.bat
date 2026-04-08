@echo off
color 0A
cls
echo.
echo ═══════════════════════════════════════════════════════
echo   Restarting Backend with SEVERITY FIX
echo ═══════════════════════════════════════════════════════
echo.

echo [1/2] Stopping any existing backend on port 4000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000') do (
    echo    Killing process %%a
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo    Done!
echo.

echo [2/2] Starting backend with SEVERITY MAPPING FIX...
cd backend
start "FarmHelp Backend - FIXED" cmd /k "echo ═══════════════════════════════════════════════════════ && echo   FarmHelp Backend - SEVERITY FIX APPLIED && echo ═══════════════════════════════════════════════════════ && echo. && node src\server-minimal.js"

echo.
echo ═══════════════════════════════════════════════════════
echo   Backend is starting in a new window!
echo ═══════════════════════════════════════════════════════
echo.
echo Look for these messages in the backend window:
echo   ✅ MongoDB Connected Successfully
echo   ✅ GROQ AI Service is READY!
echo   ✅ Server running on port 4000
echo.
echo NOW TEST PLANT ANALYZER:
echo   1. Go to http://localhost:19000
echo   2. Navigate to Plant Analyzer
echo   3. Upload test image
echo   4. Should work without validation error!
echo.
echo FIX APPLIED: severity 'medium' now maps to 'moderate'
echo.
pause
