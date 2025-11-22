# ============================================
# FarmHelp Authentication Testing Script
# Tests signup, login, and token verification
# ============================================

Write-Host "`n╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🔐 FarmHelp Authentication Test Suite            ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:4000"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "testuser_${timestamp}@farmhelp.com"
$testPassword = "Test@123456"
$testUsername = "testuser_${timestamp}"
$testName = "Test User ${timestamp}"

$results = @{
    healthCheck = $false
    signup = $false
    login = $false
    tokenVerify = $false
    getUserProfile = $false
}

# ============================================
# Test 1: Health Check
# ============================================
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "TEST 1: Health Check" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/" -Method GET -ContentType "application/json"
    Write-Host "✅ Health Check: PASSED" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Gray
    Write-Host "   Message: $($response.message)" -ForegroundColor Gray
    $results.healthCheck = $true
} catch {
    Write-Host "❌ Health Check: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ============================================
# Test 2: Signup
# ============================================
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "TEST 2: User Signup" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "Creating new user:" -ForegroundColor Gray
Write-Host "   Email: $testEmail" -ForegroundColor Gray
Write-Host "   Username: $testUsername" -ForegroundColor Gray
Write-Host "   Name: $testName" -ForegroundColor Gray

$signupBody = @{
    email = $testEmail
    password = $testPassword
    username = $testUsername
    displayName = $testName
} | ConvertTo-Json

try {
    $signupResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/signup" -Method POST -Body $signupBody -ContentType "application/json"
    Write-Host "✅ Signup: PASSED" -ForegroundColor Green
    Write-Host "   Success: $($signupResponse.success)" -ForegroundColor Gray
    Write-Host "   Message: $($signupResponse.message)" -ForegroundColor Gray
    Write-Host "   User ID: $($signupResponse.user.id)" -ForegroundColor Gray
    Write-Host "   Token: $($signupResponse.token.Substring(0, 20))..." -ForegroundColor Gray
    $results.signup = $true
    $signupToken = $signupResponse.token
} catch {
    Write-Host "❌ Signup: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   Details: $($errorDetails.message)" -ForegroundColor Red
    }
}

# ============================================
# Test 3: Duplicate Signup (Should Fail)
# ============================================
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "TEST 3: Duplicate Signup (Should Fail)" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow

try {
    $duplicateResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/signup" -Method POST -Body $signupBody -ContentType "application/json"
    Write-Host "❌ Duplicate Prevention: FAILED (Should have been rejected)" -ForegroundColor Red
} catch {
    Write-Host "✅ Duplicate Prevention: PASSED (Correctly rejected)" -ForegroundColor Green
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "   Error Message: $($errorDetails.message)" -ForegroundColor Gray
}

# ============================================
# Test 4: Login with Correct Credentials
# ============================================
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "TEST 4: Login with Correct Credentials" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow

$loginBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login: PASSED" -ForegroundColor Green
    Write-Host "   Success: $($loginResponse.success)" -ForegroundColor Gray
    Write-Host "   Message: $($loginResponse.message)" -ForegroundColor Gray
    Write-Host "   User ID: $($loginResponse.user.id)" -ForegroundColor Gray
    Write-Host "   Email: $($loginResponse.user.email)" -ForegroundColor Gray
    Write-Host "   Token: $($loginResponse.token.Substring(0, 20))..." -ForegroundColor Gray
    $results.login = $true
    $loginToken = $loginResponse.token
} catch {
    Write-Host "❌ Login: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   Details: $($errorDetails.message)" -ForegroundColor Red
    }
}

# ============================================
# Test 5: Login with Wrong Password
# ============================================
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "TEST 5: Login with Wrong Password (Should Fail)" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow

$wrongPasswordBody = @{
    email = $testEmail
    password = "WrongPassword123"
} | ConvertTo-Json

try {
    $wrongLoginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $wrongPasswordBody -ContentType "application/json"
    Write-Host "❌ Wrong Password Rejection: FAILED (Should have been rejected)" -ForegroundColor Red
} catch {
    Write-Host "✅ Wrong Password Rejection: PASSED (Correctly rejected)" -ForegroundColor Green
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "   Error Message: $($errorDetails.message)" -ForegroundColor Gray
}

# ============================================
# Test 6: Token Verification
# ============================================
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "TEST 6: Token Verification" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow

if ($loginToken) {
    $headers = @{
        Authorization = "Bearer $loginToken"
    }
    
    try {
        $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/verify" -Method GET -Headers $headers
        Write-Host "✅ Token Verification: PASSED" -ForegroundColor Green
        Write-Host "   User ID: $($verifyResponse.user.id)" -ForegroundColor Gray
        Write-Host "   Email: $($verifyResponse.user.email)" -ForegroundColor Gray
        Write-Host "   Username: $($verifyResponse.user.username)" -ForegroundColor Gray
        $results.tokenVerify = $true
    } catch {
        Write-Host "❌ Token Verification: FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Token Verification: SKIPPED (No token available)" -ForegroundColor Yellow
}

# ============================================
# Test 7: Get User Profile
# ============================================
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "TEST 7: Get User Profile" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow

if ($loginToken) {
    $headers = @{
        Authorization = "Bearer $loginToken"
    }
    
    try {
        $profileResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method GET -Headers $headers
        Write-Host "✅ Get User Profile: PASSED" -ForegroundColor Green
        Write-Host "   User ID: $($profileResponse.user.id)" -ForegroundColor Gray
        Write-Host "   Email: $($profileResponse.user.email)" -ForegroundColor Gray
        Write-Host "   Username: $($profileResponse.user.username)" -ForegroundColor Gray
        Write-Host "   Display Name: $($profileResponse.user.displayName)" -ForegroundColor Gray
        Write-Host "   Created At: $($profileResponse.user.createdAt)" -ForegroundColor Gray
        $results.getUserProfile = $true
    } catch {
        Write-Host "❌ Get User Profile: FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Get User Profile: SKIPPED (No token available)" -ForegroundColor Yellow
}

# ============================================
# Test 8: Invalid Token Test
# ============================================
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "TEST 8: Invalid Token Rejection (Should Fail)" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow

$invalidHeaders = @{
    Authorization = "Bearer invalid_token_12345"
}

try {
    $invalidResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/verify" -Method GET -Headers $invalidHeaders
    Write-Host "❌ Invalid Token Rejection: FAILED (Should have been rejected)" -ForegroundColor Red
} catch {
    Write-Host "✅ Invalid Token Rejection: PASSED (Correctly rejected)" -ForegroundColor Green
    Write-Host "   Error: Invalid token detected and rejected" -ForegroundColor Gray
}

# ============================================
# Test 9: Missing Fields Validation
# ============================================
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "TEST 9: Missing Fields Validation" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow

$incompleteSignup = @{
    email = "incomplete@test.com"
    # Missing password and username
} | ConvertTo-Json

try {
    $incompleteResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/signup" -Method POST -Body $incompleteSignup -ContentType "application/json"
    Write-Host "❌ Missing Fields Validation: FAILED (Should have been rejected)" -ForegroundColor Red
} catch {
    Write-Host "✅ Missing Fields Validation: PASSED (Correctly rejected)" -ForegroundColor Green
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "   Error Message: $($errorDetails.message)" -ForegroundColor Gray
}

# ============================================
# Test 10: Email Format Validation
# ============================================
Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "TEST 10: Email Format Validation" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow

$invalidEmailSignup = @{
    email = "invalid-email-format"
    password = "Test@123456"
    username = "testuser123"
} | ConvertTo-Json

try {
    $invalidEmailResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/signup" -Method POST -Body $invalidEmailSignup -ContentType "application/json"
    Write-Host "❌ Email Format Validation: FAILED (Should have been rejected)" -ForegroundColor Red
} catch {
    Write-Host "✅ Email Format Validation: PASSED (Correctly rejected)" -ForegroundColor Green
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "   Error Message: $($errorDetails.message)" -ForegroundColor Gray
}

# ============================================
# FINAL RESULTS
# ============================================
Write-Host "`n╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              📊 TEST RESULTS SUMMARY                  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$passedTests = ($results.Values | Where-Object { $_ -eq $true }).Count
$totalTests = $results.Count

Write-Host "Test Results:" -ForegroundColor White
Write-Host "  ✅ Health Check:           $($results.healthCheck)" -ForegroundColor $(if ($results.healthCheck) { "Green" } else { "Red" })
Write-Host "  ✅ Signup:                 $($results.signup)" -ForegroundColor $(if ($results.signup) { "Green" } else { "Red" })
Write-Host "  ✅ Login:                  $($results.login)" -ForegroundColor $(if ($results.login) { "Green" } else { "Red" })
Write-Host "  ✅ Token Verification:     $($results.tokenVerify)" -ForegroundColor $(if ($results.tokenVerify) { "Green" } else { "Red" })
Write-Host "  ✅ Get User Profile:       $($results.getUserProfile)" -ForegroundColor $(if ($results.getUserProfile) { "Green" } else { "Red" })

Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Total: $passedTests/$totalTests tests passed" -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Yellow" })
Write-Host "═══════════════════════════════════════════════════════`n" -ForegroundColor Cyan

if ($passedTests -eq $totalTests) {
    Write-Host "🎉 ALL TESTS PASSED! Authentication system is working perfectly!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Some tests failed. Please review the errors above." -ForegroundColor Yellow
    exit 1
}
