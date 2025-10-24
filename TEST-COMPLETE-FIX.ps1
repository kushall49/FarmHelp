# Complete test of the fix
Write-Host "=== COMPLETE FIX TEST ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Testing Login..." -ForegroundColor Yellow
$loginData = @{
    email = "kushal@gmail.com"
    password = "test123"
} | ConvertTo-Json

try {
    $loginResp = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
                                   -Method POST `
                                   -Body $loginData `
                                   -ContentType "application/json"
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "   User: $($loginResp.user.username)" -ForegroundColor Gray
    
    $token = $loginResp.token
    
    Write-Host ""
    Write-Host "Step 2: Decoding Token..." -ForegroundColor Yellow
    
    $decoded = node -e "const jwt = require('jsonwebtoken'); console.log(JSON.stringify(jwt.decode('$token')));" | ConvertFrom-Json
    
    Write-Host "   id field: $($decoded.id)" -ForegroundColor Cyan
    Write-Host "   userId field: $($decoded.userId)" -ForegroundColor Cyan
    Write-Host "   email: $($decoded.email)" -ForegroundColor Cyan
    
    if ($decoded.id -and $decoded.userId) {
        Write-Host "" 
        Write-Host "🎉 TOKEN FIX WORKS! Both fields present!" -ForegroundColor Green -BackgroundColor DarkGreen
    } else {
        Write-Host ""
        Write-Host "❌ Token still broken" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "Step 3: Creating Service..." -ForegroundColor Yellow
    
    $serviceData = @{
        serviceType = "Tractor"
        title = "FINAL WORKING TEST SERVICE"
        description = "Testing after the bug fix"
        district = "Ballari"
        taluk = "TestTaluk"
        phoneNumber = "9999999999"
        rateAmount = 2500
        rateUnit = "per day"
    } | ConvertTo-Json
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $createResp = Invoke-RestMethod -Uri "http://localhost:4000/api/services" `
                                   -Method POST `
                                   -Body $serviceData `
                                   -Headers $headers
    
    Write-Host ""
    Write-Host "🎉🎉🎉 SERVICE CREATED SUCCESSFULLY!" -ForegroundColor Green -BackgroundColor DarkGreen
    Write-Host ""
    Write-Host "   ID: $($createResp.data._id)" -ForegroundColor Cyan
    Write-Host "   Title: $($createResp.data.title)" -ForegroundColor Cyan
    Write-Host "   Provider: $($createResp.data.provider.name)" -ForegroundColor Cyan
    Write-Host "   District: $($createResp.data.location.district)" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Step 4: Verifying in Database..." -ForegroundColor Yellow
    node check-services.js
    
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ ALL TESTS PASSED!" -ForegroundColor Green
Write-Host "The marketplace is now working!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
