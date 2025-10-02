# TimesFM AI Service Dockerfile
FROM ubuntu:22.04

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV TIMESFM_VERBOSITY=0

# Install system dependencies for ARM64
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3-pip \
    python3.10-venv \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Check if python3 and python3.10 are different, create symlink only if needed
RUN if [ "$(readlink -f /usr/bin/python3)" != "$(readlink -f /usr/bin/python3.10)" ]; then \
        ln -sf /usr/bin/python3 /usr/bin/python3.10; \
    fi

# Create non-root user
RUN useradd --create-home --shell /bin/bash timesfm
USER timesfm
WORKDIR /home/timesfm/app

# Copy requirements first for better caching
COPY --chown=timesfm:timesfm requirements.basic.txt ./requirements.txt

# Create virtual environment
RUN python3.10 -m venv venv
ENV PATH="/home/timesfm/app/venv/bin:$PATH"

# Upgrade pip and install requirements
RUN pip install --upgrade pip setuptools wheel

# Install numpy and scipy first (base dependencies)
RUN pip install --no-cache-dir numpy==1.24.3 scipy==1.11.3

# Install remaining dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code (using simulation service for now)
COPY --chown=timesfm:timesfm simulate-service.py ./service.py

# Create cache directory
RUN mkdir -p cache && chmod 755 cache

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start the service
CMD ["python3", "service.py"]
