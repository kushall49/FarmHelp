# FarmHelp Model Training Script
# This script trains the plant disease classification model

Write-Host "=== Starting FarmHelp Model Training ===" -ForegroundColor Green
Write-Host ""

# Set paths
$projectRoot = "C:\Users\kusha\OneDrive\Desktop\FarmHelp"
$modelService = "$projectRoot\model-service"
$pythonExe = "$projectRoot\.venv\Scripts\python.exe"
$trainingScript = "$modelService\train_model.py"

# Check if paths exist
if (-not (Test-Path $pythonExe)) {
    Write-Host "[ERROR] Python not found at: $pythonExe" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $trainingScript)) {
    Write-Host "[ERROR] Training script not found at: $trainingScript" -ForegroundColor Red
    exit 1
}

# Change to model-service directory
Set-Location $modelService
Write-Host "[INFO] Working directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Set TensorFlow environment variables
$env:TF_CPP_MIN_LOG_LEVEL = "2"  # Suppress TensorFlow warnings

# Start training
Write-Host "[INFO] Starting model training..." -ForegroundColor Cyan
Write-Host "[INFO] Dataset: data/PlantVillage (15 disease classes)" -ForegroundColor Cyan
Write-Host "[INFO] Epochs: 20 | Batch Size: 32" -ForegroundColor Cyan
Write-Host "[INFO] This will take 2-4 hours..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop training" -ForegroundColor Yellow
Write-Host ""

# Run training with logging
& $pythonExe train_model.py --dataset data/PlantVillage --epochs 20 --batch-size 32 2>&1 | Tee-Object -FilePath "$modelService\training.log"

# Check exit code
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[SUCCESS] Training completed successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[ERROR] Training failed with exit code: $LASTEXITCODE" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
