# Test Chatbot Endpoint
Write-Host "Testing FarmHelp Chatbot..." -ForegroundColor Cyan

$tests = @(
    @{message="Hello"; expected="greeting"},
    @{message="What crops should I plant?"; expected="crop"},
    @{message="What's the weather like?"; expected="weather"},
    @{message="How do I treat plant disease?"; expected="disease"}
)

foreach ($test in $tests) {
    Write-Host "`nTest: $($test.message)" -ForegroundColor Yellow
    
    try {
        $body = @{message=$test.message} | ConvertTo-Json
        $response = Invoke-RestMethod -Uri 'http://localhost:4000/api/chatbot' `
            -Method POST `
            -ContentType 'application/json' `
            -Body $body
        
        Write-Host "✓ Success" -ForegroundColor Green
        Write-Host "  Reply: $($response.reply.Substring(0, [Math]::Min(100, $response.reply.Length)))..."
        Write-Host "  Intent: $($response.intent)"
        Write-Host "  Confidence: $($response.confidence)"
    }
    catch {
        Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Green
