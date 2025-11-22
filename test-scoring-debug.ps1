# Debug crop scoring

$baseUrl = "http://localhost:4000"

Write-Host "`n=== CROP SCORING DEBUG ===" -ForegroundColor Cyan

# Get Rice crop
$allCrops = Invoke-RestMethod -Uri "$baseUrl/api/crops" -Method GET
$rice = $allCrops.results | Where-Object { $_.name -like "*Rice*" } | Select-Object -First 1

Write-Host "`nRice Crop Data:" -ForegroundColor Yellow
Write-Host "  Name: $($rice.name)"
Write-Host "  Soils: $($rice.suitableSoils -join ', ')"
Write-Host "  Seasons: $($rice.seasons -join ', ')"
Write-Host "  Temp Range: $($rice.minTemp)-$($rice.maxTemp)C"
Write-Host "  Rainfall: $($rice.minRainfall)-$($rice.maxRainfall)mm"
Write-Host "  Scoring Weights:"
Write-Host "    soilScore: $($rice.soilScore)"
Write-Host "    seasonScore: $($rice.seasonScore)"
Write-Host "    tempScore: $($rice.tempScore)"
Write-Host "    rainfallScore: $($rice.rainfallScore)"
Write-Host "    marketScore: $($rice.marketScore)"

Write-Host "`nTest Conditions: loam, monsoon, 28C, 800mm rainfall" -ForegroundColor Yellow

# Manual scoring calculation
$totalScore = 0
$maxScore = 0

# Soil matching (should match 'loam')
$soilWeight = $rice.soilScore
$maxScore += $soilWeight * 10
if ($rice.suitableSoils -contains 'loam') {
    $totalScore += $soilWeight * 10
    Write-Host "  Soil Match: YES (+$($soilWeight * 10))" -ForegroundColor Green
} else {
    $totalScore += $soilWeight * 3
    Write-Host "  Soil Match: NO (+$($soilWeight * 3))" -ForegroundColor Red
}

# Season matching (should match 'monsoon')
$seasonWeight = $rice.seasonScore
$maxScore += $seasonWeight * 10
if ($rice.seasons -contains 'monsoon') {
    $totalScore += $seasonWeight * 10
    Write-Host "  Season Match: YES (+$($seasonWeight * 10))" -ForegroundColor Green
} else {
    $totalScore += $seasonWeight * 2
    Write-Host "  Season Match: NO (+$($seasonWeight * 2))" -ForegroundColor Red
}

# Temperature matching (28C in 20-35 range)
$tempWeight = $rice.tempScore
$maxScore += $tempWeight * 10
if (28 -ge $rice.minTemp -and 28 -le $rice.maxTemp) {
    $totalScore += $tempWeight * 10
    Write-Host "  Temp Match: YES (+$($tempWeight * 10))" -ForegroundColor Green
} else {
    Write-Host "  Temp Match: PARTIAL" -ForegroundColor Yellow
}

# Rainfall matching (800mm vs 1000-2500)
$rainfallWeight = $rice.rainfallScore
$maxScore += $rainfallWeight * 10
if (800 -ge $rice.minRainfall -and 800 -le $rice.maxRainfall) {
    $totalScore += $rainfallWeight * 10
    Write-Host "  Rainfall Match: YES (+$($rainfallWeight * 10))" -ForegroundColor Green
} else {
    $totalScore += $rainfallWeight * 4
    Write-Host "  Rainfall Match: NO (+$($rainfallWeight * 4))" -ForegroundColor Yellow
}

# Market demand
$marketWeight = $rice.marketScore
$maxScore += $marketWeight * 10
if ($rice.marketDemand -eq 'High') {
    $totalScore += $marketWeight * 10
    Write-Host "  Market Demand: High (+$($marketWeight * 10))" -ForegroundColor Green
}

$normalizedScore = [math]::Round(($totalScore / $maxScore) * 100)

Write-Host "`nScoring Summary:" -ForegroundColor Cyan
Write-Host "  Total Score: $totalScore"
Write-Host "  Max Score: $maxScore"
Write-Host "  Normalized: $normalizedScore"
Write-Host "  Above threshold (>20): $(if ($normalizedScore -gt 20) { 'YES' } else { 'NO' })" -ForegroundColor $(if ($normalizedScore -gt 20) { 'Green' } else { 'Red' })

Write-Host "`nActual API Response:" -ForegroundColor Cyan
$response = Invoke-RestMethod -Uri "$baseUrl/api/crops?soil=loam&season=monsoon&temp=28" -Method GET
Write-Host "  Results Count: $($response.results.Count)"
if ($response.results.Count -gt 0) {
    Write-Host "  Top Crop: $($response.results[0].name) (Score: $($response.results[0].score))"
} else {
    Write-Host "  No results returned!" -ForegroundColor Red
}
