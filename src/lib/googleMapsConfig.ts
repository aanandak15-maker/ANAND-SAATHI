/**
 * Google Maps Configuration
 * Centralized configuration for Google Maps integration
 */

import { API_KEYS } from '@/config/apiKeys';

export const GOOGLE_MAPS_CONFIG = {
  // Google Maps API Key from configuration - uses development key for local dev
  apiKey: API_KEYS.GOOGLE_MAPS.DEFAULT,
  
  // Default map settings
  defaultCenter: {
    lat: 30.9010, // Punjab, India coordinates
    lng: 75.8573
  },
  
  defaultZoom: 15,
  
  // Map styles
  mapStyles: {
    satellite: 'satellite',
    roadmap: 'roadmap',
    hybrid: 'hybrid',
    terrain: 'terrain'
  },
  
  // Drawing tools configuration
  drawingModes: {
    polygon: 'polygon',
    rectangle: 'rectangle',
    circle: 'circle',
    marker: 'marker'
  },
  
  // Field mapping specific settings
  fieldMapping: {
    minArea: 0.1, // Minimum field area in acres
    maxArea: 1000, // Maximum field area in acres
    precision: 6, // Decimal precision for coordinates
    snapToRoads: true, // Snap to roads for better accuracy
  },
  
  // Vegetation indices settings
  vegetationIndices: {
    ndvi: {
      name: 'NDVI',
      description: 'Normalized Difference Vegetation Index',
      range: [-1, 1],
      colors: ['red', 'yellow', 'green']
    },
    msavi2: {
      name: 'MSAVI2',
      description: 'Modified Soil Adjusted Vegetation Index',
      range: [-1, 1],
      colors: ['brown', 'yellow', 'green']
    }
  }
};

export const MAP_CONSTANTS = {
  // Punjab, India bounds
  PUNJAB_BOUNDS: {
    north: 32.5,
    south: 29.5,
    east: 76.5,
    west: 73.5
  },
  
  // Default field colors
  FIELD_COLORS: {
    active: '#4CAF50',
    inactive: '#9E9E9E',
    selected: '#2196F3',
    boundary: '#FF5722'
  },
  
  // Map controls
  CONTROLS: {
    zoom: true,
    mapType: true,
    scale: true,
    streetView: false,
    rotate: false,
    fullscreen: true
  }
};

// Google Maps API loader configuration
export const createMapLoader = () => {
  return {
    apiKey: GOOGLE_MAPS_CONFIG.apiKey,
    version: 'weekly',
    libraries: ['geometry', 'places', 'visualization', 'drawing'], // Include drawing library for custom drawing
    language: 'en',
    region: 'IN'
  };
};

// Utility functions for coordinate conversion
export const coordinateUtils = {
  // Convert degrees to meters (approximate)
  degreesToMeters: (lat: number, lng: number) => {
    const R = 6371000; // Earth's radius in meters
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;
    
    return {
      x: R * Math.cos(latRad) * lngRad,
      y: R * latRad
    };
  },
  
  // Calculate distance between two points
  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  },
  
  // Calculate area of a polygon
  calculatePolygonArea: (coordinates: Array<{lat: number, lng: number}>) => {
    if (coordinates.length < 3) return 0;
    
    let area = 0;
    const R = 6371000; // Earth's radius in meters
    
    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length;
      const lat1 = (coordinates[i].lat * Math.PI) / 180;
      const lng1 = (coordinates[i].lng * Math.PI) / 180;
      const lat2 = (coordinates[j].lat * Math.PI) / 180;
      const lng2 = (coordinates[j].lng * Math.PI) / 180;
      
      area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    
    area = Math.abs(area * R * R / 2);
    return area / 4046.86; // Convert to acres
  }
};

export default GOOGLE_MAPS_CONFIG;
