# Quick Test - Create Service and Verify It Appears
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Testing Service Creation Flow" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login
Write-Host "[1/4] Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "ravi@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✓ Login successful" -ForegroundColor Green
} catch {
    Write-Host "✗ Login failed. Creating test user..." -ForegroundColor Yellow
    $signupBody = @{
        email = "testcreate@test.com"
        password = "test123"
        username = "testcreate"
        displayName = "Test Creator"
    } | ConvertTo-Json
    
    try {
        $signupResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/signup" -Method POST -Body $signupBody -ContentType "application/json"
        $token = $signupResponse.token
        Write-Host "✓ New user created" -ForegroundColor Green
    } catch {
        Write-Host "✗ Signup also failed" -ForegroundColor Red
        exit 1
    }
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host ""

# Step 2: Count existing services
Write-Host "[2/4] Counting existing services..." -ForegroundColor Yellow
$beforeResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/services" -Method GET -Headers $headers
$beforeCount = $beforeResponse.data.Count
Write-Host "✓ Current services: $beforeCount" -ForegroundColor Green

Write-Host ""

# Step 3: Create new service
Write-Host "[3/4] Creating test service..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "HH:mm:ss"
$newService = @{
    serviceType = "Tractor"
    title = "Test Service Created at $timestamp"
    description = "This is a test service to verify creation is working"
    district = "Bengaluru Urban"
    taluk = "Bangalore North"
    village = "Yelahanka"
    phoneNumber = "9999000011"
    rateAmount = 1500
    rateUnit = "per day"
} | ConvertTo-Json

try {
    $createResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/services" -Method POST -Body $newService -Headers $headers
    
    if ($createResponse.success) {
        Write-Host "✓ Service created successfully!" -ForegroundColor Green
        Write-Host "  ID: $($createResponse.data._id)" -ForegroundColor Gray
        Write-Host "  Title: $($createResponse.data.title)" -ForegroundColor Gray
        $newServiceId = $createResponse.data._id
    }
} catch {
    Write-Host "✗ Failed to create service" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Response: $($_.ErrorDetails.Message)" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Step 4: Verify it appears in list
Write-Host "[4/4] Verifying service appears in list..." -ForegroundColor Yellow
Start-Sleep -Seconds 1
$afterResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/services" -Method GET -Headers $headers
$afterCount = $afterResponse.data.Count

if ($afterCount -gt $beforeCount) {
    Write-Host "✓ Service appears in list!" -ForegroundColor Green
    Write-Host "  Before: $beforeCount services" -ForegroundColor Gray
    Write-Host "  After: $afterCount services" -ForegroundColor Gray
    Write-Host "  New services: $($afterCount - $beforeCount)" -ForegroundColor Gray
} else {
    Write-Host "✗ Service NOT appearing in list!" -ForegroundColor Red
    Write-Host "  Before: $beforeCount services" -ForegroundColor Gray
    Write-Host "  After: $afterCount services" -ForegroundColor Gray
}

Write-Host ""

# Step 5: Check if specific service exists
Write-Host "[BONUS] Finding the newly created service..." -ForegroundColor Yellow
$found = $false
foreach ($service in $afterResponse.data) {
    if ($service._id -eq $newServiceId) {
        $found = $true
        Write-Host "✓ Found the service!" -ForegroundColor Green
        Write-Host "  Title: $($service.title)" -ForegroundColor Gray
        Write-Host "  District: $($service.location.district)" -ForegroundColor Gray
        Write-Host "  Provider: $($service.provider.name)" -ForegroundColor Gray
        break
    }
}

if (-not $found) {
    Write-Host "✗ Service not found in list!" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " TEST COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Frontend fix applied!" -ForegroundColor Yellow
Write-Host "The frontend will now auto-refresh when you:" -ForegroundColor White
Write-Host "  1. Create a new service" -ForegroundColor White
Write-Host "  2. Create a new job request" -ForegroundColor White
Write-Host "  3. Navigate back to ServicesHomeScreen" -ForegroundColor White
Write-Host ""
Write-Host "The fix uses useFocusEffect hook to refresh" -ForegroundColor Gray
Write-Host "the list whenever the screen comes into focus." -ForegroundColor Gray
Write-Host ""
