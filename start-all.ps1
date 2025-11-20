# ============================================
# FarmHelp - Start All Services (PowerShell)
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting FarmHelp Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to kill process on port
function Kill-ProcessOnPort {
    param($Port)
    $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($process) {
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Write-Host "   Killed process on port $Port" -ForegroundColor Yellow
    }
}

# Clean up existing processes
Write-Host "[1/4] Cleaning up existing processes..." -ForegroundColor White
Kill-ProcessOnPort 4000
Kill-ProcessOnPort 5000
Kill-ProcessOnPort 19000
Write-Host "   Done!" -ForegroundColor Green
Write-Host ""

# Get project root
$ProjectRoot = $PSScriptRoot

# Start Backend
Write-Host "[2/4] Starting Backend Server (Port 4000)..." -ForegroundColor White
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$ProjectRoot\backend'; npm start"
) -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "   Backend starting..." -ForegroundColor Green
Write-Host ""

# Start ML Service
Write-Host "[3/4] Starting ML Service (Port 5000)..." -ForegroundColor White
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$ProjectRoot\model-service'; python app.py"
) -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "   ML Service starting..." -ForegroundColor Green
Write-Host ""

# Start Frontend
Write-Host "[4/4] Starting Frontend (Port 19000)..." -ForegroundColor White
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$ProjectRoot\frontend'; npx expo start --web"
) -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "   Frontend starting..." -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All Services Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Backend:  " -NoNewline; Write-Host "http://localhost:4000" -ForegroundColor Yellow
Write-Host "  ML API:   " -NoNewline; Write-Host "http://localhost:5000" -ForegroundColor Yellow
Write-Host "  Frontend: " -NoNewline; Write-Host "http://localhost:19000" -ForegroundColor Yellow
Write-Host ""
Write-Host "  - 3 PowerShell windows opened" -ForegroundColor Gray
Write-Host "  - Wait 30 seconds for all services to load" -ForegroundColor Gray
Write-Host "  - MongoDB starts automatically with backend" -ForegroundColor Gray
Write-Host ""
Write-Host "  Press Ctrl+C in each window to stop services" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Wait and check status
Write-Host "Waiting 10 seconds before checking status" -ForegroundColor Gray
Start-Sleep -Seconds 10
Write-Host ""
Write-Host "Checking service status" -ForegroundColor White
Write-Host ""

$ports = @(4000, 5000, 19000)
foreach ($port in $ports) {
    $listening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($listening) {
        Write-Host "  OK Port $port is listening" -ForegroundColor Green
    } else {
        Write-Host "  WAIT Port $port is NOT listening yet" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Services are starting - Wait 30 seconds for full initialization" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window" -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
