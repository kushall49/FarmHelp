@echo off
cls
color 0A
title FarmHelp - Backend Server with GROQ AI

echo.
echo ╔═══════════════════════════════════════════════╗
echo ║   FarmHelp Backend - Starting with GROQ AI   ║
echo ╚═══════════════════════════════════════════════╝
echo.

cd backend

echo [1/3] Checking GROQ Configuration...
findstr "GROQ_API_KEY=gsk_" .env >nul 2>&1
if %errorlevel%==0 (
    echo    ✅ GROQ API Key found! AI is enabled!
) else (
    echo    ⚠️  GROQ API Key not found - using fallback mode
)
echo.

echo [2/3] Checking Dependencies...
if exist "node_modules\@langchain\groq" (
    echo    ✅ Langchain GROQ packages installed
) else (
    echo    ⚠️  Installing Langchain GROQ packages...
    call npm install @langchain/groq langchain @langchain/core @langchain/community --no-audit
)
echo.

echo [3/3] Starting Backend Server...
echo    Port: 4000
echo    Database: MongoDB Cloud
echo    AI: GROQ + LangChain (Llama 3.3 70B)
echo.
echo ═══════════════════════════════════════════════
echo  Server is starting... Watch for messages:
echo  ✅ "MongoDB Connected Successfully"
echo  ✅ "GROQ AI Service is READY!"
echo ═══════════════════════════════════════════════
echo.

node src\server-minimal.js

echo.
echo ═══════════════════════════════════════════════
echo  Backend server stopped
echo ═══════════════════════════════════════════════
echo.
pause
