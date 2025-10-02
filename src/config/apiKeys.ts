/**
 * API Keys Configuration
 * Replace with your actual API keys
 */

export const API_KEYS = {
  // Google Maps API Keys - Separate for development and production
  GOOGLE_MAPS: {
    // Use development key for local development (no domain restrictions)
    DEVELOPMENT: import.meta.env.VITE_GOOGLE_MAPS_API_KEY_DEVELOPMENT || 'YOUR_DEV_API_KEY_HERE',
    // Use production key for production (with domain restrictions)
    PRODUCTION: import.meta.env.VITE_GOOGLE_MAPS_API_KEY_PRODUCTION || 'YOUR_PROD_API_KEY_HERE',
    // Auto-select based on environment
    DEFAULT: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY_DEVELOPMENT || 'YOUR_API_KEY_HERE'
  },

  // Weather API Key (if needed)
  WEATHER: import.meta.env.VITE_WEATHER_API_KEY || 'YOUR_WEATHER_API_KEY',

  // WhatsApp Business API Key (if needed)
  WHATSAPP: import.meta.env.VITE_WHATSAPP_API_KEY || 'YOUR_WHATSAPP_API_KEY',

  // Other API keys can be added here
};

export const API_ENDPOINTS = {
  // Backend API
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  
  // Google Maps
  GOOGLE_MAPS: 'https://maps.googleapis.com/maps/api',
  
  // Weather API
  WEATHER: 'https://api.openweathermap.org/data/2.5',
};

export default API_KEYS;
