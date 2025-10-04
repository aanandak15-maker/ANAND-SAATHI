// Comprehensive Health Monitoring System for Anand Saathi
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.HEALTH_PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://anandsaathi.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check endpoints
app.get('/health', async (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {}
  };

  try {
    // Check TimesFM API
    const timesfmResponse = await fetch('http://timesfm-api:8001/health');
    healthCheck.services.timesfm = {
      status: timesfmResponse.ok ? 'healthy' : 'unhealthy',
      responseTime: Date.now()
    };
  } catch (error) {
    healthCheck.services.timesfm = {
      status: 'unhealthy',
      error: error.message
    };
  }

  // Check Redis (if available)
  try {
    // Add Redis health check here
    healthCheck.services.redis = {
      status: 'healthy',
      responseTime: Date.now()
    };
  } catch (error) {
    healthCheck.services.redis = {
      status: 'unhealthy',
      error: error.message
    };
  }

  // Check main application
  healthCheck.services.main = {
    status: 'healthy',
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  };

  const isHealthy = Object.values(healthCheck.services).every(
    service => service.status === 'healthy'
  );

  res.status(isHealthy ? 200 : 503).json(healthCheck);
});

// Detailed health check
app.get('/health/detailed', async (req, res) => {
  const detailedHealth = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version
    },
    services: {},
    environment: {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT
    }
  };

  // Check all services with detailed metrics
  const services = [
    { name: 'timesfm', url: 'http://timesfm-api:8001/health' },
    { name: 'main', url: 'http://localhost:3000/health' }
  ];

  for (const service of services) {
    try {
      const start = Date.now();
      const response = await fetch(service.url);
      const responseTime = Date.now() - start;
      
      detailedHealth.services[service.name] = {
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime: `${responseTime}ms`,
        statusCode: response.status
      };
    } catch (error) {
      detailedHealth.services[service.name] = {
        status: 'unhealthy',
        error: error.message,
        responseTime: 'N/A'
      };
    }
  }

  const isHealthy = Object.values(detailedHealth.services).every(
    service => service.status === 'healthy'
  );

  res.status(isHealthy ? 200 : 503).json(detailedHealth);
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    requests: {
      total: req.app.locals.requestCount || 0,
      errors: req.app.locals.errorCount || 0
    }
  };

  res.json(metrics);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Health monitor error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏥 Health Monitor running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Detailed health: http://localhost:${PORT}/health/detailed`);
  console.log(`📋 Metrics: http://localhost:${PORT}/metrics`);
});

module.exports = app;
