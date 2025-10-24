# PowerShell script to check marketplace setup
# Run this from backend folder

Write-Host "🔍 FARMHELP MARKETPLACE DIAGNOSTIC" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check 1: Backend running
Write-Host "1️⃣ Checking Backend Server..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/" -Method GET -TimeoutSec 5
    Write-Host "   ✅ Backend is running!" -ForegroundColor Green
    Write-Host "   Response: $response" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Backend is NOT running!" -ForegroundColor Red
    Write-Host "   Start it with: npm start" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check 2: Test accounts exist
Write-Host "2️⃣ Checking Test Accounts..." -ForegroundColor Yellow
try {
    $loginTest = @{
        email = "provider1@test.com"
        password = "test123"
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
    }

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
                                      -Method POST `
                                      -Body $loginTest `
                                      -Headers $headers `
                                      -TimeoutSec 5

    Write-Host "   ✅ Test account works!" -ForegroundColor Green
    Write-Host "   Email: provider1@test.com" -ForegroundColor Gray
    Write-Host "   Token: $($loginResponse.token.Substring(0,20))..." -ForegroundColor Gray
    
    $global:testToken = $loginResponse.token
    
} catch {
    Write-Host "   ❌ Test account login failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Run seed script: node seed/marketplaceSeed.js" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check 3: Services endpoint works
Write-Host "3️⃣ Checking Services Endpoint..." -ForegroundColor Yellow
try {
    $servicesResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/services" `
                                         -Method GET `
                                         -TimeoutSec 5

    Write-Host "   ✅ Services endpoint works!" -ForegroundColor Green
    Write-Host "   Found $($servicesResponse.Count) services" -ForegroundColor Gray
    
    if ($servicesResponse.Count -eq 0) {
        Write-Host "   ⚠️  Database is empty - run seed script!" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   ❌ Services endpoint failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Check 4: Create service test (with auth)
Write-Host "4️⃣ Testing Service Creation (with auth)..." -ForegroundColor Yellow
try {
    $testService = @{
        serviceType = "Tractor Rental"
        title = "Test Tractor - DELETE ME"
        description = "This is a test service created by diagnostic script"
        district = "Belgaum"
        taluk = "Bailhongal"
        phoneNumber = "9999999999"
        rate = 500
        rateUnit = "per hour"
    } | ConvertTo-Json

    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $global:testToken"
    }

    $createResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/services" `
                                       -Method POST `
                                       -Body $testService `
                                       -Headers $authHeaders `
                                       -TimeoutSec 5

    Write-Host "   ✅ Service creation works!" -ForegroundColor Green
    Write-Host "   Created service ID: $($createResponse._id)" -ForegroundColor Gray
    Write-Host "   Title: $($createResponse.title)" -ForegroundColor Gray
    
} catch {
    Write-Host "   ❌ Service creation failed!" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTIC COMPLETE" -ForegroundColor Cyan
Write-Host ""
Write-Host "TO FIX FRONTEND ISSUE:" -ForegroundColor Yellow
Write-Host "1. Open your app at http://localhost:19006" -ForegroundColor White
Write-Host "2. Login with: provider1@test.com / test123" -ForegroundColor White
Write-Host "3. Navigate to Services Marketplace" -ForegroundColor White
Write-Host "4. Try creating a service" -ForegroundColor White
Write-Host "5. Open browser console F12 to see logs" -ForegroundColor White
Write-Host ""
