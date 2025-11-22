# FarmHelp Complete System Test
# Testing as Real User - Automated Flow

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:4000"
$testResults = @()

function Write-TestHeader {
    param([string]$title)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host " $title" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = $null,
        [hashtable]$Headers = @{'Content-Type'='application/json'},
        [string]$Token = $null
    )

    Write-Host "Testing: $Name" -ForegroundColor Yellow
    
    try {
        if ($Token) {
            $Headers['Authorization'] = "Bearer $Token"
        }

        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $Headers
            UseBasicParsing = $true
            TimeoutSec = 30
        }

        if ($Body) {
            $params['Body'] = ($Body | ConvertTo-Json -Depth 10)
        }

        $response = Invoke-WebRequest @params
        $content = $response.Content | ConvertFrom-Json

        Write-Host "SUCCESS - $Name - Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response: $($content | ConvertTo-Json -Compress)" -ForegroundColor Gray
        
        $script:testResults += [PSCustomObject]@{
            Test = $Name
            Status = "PASS"
            StatusCode = $response.StatusCode
            Response = $content
        }

        return @{
            Success = $true
            Data = $content
            StatusCode = $response.StatusCode
        }
    }
    catch {
        Write-Host "FAILED - $Name - Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            Write-Host "Status Code: $statusCode" -ForegroundColor Red
        }
        
        $script:testResults += [PSCustomObject]@{
            Test = $Name
            Status = "FAIL"
            Error = $_.Exception.Message
        }

        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

# START TESTING
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host " FarmHelp Complete System Test Suite" -ForegroundColor Magenta
Write-Host " Testing as Real User - Automated" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

Start-Sleep -Seconds 1

# 1. HEALTH CHECK
Write-TestHeader "1. Health Check"
$health = Test-Endpoint -Name "Server Health Check" -Method "GET" -Endpoint "/"

if (-not $health.Success) {
    Write-Host "`nServer is not running! Exiting..." -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# 2. USER SIGNUP
Write-TestHeader "2. User Registration (Signup)"

$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$testUser = @{
    name = "Test Farmer $timestamp"
    email = "farmer$timestamp@farmhelp.com"
    password = "SecurePass123!"
}

Write-Host "Creating new user: $($testUser.email)" -ForegroundColor Cyan
$signup = Test-Endpoint -Name "User Signup" -Method "POST" -Endpoint "/api/auth/signup" -Body $testUser

if ($signup.Success) {
    $token = $signup.Data.token
    $userId = $signup.Data.user.id
    Write-Host "User created successfully!" -ForegroundColor Green
    Write-Host "User ID: $userId" -ForegroundColor Cyan
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Cyan
} else {
    Write-Host "Signup failed! Cannot continue." -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

# 3. USER LOGIN
Write-TestHeader "3. User Authentication (Login)"

$loginCredentials = @{
    email = $testUser.email
    password = $testUser.password
}

$login = Test-Endpoint -Name "User Login" -Method "POST" -Endpoint "/api/auth/login" -Body $loginCredentials

if ($login.Success) {
    $loginToken = $login.Data.token
    Write-Host "Login successful!" -ForegroundColor Green
    Write-Host "New Token: $($loginToken.Substring(0, 20))..." -ForegroundColor Cyan
}

Start-Sleep -Seconds 1

# 4. CROP RECOMMENDATIONS
Write-TestHeader "4. Crop Recommendations"

Test-Endpoint -Name "Get All Crops" -Method "GET" -Endpoint "/api/crops"
Start-Sleep -Milliseconds 500

Test-Endpoint -Name "Get Crops for Loam Soil" -Method "GET" -Endpoint "/api/crops?soil=loam"
Start-Sleep -Milliseconds 500

Test-Endpoint -Name "Get Crops for Monsoon Season" -Method "GET" -Endpoint "/api/crops?season=monsoon"
Start-Sleep -Milliseconds 500

Test-Endpoint -Name "Get Crops for 25C" -Method "GET" -Endpoint "/api/crops?temp=25"
Start-Sleep -Milliseconds 500

Test-Endpoint -Name "Get Crops (Combined Filters)" -Method "GET" -Endpoint "/api/crops?soil=clay&season=winter&temp=20"

Start-Sleep -Seconds 1

# 5. COMMUNITY FEATURES
Write-TestHeader "5. Community Features (Authenticated)"

$getPosts = Test-Endpoint -Name "Get Community Posts" -Method "GET" -Endpoint "/api/community" -Token $token
Start-Sleep -Milliseconds 500

$newPost = @{
    content = "Hello from automated test! Testing the FarmHelp community feature."
    imageUrl = ""
}
$createPost = Test-Endpoint -Name "Create Community Post" -Method "POST" -Endpoint "/api/community" -Body $newPost -Token $token

if ($createPost.Success) {
    $postId = $createPost.Data.post._id
    Write-Host "Post created with ID: $postId" -ForegroundColor Green
}

Start-Sleep -Seconds 1

# 6. CHATBOT TEST
Write-TestHeader "6. AI Chatbot Service (Test Mode)"

$chatQueries = @(
    "Hello, what can you help me with?",
    "What crops should I grow in monsoon season?",
    "Tell me about rice farming"
)

foreach ($query in $chatQueries) {
    $chatBody = @{ message = $query }
    Test-Endpoint -Name "Chatbot: '$query'" -Method "POST" -Endpoint "/api/chatbot/test" -Body $chatBody
    Start-Sleep -Milliseconds 800
}

Start-Sleep -Seconds 1

# 7. AUTHENTICATED CHATBOT
Write-TestHeader "7. AI Chatbot Service (Authenticated)"

$authChatBody = @{ message = "What are the best practices for organic farming?" }
Test-Endpoint -Name "Authenticated Chatbot Query" -Method "POST" -Endpoint "/api/chatbot" -Body $authChatBody -Token $token

Start-Sleep -Seconds 1

# 8. ERROR HANDLING
Write-TestHeader "8. Error Handling & Edge Cases"

Test-Endpoint -Name "Invalid Login (Wrong Password)" -Method "POST" -Endpoint "/api/auth/login" -Body @{
    email = $testUser.email
    password = "WrongPassword123!"
}

Start-Sleep -Milliseconds 500

Test-Endpoint -Name "Duplicate Signup (Should Fail)" -Method "POST" -Endpoint "/api/auth/signup" -Body $testUser

Start-Sleep -Milliseconds 500

Test-Endpoint -Name "Signup Missing Fields" -Method "POST" -Endpoint "/api/auth/signup" -Body @{ email = "incomplete@test.com" }

Start-Sleep -Milliseconds 500

Test-Endpoint -Name "Unauthorized Community Access" -Method "GET" -Endpoint "/api/community"

Start-Sleep -Milliseconds 500

Test-Endpoint -Name "Invalid Token Access" -Method "GET" -Endpoint "/api/community" -Token "invalid.token.here"

Start-Sleep -Milliseconds 500

Test-Endpoint -Name "404 Route Test" -Method "GET" -Endpoint "/api/nonexistent"

Start-Sleep -Seconds 1

# 9. COMPLETE WORKFLOW
Write-TestHeader "9. Complete User Workflow Simulation"

Write-Host "Simulating real user journey..." -ForegroundColor Cyan

$newUserTimestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$realUser = @{
    name = "John Farmer"
    email = "john.farmer$newUserTimestamp@example.com"
    password = "Farm2024!Secure"
}

Write-Host "`nStep 1: New user registration..." -ForegroundColor Cyan
$realSignup = Test-Endpoint -Name "Real User Signup" -Method "POST" -Endpoint "/api/auth/signup" -Body $realUser

if ($realSignup.Success) {
    $realToken = $realSignup.Data.token
    
    Start-Sleep -Milliseconds 500
    
    Write-Host "`nStep 2: User logs in..." -ForegroundColor Cyan
    $realLogin = Test-Endpoint -Name "Real User Login" -Method "POST" -Endpoint "/api/auth/login" -Body @{
        email = $realUser.email
        password = $realUser.password
    }
    
    Start-Sleep -Milliseconds 500
    
    Write-Host "`nStep 3: Checking crop recommendations..." -ForegroundColor Cyan
    Test-Endpoint -Name "User Checks Crops" -Method "GET" -Endpoint "/api/crops?soil=loam&season=monsoon"
    
    Start-Sleep -Milliseconds 500
    
    Write-Host "`nStep 4: Viewing community posts..." -ForegroundColor Cyan
    Test-Endpoint -Name "User Views Community" -Method "GET" -Endpoint "/api/community" -Token $realToken
    
    Start-Sleep -Milliseconds 500
    
    Write-Host "`nStep 5: Creating community post..." -ForegroundColor Cyan
    Test-Endpoint -Name "User Creates Post" -Method "POST" -Endpoint "/api/community" -Body @{
        content = "Just started using FarmHelp! Looking forward to better crop yields this season."
    } -Token $realToken
    
    Start-Sleep -Milliseconds 500
    
    Write-Host "`nStep 6: Chatting with AI assistant..." -ForegroundColor Cyan
    Test-Endpoint -Name "User Asks Chatbot" -Method "POST" -Endpoint "/api/chatbot" -Body @{
        message = "What are the best practices for sustainable farming?"
    } -Token $realToken
    
    Write-Host "`nComplete workflow executed successfully!" -ForegroundColor Green
}

Start-Sleep -Seconds 1

# TEST RESULTS SUMMARY
Write-Host "`n`n========================================" -ForegroundColor Magenta
Write-Host " TEST RESULTS SUMMARY" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Status -like "*PASS*" }).Count
$failedTests = $totalTests - $passedTests
$successRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 2) } else { 0 }

Write-Host "Total Tests Run:     $totalTests" -ForegroundColor White
Write-Host "Tests Passed:        $passedTests" -ForegroundColor Green
Write-Host "Tests Failed:        $failedTests" -ForegroundColor $(if ($failedTests -eq 0) { "Green" } else { "Red" })
Write-Host "Success Rate:        $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })
Write-Host "`n"

Write-Host "========================================" -ForegroundColor Gray
Write-Host "DETAILED TEST RESULTS:" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Gray

$testResults | Format-Table -Property Test, Status -AutoSize

Write-Host "`n"

if ($successRate -ge 90) {
    Write-Host "EXCELLENT! System is working perfectly!" -ForegroundColor Green
} elseif ($successRate -ge 70) {
    Write-Host "GOOD! Most features are working, minor issues detected." -ForegroundColor Yellow
} elseif ($successRate -ge 50) {
    Write-Host "WARNING! Several features have issues." -ForegroundColor Yellow
} else {
    Write-Host "CRITICAL! System has major issues." -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Cyan

# Export results
$resultsFile = "test-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$testResults | ConvertTo-Json -Depth 10 | Out-File -FilePath $resultsFile -Encoding UTF8
Write-Host "Test results saved to: $resultsFile`n" -ForegroundColor Yellow
