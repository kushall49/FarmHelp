# FarmHelp Flask ML Service - Start Server
Write-Host "Starting FarmHelp ML Service..." -ForegroundColor Cyan

# Activate virtual environment
if (Test-Path "venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & ".\venv\Scripts\Activate.ps1"
} else {
    Write-Host "⚠ Virtual environment not found. Run setup-ml-service.ps1 first" -ForegroundColor Red
    exit 1
}

# Check if model exists
$modelPath = "models\plant_disease_model.h5"
if (!(Test-Path $modelPath)) {
    Write-Host "`n⚠ Warning: Model file not found at $modelPath" -ForegroundColor Yellow
    Write-Host "  Service will start but /analyze endpoint will return 503" -ForegroundColor Yellow
    Write-Host ""
}

# Start Flask server
Write-Host "`nStarting Flask server on http://localhost:5000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

python app.py
