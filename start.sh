#!/bin/bash

# VelocityEdge - Quick Start Script
# This script starts all services and opens the dashboard

echo "🚀 Starting VelocityEdge..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Build and start services
echo "📦 Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✅ All services are running!"
    echo ""
    echo "📊 Dashboard: http://localhost:3001"
    echo "⚡ Varnish Cache: http://localhost:8080"
    echo "🔧 Backend API: http://localhost:3000"
    echo ""
    echo "Opening dashboard in browser..."
    
    # Open browser (cross-platform)
    if command -v xdg-open > /dev/null; then
        xdg-open http://localhost:3001
    elif command -v open > /dev/null; then
        open http://localhost:3001
    else
        start http://localhost:3001
    fi
    
    echo ""
    echo "📜 View logs with: docker-compose logs -f"
    echo "🛑 Stop services with: docker-compose down"
else
    echo ""
    echo "❌ Error: Services failed to start"
    echo "Check logs with: docker-compose logs"
    exit 1
fi
