# VelocityEdge - Quick Start Script (Windows)
# Run with: .\start.ps1

Write-Host "🚀 Starting VelocityEdge..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📦 Building and starting services..." -ForegroundColor Cyan
docker-compose up --build -d

# Wait for services to be ready
Write-Host ""
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if services are running
$services = docker-compose ps
if ($services -match "Up") {
    Write-Host ""
    Write-Host "✅ All services are running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Dashboard:      http://localhost:3001" -ForegroundColor Cyan
    Write-Host "⚡ Varnish Cache:  http://localhost:8080" -ForegroundColor Magenta
    Write-Host "🔧 Backend API:    http://localhost:3000" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opening dashboard in browser..." -ForegroundColor Cyan
    
    # Open browser
    Start-Process "http://localhost:3001"
    
    Write-Host ""
    Write-Host "📜 View logs with:    docker-compose logs -f" -ForegroundColor White
    Write-Host "🛑 Stop services with: docker-compose down" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Error: Services failed to start" -ForegroundColor Red
    Write-Host "Check logs with: docker-compose logs" -ForegroundColor Yellow
    exit 1
}
