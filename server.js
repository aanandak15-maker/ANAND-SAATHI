/**
 * Anand Saathi Secure Backend Server
 * Handles authentication, API keys, and secure endpoints
 * ES Module version for modern Node.js
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import * as Sentry from '@sentry/node';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.server
dotenv.config({ path: '.env.server' });

// Initialize Sentry for error reporting (simplified)
Sentry.init({
  dsn: process.env.SENTRY_DSN || 'https://your-sentry-dsn@sentry.io/project-id',
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  environment: process.env.NODE_ENV || 'development',
  release: process.env.npm_package_version || '1.0.0',
});

const app = express();
const PORT = process.env.PORT || 3000;

// Configure winston logger for structured logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'anand-saathi-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// If we're not in production then log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  logger.info('Request started', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.supabase.co", "https://earthengine.googleapis.com"],
    },
  },
}));

// CORS configuration - Allow both ports for development
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5180', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Supabase client (server-side)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  logger.info('Health check requested', {
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Secure API keys endpoint with enhanced logging
app.get('/api/keys/maps', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Unauthorized API key request', { ip: req.ip, userAgent: req.get('User-Agent') });
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn('Invalid token for API key request', { error: error?.message, ip: req.ip });
      return res.status(401).json({ error: 'Invalid token' });
    }

    logger.info('API key served successfully', {
      userId: user.id,
      email: user.email,
      keyType: 'google-maps'
    });

    // Only serve API key to authenticated users
    res.json({
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
    });
  } catch (error) {
    logger.error('Error serving API keys', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Secure Earth Engine API key
app.get('/api/keys/earth-engine', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({
      geeApiKey: process.env.GEE_API_KEY,
      geeProjectId: process.env.GEE_PROJECT_ID
    });
  } catch (error) {
    logger.error('Error serving Earth Engine keys:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Secure weather API keys
app.get('/api/keys/weather', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({
      openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
      weatherApiKey: process.env.WEATHERAPI_KEY
    });
  } catch (error) {
    logger.error('Error serving weather keys:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Field analysis endpoint with validation
app.post('/api/fields/analyze', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { fieldId, boundary, cropType } = req.body;

    // Input validation
    if (!fieldId || !boundary || !boundary.coordinates) {
      return res.status(400).json({ error: 'Invalid field data provided' });
    }

    // Call Supabase function for analysis
    const { data, error: analysisError } = await supabase.functions.invoke('gee-analysis', {
      body: { fieldId, boundary, cropType }
    });

    if (analysisError) {
      logger.error('Analysis error:', analysisError);
      return res.status(500).json({ error: 'Analysis failed' });
    }

    res.json({
      success: true,
      analysisId: data.analysisId,
      results: data.results,
      recommendations: data.recommendations
    });

  } catch (error) {
    logger.error('Field analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User profile endpoint
app.get('/api/user/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      logger.error('Profile fetch error:', profileError);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        profile: profile || null
      }
    });

  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Auth middleware for protected routes
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Protected routes
app.get('/api/dashboard', requireAuth, (req, res) => {
  res.json({
    message: 'Welcome to your secure dashboard',
    user: req.user.email,
    timestamp: new Date().toISOString()
  });
});

// Enhanced error handling middleware with Sentry integration
app.use((err, req, res, next) => {
  logger.error('Unhandled error occurred', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Send error to Sentry
  Sentry.captureException(err, {
    tags: {
      url: req.url,
      method: req.method,
      ip: req.ip
    },
    user: req.user || null
  });

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Fields API endpoints
app.get('/api/fields', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get fields for the authenticated user
    const { data: fields, error: fieldsError } = await supabase
      .from('fields')
      .select('*')
      .eq('user_id', user.id);

    if (fieldsError) {
      logger.error('Error fetching fields:', fieldsError);
      return res.status(500).json({ error: 'Failed to fetch fields' });
    }

    res.json({ success: true, data: fields || [] });
  } catch (error) {
    logger.error('Error in fields endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/fields', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const fieldData = { ...req.body, user_id: user.id };

    const { data: field, error: fieldError } = await supabase
      .from('fields')
      .insert(fieldData)
      .select()
      .single();

    if (fieldError) {
      logger.error('Error creating field:', fieldError);
      return res.status(500).json({ error: 'Failed to create field' });
    }

    res.json({ success: true, data: field });
  } catch (error) {
    logger.error('Error in create field endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  logger.info('Anand Saathi Backend Server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

export default app;
