/**
 * Google Maps React Hook
 * Custom hook for managing Google Maps integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_CONFIG, createMapLoader, coordinateUtils } from '@/lib/googleMapsConfig';

// Declare google.maps types for TypeScript
declare global {
  interface Window {
    google: any;
  }
}

interface MapInstance {
  map: any;
  drawingManager: any;
  markers: any[];
  polygons: any[];
  isLoaded: boolean;
  error: string | null;
}

interface UseGoogleMapsOptions {
  center?: { lat: number; lng: number };
  zoom?: number;
  mapTypeId?: string;
  enableDrawing?: boolean;
  enabled?: boolean; // Only initialize when enabled
  onMapClick?: (event: any) => void;
  onPolygonComplete?: (polygon: any) => void;
  onMarkerComplete?: (marker: any) => void;
}

export const useGoogleMaps = (options: UseGoogleMapsOptions = {}) => {
  const [mapInstance, setMapInstance] = useState<MapInstance>({
    map: null,
    drawingManager: null,
    markers: [],
    polygons: [],
    isLoaded: false,
    error: null
  });
  const [initAttempts, setInitAttempts] = useState(0);

  const mapRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<Loader | null>(null);

  // Initialize Google Maps
  const initializeMap = useCallback(async () => {
    // Don't initialize if not enabled
    if (!options.enabled) {
      return;
    }

    // Don't initialize if already loaded or loading
    if (mapInstance.isLoaded || mapInstance.error) {
      return;
    }

    // Limit initialization attempts
    if (initAttempts >= 5) {
      console.log('Max initialization attempts reached');
      setMapInstance(prev => ({ ...prev, error: 'Max initialization attempts reached' }));
      return;
    }

    // Wait for DOM element to be available
    if (!mapRef.current) {
      console.log(`Map ref not ready, attempt ${initAttempts + 1}/5`);
      setInitAttempts(prev => prev + 1);
      return;
    }

    try {
      // Create loader if not exists
      if (!loaderRef.current) {
        loaderRef.current = new Loader(createMapLoader());
      }

      // Load Google Maps API
      await loaderRef.current.load();

      // Wait for Google Maps to be available
      if (!window.google || !window.google.maps) {
        throw new Error('Google Maps API not loaded');
      }

      // Double-check DOM element is still available
      if (!mapRef.current) {
        throw new Error('Map container element not available');
      }

      // Create map instance
      const map = new window.google.maps.Map(mapRef.current, {
        center: options.center || GOOGLE_MAPS_CONFIG.defaultCenter,
        zoom: options.zoom || GOOGLE_MAPS_CONFIG.defaultZoom,
        mapTypeId: options.mapTypeId || window.google.maps.MapTypeId.SATELLITE,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        scaleControl: true,
        rotateControl: false,
        clickableIcons: false,
        gestureHandling: 'greedy'
      });

      // Create drawing manager if enabled (DISABLED due to deprecation)
      let drawingManager: any = null;
      
      if (options.enableDrawing) {
        console.log('Drawing functionality disabled due to Google Maps API deprecation');
        // Drawing manager disabled due to Google Maps API deprecation
        // All drawing functionality moved to custom drawing hook
      }

      // Add map click listener
      if (options.onMapClick) {
        map.addListener('click', options.onMapClick);
      }

      // Update map instance
      setMapInstance({
        map,
        drawingManager,
        markers: [],
        polygons: [],
        isLoaded: true,
        error: null
      });

    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      setMapInstance(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load Google Maps',
        isLoaded: false
      }));
    }
  }, [options]);

  // Load map on mount with proper timing
  useEffect(() => {
    if (options.enabled) {
      // Use a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        initializeMap();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [options.enabled, initializeMap]);

  // Try to initialize when the ref becomes available
  useEffect(() => {
    if (options.enabled && mapRef.current && !mapInstance.isLoaded && !mapInstance.error && initAttempts < 5) {
      const timer = setTimeout(() => {
        initializeMap();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [options.enabled, mapRef.current, mapInstance.isLoaded, mapInstance.error, initAttempts, initializeMap]);

  // Utility functions
  const addMarker = useCallback((position: { lat: number; lng: number }, title?: string) => {
    if (!mapInstance.map || !window.google) return null;

    const marker = new window.google.maps.Marker({
      position,
      map: mapInstance.map,
      title: title || 'Field Marker',
      draggable: true,
      animation: window.google.maps.Animation.DROP
    });

    setMapInstance(prev => ({
      ...prev,
      markers: [...prev.markers, marker]
    }));

    return marker;
  }, [mapInstance.map]);

  const addPolygon = useCallback((coordinates: Array<{ lat: number; lng: number }>, options?: any) => {
    if (!mapInstance.map || !window.google) return null;

    const polygon = new window.google.maps.Polygon({
      paths: coordinates,
      map: mapInstance.map,
      fillColor: options?.fillColor || '#4CAF50',
      fillOpacity: options?.fillOpacity || 0.3,
      strokeColor: options?.strokeColor || '#4CAF50',
      strokeOpacity: options?.strokeOpacity || 0.8,
      strokeWeight: options?.strokeWeight || 2,
      clickable: true,
      editable: true,
      draggable: true,
      ...options
    });

    setMapInstance(prev => ({
      ...prev,
      polygons: [...prev.polygons, polygon]
    }));

    return polygon;
  }, [mapInstance.map]);

  const clearAll = useCallback(() => {
    // Clear markers
    mapInstance.markers.forEach(marker => marker.setMap(null));
    
    // Clear polygons
    mapInstance.polygons.forEach(polygon => polygon.setMap(null));
    
    setMapInstance(prev => ({
      ...prev,
      markers: [],
      polygons: []
    }));
  }, [mapInstance.markers, mapInstance.polygons]);

  const fitBounds = useCallback((coordinates: Array<{ lat: number; lng: number }>) => {
    if (!mapInstance.map || !window.google || coordinates.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    coordinates.forEach(coord => bounds.extend(coord));
    mapInstance.map.fitBounds(bounds);
  }, [mapInstance.map]);

  const getCurrentLocation = useCallback(() => {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }, []);

  const calculateArea = useCallback((coordinates: Array<{ lat: number; lng: number }>) => {
    return coordinateUtils.calculatePolygonArea(coordinates);
  }, []);

  const calculateDistance = useCallback((point1: { lat: number; lng: number }, point2: { lat: number; lng: number }) => {
    return coordinateUtils.calculateDistance(point1.lat, point1.lng, point2.lat, point2.lng);
  }, []);

  // Manual initialization function
  const forceInitialize = useCallback(() => {
    if (mapRef.current && !mapInstance.isLoaded) {
      setInitAttempts(0); // Reset attempts
      setMapInstance(prev => ({ ...prev, error: null })); // Clear any previous errors
      initializeMap();
    }
  }, [mapRef.current, mapInstance.isLoaded, initializeMap]);

  return {
    mapRef,
    mapInstance,
    addMarker,
    addPolygon,
    clearAll,
    fitBounds,
    getCurrentLocation,
    calculateArea,
    calculateDistance,
    initializeMap,
    forceInitialize
  };
};

export default useGoogleMaps;