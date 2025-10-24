# FarmHelp Flask ML Service - Quick Setup
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FarmHelp Plant Analyzer ML Service Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to model-service directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $scriptDir

# Check Python version
Write-Host "[1/6] Checking Python version..." -ForegroundColor Yellow
python --version

# Create virtual environment
Write-Host "`n[2/6] Creating virtual environment..." -ForegroundColor Yellow
python -m venv venv

# Activate virtual environment
Write-Host "`n[3/6] Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Install dependencies
Write-Host "`n[4/6] Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment template
Write-Host "`n[5/6] Creating .env file..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file" -ForegroundColor Green
} else {
    Write-Host "✓ .env already exists" -ForegroundColor Green
}

# Check for model file
Write-Host "`n[6/6] Checking for model file..." -ForegroundColor Yellow
$modelPath = "models\plant_disease_model.h5"
if (Test-Path $modelPath) {
    $size = (Get-Item $modelPath).Length / 1MB
    Write-Host "✓ Model file found! Size: $([math]::Round($size, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "⚠ Model file not found at: $modelPath" -ForegroundColor Red
    Write-Host "  The service will start but /analyze endpoint will return 503" -ForegroundColor Yellow
    Write-Host "  Please place your trained TensorFlow model there." -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. (Optional) Place your model at: models\plant_disease_model.h5" -ForegroundColor White
Write-Host "2. Run the service: python app.py" -ForegroundColor White
Write-Host "3. Test health: curl http://localhost:5000/health" -ForegroundColor White
Write-Host "4. Test analyze: See README.md for API examples" -ForegroundColor White
Write-Host ""
Write-Host "To start the service now, run:" -ForegroundColor Cyan
Write-Host "  python app.py" -ForegroundColor White
Write-Host ""
