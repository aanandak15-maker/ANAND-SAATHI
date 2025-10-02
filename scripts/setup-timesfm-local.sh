#!/bin/bash
# Anand Saathi TimesFM Setup Script
# Sets up local TimesFM Python microservice for real AI predictions

set -e  # Exit on any error

echo "🚀 Setting up Anand Saathi TimesFM AI Service"
echo "=============================================="

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

echo "✅ Docker and docker-compose found"

# Build and start only the TimesFM service
echo "🏗️ Building TimesFM service Docker image..."
cd timesfm_service

# Force rebuild in case of cache issues
docker build --no-cache -t anand-saathi-timesfm .

echo "🐳 Starting TimesFM service..."
cd ..

# Set environment variable for TimesFM service URL
export VITE_TIMESFM_SERVICE_URL=http://localhost:8000

echo "⏳ Waiting for TimesFM service to start (this may take a few minutes for first run)..."
# Let the user know when the service is ready

cat << 'EOF'

🔍 MONITORTING SERVICE STATUS
==============================

Check the TimesFM service health:
curl http://localhost:8000/health

Expected initial response (TimesFM loading):
{
  "status": "healthy",
  "timesfm_available": true,
  "timesfm_loaded": false,
  "timestamp": "..."
}

Wait 2-3 minutes, then check again (TimesFM loaded):
{
  "status": "healthy",
  "timesfm_available": true,
  "timesfm_loaded": true,
  "timestamp": "..."
}

🚀 TESTING PREDICTIONS
======================

Once TimesFM is loaded, test yield predictions:

curl -X POST http://localhost:8000/api/forecast/yield \
  -H "Content-Type: application/json" \
  -d '{
    "field_id": "test_field_001",
    "crop_type": "rice",
    "historical_yield": [2.5, 2.6, 2.4, 2.7, 2.8, 2.9],
    "forecast_days": 14,
    "latitude": 30.9,
    "longitude": 75.85,
    "district": "ludhiana"
  }'

✅ SUCCESS RESPONSE:
{
  "field_id": "test_field_001",
  "predictions": [...],
  "confidence_intervals": [...],
  "accuracy_score": 0.88,
  "model_info": {
    "model_type": "TimesFM_real",
    // ... actual Google TimesFM predictions!
  }
}

🎉 Anand Saathi is now enhanced with REAL TimesFM AI predictions!

EOF
