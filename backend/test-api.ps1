#!/usr/bin/env pwsh
# Test Hugging Face API Key and Model

Write-Host "🧪 Testing Hugging Face API Configuration..." -ForegroundColor Cyan
Write-Host ""

# Read API key from .env
$envPath = "C:\Users\kusha\OneDrive\Desktop\FarmHelp\backend\.env"
$apiKey = ""

if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match "^HUGGINGFACE_API_KEY=(.+)$") {
            $apiKey = $matches[1]
        }
    }
}

if (-Not $apiKey) {
    Write-Host "❌ No API key found in .env!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ API Key found: $($apiKey.Substring(0,10))..." -ForegroundColor Green
Write-Host ""

# Test the API with a simple request
Write-Host "🔍 Testing API connection to Google FLAN-T5-Large..." -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

$body = @{
    inputs = "What are the best crops for loamy soil?"
    parameters = @{
        max_length = 100
        min_length = 20
        temperature = 0.7
    }
} | ConvertTo-Json

Write-Host "🔍 Testing API connection to Google FLAN-T5-Large..." -ForegroundColor Yellow

$response = Invoke-RestMethod -Uri "https://api-inference.huggingface.co/models/google/flan-t5-large" `
    -Method Post `
    -Headers $headers `
    -Body $body `
    -TimeoutSec 30 `
    -ErrorAction Stop

Write-Host ""
Write-Host "✅ SUCCESS! API is working!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Response from AI:" -ForegroundColor Cyan
Write-Host $response[0].generated_text -ForegroundColor White
Write-Host ""
Write-Host "🎉 Your chatbot will now give REAL AI responses!" -ForegroundColor Green
Write-Host ""

