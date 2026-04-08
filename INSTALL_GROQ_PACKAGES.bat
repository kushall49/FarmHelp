@echo off
echo ========================================
echo GROQ AI Chatbot - Package Installation
echo ========================================
echo.

cd backend

echo [1/4] Checking Node.js version...
node -v
if errorlevel 1 (
    echo ERROR: Node.js not found!
    pause
    exit /b 1
)
echo.

echo [2/4] Installing LangChain packages with --legacy-peer-deps...
call npm install @langchain/groq langchain @langchain/core @langchain/community --legacy-peer-deps
if errorlevel 1 (
    echo ERROR: Installation failed!
    pause
    exit /b 1
)
echo.

echo [3/4] Verifying installation...
call npm list @langchain/groq langchain
echo.

echo [4/4] Setup complete!
echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo 1. Get GROQ API key from: https://console.groq.com/keys
echo 2. Add to backend\.env file: GROQ_API_KEY=gsk_xxxxx
echo 3. Restart the backend server
echo 4. Check console for: "GROQ AI Service is READY"
echo.
echo Read GROQ_SETUP.md for detailed instructions!
echo ========================================
pause
