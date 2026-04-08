@echo off
color 0A
cls
echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║       FarmHelp - ONE-CLICK AUTO DEBUG ^& FIX          ║
echo ╚═══════════════════════════════════════════════════════╝
echo.
echo This will automatically:
echo   ✅ Check all services
echo   ✅ Start backend if needed
echo   ✅ Test GROQ AI
echo   ✅ Start frontend if needed
echo   ✅ Fix any issues
echo.
echo Press any key to start auto-debug...
pause > nul
echo.
echo ═══════════════════════════════════════════════════════
echo.

cd /d "C:\Users\kusha\OneDrive\Desktop\New folder\FarmHelp"
powershell.exe -ExecutionPolicy Bypass -File "AUTO-FIX.ps1"

echo.
echo ═══════════════════════════════════════════════════════
echo  Auto-debug complete!
echo ═══════════════════════════════════════════════════════
echo.
pause
