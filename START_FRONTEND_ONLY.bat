@echo off
title FarmHelp - Frontend ONLY (Web)
color 0A

echo.
echo ========================================
echo   Starting Frontend for WEB
echo ========================================
echo.

cd /d "%~dp0"

REM Kill existing frontend
echo [1/3] Stopping old frontend...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":19000" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8081" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
echo    Done!
echo.

REM Go to frontend
cd frontend

REM Clear cache
echo [2/3] Clearing Expo cache...
if exist .expo (
    rmdir /s /q .expo
    echo    Cache cleared!
)
echo.

REM Start frontend with WEB ONLY
echo [3/3] Starting Expo for WEB...
echo.
echo ========================================
echo   Frontend Starting - WATCH THIS WINDOW!
echo ========================================
echo.
echo   Wait for: "Metro waiting on exp://..."
echo   Then PRESS 'w' to start web!
echo.
echo ========================================
echo.

npx expo start --web

pause
