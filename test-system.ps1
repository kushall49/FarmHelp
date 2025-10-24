# FarmHelp Testing Guide
Write-Host "=== FarmHelp System Status ===" -ForegroundColor Green
Write-Host ""

# Check Backend (Node.js)
Write-Host "1. Backend API (Node.js):" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri http://localhost:4000/ -TimeoutSec 3
    Write-Host "   [OK] Backend is RUNNING on port 4000" -ForegroundColor Green
    Write-Host "   Available routes: /api/auth/signup, /api/auth/login, /api/community, /api/services" -ForegroundColor Gray
} catch {
    Write-Host "   [ERROR] Backend not responding on port 4000" -ForegroundColor Red
}

Write-Host ""

# Check Flask ML Service
Write-Host "2. ML Service (Flask):" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri http://localhost:5000/health -TimeoutSec 3
    Write-Host "   [OK] Flask ML Service is RUNNING on port 5000" -ForegroundColor Green
} catch {
    Write-Host "   [!] Flask ML Service not responding on port 5000" -ForegroundColor Yellow
    Write-Host "   Check the Flask CMD window for errors (TensorFlow loading takes time)" -ForegroundColor Gray
}

Write-Host ""

# Check for model files
Write-Host "3. Model Files:" -ForegroundColor Cyan
$modelFiles = @(
    "C:\Users\kusha\OneDrive\Desktop\FarmHelp\model-service\models\plant_disease_model.h5",
    "C:\Users\kusha\OneDrive\Desktop\FarmHelp\model-service\models\plant_disease_model.tflite",
    "C:\Users\kusha\OneDrive\Desktop\FarmHelp\model-service\models\class_labels.json"
)

foreach ($file in $modelFiles) {
    if (Test-Path $file) {
        $size = [math]::Round((Get-Item $file).Length/1MB, 2)
        Write-Host "   [OK] $(Split-Path $file -Leaf) ($size MB)" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] Missing: $(Split-Path $file -Leaf)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Yellow
Write-Host "1. Wait for Flask to finish loading (TensorFlow takes 30-60 seconds)"
Write-Host "2. Test with Postman: Import FarmHelp_API_Collection.postman_collection.json"
Write-Host "3. Test flow: Register -> Login -> Upload Plant Image -> Get Prediction"
Write-Host ""
