# ============================================
# FarmHelp - Stop All Services (PowerShell)
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Stopping FarmHelp Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to kill process on port
function Kill-ProcessOnPort {
    param($Port)
    $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($processes) {
        foreach ($pid in $processes) {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "   Killed PID $pid on port $Port" -ForegroundColor Yellow
        }
        return $true
    }
    return $false
}

Write-Host "[1/3] Stopping Backend (Port 4000)..." -ForegroundColor White
if (Kill-ProcessOnPort 4000) {
    Write-Host "   ✓ Backend stopped" -ForegroundColor Green
} else {
    Write-Host "   ✗ Backend not running" -ForegroundColor Gray
}

Write-Host "[2/3] Stopping ML Service (Port 5000)..." -ForegroundColor White
if (Kill-ProcessOnPort 5000) {
    Write-Host "   ✓ ML Service stopped" -ForegroundColor Green
} else {
    Write-Host "   ✗ ML Service not running" -ForegroundColor Gray
}

Write-Host "[3/3] Stopping Frontend (Port 19000)..." -ForegroundColor White
if (Kill-ProcessOnPort 19000) {
    Write-Host "   ✓ Frontend stopped" -ForegroundColor Green
} else {
    Write-Host "   ✗ Frontend not running" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All Services Stopped!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
