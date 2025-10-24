# Flask ML Service - Quick Start Guide

## Setup Script (Windows PowerShell)

@"
# FarmHelp Flask ML Service - Quick Setup
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FarmHelp Plant Analyzer ML Service Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to model-service directory
Set-Location -Path "model-service"

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
Write-Host "`n[4/6] Installing dependencies..." -ForegroundColor Yellow
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
    Write-Host "✓ Model file found!" -ForegroundColor Green
} else {
    Write-Host "⚠ Model file not found at: $modelPath" -ForegroundColor Red
    Write-Host "  Please place your trained TensorFlow model there." -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Place your model at: models\plant_disease_model.h5" -ForegroundColor White
Write-Host "2. Run: python app.py" -ForegroundColor White
Write-Host "3. Test: curl http://localhost:5000/health" -ForegroundColor White
Write-Host ""
"@ | Out-File -FilePath "setup-ml-service.ps1" -Encoding UTF8

Write-Host "Setup script created: setup-ml-service.ps1"
