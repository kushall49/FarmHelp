# FarmHelp - Complete Setup & Start (PowerShell)
# This script installs GROQ AI and starts all services

$ErrorActionPreference = "Continue"
$Host.UI.RawUI.WindowTitle = "FarmHelp - Complete Setup"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  FarmHelp - Complete Setup" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

# Get script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Step 1: Kill existing processes
Write-Host "[1/6] Stopping any running services..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort 19000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Write-Host "   Done!" -ForegroundColor Green
Write-Host ""

# Step 2: Install GROQ packages
Write-Host "[2/6] Installing GROQ AI packages in backend..." -ForegroundColor Yellow
Set-Location backend
Write-Host "   Running: npm install @langchain/groq langchain @langchain/core @langchain/community"
npm install @langchain/groq langchain @langchain/core @langchain/community --no-audit --prefer-offline 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Success! GROQ AI packages installed." -ForegroundColor Green
} else {
    Write-Host "   WARNING: Some packages may not have installed. Continuing..." -ForegroundColor Yellow
}
Set-Location ..
Write-Host ""

# Step 3: Verify GROQ API Key
Write-Host "[3/6] Checking GROQ API Key..." -ForegroundColor Yellow
$envContent = Get-Content "backend\.env" -ErrorAction SilentlyContinue
if ($envContent -match "GROQ_API_KEY=gsk_") {
    Write-Host "   Success! GROQ API Key found." -ForegroundColor Green
} else {
    Write-Host "   WARNING: GROQ_API_KEY not found in .env file!" -ForegroundColor Yellow
    Write-Host "   Chatbot will use fallback AI." -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Install frontend packages if needed
Write-Host "[4/6] Checking frontend packages..." -ForegroundColor Yellow
Set-Location frontend
if (-not (Test-Path "node_modules")) {
    Write-Host "   Installing frontend packages..."
    npm install 2>&1 | Out-Null
    Write-Host "   Done!" -ForegroundColor Green
} else {
    Write-Host "   Frontend packages already installed." -ForegroundColor Green
}
Set-Location ..
Write-Host ""

# Step 5: Start REST & Mongo Backend
Write-Host "[5/7] Starting Primary Mongo Backend Server (Port 4000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\backend'; Write-Host '[MONGO BACKEND] Starting...' -ForegroundColor Cyan; node src/server-minimal.js" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "   Backend 1 started!" -ForegroundColor Green
Write-Host ""

# Step 6: Start Real-Time Rapido Database + Socket Service
Write-Host "[6/7] Starting Real-Time Socket Service (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\backend'; Write-Host '[REAL-TIME ENGINE] Starting Rapido/Uber sockets on Port 5000...' -ForegroundColor Cyan; node src/server.js" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "   WebSocket Engine initialized." -ForegroundColor Green
Write-Host ""

# Step 7: Start Frontend
Write-Host "[7/7] Starting Frontend Web App (Port 19000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\frontend'; Write-Host '[FRONTEND] Starting Expo Web...' -ForegroundColor Cyan; npx expo start --web --port 19000" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "   Frontend Web App started!" -ForegroundColor Green
Write-Host ""

Write-Host "=========================================" -ForegroundColor Green
Write-Host "  Setup Complete - Services Starting!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Two windows have opened:" -ForegroundColor Cyan
Write-Host "1. Backend  (Check for: 'GROQ AI Service is READY')" -ForegroundColor White
Write-Host "2. Frontend (Wait for: 'Metro waiting on exp://')" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Yellow
Write-Host "- Wait 30-60 seconds for everything to load"
Write-Host "- Frontend will show a QR code and URLs"
Write-Host "- Look for 'Metro waiting on exp://' message"
Write-Host "- Then you can press 'w' in frontend window for web"
Write-Host ""
Write-Host "OR wait for URLs to appear and open:"
Write-Host "http://localhost:19000" -ForegroundColor Cyan
Write-Host ""
Write-Host "If port 19000 doesn't work, check the frontend window"
Write-Host "for the actual port (might be 8081 or different)"
Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Waiting 45 seconds before opening browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 45
Write-Host ""
Write-Host "Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:19000"
Write-Host ""
Write-Host "If browser shows error:" -ForegroundColor Yellow
Write-Host "1. Wait another 30 seconds"
Write-Host "2. Check frontend window for actual URL"
Write-Host "3. Press 'w' in frontend window to start web server"
Write-Host ""
Write-Host "Press any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
