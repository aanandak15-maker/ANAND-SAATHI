#!/bin/bash

echo "🚀 Starting TimesFM Integration with Docker"
echo "============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Build and start TimesFM service
echo "🔧 Building TimesFM API service..."
docker-compose up -d timesfm-api

# Wait for TimesFM service to be ready
echo "⏳ Waiting for TimesFM service to be ready..."
sleep 30

# Check if TimesFM service is healthy
echo "🔍 Checking TimesFM service health..."
for i in {1..10}; do
    if curl -f http://localhost:8001/health > /dev/null 2>&1; then
        echo "✅ TimesFM service is ready!"
        break
    else
        echo "⏳ Waiting for TimesFM service... (attempt $i/10)"
        sleep 10
    fi
done

# Build and start Anand Saathi
echo "🔧 Building Anand Saathi application..."
docker-compose up -d anand-saathi

# Wait for Anand Saathi to be ready
echo "⏳ Waiting for Anand Saathi to be ready..."
sleep 20

# Check if Anand Saathi is ready
echo "🔍 Checking Anand Saathi health..."
for i in {1..5}; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Anand Saathi is ready!"
        break
    else
        echo "⏳ Waiting for Anand Saathi... (attempt $i/5)"
        sleep 10
    fi
done

echo ""
echo "🎉 TimesFM Integration is running!"
echo "=================================="
echo "📊 TimesFM API: http://localhost:8001"
echo "🌾 Anand Saathi: http://localhost:3000"
echo ""
echo "📋 Available endpoints:"
echo "  - GET  http://localhost:8001/health"
echo "  - POST http://localhost:8001/forecast/weather"
echo "  - POST http://localhost:8001/forecast/yield"
echo "  - POST http://localhost:8001/forecast/market"
echo "  - POST http://localhost:8001/forecast/comprehensive"
echo ""
echo "🔧 To stop the services:"
echo "  docker-compose down"
echo ""
echo "📊 To view logs:"
echo "  docker-compose logs -f timesfm-api"
echo "  docker-compose logs -f anand-saathi"

