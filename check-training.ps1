# Check Training Progress
Write-Host "=== FarmHelp Model Training Progress ===" -ForegroundColor Green
Write-Host ""

# Check if training process is running
$pythonProcess = Get-Process python -ErrorAction SilentlyContinue
if ($pythonProcess) {
    Write-Host "[OK] Training is RUNNING" -ForegroundColor Green
    foreach ($proc in $pythonProcess) {
        Write-Host "  Process ID: $($proc.Id)"
        Write-Host "  CPU Time: $([math]::Round($proc.CPU, 1))s"
        Write-Host "  Memory: $([math]::Round($proc.WorkingSet64/1MB, 0)) MB"
    }
} else {
    Write-Host "[!] No Python training process found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Checking for output files ===" -ForegroundColor Cyan

# Check for model files
$modelDir = "C:\Users\kusha\OneDrive\Desktop\FarmHelp\model-service\models"
$files = @(
    @{Name="plant_disease_model.h5"; Type="Main Model"},
    @{Name="plant_disease_model.tflite"; Type="Mobile Model"},
    @{Name="class_labels.json"; Type="Labels"},
    @{Name="best_model.keras"; Type="Best Model"}
)

foreach ($file in $files) {
    $path = Join-Path $modelDir $file.Name
    if (Test-Path $path) {
        $size = [math]::Round((Get-Item $path).Length/1MB, 2)
        Write-Host "[OK] $($file.Type): $($file.Name) ($size MB)" -ForegroundColor Green
    } else {
        Write-Host "[ ] $($file.Type): $($file.Name) (not created yet)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Training will take 2-4 hours. Run this script again to check!" -ForegroundColor Cyan
