# PowerShell script to test creating a service via API
# This simulates what the frontend should be doing

Write-Host "🧪 TESTING SERVICE CREATION API" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login to get token
Write-Host "1️⃣ Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "kushal@gmail.com"
    password = "test123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
                                      -Method POST `
                                      -Body $loginBody `
                                      -ContentType "application/json"
    
    Write-Host "   ✅ Login successful!" -ForegroundColor Green
    $token = $loginResponse.token
    Write-Host "   Token: $($token.Substring(0,30))..." -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Login failed!" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Create a service
Write-Host "2️⃣ Creating service..." -ForegroundColor Yellow

$serviceData = @{
    serviceType = "Tractor"
    title = "Test Service from PowerShell"
    description = "This is a test to see if API works"
    district = "Ballari"
    taluk = "TestTaluk"
    phoneNumber = "7525963547"
    rateAmount = 1000
    rateUnit = "per day"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

try {
    $createResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/services" `
                                       -Method POST `
                                       -Body $serviceData `
                                       -Headers $headers
    
    Write-Host "   ✅ Service created successfully!" -ForegroundColor Green
    Write-Host "   Service ID: $($createResponse._id)" -ForegroundColor Gray
    Write-Host "   Title: $($createResponse.title)" -ForegroundColor Gray
    Write-Host "   Provider: $($createResponse.provider.name)" -ForegroundColor Gray
    
} catch {
    Write-Host "   ❌ Service creation failed!" -ForegroundColor Red
    Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    
    # Try to get detailed error
    if ($_.ErrorDetails.Message) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
