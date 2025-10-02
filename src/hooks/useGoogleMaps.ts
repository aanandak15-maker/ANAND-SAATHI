/**
 * Google Maps React Hook
 * Custom hook for managing Google Maps integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { loadGoogleMaps } from '@/lib/googleMapsLoader';
import { GOOGLE_MAPS_CONFIG, coordinateUtils } from '@/lib/googleMapsConfig';

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

  // Load Google Maps script directly

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
      console.log('Loading Google Maps API...');
      console.log('API Key:', GOOGLE_MAPS_CONFIG.apiKey ? 'Set' : 'Not set');

      // Load Google Maps script using centralized loader
      await loadGoogleMaps();

      console.log('Google Maps API loaded successfully');

      // Double-check DOM element is still available
      if (!mapRef.current) {
        throw new Error('Map container element not available');
      }

      // Create map instance
      const map = new window.google.maps.Map(mapRef.current, {
        center: options.center || GOOGLE_MAPS_CONFIG.defaultCenter,
        zoom: options.zoom || GOOGLE_MAPS_CONFIG.defaultZoom,
        mapTypeId: 'satellite',
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        scaleControl: true,
        rotateControl: false,
        clickableIcons: false,
        gestureHandling: 'greedy'
      });

      // Force satellite view and refresh
      console.log('Setting satellite view...');
      map.setMapTypeId('satellite');

      // Force a map refresh after initialization
      setTimeout(() => {
        window.google.maps.event.trigger(map, 'resize');
        console.log('Map refreshed with satellite view');
      }, 1000);

      // Create drawing manager if enabled (ENABLED - Google Maps drawing is fully supported)
      let drawingManager: any = null;

      if (options.enableDrawing) {
        console.log('Initializing Google Maps Drawing Manager...');

        try {
          // Verify drawing library is available
          if (!window.google?.maps?.drawing?.DrawingManager) {
            console.error('❌ Google Maps Drawing library not available');
            console.log('Available APIs:', Object.keys(window.google?.maps || {}));
          } else {
            drawingManager = new window.google.maps.drawing.DrawingManager({
              drawingMode: null,
              drawingControl: true, // Enable drawing controls on map
              drawingControlOptions: {
                position: window.google.maps.ControlPosition.TOP_LEFT,
                drawingModes: [
                  window.google.maps.drawing.OverlayType.POLYGON,
                  window.google.maps.drawing.OverlayType.RECTANGLE
                ]
              },
              polygonOptions: {
                fillColor: '#2196F3',
                strokeColor: '#1976D2',
                fillOpacity: 0.3,
                strokeWeight: 3,
                clickable: true,
                editable: true,
                draggable: true,
                zIndex: 1
              },
              rectangleOptions: {
                fillColor: '#4CAF50',
                strokeColor: '#388E3C',
                fillOpacity: 0.3,
                strokeWeight: 3,
                clickable: true,
                editable: true,
                draggable: true,
                zIndex: 1
              }
            });

            drawingManager.setMap(map);

            // Add event listeners for shape completion
            drawingManager.addListener('polygoncomplete', (polygon: any) => {
              console.log('🎯 Polygon completed via Drawing Manager');

              // Calculate area using Google Maps
              const areaInSquareMeters = window.google.maps.geometry.spherical.computeArea(polygon.getPath());
              const areaInAcres = areaInSquareMeters / 4046.8564224; // Accurate conversion

              console.log(`📐 ${areaInAcres.toFixed(3)} acres calculated`);

              // Convert to our format
              const coordinates = polygon.getPath().getArray().map((point: any) => ({
                lat: point.lat(),
                lng: point.lng()
              }));

              // Notify parent component
              if (options.onPolygonComplete) {
                const shapeData = {
                  type: 'polygon' as const,
                  points: coordinates,
                  area: areaInAcres,
                  path: polygon.getPath()
                };
                options.onPolygonComplete(polygon);
              }
            });

            drawingManager.addListener('rectanglecomplete', (rectangle: any) => {
              console.log('🎯 Rectangle completed via Drawing Manager');

              // For rectangle, we need to get the area differently
              const bounds = rectangle.getBounds();
              const areaInSquareMeters = window.google.maps.geometry.spherical.computeArea([
                bounds.getNorthEast(),
                bounds.getSouthEast(),
                bounds.getSouthWest(),
                bounds.getNorthWest()
              ]);
              const areaInAcres = areaInSquareMeters / 4046.8564224;

              console.log(`📐 Rectangle: ${areaInAcres.toFixed(3)} acres calculated`);

              // Notify parent component
              if (options.onPolygonComplete) {
                options.onPolygonComplete(rectangle);
              }
            });

            console.log('✅ Drawing Manager initialized successfully');
            console.log('🎨 Available drawing tools: Polygon, Rectangle');
          }
        } catch (error) {
          console.error('❌ Error initializing Drawing Manager:', error);
          drawingManager = null;
        }
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
      console.error('Google Maps status at error:', {
        hasGoogle: !!window.google,
        hasMaps: !!(window.google && window.google.maps),
        hasMapClass: !!(window.google && window.google.maps && window.google.maps.Map),
        apiKeySet: !!GOOGLE_MAPS_CONFIG.apiKey
      });

      setMapInstance(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Unknown error' }));
    }
  }, [options, GOOGLE_MAPS_CONFIG, initAttempts, mapInstance.isLoaded, mapInstance.error, mapRef]);

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
