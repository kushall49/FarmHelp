# Check if servers are running
Write-Host "=== FarmHelp Services Status ===" -ForegroundColor Green
Write-Host ""

# Check Flask (Port 5000)
try {
    $flask = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "[OK] Flask ML Service: RUNNING on port 5000" -ForegroundColor Green
} catch {
    Write-Host "[X] Flask ML Service: NOT RUNNING on port 5000" -ForegroundColor Red
}

# Check Backend (Port 4000)
try {
    $backend = Invoke-WebRequest -Uri "http://localhost:4000/" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "[OK] Node.js Backend: RUNNING on port 4000" -ForegroundColor Green
} catch {
    Write-Host "[X] Node.js Backend: NOT RUNNING on port 4000" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Process Check ===" -ForegroundColor Cyan
$node = Get-Process node -ErrorAction SilentlyContinue
$python = Get-Process python -ErrorAction SilentlyContinue

if ($node) {
    Write-Host "[OK] Node.js processes: $(@($node).Count)" -ForegroundColor Green
} else {
    Write-Host "[X] No Node.js processes found" -ForegroundColor Yellow
}

if ($python) {
    Write-Host "[OK] Python processes: $(@($python).Count)" -ForegroundColor Green
} else {
    Write-Host "[X] No Python processes found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Check the CMD windows for detailed logs!" -ForegroundColor Cyan
