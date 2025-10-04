FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY simple_requirements.txt .
RUN pip install --no-cache-dir -r simple_requirements.txt

# Copy application code
COPY . .

# Create models directory
RUN mkdir -p /app/models

# Note: TimesFM models will be loaded at runtime
# For now, we'll use a simplified forecasting approach

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Run the API server
CMD ["python", "api_server.py"]
