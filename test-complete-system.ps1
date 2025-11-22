# ═══════════════════════════════════════════════════════════════
# 🧪 FarmHelp Complete System Test - Real User Simulation
# ═══════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:4000"
$testResults = @()

function Write-TestHeader {
    param([string]$title)
    Write-Host "`n╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  $title" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$message)
    Write-Host "✓ $message" -ForegroundColor Green
}

function Write-Failure {
    param([string]$message)
    Write-Host "✗ $message" -ForegroundColor Red
}

function Write-Info {
    param([string]$message)
    Write-Host "ℹ $message" -ForegroundColor Yellow
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

    Write-Info "Testing: $Name"
    
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

        Write-Success "$Name - Status: $($response.StatusCode)"
        Write-Host "   Response: $($content | ConvertTo-Json -Compress)" -ForegroundColor Gray
        
        $script:testResults += [PSCustomObject]@{
            Test = $Name
            Status = "✓ PASS"
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
        Write-Failure "$Name - Error: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            Write-Host "   Status Code: $statusCode" -ForegroundColor Red
        }
        
        $script:testResults += [PSCustomObject]@{
            Test = $Name
            Status = "✗ FAIL"
            Error = $_.Exception.Message
        }

        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

# ═══════════════════════════════════════════════════════════════
# START TESTING
# ═══════════════════════════════════════════════════════════════

Write-Host "`n"
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                                                               ║" -ForegroundColor Magenta
Write-Host "║       🧪 FarmHelp Complete System Test Suite 🧪               ║" -ForegroundColor Magenta
Write-Host "║       Testing as Real User - Automated Flow                   ║" -ForegroundColor Magenta
Write-Host "║                                                               ║" -ForegroundColor Magenta
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host "`n"

Start-Sleep -Seconds 1

# ═══════════════════════════════════════════════════════════════
# 1. HEALTH CHECK
# ═══════════════════════════════════════════════════════════════

Write-TestHeader "1️⃣  Health Check"
$health = Test-Endpoint -Name "Server Health Check" -Method "GET" -Endpoint "/"

if (-not $health.Success) {
    Write-Host "`n❌ Server is not running! Please start the backend server first." -ForegroundColor Red
    Write-Host "   Run: cd backend ; node src/app.js`n" -ForegroundColor Yellow
    exit 1
}

Start-Sleep -Seconds 1

# ═══════════════════════════════════════════════════════════════
# 2. USER SIGNUP
# ═══════════════════════════════════════════════════════════════

Write-TestHeader "2️⃣  User Registration (Signup)"

$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$testUser = @{
    name = "Test Farmer $timestamp"
    email = "farmer$timestamp@farmhelp.com"
    password = "SecurePass123!"
}

Write-Info "Creating new user: $($testUser.email)"
$signup = Test-Endpoint -Name "User Signup" -Method "POST" -Endpoint "/api/auth/signup" -Body $testUser

if ($signup.Success) {
    $token = $signup.Data.token
    $userId = $signup.Data.user.id
    Write-Success "User created successfully!"
    Write-Host "   User ID: $userId" -ForegroundColor Cyan
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Cyan
} else {
    Write-Failure "Signup failed! Cannot continue with tests."
    exit 1
}

Start-Sleep -Seconds 1

# ═══════════════════════════════════════════════════════════════
# 3. USER LOGIN
# ═══════════════════════════════════════════════════════════════

Write-TestHeader "3️⃣  User Authentication (Login)"

$loginCredentials = @{
    email = $testUser.email
    password = $testUser.password
}

$login = Test-Endpoint -Name "User Login" -Method "POST" -Endpoint "/api/auth/login" -Body $loginCredentials

if ($login.Success) {
    $loginToken = $login.Data.token
    Write-Success "Login successful!"
    Write-Host "   New Token: $($loginToken.Substring(0, 20))..." -ForegroundColor Cyan
} else {
    Write-Failure "Login failed!"
}

Start-Sleep -Seconds 1

# ═══════════════════════════════════════════════════════════════
# 4. CROP RECOMMENDATIONS (Without Auth)
# ═══════════════════════════════════════════════════════════════

Write-TestHeader "4️⃣  Crop Recommendations (Public Access)"

# Test 1: Get all crops
Test-Endpoint -Name "Get All Crops" -Method "GET" -Endpoint "/api/crops"

Start-Sleep -Milliseconds 500

# Test 2: Get crops by soil type
Test-Endpoint -Name "Get Crops for Loam Soil" -Method "GET" -Endpoint "/api/crops?soil=loam"

Start-Sleep -Milliseconds 500

# Test 3: Get crops by season
Test-Endpoint -Name "Get Crops for Monsoon Season" -Method "GET" -Endpoint "/api/crops?season=monsoon"

Start-Sleep -Milliseconds 500

# Test 4: Get crops by temperature
Test-Endpoint -Name "Get Crops for 25°C" -Method "GET" -Endpoint "/api/crops?temp=25"

Start-Sleep -Milliseconds 500

# Test 5: Combined filters
Test-Endpoint -Name "Get Crops (Combined Filters)" -Method "GET" -Endpoint "/api/crops?soil=clay&season=winter&temp=20"

Start-Sleep -Seconds 1

# ═══════════════════════════════════════════════════════════════
# 5. COMMUNITY FEATURES (Requires Auth)
# ═══════════════════════════════════════════════════════════════

Write-TestHeader "5️⃣  Community Features (Authenticated)"

# Test 1: Get all posts
$getPosts = Test-Endpoint -Name "Get Community Posts" -Method "GET" -Endpoint "/api/community" -Token $token

Start-Sleep -Milliseconds 500

# Test 2: Create new post
$newPost = @{
    content = "Hello from automated test! Testing the FarmHelp community feature. 🌾"
    imageUrl = ""
}
$createPost = Test-Endpoint -Name "Create Community Post" -Method "POST" -Endpoint "/api/community" -Body $newPost -Token $token

if ($createPost.Success) {
    $postId = $createPost.Data.post._id
    Write-Success "Post created with ID: $postId"
}

Start-Sleep -Seconds 1

# ═══════════════════════════════════════════════════════════════
# 6. CHATBOT (Without Auth - Test Endpoint)
# ═══════════════════════════════════════════════════════════════

Write-TestHeader "6️⃣  AI Chatbot Service (Test Mode)"

# Test various chatbot queries
$chatQueries = @(
    "Hello, what can you help me with?",
    "What crops should I grow in monsoon season?",
    "Tell me about rice farming",
    "What is the best fertilizer for wheat?",
    "How do I prevent pest attacks?"
)

foreach ($query in $chatQueries) {
    $chatBody = @{ message = $query }
    Test-Endpoint -Name "Chatbot: '$query'" -Method "POST" -Endpoint "/api/chatbot/test" -Body $chatBody
    Start-Sleep -Milliseconds 800
}

Start-Sleep -Seconds 1

# ═══════════════════════════════════════════════════════════════
# 7. CHATBOT (With Auth)
# ═══════════════════════════════════════════════════════════════

Write-TestHeader "7️⃣  AI Chatbot Service (Authenticated)"

$authChatBody = @{ message = "What are the best practices for organic farming?" }
Test-Endpoint -Name "Authenticated Chatbot Query" -Method "POST" -Endpoint "/api/chatbot" -Body $authChatBody -Token $token

Start-Sleep -Seconds 1

# ═══════════════════════════════════════════════════════════════
# 8. ERROR HANDLING TESTS
# ═══════════════════════════════════════════════════════════════

Write-TestHeader "8️⃣  Error Handling & Edge Cases"

# Test 1: Invalid login credentials
Test-Endpoint -Name "Invalid Login (Wrong Password)" -Method "POST" -Endpoint "/api/auth/login" -Body @{
    email = $testUser.email
    password = "WrongPassword123!"
}

Start-Sleep -Milliseconds 500

# Test 2: Duplicate signup
Test-Endpoint -Name "Duplicate Signup (Should Fail)" -Method "POST" -Endpoint "/api/auth/signup" -Body $testUser

Start-Sleep -Milliseconds 500

# Test 3: Missing required fields
Test-Endpoint -Name "Signup Missing Fields" -Method "POST" -Endpoint "/api/auth/signup" -Body @{ email = "incomplete@test.com" }

Start-Sleep -Milliseconds 500

# Test 4: Unauthorized access to protected route
Test-Endpoint -Name "Unauthorized Community Access" -Method "GET" -Endpoint "/api/community"

Start-Sleep -Milliseconds 500

# Test 5: Invalid token
Test-Endpoint -Name "Invalid Token Access" -Method "GET" -Endpoint "/api/community" -Token "invalid.token.here"

Start-Sleep -Milliseconds 500

# Test 6: 404 - Non-existent route
Test-Endpoint -Name "404 Route Test" -Method "GET" -Endpoint "/api/nonexistent"

Start-Sleep -Seconds 1

# ═══════════════════════════════════════════════════════════════
# 9. COMPREHENSIVE WORKFLOW TEST
# ═══════════════════════════════════════════════════════════════

Write-TestHeader "9️⃣  Complete User Workflow Simulation"

Write-Info "Simulating real user journey..."

# Step 1: New user signs up
$newUserTimestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$realUser = @{
    name = "John Farmer"
    email = "john.farmer$newUserTimestamp@example.com"
    password = "Farm2024!Secure"
}

Write-Host "`n   👤 Step 1: New user registration..." -ForegroundColor Cyan
$realSignup = Test-Endpoint -Name "Real User Signup" -Method "POST" -Endpoint "/api/auth/signup" -Body $realUser

if ($realSignup.Success) {
    $realToken = $realSignup.Data.token
    
    Start-Sleep -Milliseconds 500
    
    # Step 2: User logs in again
    Write-Host "`n   🔐 Step 2: User logs in..." -ForegroundColor Cyan
    $realLogin = Test-Endpoint -Name "Real User Login" -Method "POST" -Endpoint "/api/auth/login" -Body @{
        email = $realUser.email
        password = $realUser.password
    }
    
    Start-Sleep -Milliseconds 500
    
    # Step 3: User checks crop recommendations
    Write-Host "`n   🌾 Step 3: Checking crop recommendations..." -ForegroundColor Cyan
    Test-Endpoint -Name "User Checks Crops" -Method "GET" -Endpoint "/api/crops?soil=loam&season=monsoon"
    
    Start-Sleep -Milliseconds 500
    
    # Step 4: User views community
    Write-Host "`n   📱 Step 4: Viewing community posts..." -ForegroundColor Cyan
    Test-Endpoint -Name "User Views Community" -Method "GET" -Endpoint "/api/community" -Token $realToken
    
    Start-Sleep -Milliseconds 500
    
    # Step 5: User creates a post
    Write-Host "`n   ✍️  Step 5: Creating community post..." -ForegroundColor Cyan
    Test-Endpoint -Name "User Creates Post" -Method "POST" -Endpoint "/api/community" -Body @{
        content = "Just started using FarmHelp! Looking forward to better crop yields this season. 🌱"
    } -Token $realToken
    
    Start-Sleep -Milliseconds 500
    
    # Step 6: User chats with AI
    Write-Host "`n   💬 Step 6: Chatting with AI assistant..." -ForegroundColor Cyan
    Test-Endpoint -Name "User Asks Chatbot" -Method "POST" -Endpoint "/api/chatbot" -Body @{
        message = "What are the best practices for sustainable farming?"
    } -Token $realToken
    
    Write-Success "`nComplete workflow executed successfully!"
}

Start-Sleep -Seconds 1

# ═══════════════════════════════════════════════════════════════
# TEST RESULTS SUMMARY
# ═══════════════════════════════════════════════════════════════

Write-Host "`n`n"
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                   📊 TEST RESULTS SUMMARY                     ║" -ForegroundColor Magenta
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host "`n"

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Status -like "*PASS*" }).Count
$failedTests = $totalTests - $passedTests
$successRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 2) } else { 0 }

Write-Host "Total Tests Run:     $totalTests" -ForegroundColor White
Write-Host "Tests Passed:        $passedTests" -ForegroundColor Green
Write-Host "Tests Failed:        $failedTests" -ForegroundColor $(if ($failedTests -eq 0) { "Green" } else { "Red" })
Write-Host "Success Rate:        $successRate%" -ForegroundColor $(if ($successRate -ge 80) { "Green" } elseif ($successRate -ge 60) { "Yellow" } else { "Red" })
Write-Host "`n"

# Display detailed results
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "DETAILED TEST RESULTS:" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Gray

$testResults | Format-Table -Property Test, Status -AutoSize

Write-Host "`n"

# Final verdict
if ($successRate -ge 90) {
    Write-Host "🎉 EXCELLENT! System is working perfectly!" -ForegroundColor Green
} elseif ($successRate -ge 70) {
    Write-Host "✅ GOOD! Most features are working, minor issues detected." -ForegroundColor Yellow
} elseif ($successRate -ge 50) {
    Write-Host "⚠️  WARNING! Several features have issues." -ForegroundColor Yellow
} else {
    Write-Host "❌ CRITICAL! System has major issues." -ForegroundColor Red
}

Write-Host "`n"
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Test completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "`n"

# Export results to JSON
$resultsFile = "test-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$testResults | ConvertTo-Json -Depth 10 | Out-File -FilePath $resultsFile -Encoding UTF8
Write-Info "Test results saved to: $resultsFile"
Write-Host "`n"
