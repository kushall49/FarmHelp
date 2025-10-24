# RESTART BACKEND SERVER - IMPORTANT!
# This will apply the JWT fix

Write-Host "🔄 RESTARTING BACKEND SERVER..." -ForegroundColor Cyan
Write-Host ""

# Kill any existing node processes on port 4000
Write-Host "1️⃣ Stopping old server..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "2️⃣ Starting fresh server..." -ForegroundColor Yellow
Write-Host ""

# Start the server
cd C:\Users\kusha\OneDrive\Desktop\FarmHelp\backend
npm start

# Note: Server will run in THIS terminal
# Don't close this window!
