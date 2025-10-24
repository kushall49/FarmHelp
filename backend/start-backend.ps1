#!/usr/bin/env pwsh
# FarmHelp Backend Startup Script

Write-Host "🌾 Starting FarmHelp Backend Server..." -ForegroundColor Green
Write-Host ""

# Navigate to backend directory
Set-Location -Path "C:\Users\kusha\OneDrive\Desktop\FarmHelp\backend"

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file with your configuration." -ForegroundColor Yellow
    exit 1
}

# Display configuration
Write-Host "📋 Configuration:" -ForegroundColor Cyan
Write-Host "  - Server: http://localhost:4000" -ForegroundColor White
Write-Host "  - Chatbot: POST /api/chatbot" -ForegroundColor White
Write-Host "  - AI Model: Google FLAN-T5-Large (Real AI Responses!)" -ForegroundColor White
Write-Host ""

# Start the server
Write-Host "🚀 Starting server with real AI chatbot..." -ForegroundColor Green
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

node src\server-minimal.js
