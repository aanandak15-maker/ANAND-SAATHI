// Security Configuration for Anand Saathi
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Security configuration
const SecurityConfig = {
  // API Keys - Move to environment variables
  API_KEYS: {
    GOOGLE_MAPS: process.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBZlJtstGEj9wCMP5_O5PaGytIi-iForN0',
    WEATHER: process.env.VITE_WEATHER_API_KEY || '623822e31715b644264f0f606c4a9952',
    OPENWEATHER: process.env.VITE_OPENWEATHER_API_KEY || '623822e31715b644264f0f606c4a9952',
  },

  // Rate limiting configuration
  RATE_LIMITS: {
    API: rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    }),
    
    FORECAST: rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 10, // limit each IP to 10 forecast requests per minute
      message: 'Too many forecast requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    }),
    
    AUTH: rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 auth requests per 15 minutes
      message: 'Too many authentication attempts, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    })
  },

  // CORS configuration
  CORS: {
    development: {
      origin: ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true,
      optionsSuccessStatus: 200
    },
    production: {
      origin: ['https://anandsaathi.com', 'https://www.anandsaathi.com'],
      credentials: true,
      optionsSuccessStatus: 200
    }
  },

  // Helmet configuration
  HELMET: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://maps.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https://api.openweathermap.org", "https://maps.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false
  },

  // Input validation patterns
  VALIDATION: {
    FIELD_ID: /^[a-zA-Z0-9-_]{3,50}$/,
    CROP_TYPE: /^(rice|wheat|cotton|sugarcane|maize)$/,
    COORDINATES: {
      LAT: /^-?([1-8]?[0-9](\.[0-9]+)?|90(\.0+)?)$/,
      LNG: /^-?((1[0-7][0-9])|([1-9]?[0-9]))(\.[0-9]+)?$/
    },
    HORIZON: /^[1-365]$/
  },

  // Environment-based configuration
  getCorsConfig: () => {
    return process.env.NODE_ENV === 'production' 
      ? SecurityConfig.CORS.production 
      : SecurityConfig.CORS.development;
  },

  // Security middleware setup
  setupSecurity: (app) => {
    // Helmet for security headers
    app.use(helmet(SecurityConfig.HELMET));
    
    // CORS
    app.use(cors(SecurityConfig.getCorsConfig()));
    
    // Rate limiting
    app.use('/api/', SecurityConfig.RATE_LIMITS.API);
    app.use('/api/forecast/', SecurityConfig.RATE_LIMITS.FORECAST);
    app.use('/api/auth/', SecurityConfig.RATE_LIMITS.AUTH);
    
    // Request logging
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  },

  // Input validation helpers
  validateInput: {
    fieldId: (fieldId) => SecurityConfig.VALIDATION.FIELD_ID.test(fieldId),
    cropType: (cropType) => SecurityConfig.VALIDATION.CROP_TYPE.test(cropType),
    coordinates: (lat, lng) => 
      SecurityConfig.VALIDATION.COORDINATES.LAT.test(lat) && 
      SecurityConfig.VALIDATION.COORDINATES.LNG.test(lng),
    horizon: (horizon) => SecurityConfig.VALIDATION.HORIZON.test(horizon.toString())
  }
};

module.exports = SecurityConfig;
