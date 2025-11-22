# FarmHelp Authentication Test Suite
# Tests signup, login, and token verification

Write-Host "`n===========================================================" -ForegroundColor Cyan
Write-Host "  FarmHelp Authentication Test Suite" -ForegroundColor Cyan
Write-Host "===========================================================`n" -ForegroundColor Cyan

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

# Test 1: Health Check
Write-Host "===========================================================`n" -ForegroundColor Yellow
Write-Host "TEST 1: Health Check`n" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/" -Method GET -ContentType "application/json"
    Write-Host "[PASS] Health Check" -ForegroundColor Green
    Write-Host "  Status: $($response.status)" -ForegroundColor Gray
    Write-Host "  Message: $($response.message)`n" -ForegroundColor Gray
    $results.healthCheck = $true
} catch {
    Write-Host "[FAIL] Health Check" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)`n" -ForegroundColor Red
    exit 1
}

# Test 2: Signup
Write-Host "===========================================================`n" -ForegroundColor Yellow
Write-Host "TEST 2: User Signup`n" -ForegroundColor Yellow
Write-Host "Creating new user:" -ForegroundColor Gray
Write-Host "  Email: $testEmail" -ForegroundColor Gray
Write-Host "  Username: $testUsername`n" -ForegroundColor Gray

$signupBody = @{
    email = $testEmail
    password = $testPassword
    username = $testUsername
    displayName = $testName
} | ConvertTo-Json

try {
    $signupResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/signup" -Method POST -Body $signupBody -ContentType "application/json"
    Write-Host "[PASS] Signup" -ForegroundColor Green
    Write-Host "  Success: $($signupResponse.success)" -ForegroundColor Gray
    Write-Host "  Message: $($signupResponse.message)" -ForegroundColor Gray
    Write-Host "  User ID: $($signupResponse.user.id)" -ForegroundColor Gray
    Write-Host "  Token: $($signupResponse.token.Substring(0, 20))...`n" -ForegroundColor Gray
    $results.signup = $true
    $signupToken = $signupResponse.token
} catch {
    Write-Host "[FAIL] Signup" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Details: $($errorDetails.message)`n" -ForegroundColor Red
    }
}

# Test 3: Duplicate Signup (Should Fail)
Write-Host "===========================================================`n" -ForegroundColor Yellow
Write-Host "TEST 3: Duplicate Signup (Should Fail)`n" -ForegroundColor Yellow

try {
    $duplicateResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/signup" -Method POST -Body $signupBody -ContentType "application/json"
    Write-Host "[FAIL] Duplicate Prevention (Should have been rejected)`n" -ForegroundColor Red
} catch {
    Write-Host "[PASS] Duplicate Prevention (Correctly rejected)" -ForegroundColor Green
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "  Error Message: $($errorDetails.message)`n" -ForegroundColor Gray
}

# Test 4: Login with Correct Credentials
Write-Host "===========================================================`n" -ForegroundColor Yellow
Write-Host "TEST 4: Login with Correct Credentials`n" -ForegroundColor Yellow

$loginBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "[PASS] Login" -ForegroundColor Green
    Write-Host "  Success: $($loginResponse.success)" -ForegroundColor Gray
    Write-Host "  Message: $($loginResponse.message)" -ForegroundColor Gray
    Write-Host "  User ID: $($loginResponse.user.id)" -ForegroundColor Gray
    Write-Host "  Email: $($loginResponse.user.email)" -ForegroundColor Gray
    Write-Host "  Token: $($loginResponse.token.Substring(0, 20))...`n" -ForegroundColor Gray
    $results.login = $true
    $loginToken = $loginResponse.token
} catch {
    Write-Host "[FAIL] Login" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Details: $($errorDetails.message)`n" -ForegroundColor Red
    }
}

# Test 5: Login with Wrong Password
Write-Host "===========================================================`n" -ForegroundColor Yellow
Write-Host "TEST 5: Login with Wrong Password (Should Fail)`n" -ForegroundColor Yellow

$wrongPasswordBody = @{
    email = $testEmail
    password = "WrongPassword123"
} | ConvertTo-Json

try {
    $wrongLoginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $wrongPasswordBody -ContentType "application/json"
    Write-Host "[FAIL] Wrong Password Rejection (Should have been rejected)`n" -ForegroundColor Red
} catch {
    Write-Host "[PASS] Wrong Password Rejection (Correctly rejected)" -ForegroundColor Green
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "  Error Message: $($errorDetails.message)`n" -ForegroundColor Gray
}

# Test 6: Token Verification
Write-Host "===========================================================`n" -ForegroundColor Yellow
Write-Host "TEST 6: Token Verification`n" -ForegroundColor Yellow

if ($loginToken) {
    $headers = @{
        Authorization = "Bearer $loginToken"
    }
    
    try {
        $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/verify" -Method GET -Headers $headers
        Write-Host "[PASS] Token Verification" -ForegroundColor Green
        Write-Host "  User ID: $($verifyResponse.user.id)" -ForegroundColor Gray
        Write-Host "  Email: $($verifyResponse.user.email)" -ForegroundColor Gray
        Write-Host "  Username: $($verifyResponse.user.username)`n" -ForegroundColor Gray
        $results.tokenVerify = $true
    } catch {
        Write-Host "[FAIL] Token Verification" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)`n" -ForegroundColor Red
    }
} else {
    Write-Host "[SKIP] Token Verification (No token available)`n" -ForegroundColor Yellow
}

# Test 7: Get User Profile
Write-Host "===========================================================`n" -ForegroundColor Yellow
Write-Host "TEST 7: Get User Profile`n" -ForegroundColor Yellow

if ($loginToken) {
    $headers = @{
        Authorization = "Bearer $loginToken"
    }
    
    try {
        $profileResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method GET -Headers $headers
        Write-Host "[PASS] Get User Profile" -ForegroundColor Green
        Write-Host "  User ID: $($profileResponse.user.id)" -ForegroundColor Gray
        Write-Host "  Email: $($profileResponse.user.email)" -ForegroundColor Gray
        Write-Host "  Username: $($profileResponse.user.username)" -ForegroundColor Gray
        Write-Host "  Display Name: $($profileResponse.user.displayName)" -ForegroundColor Gray
        Write-Host "  Created At: $($profileResponse.user.createdAt)`n" -ForegroundColor Gray
        $results.getUserProfile = $true
    } catch {
        Write-Host "[FAIL] Get User Profile" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)`n" -ForegroundColor Red
    }
} else {
    Write-Host "[SKIP] Get User Profile (No token available)`n" -ForegroundColor Yellow
}

# Test 8: Invalid Token Test
Write-Host "===========================================================`n" -ForegroundColor Yellow
Write-Host "TEST 8: Invalid Token Rejection (Should Fail)`n" -ForegroundColor Yellow

$invalidHeaders = @{
    Authorization = "Bearer invalid_token_12345"
}

try {
    $invalidResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/verify" -Method GET -Headers $invalidHeaders
    Write-Host "[FAIL] Invalid Token Rejection (Should have been rejected)`n" -ForegroundColor Red
} catch {
    Write-Host "[PASS] Invalid Token Rejection (Correctly rejected)" -ForegroundColor Green
    Write-Host "  Error: Invalid token detected and rejected`n" -ForegroundColor Gray
}

# Test 9: Missing Fields Validation
Write-Host "===========================================================`n" -ForegroundColor Yellow
Write-Host "TEST 9: Missing Fields Validation`n" -ForegroundColor Yellow

$incompleteSignup = @{
    email = "incomplete@test.com"
} | ConvertTo-Json

try {
    $incompleteResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/signup" -Method POST -Body $incompleteSignup -ContentType "application/json"
    Write-Host "[FAIL] Missing Fields Validation (Should have been rejected)`n" -ForegroundColor Red
} catch {
    Write-Host "[PASS] Missing Fields Validation (Correctly rejected)" -ForegroundColor Green
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "  Error Message: $($errorDetails.message)`n" -ForegroundColor Gray
}

# Test 10: Email Format Validation
Write-Host "===========================================================`n" -ForegroundColor Yellow
Write-Host "TEST 10: Email Format Validation`n" -ForegroundColor Yellow

$invalidEmailSignup = @{
    email = "invalid-email-format"
    password = "Test@123456"
    username = "testuser123"
} | ConvertTo-Json

try {
    $invalidEmailResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/signup" -Method POST -Body $invalidEmailSignup -ContentType "application/json"
    Write-Host "[FAIL] Email Format Validation (Should have been rejected)`n" -ForegroundColor Red
} catch {
    Write-Host "[PASS] Email Format Validation (Correctly rejected)" -ForegroundColor Green
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "  Error Message: $($errorDetails.message)`n" -ForegroundColor Gray
}

# FINAL RESULTS
Write-Host "===========================================================`n" -ForegroundColor Cyan
Write-Host "TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "===========================================================`n" -ForegroundColor Cyan

$passedTests = ($results.Values | Where-Object { $_ -eq $true }).Count
$totalTests = $results.Count

Write-Host "Test Results:" -ForegroundColor White
Write-Host "  Health Check:         $($results.healthCheck)" -ForegroundColor $(if ($results.healthCheck) { "Green" } else { "Red" })
Write-Host "  Signup:               $($results.signup)" -ForegroundColor $(if ($results.signup) { "Green" } else { "Red" })
Write-Host "  Login:                $($results.login)" -ForegroundColor $(if ($results.login) { "Green" } else { "Red" })
Write-Host "  Token Verification:   $($results.tokenVerify)" -ForegroundColor $(if ($results.tokenVerify) { "Green" } else { "Red" })
Write-Host "  Get User Profile:     $($results.getUserProfile)" -ForegroundColor $(if ($results.getUserProfile) { "Green" } else { "Red" })

Write-Host "`n===========================================================`n" -ForegroundColor Cyan
Write-Host "Total: $passedTests/$totalTests core tests passed" -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Yellow" })
Write-Host "===========================================================`n" -ForegroundColor Cyan

if ($passedTests -eq $totalTests) {
    Write-Host "SUCCESS: ALL CORE TESTS PASSED!" -ForegroundColor Green
    Write-Host "Authentication system is working perfectly!`n" -ForegroundColor Green
    exit 0
} else {
    Write-Host "WARNING: Some tests failed. Please review the errors above.`n" -ForegroundColor Yellow
    exit 1
}
