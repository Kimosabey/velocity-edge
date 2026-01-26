# VelocityEdge - Cache Performance Test Script (Windows)
# Run with: .\test-cache.ps1

$VARNISH_URL = "http://localhost:8080"
$BACKEND_URL = "http://localhost:3000"

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   VelocityEdge - Cache Performance Test                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Test 1: Cache MISS
Write-Host "📝 Test 1: First Request (Cache MISS)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$StartTime = Get-Date
try {
    $response = Invoke-WebRequest -Uri "$VARNISH_URL/api/fast-data" -Headers @{"Cache-Control"="no-cache"} -UseBasicParsing
    $EndTime = Get-Date
    $MissTime = ($EndTime - $StartTime).TotalMilliseconds
    
    $cacheStatus = $response.Headers["X-Cache"]
    Write-Host "Status: $cacheStatus" -ForegroundColor $(if ($cacheStatus -eq "MISS") { "Red" } else { "Yellow" })
    Write-Host "Response Time: $([math]::Round($MissTime, 2))ms" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error: Could not connect to Varnish" -ForegroundColor Red
    Write-Host "Make sure services are running: docker-compose ps" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Start-Sleep -Seconds 2

# Test 2: Cache HIT
Write-Host "📝 Test 2: Second Request (Cache HIT)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$StartTime = Get-Date
$response = Invoke-WebRequest -Uri "$VARNISH_URL/api/fast-data" -UseBasicParsing
$EndTime = Get-Date
$HitTime = ($EndTime - $StartTime).TotalMilliseconds

$cacheStatus = $response.Headers["X-Cache"]
$cacheHits = $response.Headers["X-Cache-Hits"]

Write-Host "Status: $cacheStatus" -ForegroundColor $(if ($cacheStatus -eq "HIT") { "Green" } else { "Yellow" })
Write-Host "Response Time: $([math]::Round($HitTime, 2))ms" -ForegroundColor Cyan
if ($cacheHits) {
    Write-Host "Cache Hits: $cacheHits" -ForegroundColor Green
}

Write-Host ""

# Calculate improvement
if ($MissTime -gt 0) {
    $Improvement = [math]::Round((($MissTime - $HitTime) / $MissTime) * 100, 2)
    
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                 Performance Summary                     ║" -ForegroundColor Cyan
    Write-Host "╠════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
    Write-Host "║  Cache MISS:     $([math]::Round($MissTime, 2))ms                           ║" -ForegroundColor Red
    Write-Host "║  Cache HIT:      $([math]::Round($HitTime, 2))ms                             ║" -ForegroundColor Green
    Write-Host "║  Improvement:    $Improvement%                          ║" -ForegroundColor Yellow
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
}

Write-Host ""

# Test 3: Multiple Requests
Write-Host "📝 Test 3: Burst Test (10 Rapid Requests)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$times = @()
for ($i = 1; $i -le 10; $i++) {
    $StartTime = Get-Date
    $response = Invoke-WebRequest -Uri "$VARNISH_URL/api/fast-data" -UseBasicParsing
    $EndTime = Get-Date
    $time = ($EndTime - $StartTime).TotalMilliseconds
    $times += $time
    
    $cacheStatus = $response.Headers["X-Cache"]
    $color = if ($cacheStatus -eq "HIT") { "Green" } else { "Red" }
    Write-Host "  Request $i : $([math]::Round($time, 2))ms ($cacheStatus)" -ForegroundColor $color
}

$avgTime = ($times | Measure-Object -Average).Average
$minTime = ($times | Measure-Object -Minimum).Minimum
$maxTime = ($times | Measure-Object -Maximum).Maximum

Write-Host ""
Write-Host "Average: $([math]::Round($avgTime, 2))ms | Min: $([math]::Round($minTime, 2))ms | Max: $([math]::Round($maxTime, 2))ms" -ForegroundColor Cyan

Write-Host ""
Write-Host "✅ Testing complete!" -ForegroundColor Green
Write-Host ""
Write-Host "View detailed metrics at: http://localhost:3001" -ForegroundColor Yellow
