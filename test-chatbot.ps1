Start-Sleep -Seconds 2
$body = @{
    message = "Hello, tell me about farming"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/chatbot" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Chatbot Response:" -ForegroundColor Green
    Write-Host $response.reply -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}
