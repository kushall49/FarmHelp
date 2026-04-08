# FarmHelp - Master Control Script
# This script automatically debugs and fixes everything

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      FarmHelp - Auto Debug & Fix Tool                ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Step 1: Check Backend
Write-Host "[1/6] Checking Backend Server..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000" -Method GET -TimeoutSec 3
    Write-Host "   ✅ Backend is RUNNING" -ForegroundColor Green
    Write-Host "   Database: $($response.db)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Backend is NOT running! Starting it now..." -ForegroundColor Red
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\backend'; node src/server-minimal.js" -WindowStyle Normal
    Write-Host "   Waiting 10 seconds for backend to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}
Write-Host ""

# Step 2: Test Chatbot API
Write-Host "[2/6] Testing Chatbot API..." -ForegroundColor Yellow
try {
    $body = @{ message = "Hello" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/chatbot" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "   ✅ Chatbot API is responding!" -ForegroundColor Green
    Write-Host "   Reply: $($response.reply.Substring(0, [Math]::Min(100, $response.reply.Length)))..." -ForegroundColor White
} catch {
    Write-Host "   ❌ Chatbot API failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Test GROQ AI
Write-Host "[3/6] Testing GROQ AI with Farming Question..." -ForegroundColor Yellow
Write-Host "   Question: 'What crops grow best in loamy soil?'" -ForegroundColor Cyan
try {
    $body = @{ message = "What crops grow best in loamy soil?" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/chatbot" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 20
    
    Write-Host "   ✅ GROQ AI Response Received!" -ForegroundColor Green
    Write-Host ""
    Write-Host "   ─────────────────────────────────────────────" -ForegroundColor Gray
    Write-Host "   AI Reply:" -ForegroundColor Cyan
    Write-Host "   ─────────────────────────────────────────────" -ForegroundColor Gray
    
    $lines = $response.reply -split "`n"
    foreach ($line in $lines) {
        if ($line.Trim()) {
            Write-Host "   $line" -ForegroundColor White
        }
    }
    
    Write-Host "   ─────────────────────────────────────────────" -ForegroundColor Gray
    Write-Host "   Intent: $($response.intent)" -ForegroundColor Yellow
    Write-Host "   Confidence: $($response.confidence)" -ForegroundColor Yellow
    
    # Check if intelligent response
    if ($response.reply.Length -gt 200 -or $response.reply -match "loamy|soil|crop") {
        Write-Host ""
        Write-Host "   ✅ Response is from GROQ AI (intelligent & detailed)" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "   ⚠️  Response may be from fallback service" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   ❌ GROQ AI test failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Check Frontend
Write-Host "[4/6] Checking Frontend..." -ForegroundColor Yellow
$frontendRunning = $false
$ports = @(19000, 8081, 19001, 19006)

foreach ($port in $ports) {
    try {
        Invoke-RestMethod -Uri "http://localhost:$port" -Method GET -TimeoutSec 2 -ErrorAction Stop | Out-Null
        Write-Host "   ✅ Frontend is RUNNING on port $port" -ForegroundColor Green
        Write-Host "   URL: http://localhost:$port" -ForegroundColor Cyan
        $frontendRunning = $true
        break
    } catch {
        # Continue to next port
    }
}

if (-not $frontendRunning) {
    Write-Host "   ⚠️  Frontend is NOT running" -ForegroundColor Yellow
    Write-Host "   Starting frontend now..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\frontend'; npx expo start --web" -WindowStyle Normal
    Write-Host "   Frontend is starting in a new window..." -ForegroundColor Green
}
Write-Host ""

# Step 5: Check Environment
Write-Host "[5/6] Checking Configuration..." -ForegroundColor Yellow
$envPath = "$scriptPath\backend\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    if ($envContent -match "GROQ_API_KEY=gsk_") {
        Write-Host "   ✅ GROQ_API_KEY is configured" -ForegroundColor Green
    } else {
        Write-Host "   ❌ GROQ_API_KEY is NOT configured!" -ForegroundColor Red
        Write-Host "   → Get free key from: https://console.groq.com/keys" -ForegroundColor Yellow
    }
    
    if ($envContent -match "MONGODB_URI=") {
        Write-Host "   ✅ MONGODB_URI is configured" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ .env file not found!" -ForegroundColor Red
}
Write-Host ""

# Step 6: Check Packages
Write-Host "[6/6] Checking Node Packages..." -ForegroundColor Yellow
$packagesOk = $true

if (Test-Path "$scriptPath\backend\node_modules\@langchain\groq") {
    Write-Host "   ✅ @langchain/groq installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ @langchain/groq NOT installed!" -ForegroundColor Red
    $packagesOk = $false
}

if (Test-Path "$scriptPath\backend\node_modules\langchain") {
    Write-Host "   ✅ langchain installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ langchain NOT installed!" -ForegroundColor Red
    $packagesOk = $false
}

if (-not $packagesOk) {
    Write-Host ""
    Write-Host "   Installing missing packages..." -ForegroundColor Yellow
    Set-Location "$scriptPath\backend"
    npm install @langchain/groq langchain @langchain/core @langchain/community
    Set-Location $scriptPath
}
Write-Host ""

# Summary
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                    SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 System Status:" -ForegroundColor White
Write-Host ""

# Re-check backend
try {
    Invoke-RestMethod -Uri "http://localhost:4000" -Method GET -TimeoutSec 2 -ErrorAction Stop | Out-Null
    Write-Host "   Backend:    ✅ RUNNING" -ForegroundColor Green
} catch {
    Write-Host "   Backend:    ❌ STOPPED" -ForegroundColor Red
}

# Re-check frontend
$frontendStatus = $false
foreach ($port in @(19000, 8081)) {
    try {
        Invoke-RestMethod -Uri "http://localhost:$port" -Method GET -TimeoutSec 2 -ErrorAction Stop | Out-Null
        Write-Host "   Frontend:   ✅ RUNNING (port $port)" -ForegroundColor Green
        $frontendStatus = $true
        break
    } catch {}
}
if (-not $frontendStatus) {
    Write-Host "   Frontend:   ⚠️  STARTING..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔗 Quick Links:" -ForegroundColor White
Write-Host "   Backend:  http://localhost:4000" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:19000" -ForegroundColor Cyan
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Auto-debug complete! Check the windows that opened." -ForegroundColor Green
Write-Host ""
Write-Host "Wait 30 seconds for everything to load, then:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:19000" -ForegroundColor White
Write-Host "2. Navigate to AI Assistant" -ForegroundColor White
Write-Host "3. Ask: 'What crops grow in loamy soil?'" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to close this window"
