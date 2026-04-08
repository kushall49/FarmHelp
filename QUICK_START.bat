@echo off
title FarmHelp - Quick Start with GROQ AI
color 0A

echo.
echo =========================================================
echo        FarmHelp - Installing GROQ AI ^& Starting App
echo =========================================================
echo.

cd /d "C:\Users\kusha\OneDrive\Desktop\New folder\FarmHelp"

echo [Step 1/2] Installing GROQ AI packages...
cd backend
call npm install @langchain/groq langchain @langchain/core @langchain/community
if errorlevel 1 (
    echo WARNING: Package installation had issues. Continuing anyway...
)
cd ..
echo Done!
echo.

echo [Step 2/2] Starting FarmHelp Application...
call START_HERE.bat
