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
Write-Host "[1/4] Stopping any running services..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort 19000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Write-Host "   Done!" -ForegroundColor Green
Write-Host ""

# Start ML Service
Write-Host "[2/4] Starting ML Service (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\model-service'; Write-Host '[ML SERVICE] Starting Flask ML API...' -ForegroundColor Magenta; python app.py; if ($LASTEXITCODE -ne 0) { if ($env:USE_ML_MOCK_FALLBACK -eq 'true') { Write-Host '[ML SERVICE] app.py failed, starting fallback app_simple.py (USE_ML_MOCK_FALLBACK=true)...' -ForegroundColor Yellow; python app_simple.py } else { Write-Host '[ML SERVICE] app.py failed. Mock fallback disabled for production. Set USE_ML_MOCK_FALLBACK=true only for local dev.' -ForegroundColor Red } }" -WindowStyle Normal
Start-Sleep -Seconds 4
Write-Host "   ML service started!" -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "[3/4] Starting Backend Server (Port 4000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\backend'; Write-Host '[BACKEND] Starting with GROQ AI...' -ForegroundColor Cyan; node src/server-minimal.js" -WindowStyle Normal
Start-Sleep -Seconds 5
Write-Host "   Backend started!" -ForegroundColor Green
Write-Host ""

# Start Frontend Web Server (stable static web build)
Write-Host "[4/4] Building and Serving Frontend Web (Port 19006)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\frontend'; Write-Host '[FRONTEND] Exporting web build...' -ForegroundColor Cyan; npx expo export:web; Write-Host '[FRONTEND] Serving web-build on 19006...' -ForegroundColor Cyan; npx serve web-build -l 19006" -WindowStyle Normal
Start-Sleep -Seconds 5
Write-Host "   Frontend web server started on 19006!" -ForegroundColor Green
Write-Host ""

Write-Host "=========================================" -ForegroundColor Green
Write-Host "  Services Starting!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Three windows have opened:" -ForegroundColor Cyan
Write-Host "1. ML Service - Should show Flask running on 5000" -ForegroundColor White
Write-Host "2. Backend    - Should show server on 4000" -ForegroundColor White
Write-Host "3. Frontend   - Will compile and start web server" -ForegroundColor White
Write-Host ""
Write-Host "Waiting for web build..." -ForegroundColor Yellow
$frontendReady = $false
for ($i = 0; $i -lt 120; $i++) {
    $conn = Get-NetTCPConnection -LocalPort 19006 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn) {
        $frontendReady = $true
        break
    }
    Start-Sleep -Seconds 1
}
Write-Host ""
if ($frontendReady) {
    Write-Host "Opening browser at http://localhost:19006" -ForegroundColor Green
    Start-Process "http://localhost:19006"
} else {
    Write-Host "Frontend did not open port 19006 in time." -ForegroundColor Red
    Write-Host "Check the frontend window for build errors." -ForegroundColor Yellow
}
Write-Host ""
Write-Host "If browser shows error:" -ForegroundColor Yellow
Write-Host "- Wait another 20 seconds (first export takes time)" -ForegroundColor White
Write-Host "- Check frontend window - it should say 'Serving!'" -ForegroundColor White
Write-Host "- Then refresh the browser" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
