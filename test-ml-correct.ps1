# ML Model Service Correct Test Suite
$BaseUrl = "http://localhost:5000"
$TestCount = 0
$PassedTests = 0
$FailedTests = 0

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ML Model Service Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Root Endpoint
$TestCount++
Write-Host "[$TestCount] Testing Root Endpoint (/)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/" -Method GET -TimeoutSec 5
    if ($response.status -eq "running" -and $response.service) {
        Write-Host "  PASS - Service running" -ForegroundColor Green
        Write-Host "  Service: $($response.service)" -ForegroundColor Gray
        Write-Host "  Version: $($response.version)" -ForegroundColor Gray
        Write-Host "  Model Loaded: $($response.model_loaded)" -ForegroundColor Gray
        $PassedTests++
    } else {
        Write-Host "  FAIL - Unexpected response" -ForegroundColor Red
        $FailedTests++
    }
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $FailedTests++
}

# Test 2: Health Check
$TestCount++
Write-Host "[$TestCount] Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET -TimeoutSec 5
    if ($response.status -eq "healthy") {
        Write-Host "  PASS - Service healthy" -ForegroundColor Green
        Write-Host "  Uptime: $($response.uptime_formatted)" -ForegroundColor Gray
        Write-Host "  Model Loaded: $($response.model_loaded)" -ForegroundColor Gray
        $PassedTests++
    } else {
        Write-Host "  FAIL - Service not healthy" -ForegroundColor Red
        $FailedTests++
    }
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $FailedTests++
}

# Test 3: Analyze Endpoint with Test Image
$TestCount++
Write-Host "[$TestCount] Testing Disease Analysis..." -ForegroundColor Yellow
try {
    $testImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
    $body = @{
        image = $testImage
        return_gradcam = $true
        top_k = 3
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/analyze" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30
    if ($response.success -and $response.disease) {
        Write-Host "  PASS - Analysis completed" -ForegroundColor Green
        Write-Host "  Crop: $($response.crop)" -ForegroundColor Gray
        Write-Host "  Disease: $($response.disease)" -ForegroundColor Gray
        Write-Host "  Confidence: $($response.confidence_percentage)" -ForegroundColor Gray
        Write-Host "  Processing Time: $([math]::Round($response.processing_time_ms, 2))ms" -ForegroundColor Gray
        $PassedTests++
    } else {
        Write-Host "  FAIL - Analysis failed" -ForegroundColor Red
        Write-Host "  Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
        $FailedTests++
    }
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $FailedTests++
}

# Test 4: Analyze with GradCAM
$TestCount++
Write-Host "[$TestCount] Testing GradCAM Visualization..." -ForegroundColor Yellow
try {
    $testImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
    $body = @{
        image = $testImage
        return_gradcam = $true
        top_k = 2
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$BaseUrl/analyze" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30
    if ($response.success -and $response.gradcam) {
        Write-Host "  PASS - GradCAM generated" -ForegroundColor Green
        Write-Host "  GradCAM size: $($response.gradcam.Length) chars" -ForegroundColor Gray
        $PassedTests++
    } else {
        Write-Host "  FAIL - No GradCAM in response" -ForegroundColor Red
        $FailedTests++
    }
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $FailedTests++
}

# Test 5: Error Handling - Invalid Image
$TestCount++
Write-Host "[$TestCount] Testing Error Handling (Invalid Image)..." -ForegroundColor Yellow
try {
    $body = @{
        image = "invalid_base64_data"
        return_gradcam = $false
        top_k = 3
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$BaseUrl/analyze" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "  FAIL - Should have returned error" -ForegroundColor Red
    $FailedTests++
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "  PASS - Correctly returned 400 error" -ForegroundColor Green
        $PassedTests++
    } else {
        Write-Host "  FAIL - Wrong error code: $statusCode" -ForegroundColor Red
        $FailedTests++
    }
}

# Test 6: Error Handling - Missing Image
$TestCount++
Write-Host "[$TestCount] Testing Error Handling (Missing Image)..." -ForegroundColor Yellow
try {
    $body = @{
        top_k = 3
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$BaseUrl/analyze" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "  FAIL - Should have returned error" -ForegroundColor Red
    $FailedTests++
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "  PASS - Correctly returned 400 error" -ForegroundColor Green
        $PassedTests++
    } else {
        Write-Host "  FAIL - Wrong error code: $statusCode" -ForegroundColor Red
        $FailedTests++
    }
}

# Test 7: Performance Test
$TestCount++
Write-Host "[$TestCount] Testing Response Time..." -ForegroundColor Yellow
try {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $response = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET -TimeoutSec 5
    $stopwatch.Stop()
    $responseTime = $stopwatch.ElapsedMilliseconds
    
    if ($responseTime -lt 1000) {
        Write-Host "  PASS - Fast response: ${responseTime}ms" -ForegroundColor Green
        $PassedTests++
    } elseif ($responseTime -lt 3000) {
        Write-Host "  PASS - Acceptable response: ${responseTime}ms" -ForegroundColor Yellow
        $PassedTests++
    } else {
        Write-Host "  FAIL - Slow response: ${responseTime}ms" -ForegroundColor Red
        $FailedTests++
    }
} catch {
    Write-Host "  FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $FailedTests++
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Results Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Tests:  $TestCount" -ForegroundColor White
Write-Host "Passed:       $PassedTests" -ForegroundColor Green
Write-Host "Failed:       $FailedTests" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($PassedTests / $TestCount) * 100, 2))%" -ForegroundColor Cyan
Write-Host ""

if ($FailedTests -eq 0) {
    Write-Host "SUCCESS - All tests passed!" -ForegroundColor Green
    Write-Host "ML Model Service is fully functional!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "WARNING - Some tests failed" -ForegroundColor Yellow
    Write-Host "Review the output above for details" -ForegroundColor Yellow
    exit 1
}
