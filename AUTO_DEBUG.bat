@echo off
cls
color 0B
title FarmHelp - Auto Debugger

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║         FarmHelp - Automatic Debugging Tool          ║
echo ╚═══════════════════════════════════════════════════════╝
echo.
echo Starting comprehensive system check...
echo.

REM ========================================
REM STEP 1: Check if Backend is Running
REM ========================================
echo [STEP 1/6] Checking Backend Server Status...
echo.

curl -s http://localhost:4000 > nul 2>&1
if %errorlevel%==0 (
    echo    ✅ Backend is RUNNING on port 4000
    curl -s http://localhost:4000
    echo.
) else (
    echo    ❌ Backend is NOT running!
    echo    Starting backend now...
    echo.
    start "FarmHelp Backend" cmd /k "cd backend && node src\server-minimal.js"
    echo    Waiting 10 seconds for backend to start...
    timeout /t 10 /nobreak > nul
    echo.
)

REM ========================================
REM STEP 2: Test Basic Chatbot API
REM ========================================
echo [STEP 2/6] Testing Chatbot API Endpoint...
echo.

curl -X POST http://localhost:4000/api/chatbot -H "Content-Type: application/json" -d "{\"message\":\"Hello\"}" 2>nul
if %errorlevel%==0 (
    echo.
    echo    ✅ Chatbot API is responding!
) else (
    echo.
    echo    ❌ Chatbot API is not responding!
    echo    Check backend window for errors.
)
echo.

REM ========================================
REM STEP 3: Test GROQ AI with Farming Question
REM ========================================
echo [STEP 3/6] Testing GROQ AI Response...
echo.
echo Sending: "What crops grow in loamy soil?"
echo.

curl -X POST http://localhost:4000/api/chatbot -H "Content-Type: application/json" -d "{\"message\":\"What crops grow best in loamy soil?\"}" 
echo.
echo.

REM ========================================
REM STEP 4: Check Node Modules
REM ========================================
echo [STEP 4/6] Checking Required Packages...
echo.

cd backend
if exist "node_modules\@langchain\groq" (
    echo    ✅ @langchain/groq is installed
) else (
    echo    ❌ @langchain/groq is MISSING!
    echo    Installing now...
    call npm install @langchain/groq langchain @langchain/core @langchain/community
)

if exist "node_modules\langchain" (
    echo    ✅ langchain is installed
) else (
    echo    ❌ langchain is MISSING!
)

if exist "node_modules\axios" (
    echo    ✅ axios is installed
) else (
    echo    ❌ axios is MISSING!
)
cd ..
echo.

REM ========================================
REM STEP 5: Check Environment Variables
REM ========================================
echo [STEP 5/6] Checking Environment Configuration...
echo.

findstr "GROQ_API_KEY=gsk_" backend\.env > nul 2>&1
if %errorlevel%==0 (
    echo    ✅ GROQ_API_KEY is configured
) else (
    echo    ❌ GROQ_API_KEY is NOT configured!
    echo    Please add GROQ_API_KEY to backend\.env file
    echo    Get free key from: https://console.groq.com/keys
)

findstr "MONGODB_URI=" backend\.env > nul 2>&1
if %errorlevel%==0 (
    echo    ✅ MONGODB_URI is configured
) else (
    echo    ❌ MONGODB_URI is NOT configured!
)
echo.

REM ========================================
REM STEP 6: Test Frontend Connection
REM ========================================
echo [STEP 6/6] Checking Frontend Status...
echo.

curl -s http://localhost:19000 > nul 2>&1
if %errorlevel%==0 (
    echo    ✅ Frontend is RUNNING on port 19000
    echo    URL: http://localhost:19000
) else (
    curl -s http://localhost:8081 > nul 2>&1
    if %errorlevel%==0 (
        echo    ✅ Frontend is RUNNING on port 8081
        echo    URL: http://localhost:8081
    ) else (
        echo    ⚠️  Frontend is NOT running
        echo    Start with: start-web.ps1
    )
)
echo.

REM ========================================
REM Summary
REM ========================================
echo.
echo ═══════════════════════════════════════════════════════
echo                    SUMMARY
echo ═══════════════════════════════════════════════════════
echo.
echo 📊 System Status:
echo.

curl -s http://localhost:4000 > nul 2>&1
if %errorlevel%==0 (
    echo    ✅ Backend: RUNNING
) else (
    echo    ❌ Backend: STOPPED
)

curl -s http://localhost:19000 > nul 2>&1
if %errorlevel%==0 (
    echo    ✅ Frontend: RUNNING on port 19000
) else (
    curl -s http://localhost:8081 > nul 2>&1
    if %errorlevel%==0 (
        echo    ✅ Frontend: RUNNING on port 8081
    ) else (
        echo    ❌ Frontend: STOPPED
    )
)

findstr "GROQ_API_KEY=gsk_" backend\.env > nul 2>&1
if %errorlevel%==0 (
    echo    ✅ GROQ AI: CONFIGURED
) else (
    echo    ❌ GROQ AI: NOT CONFIGURED
)

echo.
echo 🔗 Quick Links:
echo    Backend:  http://localhost:4000
echo    Frontend: http://localhost:19000
echo    Test API: curl -X POST http://localhost:4000/api/chatbot -H "Content-Type: application/json" -d "{\"message\":\"Hello\"}"
echo.
echo ═══════════════════════════════════════════════════════
echo.

pause
