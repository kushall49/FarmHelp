# FarmHelp - Complete Setup & Start (PowerShell)
# This script installs GROQ AI and starts ALL services (ML, Backend, Frontend)

$ErrorActionPreference = "Continue"
$Host.UI.RawUI.WindowTitle = "FarmHelp - Complete Setup"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  FarmHelp - Complete Setup" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Starting ALL services:" -ForegroundColor Cyan
Write-Host "  • ML Service (Port 5000) - Plant Disease AI" -ForegroundColor White
Write-Host "  • Backend (Port 4000) - API Server" -ForegroundColor White
Write-Host "  • Frontend (Port 19000) - Web App" -ForegroundColor White
Write-Host ""

# Get script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Step 1: Kill existing processes
Write-Host "[1/7] Stopping any running services..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort 19000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Write-Host "   Done!" -ForegroundColor Green
Write-Host ""

# Step 2: Check Python for ML Service
Write-Host "[2/7] Checking Python installation..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "   WARNING: Python not found!" -ForegroundColor Red
    Write-Host "   ML Service will not work. Install Python 3.8+ from python.org" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Install GROQ packages
Write-Host "[3/7] Installing GROQ AI packages in backend..." -ForegroundColor Yellow
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

# Step 4: Verify GROQ API Key
Write-Host "[4/7] Checking GROQ API Key..." -ForegroundColor Yellow
$envContent = Get-Content "backend\.env" -ErrorAction SilentlyContinue
if ($envContent -match "GROQ_API_KEY=gsk_") {
    Write-Host "   Success! GROQ API Key found." -ForegroundColor Green
} else {
    Write-Host "   WARNING: GROQ_API_KEY not found in .env file!" -ForegroundColor Yellow
    Write-Host "   Chatbot will use fallback AI." -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Install frontend packages if needed
Write-Host "[5/7] Checking frontend packages..." -ForegroundColor Yellow
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

# Step 6: Start ML Service (Port 5000)
Write-Host "[6/7] Starting ML Service (Port 5000) - Plant Disease AI..." -ForegroundColor Yellow
$pythonCheck = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\model-service'; `$Host.UI.RawUI.WindowTitle='FarmHelp - ML Service'; Write-Host '[ML SERVICE] Starting Flask app on port 5000...' -ForegroundColor Magenta; python app.py" -WindowStyle Normal
    Start-Sleep -Seconds 3
    Write-Host "   ML Service started! Check its window for status." -ForegroundColor Green
} else {
    Write-Host "   SKIPPED: Python not installed" -ForegroundColor Yellow
    Write-Host "   WARNING: Plant Analyzer will not work!" -ForegroundColor Red
}
Write-Host ""

# Step 7: Start Backend Server (Port 4000)
Write-Host "[7/7] Starting Backend Server (Port 4000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\backend'; `$Host.UI.RawUI.WindowTitle='FarmHelp - Backend'; Write-Host '[BACKEND] Starting Node.js server...' -ForegroundColor Cyan; node src/server-minimal.js" -WindowStyle Normal
Start-Sleep -Seconds 5
Write-Host "   Backend started! Check its window for GROQ status." -ForegroundColor Green
Write-Host ""

# Step 8: Start Frontend
Write-Host "[8/8] Starting Frontend (Port 19000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\frontend'; `$Host.UI.RawUI.WindowTitle='FarmHelp - Frontend'; Write-Host '[FRONTEND] Starting Expo...' -ForegroundColor Cyan; npx expo start" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "   Frontend started!" -ForegroundColor Green
Write-Host ""

Write-Host "=========================================" -ForegroundColor Green
Write-Host "  Setup Complete - All Services Starting!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Three windows have opened:" -ForegroundColor Cyan
Write-Host "1. ML Service  (Port 5000 - Plant Disease AI)" -ForegroundColor Magenta
Write-Host "   Check for: 'Running on http://127.0.0.1:5000'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Backend     (Port 4000 - API Server)" -ForegroundColor Cyan
Write-Host "   Check for: 'GROQ AI Service is READY'" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Frontend    (Port 19000 - Web App)" -ForegroundColor Green
Write-Host "   Wait for: 'Metro waiting on exp://'" -ForegroundColor Gray
Write-Host ""
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "  Service URLs:" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "ML Service:  http://127.0.0.1:5000/health" -ForegroundColor Magenta
Write-Host "Backend:     http://localhost:4000/api/crops" -ForegroundColor Cyan
Write-Host "Frontend:    http://localhost:19000" -ForegroundColor Green
Write-Host ""
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Yellow
Write-Host "- Wait 45-60 seconds for everything to load" -ForegroundColor White
Write-Host "- ML Service must show: 'Running on http://127.0.0.1:5000'" -ForegroundColor White
Write-Host "- Backend must show: 'GROQ AI Service is READY'" -ForegroundColor White
Write-Host "- Frontend will show QR code and URLs" -ForegroundColor White
Write-Host ""
Write-Host "Testing Plant Analyzer:" -ForegroundColor Cyan
Write-Host "1. All 3 services must be running" -ForegroundColor White
Write-Host "2. Go to Plant Analyzer in app" -ForegroundColor White
Write-Host "3. Upload test image from test-images folder" -ForegroundColor White
Write-Host "4. Get disease detection + cure suggestions!" -ForegroundColor White
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
