# FarmHelp Crop Recommendation Test Suite
# Tests the AI-powered crop recommendation system

$baseUrl = "http://localhost:4000"
$passed = 0
$failed = 0

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   CROP RECOMMENDATION TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Get all crops (no filters)
Write-Host "Test 1: Get All Crops (No Filters)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/crops" -Method GET -TimeoutSec 10
    if ($response.success -and $response.results) {
        Write-Host "  PASS - Retrieved $($response.results.Count) crops" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  FAIL - Invalid response format" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  FAIL - $_" -ForegroundColor Red
    $failed++
}

# Test 2: Crop recommendation for Loamy soil in Monsoon
Write-Host "`nTest 2: Loamy Soil + Monsoon Season" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/crops?soil=loamy&season=monsoon&temp=28" -Method GET -TimeoutSec 10
    if ($response.success -and $response.results) {
        Write-Host "  PASS - Found $($response.results.Count) suitable crops" -ForegroundColor Green
        Write-Host "  Top 3 Recommendations:" -ForegroundColor Cyan
        $response.results | Select-Object -First 3 | ForEach-Object {
            Write-Host "    $($_.rank). $($_.name) (Score: $($_.score))" -ForegroundColor White
        }
        $passed++
    } else {
        Write-Host "  FAIL - No recommendations found" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  FAIL - $_" -ForegroundColor Red
    $failed++
}

# Test 3: Crop recommendation for Clay soil in Summer
Write-Host "`nTest 3: Clay Soil + Summer Season" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/crops?soil=clay&season=summer&temp=35" -Method GET -TimeoutSec 10
    if ($response.success -and $response.results) {
        Write-Host "  PASS - Found $($response.results.Count) suitable crops" -ForegroundColor Green
        Write-Host "  Top Recommendation: $($response.results[0].name) (Score: $($response.results[0].score))" -ForegroundColor Cyan
        $passed++
    } else {
        Write-Host "  FAIL - No recommendations found" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  FAIL - $_" -ForegroundColor Red
    $failed++
}

# Test 4: Crop recommendation for Sandy soil in Winter
Write-Host "`nTest 4: Sandy Soil + Winter Season" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/crops?soil=sandy&season=winter&temp=18" -Method GET -TimeoutSec 10
    if ($response.success -and $response.results) {
        Write-Host "  PASS - Found $($response.results.Count) suitable crops" -ForegroundColor Green
        Write-Host "  Top Recommendation: $($response.results[0].name) (Score: $($response.results[0].score))" -ForegroundColor Cyan
        $passed++
    } else {
        Write-Host "  FAIL - No recommendations found" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  FAIL - $_" -ForegroundColor Red
    $failed++
}

# Test 5: Crop recommendation for Loam soil in Spring
Write-Host "`nTest 5: Loam Soil + Spring Season" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/crops?soil=loam&season=spring&temp=24" -Method GET -TimeoutSec 10
    if ($response.success -and $response.results) {
        Write-Host "  PASS - Found $($response.results.Count) suitable crops" -ForegroundColor Green
        Write-Host "  Conditions: Soil=$($response.conditions.soil), Season=$($response.conditions.season), Temp=$($response.conditions.temperature)C" -ForegroundColor Cyan
        $passed++
    } else {
        Write-Host "  FAIL - No recommendations found" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  FAIL - $_" -ForegroundColor Red
    $failed++
}

# Test 6: Detailed crop information check
Write-Host "`nTest 6: Verify Crop Details" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/crops?soil=loamy&season=monsoon&temp=28" -Method GET -TimeoutSec 10
    $crop = $response.results[0]
    if ($crop.name -and $crop.score -and $crop.suitableSoils -and $crop.seasons) {
        Write-Host "  PASS - Crop has complete information" -ForegroundColor Green
        Write-Host "    Name: $($crop.name)" -ForegroundColor White
        Write-Host "    Score: $($crop.score)" -ForegroundColor White
        Write-Host "    Suitable Soils: $($crop.suitableSoils -join ', ')" -ForegroundColor White
        Write-Host "    Seasons: $($crop.seasons -join ', ')" -ForegroundColor White
        Write-Host "    Temp Range: $($crop.minTemp)C - $($crop.maxTemp)C" -ForegroundColor White
        Write-Host "    Water Requirement: $($crop.waterRequirement)" -ForegroundColor White
        Write-Host "    Market Demand: $($crop.marketDemand)" -ForegroundColor White
        $passed++
    } else {
        Write-Host "  FAIL - Missing crop information" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  FAIL - $_" -ForegroundColor Red
    $failed++
}

# Test 7: Scoring reasons check
Write-Host "`nTest 7: Verify Scoring Reasons" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/crops?soil=loamy&season=monsoon&temp=28" -Method GET -TimeoutSec 10
    $crop = $response.results[0]
    if ($crop.reasons -and $crop.reasons.Count -gt 0) {
        Write-Host "  PASS - Crop has scoring reasons" -ForegroundColor Green
        Write-Host "  Scoring Breakdown:" -ForegroundColor Cyan
        $crop.reasons | ForEach-Object {
            Write-Host "    - $_" -ForegroundColor White
        }
        $passed++
    } else {
        Write-Host "  FAIL - No scoring reasons provided" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  FAIL - $_" -ForegroundColor Red
    $failed++
}

# Test 8: Test with extreme temperature
Write-Host "`nTest 8: Extreme Temperature (High)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/crops?soil=loamy&season=summer&temp=42" -Method GET -TimeoutSec 10
    if ($response.success) {
        Write-Host "  PASS - System handles extreme temperature" -ForegroundColor Green
        if ($response.results.Count -gt 0) {
            Write-Host "  Found $($response.results.Count) heat-tolerant crops" -ForegroundColor Cyan
        } else {
            Write-Host "  No crops suitable for extreme heat (expected)" -ForegroundColor DarkYellow
        }
        $passed++
    } else {
        Write-Host "  FAIL - Error handling extreme temperature" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  FAIL - $_" -ForegroundColor Red
    $failed++
}

# Test 9: Test with low temperature
Write-Host "`nTest 9: Low Temperature (Cold)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/crops?soil=loamy&season=winter&temp=5" -Method GET -TimeoutSec 10
    if ($response.success) {
        Write-Host "  PASS - System handles low temperature" -ForegroundColor Green
        if ($response.results.Count -gt 0) {
            Write-Host "  Found $($response.results.Count) cold-tolerant crops" -ForegroundColor Cyan
        } else {
            Write-Host "  No crops suitable for extreme cold (expected)" -ForegroundColor DarkYellow
        }
        $passed++
    } else {
        Write-Host "  FAIL - Error handling low temperature" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  FAIL - $_" -ForegroundColor Red
    $failed++
}

# Test 10: Test ranking system
Write-Host "`nTest 10: Verify Ranking System" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/crops?soil=loamy&season=monsoon&temp=28" -Method GET -TimeoutSec 10
    $rankings = $response.results | ForEach-Object { $_.rank }
    $expectedRankings = 1..$response.results.Count
    $isCorrect = $true
    for ($i = 0; $i -lt $rankings.Count; $i++) {
        if ($rankings[$i] -ne ($i + 1)) {
            $isCorrect = $false
            break
        }
    }
    if ($isCorrect) {
        Write-Host "  PASS - Rankings are sequential (1, 2, 3...)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  FAIL - Rankings are not sequential" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  FAIL - $_" -ForegroundColor Red
    $failed++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Tests: $($passed + $failed)" -ForegroundColor White
Write-Host "Passed:      $passed" -ForegroundColor Green
Write-Host "Failed:      $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "Success Rate: $([math]::Round(($passed / ($passed + $failed)) * 100, 2))%" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })
Write-Host "========================================`n" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "Crop Recommendation System is FULLY FUNCTIONAL" -ForegroundColor Green
} else {
    Write-Host "SOME TESTS FAILED" -ForegroundColor Red
    Write-Host "Review the failures above for details" -ForegroundColor Yellow
}
