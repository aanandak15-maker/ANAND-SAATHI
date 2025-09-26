/**
 * API Keys Configuration
 * Replace with your actual API keys
 */

export const API_KEYS = {
  // Google Maps API Key
  // Get from: https://console.cloud.google.com/
  GOOGLE_MAPS: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBZlJtstGEj9wCMP5_O5PaGytIi-iForN0',
  
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
