@echo off
title FarmHelp Backend - GROQ AI Enabled
color 0A

echo.
echo ================================================
echo   Starting FarmHelp Backend with GROQ AI
echo ================================================
echo.

cd backend

echo [*] Checking GROQ API Key...
findstr "GROQ_API_KEY=gsk_" .env >nul 2>&1
if %errorlevel%==0 (
    echo [OK] GROQ API Key found!
) else (
    echo [WARNING] GROQ_API_KEY not found in .env file!
    echo [INFO] AI will use fallback mode.
)

echo.
echo [*] Starting backend server on port 4000...
echo [*] Press Ctrl+C to stop the server
echo.
echo ================================================
echo.

node src\server-minimal.js

pause
