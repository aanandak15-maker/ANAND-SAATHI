# Satellite Processing Service Dockerfile
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Create non-root user
RUN useradd --create-home --shell /bin/bash satellite
USER satellite
WORKDIR /home/satellite/app

# Copy requirements first for better caching
COPY --chown=satellite:satellite requirements.txt .

# Create virtual environment
RUN python -m venv venv
ENV PATH="/home/satellite/app/venv/bin:$PATH"

# Upgrade pip and install requirements
RUN pip install --upgrade pip setuptools wheel

# Install core dependencies (ultraminimal for API functionality)
RUN pip install --no-cache-dir \
    numpy==1.24.3

# Install FastAPI and utility libraries
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=satellite:satellite service.py .
COPY --chown=satellite:satellite __init__.py .

# Create cache directory
RUN mkdir -p satellite_cache && chmod 755 satellite_cache

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Start the service
CMD ["python", "service.py"]
