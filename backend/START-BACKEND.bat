@echo off
echo.
echo ====================================
echo  Starting FarmHelp Backend Server
echo ====================================
echo.
echo AI Model: Facebook BlenderBot 400M
echo Server: http://localhost:4000
echo Chatbot: POST /api/chatbot
echo.
echo Press Ctrl+C to stop
echo.

cd /d "C:\Users\kusha\OneDrive\Desktop\FarmHelp\backend"
node src\server-minimal.js
