@echo off
REM ============================================
REM FarmHelp - Stop All Services (Windows)
REM ============================================

echo.
echo ========================================
echo   Stopping FarmHelp Services
echo ========================================
echo.

echo [1/3] Stopping Backend (Port 4000)...
FOR /F "tokens=5" %%A IN ('netstat -ano ^| findstr ":4000" ^| findstr "LISTENING"') DO (
    taskkill /F /PID %%A >nul 2>&1
    echo    Killed PID %%A
)

echo [2/3] Stopping ML Service (Port 5000)...
FOR /F "tokens=5" %%A IN ('netstat -ano ^| findstr ":5000" ^| findstr "LISTENING"') DO (
    taskkill /F /PID %%A >nul 2>&1
    echo    Killed PID %%A
)

echo [3/3] Stopping Frontend (Port 19000)...
FOR /F "tokens=5" %%A IN ('netstat -ano ^| findstr ":19000" ^| findstr "LISTENING"') DO (
    taskkill /F /PID %%A >nul 2>&1
    echo    Killed PID %%A
)

echo.
echo ========================================
echo   All Services Stopped!
echo ========================================
echo.
pause
