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
Get-NetTCPConnection -LocalPort 19006 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
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

# Step 6: Start ML Service for Plant Analyzer
Write-Host "[6/7] Starting ML Service (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\model-service'; Write-Host '[ML SERVICE] Starting Flask ML API on port 5000...' -ForegroundColor Magenta; python app.py; if ($LASTEXITCODE -ne 0) { if ($env:USE_ML_MOCK_FALLBACK -eq 'true') { Write-Host '[ML SERVICE] app.py failed, starting fallback app_simple.py (USE_ML_MOCK_FALLBACK=true)...' -ForegroundColor Yellow; python app_simple.py } else { Write-Host '[ML SERVICE] app.py failed. Mock fallback disabled for production. Set USE_ML_MOCK_FALLBACK=true only for local dev.' -ForegroundColor Red } }" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "   ML Service started." -ForegroundColor Green
Write-Host ""

# Step 7: Start Frontend (stable static web build)
Write-Host "[7/7] Building and Serving Frontend Web App (Port 19006)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\frontend'; Write-Host '[FRONTEND] Exporting web build...' -ForegroundColor Cyan; npx expo export:web; Write-Host '[FRONTEND] Serving web-build on 19006...' -ForegroundColor Cyan; npx serve web-build -l 19006" -WindowStyle Normal
Start-Sleep -Seconds 5
Write-Host "   Frontend Web App started on 19006!" -ForegroundColor Green
Write-Host ""

Write-Host "=========================================" -ForegroundColor Green
Write-Host "  Setup Complete - Services Starting!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Two windows have opened:" -ForegroundColor Cyan
Write-Host "1. Backend  (Check for: 'GROQ AI Service is READY')" -ForegroundColor White
Write-Host "2. Frontend (Wait for: 'Serving!' on port 19006)" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Yellow
Write-Host "- Wait 30-60 seconds for everything to load"
Write-Host "- Frontend will export and then serve static files"
Write-Host "- Look for 'Serving!' message in frontend window"
Write-Host ""
Write-Host "OR wait for URLs to appear and open:"
Write-Host "http://localhost:19006" -ForegroundColor Cyan
Write-Host ""
Write-Host "If port 19006 doesn't work, check the frontend window"
Write-Host "for the actual port (might be 8081 or different)"
Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Waiting for frontend web server on port 19006..." -ForegroundColor Yellow
$frontendReady = $false
for ($i = 0; $i -lt 120; $i++) {
    $conn = Get-NetTCPConnection -LocalPort 19006 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn) {
        $frontendReady = $true
        break
    }
    Start-Sleep -Seconds 1
}
Write-Host ""
if ($frontendReady) {
    Write-Host "Opening browser..." -ForegroundColor Green
    Start-Process "http://localhost:19006"
} else {
    Write-Host "Frontend did not open port 19006 in time." -ForegroundColor Red
    Write-Host "Please check the frontend window for export/serve errors." -ForegroundColor Yellow
}
Write-Host ""
Write-Host "If browser shows error:" -ForegroundColor Yellow
Write-Host "1. Wait another 30 seconds"
Write-Host "2. Check frontend window for actual URL"
Write-Host "3. Confirm frontend window says 'Serving!'"
Write-Host ""
Write-Host "Press any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
