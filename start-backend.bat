@echo off
cd /d "c:\Users\kusha\OneDrive\Desktop\FarmHelp\backend"
echo Starting FarmHelp Backend...
echo.
node "src/minimal-server.js"
echo.
echo Backend stopped. Press any key to close...
pause > nul
