# FarmHelp - Start Web Version Directly
# This script starts backend and frontend web server automatically

$ErrorActionPreference = "Continue"
Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  FarmHelp - Starting Web Version" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

# Get script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Kill existing processes
Write-Host "[1/3] Stopping any running services..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort 19000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Write-Host "   Done!" -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "[2/3] Starting Backend Server (Port 4000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\backend'; Write-Host '[BACKEND] Starting with GROQ AI...' -ForegroundColor Cyan; node src/server-minimal.js" -WindowStyle Normal
Start-Sleep -Seconds 5
Write-Host "   Backend started!" -ForegroundColor Green
Write-Host ""

# Start Frontend Web Server (automatic)
Write-Host "[3/3] Starting Frontend Web Server (Port 19000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\frontend'; Write-Host '[FRONTEND] Starting Web Server...' -ForegroundColor Cyan; npx expo start --web" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "   Frontend web server starting..." -ForegroundColor Green
Write-Host ""

Write-Host "=========================================" -ForegroundColor Green
Write-Host "  Services Starting!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Two windows have opened:" -ForegroundColor Cyan
Write-Host "1. Backend  - Should show 'GROQ AI Service is READY'" -ForegroundColor White
Write-Host "2. Frontend - Will compile and start web server" -ForegroundColor White
Write-Host ""
Write-Host "Waiting 60 seconds for compilation..." -ForegroundColor Yellow
Start-Sleep -Seconds 60
Write-Host ""
Write-Host "Opening browser at http://localhost:19000" -ForegroundColor Green
Start-Process "http://localhost:19000"
Write-Host ""
Write-Host "If browser shows error:" -ForegroundColor Yellow
Write-Host "- Wait another 30 seconds (first compile takes time)" -ForegroundColor White
Write-Host "- Check frontend window - it should say 'Webpack compiled'" -ForegroundColor White
Write-Host "- Then refresh the browser" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
