# ML Model Service Test Suite
$BaseUrl = "http://localhost:5000"
$TestCount = 0
$PassedTests = 0
$FailedTests = 0

Write-Host ""
Write-Host "ML Model Service Test Suite" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor Gray
Write-Host ""

# Test 1: Health Check
$TestCount++
Write-Host "[$TestCount] Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/" -Method GET -TimeoutSec 5
    if ($response.status -eq "running") {
        Write-Host "  PASS - Service running" -ForegroundColor Green
        $PassedTests++
    } else {
        Write-Host "  FAIL - Unexpected status" -ForegroundColor Red
        $FailedTests++
    }
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $FailedTests++
}

# Test 2: Model Info
$TestCount++
Write-Host "[$TestCount] Testing Model Info..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/model/info" -Method GET -TimeoutSec 5
    if ($response.input_shape -and $response.output_shape) {
        Write-Host "  PASS - Model info retrieved" -ForegroundColor Green
        Write-Host "  Input: $($response.input_shape)" -ForegroundColor Gray
        Write-Host "  Classes: $($response.num_classes)" -ForegroundColor Gray
        $PassedTests++
    } else {
        Write-Host "  FAIL - Missing model info" -ForegroundColor Red
        $FailedTests++
    }
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $FailedTests++
}

# Test 3: Get Classes
$TestCount++
Write-Host "[$TestCount] Testing Get Classes..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/classes" -Method GET -TimeoutSec 5
    if ($response.classes -and $response.classes.Count -gt 0) {
        Write-Host "  PASS - Got $($response.classes.Count) classes" -ForegroundColor Green
        $PassedTests++
    } else {
        Write-Host "  FAIL - No classes returned" -ForegroundColor Red
        $FailedTests++
    }
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $FailedTests++
}

# Test 4: Predict with test image
$TestCount++
Write-Host "[$TestCount] Testing Prediction..." -ForegroundColor Yellow
try {
    $testImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
    $body = @{
        image = $testImage
        top_k = 3
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/predict" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30
    if ($response.predictions -and $response.predictions.Count -gt 0) {
        Write-Host "  PASS - Got predictions" -ForegroundColor Green
        Write-Host "  Top: $($response.predictions[0].disease) ($([math]::Round($response.predictions[0].confidence * 100, 2))%)" -ForegroundColor Gray
        $PassedTests++
    } else {
        Write-Host "  FAIL - No predictions" -ForegroundColor Red
        $FailedTests++
    }
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $FailedTests++
}

# Test 5: GradCAM
$TestCount++
Write-Host "[$TestCount] Testing GradCAM..." -ForegroundColor Yellow
try {
    $testImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
    $body = @{
        image = $testImage
        top_k = 2
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/predict-with-gradcam" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30
    if ($response.predictions -and $response.gradcam_image) {
        Write-Host "  PASS - GradCAM generated" -ForegroundColor Green
        $PassedTests++
    } else {
        Write-Host "  FAIL - Missing GradCAM" -ForegroundColor Red
        $FailedTests++
    }
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $FailedTests++
}

# Test 6: Treatment Info
$TestCount++
Write-Host "[$TestCount] Testing Treatment Info..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/treatment/Tomato___Late_blight" -Method GET -TimeoutSec 5
    if ($response.disease -and $response.treatment) {
        Write-Host "  PASS - Treatment info retrieved" -ForegroundColor Green
        $PassedTests++
    } else {
        Write-Host "  FAIL - Missing treatment info" -ForegroundColor Red
        $FailedTests++
    }
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $FailedTests++
}

# Test 7: Error Handling
$TestCount++
Write-Host "[$TestCount] Testing Error Handling..." -ForegroundColor Yellow
try {
    $body = @{
        image = "invalid"
        top_k = 3
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$BaseUrl/predict" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "  FAIL - Should have returned error" -ForegroundColor Red
    $FailedTests++
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "  PASS - Correctly returned 400 error" -ForegroundColor Green
        $PassedTests++
    } else {
        Write-Host "  FAIL - Wrong error code" -ForegroundColor Red
        $FailedTests++
    }
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Results" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total:  $TestCount" -ForegroundColor White
Write-Host "Passed: $PassedTests" -ForegroundColor Green
Write-Host "Failed: $FailedTests" -ForegroundColor Red
Write-Host "Rate:   $([math]::Round(($PassedTests / $TestCount) * 100, 2))%" -ForegroundColor Cyan
Write-Host ""

if ($FailedTests -eq 0) {
    Write-Host "All tests PASSED!" -ForegroundColor Green
} else {
    Write-Host "Some tests FAILED" -ForegroundColor Yellow
}
