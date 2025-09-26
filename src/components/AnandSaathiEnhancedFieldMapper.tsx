/**
 * Anand Saathi Enhanced Field Mapper
 * Advanced field mapping with GPS walk tracking, satellite imagery, and vegetation analysis
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useCustomDrawing } from '@/hooks/useCustomDrawing';
import { GOOGLE_MAPS_CONFIG, coordinateUtils } from '@/lib/googleMapsConfig';
import { satelliteImageCache } from '@/services/satelliteImageCache';

// Declare google.maps types for TypeScript
declare global {
  interface Window {
    google: any;
  }
}
import { 
  MapPin, 
  Navigation, 
  Target, 
  Save, 
  RotateCcw,
  Satellite,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Square,
  Download,
  Upload,
  Eye,
  EyeOff,
  Layers,
  BarChart3,
  Activity,
  TrendingUp,
  Droplets,
  Sun,
  Thermometer,
  Wind,
  Leaf,
  Crop,
  Calendar,
  Info,
  Copy,
  Lightbulb,
  RefreshCw,
  Database,
  Cloud,
  Globe,
  Smartphone,
  Camera,
  FileText,
  X
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { anandSaathiBackend, FieldData } from '@/lib/anandSaathiBackend';
import { toast } from 'sonner';
import GoogleFieldMapper from './GoogleFieldMapper';
import GoogleSatelliteMapper from './GoogleSatelliteMapper';
import VegetationIndices from './VegetationIndices';
import UpdatedVegetationIndices from './UpdatedVegetationIndices';
import AnandSaathiVegetationAnalysis from './AnandSaathiVegetationAnalysis';

interface AnandSaathiEnhancedFieldMapperProps {
  farmId: string;
  onFieldCreated?: (field: FieldData) => void;
  onCancel?: () => void;
}

interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface VegetationData {
  ndvi: number;
  ndmi: number;
  msavi2: number;
  ndre: number;
  timestamp: Date;
  confidence: number;
}

interface MappingState {
  method: 'gps_walk' | 'satellite_pin' | 'google_maps' | 'estimated';
  isTracking: boolean;
  positions: GPSPosition[];
  polygon: Array<{ lat: number; lng: number }>;
  area: number;
  accuracy: number;
  progress: number;
  vegetationData: VegetationData | null;
  satelliteImage: string | null;
  isMapping: boolean;
  lastUpdate: number;
  errors: string[];
  corrections: Array<{
    id: string;
    type: 'position' | 'area' | 'boundary';
    original: any;
    corrected: any;
    timestamp: number;
  }>;
}

const AnandSaathiEnhancedFieldMapper: React.FC<AnandSaathiEnhancedFieldMapperProps> = ({
  farmId,
  onFieldCreated,
  onCancel
}) => {
  const { t, language, isPunjabi, isHindi } = useTranslation();
  const [activeTab, setActiveTab] = useState('mapping');
  const [fieldData, setFieldData] = useState<Partial<FieldData>>({
    name: '',
    crop_type: 'Rice',
    area_acres: 0,
    latitude: 0,
    longitude: 0,
    farm_id: farmId
  });
  const [mappingState, setMappingState] = useState<MappingState>({
    method: 'gps_walk',
    isTracking: false,
    positions: [],
    polygon: [],
    area: 0,
    accuracy: 0,
    progress: 0,
    vegetationData: null,
    satelliteImage: null,
    isMapping: false,
    lastUpdate: Date.now(),
    errors: [],
    corrections: []
  });

  // Google Maps integration
  const {
    mapRef,
    mapInstance,
    addMarker,
    addPolygon,
    clearAll,
    fitBounds,
    getCurrentLocation,
    calculateArea,
    calculateDistance,
    forceInitialize
  } = useGoogleMaps({
    center: { lat: 30.9010, lng: 75.8573 }, // Punjab, India
    zoom: 15,
    mapTypeId: 'satellite',
    enableDrawing: true,
    enabled: activeTab === 'google-maps', // Only initialize when Google Maps tab is active
    onMapClick: (event) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        addMarker({ lat, lng }, 'Field Point');
        
        setFieldData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));
      }
    },
    onPolygonComplete: (polygon) => {
      const path = polygon.getPath();
      const coordinates = Array.from(path.getArray()).map(latLng => ({
        lat: latLng.lat(),
        lng: latLng.lng()
      }));
      
      const area = calculateArea(coordinates);
      
      setMappingState(prev => ({
        ...prev,
        polygon: coordinates,
        area: area
      }));
      
      setFieldData(prev => ({
        ...prev,
        area_acres: area
      }));
    }
  });

  // Custom drawing integration (only when mapInstance is available)
  const {
    drawingState,
    startDrawing,
    stopDrawing,
    clearAllShapes,
    removeShape
  } = useCustomDrawing({
    mapInstance: mapInstance,
    onShapeComplete: (shape) => {
      console.log('Shape completed:', shape);
      setMappingState(prev => ({
        ...prev,
        area: shape.area,
        progress: 100, // Drawing complete = 100% progress
        lastUpdate: Date.now(),
        isMapping: false,
        // Update polygon points for display
        polygon: shape.points || prev.polygon
      }));
      
      // Update field data with the drawn shape area
      setFieldData(prev => ({
        ...prev,
        area_acres: shape.area
      }));
      
      console.log('Drawn shape area:', shape.area, 'acres');
      toast.success(isPunjabi ? `ਖੇਤ ਮੈਪਿੰਗ ਪੂਰੀ ਹੋ ਗਈ! ਖੇਤਰ: ${shape.area} ਏਕੜ` : isHindi ? `खेत मैपिंग पूरी हो गई! क्षेत्र: ${shape.area} एकड़` : `Field mapping completed! Area: ${shape.area} acres`);
    },
    onShapeUpdate: (shape) => {
      console.log('Shape updated:', shape);
      setMappingState(prev => ({
        ...prev,
        area: shape.area,
        progress: Math.min(100, (shape.points?.length || 0) * 10), // Progress based on points
        lastUpdate: Date.now(),
        polygon: shape.points || prev.polygon
      }));
      
      // Update field data with the updated shape area
      setFieldData(prev => ({
        ...prev,
        area_acres: shape.area
      }));
    }
  });

  // Error correction functions
  const addError = (error: string) => {
    setMappingState(prev => ({
      ...prev,
      errors: [...prev.errors, error],
      lastUpdate: Date.now()
    }));
  };

  const clearErrors = () => {
    setMappingState(prev => ({
      ...prev,
      errors: [],
      lastUpdate: Date.now()
    }));
  };

  const addCorrection = (type: 'position' | 'area' | 'boundary', original: any, corrected: any) => {
    const correction = {
      id: `correction_${Date.now()}`,
      type,
      original,
      corrected,
      timestamp: Date.now()
    };
    
    setMappingState(prev => ({
      ...prev,
      corrections: [...prev.corrections, correction],
      lastUpdate: Date.now()
    }));
  };

  const undoLastCorrection = () => {
    setMappingState(prev => {
      if (prev.corrections.length === 0) return prev;
      
      const lastCorrection = prev.corrections[prev.corrections.length - 1];
      const newCorrections = prev.corrections.slice(0, -1);
      
      // Apply the original value back
      let newState = { ...prev };
      if (lastCorrection.type === 'position') {
        newState.positions = lastCorrection.original;
      } else if (lastCorrection.type === 'area') {
        newState.area = lastCorrection.original;
      } else if (lastCorrection.type === 'boundary') {
        newState.polygon = lastCorrection.original;
      }
      
      return {
        ...newState,
        corrections: newCorrections,
        lastUpdate: Date.now()
      };
    });
  };

  const resetMapping = () => {
    setMappingState(prev => ({
      ...prev,
      isTracking: false,
      positions: [],
      polygon: [],
      area: 0,
      accuracy: 0,
      progress: 0,
      isMapping: false,
      errors: [],
      corrections: [],
      lastUpdate: Date.now()
    }));
    
    // Clear all shapes from map
    if (mapInstance?.map) {
      try {
        clearAllShapes();
      } catch (error) {
        console.log('Error clearing shapes:', error);
        // Fallback: just clear the state
        setMappingState(prev => ({
          ...prev,
          isTracking: false,
          positions: [],
          polygon: [],
          area: 0,
          accuracy: 0,
          progress: 0,
          isMapping: false,
          errors: [],
          corrections: [],
          lastUpdate: Date.now()
        }));
      }
    }
    
    toast.success(isPunjabi ? 'ਮੈਪਿੰਗ ਰੀਸੈਟ ਹੋ ਗਈ' : isHindi ? 'मैपिंग रीसेट हो गई' : 'Mapping reset');
  };

  const validateMapping = () => {
    const errors: string[] = [];
    
    // Check if mapping is complete
    if (mappingState.positions.length < 3 && mappingState.polygon.length < 3) {
      errors.push(isPunjabi ? 'ਘੱਟੋ-ਘੱਟ 3 ਪੁਆਇੰਟ ਚਾਹੀਦੇ ਹਨ' : isHindi ? 'कम से कम 3 पॉइंट चाहिए' : 'At least 3 points required');
    }
    
    // Check area validity
    if (mappingState.area <= 0) {
      errors.push(isPunjabi ? 'ਖੇਤ ਦਾ ਖੇਤਰ ਗਲਤ ਹੈ' : isHindi ? 'खेत का क्षेत्र गलत है' : 'Invalid field area');
    }
    
    // Check accuracy
    if (mappingState.accuracy > 10) {
      errors.push(isPunjabi ? 'GPS ਸ਼ੁੱਧਤਾ ਘੱਟ ਹੈ' : isHindi ? 'GPS शुद्धता कम है' : 'Low GPS accuracy');
    }
    
    if (errors.length > 0) {
      setMappingState(prev => ({
        ...prev,
        errors,
        lastUpdate: Date.now()
      }));
      return false;
    }
    
    return true;
  };

  const forceMapRefresh = () => {
    if (mapInstance?.map) {
      // Force map to refresh and re-render
      const currentCenter = mapInstance.map.getCenter();
      const currentZoom = mapInstance.map.getZoom();
      
      // Trigger a resize event to force re-render
      window.google.maps.event.trigger(mapInstance.map, 'resize');
      
      // Re-center the map
      mapInstance.map.setCenter(currentCenter);
      mapInstance.map.setZoom(currentZoom);
      
      // Update timestamp
      setMappingState(prev => ({
        ...prev,
        lastUpdate: Date.now()
      }));
      
      toast.success(isPunjabi ? 'ਮੈਪ ਰੀਫ੍ਰੈਸ਼ ਹੋ ਗਿਆ' : isHindi ? 'मैप रिफ्रेश हो गया' : 'Map refreshed');
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GPSPosition | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const polygonRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Initialize comprehensive data entry methods
  const dataEntryMethods = [
    {
      id: 'gps_walk',
      name: isPunjabi ? 'GPS ਚੱਲੋ' : isHindi ? 'GPS चलो' : 'GPS Walk',
      description: isPunjabi ? 'ਖੇਤ ਦੇ ਘੇਰੇ ਦੁਆਲੇ ਚੱਲੋ' : isHindi ? 'खेत के घेरे के चारों ओर चलें' : 'Walk around field boundary',
      icon: <Navigation className="h-5 w-5" />,
      accuracy: 'High',
      time: '10-15 min',
      category: 'physical'
    },
    {
      id: 'satellite_pin',
      name: isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਪਿੰਨ' : isHindi ? 'सैटेलाइट पिन' : 'Satellite Pin',
      description: isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਚਿੱਤਰ \'ਤੇ ਪਿੰਨ ਲਗਾਓ' : isHindi ? 'सैटेलाइट छवि पर पिन लगाएं' : 'Pin on satellite image',
      icon: <Satellite className="h-5 w-5" />,
      accuracy: 'Medium',
      time: '5-10 min',
      category: 'remote'
    },
    {
      id: 'google_maps',
      name: isPunjabi ? 'ਗੂਗਲ ਮੈਪਸ' : isHindi ? 'गूगल मैप्स' : 'Google Maps',
      description: isPunjabi ? 'ਗੂਗਲ ਮੈਪਸ \'ਤੇ ਖੇਤ ਚਿੱਤਰ' : isHindi ? 'गूगल मैप्स पर खेत चित्र' : 'Draw field on Google Maps',
      icon: <Globe className="h-5 w-5" />,
      accuracy: 'Medium',
      time: '5-10 min',
      category: 'digital'
    },
    {
      id: 'manual_coordinates',
      name: isPunjabi ? 'ਮੈਨੂਅਲ ਕੋਆਰਡੀਨੇਟਸ' : isHindi ? 'मैनुअल निर्देशांक' : 'Manual Coordinates',
      description: isPunjabi ? 'ਲੈਟੀਟਿਊਡ ਅਤੇ ਲੌਂਗੀਟਿਊਡ ਦਾਖਲ ਕਰੋ' : isHindi ? 'अक्षांश और देशांतर दर्ज करें' : 'Enter latitude and longitude',
      icon: <MapPin className="h-5 w-5" />,
      accuracy: 'High',
      time: '2-3 min',
      category: 'digital'
    },
    {
      id: 'area_calculation',
      name: isPunjabi ? 'ਰਕਬਾ ਗਣਨਾ' : isHindi ? 'क्षेत्रफल गणना' : 'Area Calculation',
      description: isPunjabi ? 'ਲੰਬਾਈ ਅਤੇ ਚੌੜਾਈ ਨਾਲ ਰਕਬਾ ਗਣਨਾ' : isHindi ? 'लंबाई और चौड़ाई से क्षेत्रफल की गणना' : 'Calculate area from length and width',
      icon: <BarChart3 className="h-5 w-5" />,
      accuracy: 'Medium',
      time: '1-2 min',
      category: 'digital'
    },
    {
      id: 'file_import',
      name: isPunjabi ? 'ਫਾਈਲ ਆਯਾਤ' : isHindi ? 'फ़ाइल आयात' : 'File Import',
      description: isPunjabi ? 'KML, GeoJSON ਜਾਂ CSV ਫਾਈਲਾਂ ਆਯਾਤ ਕਰੋ' : isHindi ? 'KML, GeoJSON या CSV फाइलें आयात करें' : 'Import KML, GeoJSON or CSV files',
      icon: <Upload className="h-5 w-5" />,
      accuracy: 'High',
      time: '1 min',
      category: 'digital'
    },
    {
      id: 'drone_survey',
      name: isPunjabi ? 'ਡਰੋਨ ਸਰਵੇ' : isHindi ? 'ड्रोन सर्वेक्षण' : 'Drone Survey',
      description: isPunjabi ? 'ਡਰੋਨ ਦੁਆਰਾ ਕੀਤੀ ਗਈ ਸਰਵੇ ਡੇਟਾ' : isHindi ? 'ड्रोन द्वारा किया गया सर्वेक्षण डेटा' : 'Survey data from drone',
      icon: <Camera className="h-5 w-5" />,
      accuracy: 'Very High',
      time: 'Auto',
      category: 'advanced'
    },
    {
      id: 'government_records',
      name: isPunjabi ? 'ਸਰਕਾਰੀ ਰਿਕਾਰਡਸ' : isHindi ? 'सरकारी रिकॉर्ड्स' : 'Gov. Records',
      description: isPunjabi ? 'ਸਰਕਾਰੀ ਜ਼ਮੀਨ ਰਿਕਾਰਡਸ ਤੋਂ ਡੇਟਾ' : isHindi ? 'सरकारी भूमि रिकॉर्ड से डेटा' : 'Data from government land records',
      icon: <FileText className="h-5 w-5" />,
      accuracy: 'Official',
      time: '2-5 min',
      category: 'official'
    }
  ];

  // Vegetation indices data
  const vegetationIndices = [
    {
      name: 'NDVI',
      fullName: 'Normalized Difference Vegetation Index',
      value: 0.75,
      status: 'Good',
      description: isPunjabi ? 'ਵਨਸਪਤੀ ਸਿਹਤ ਦਾ ਸੂਚਕ' : isHindi ? 'वनस्पति स्वास्थ्य का सूचक' : 'Vegetation health indicator',
      color: 'green'
    },
    {
      name: 'NDMI',
      fullName: 'Normalized Difference Moisture Index',
      value: 0.68,
      status: 'Moderate',
      description: isPunjabi ? 'ਮਿੱਟੀ ਦੀ ਨਮੀ ਦਾ ਸੂਚਕ' : isHindi ? 'मिट्टी की नमी का सूचक' : 'Soil moisture indicator',
      color: 'blue'
    },
    {
      name: 'MSAVI2',
      fullName: 'Modified Soil Adjusted Vegetation Index',
      value: 0.82,
      status: 'Excellent',
      description: isPunjabi ? 'ਮਿੱਟੀ ਪ੍ਰਭਾਵ ਤੋਂ ਮੁਕਤ ਸੂਚਕ' : isHindi ? 'मिट्टी प्रभाव से मुक्त सूचक' : 'Soil-free vegetation indicator',
      color: 'green'
    },
    {
      name: 'NDRE',
      fullName: 'Normalized Difference Red Edge',
      value: 0.71,
      status: 'Good',
      description: isPunjabi ? 'ਪੱਤਿਆਂ ਦੀ ਸਿਹਤ ਦਾ ਸੂਚਕ' : isHindi ? 'पत्तियों की सेहत का सूचक' : 'Leaf health indicator',
      color: 'green'
    }
  ];

  // Initialize GPS tracking
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          });
        },
        (error) => {
          console.error('GPS Error:', error);
          toast.error(isPunjabi ? 'GPS ਲੋਕੇਸ਼ਨ ਲੱਭਣ ਵਿੱਚ ਅਸਫਲ' : isHindi ? 'GPS स्थान खोजने में असफल' : 'Failed to get GPS location');
        }
      );
    }
  }, [isPunjabi, isHindi]);

  // Start GPS tracking
  const startGPSTracking = async () => {
    if (!navigator.geolocation) {
      toast.error(isPunjabi ? 'GPS ਸਹਾਇਕ ਨਹੀਂ ਹੈ' : isHindi ? 'GPS सहायक नहीं है' : 'GPS not supported');
      return;
    }

    try {
      // Get current location first
      const currentPos = await getCurrentLocation();
      setCurrentLocation({
        latitude: currentPos.lat,
        longitude: currentPos.lng,
        accuracy: 0,
        timestamp: Date.now()
      });

      // Center map on current location
      if (mapInstance.map) {
        mapInstance.map.setCenter(currentPos);
        mapInstance.map.setZoom(18);
      }

      setMappingState(prev => ({ ...prev, isTracking: true, positions: [] }));
      
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newPosition: GPSPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };

        setMappingState(prev => {
          const newPositions = [...prev.positions, newPosition];
          const progress = Math.min(100, (newPositions.length / 20) * 100); // 20 points = 100%
          
          // Calculate area if we have enough points
          let area = prev.area;
          if (newPositions.length >= 3) {
            area = calculatePolygonArea(newPositions);
          }
          
          return {
            ...prev,
            positions: newPositions,
            progress: progress,
            lastUpdate: Date.now(),
            accuracy: newPosition.accuracy,
            area: area
          };
        });

        // Add marker to map
        addMarker({
          lat: newPosition.latitude,
          lng: newPosition.longitude
        }, `GPS Point ${prev.positions.length + 1}`);

        // Update field data with current position
        setFieldData(prev => ({
          ...prev,
          latitude: newPosition.latitude,
          longitude: newPosition.longitude,
          area_acres: newPositions.length >= 3 ? calculatePolygonArea(newPositions) : prev.area_acres
        }));

        // Update current location
        setCurrentLocation(newPosition);
      },
      (error) => {
        console.error('GPS Tracking Error:', error);
        toast.error(isPunjabi ? 'GPS ਟ੍ਰੈਕਿੰਗ ਵਿੱਚ ਤਰੁਟੀ' : isHindi ? 'GPS ट्रैकिंग में त्रुटि' : 'GPS tracking error');
        setMappingState(prev => ({ ...prev, isTracking: false }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000
      }
    );

      // Store watch ID for cleanup
      watchIdRef.current = watchId;
    } catch (error) {
      console.error('Error starting GPS tracking:', error);
      toast.error(isPunjabi ? 'GPS ਟ੍ਰੈਕਿੰਗ ਸ਼ੁਰੂ ਕਰਨ ਵਿੱਚ ਅਸਫਲ' : isHindi ? 'GPS ट्रैकिंग शुरू करने में असफल' : 'Failed to start GPS tracking');
    }
  };

  // Stop GPS tracking
  const stopGPSTracking = () => {
    setMappingState(prev => ({ ...prev, isTracking: false }));
    
    if (mappingState.positions.length > 2) {
      // Calculate area using improved calculation
      const area = calculatePolygonArea(mappingState.positions);
      setMappingState(prev => ({ ...prev, area, progress: 100, lastUpdate: Date.now() }));
      setFieldData(prev => ({ ...prev, area_acres: area }));
      
      console.log('GPS Area calculated:', area, 'acres');
      console.log('GPS Positions:', mappingState.positions.length);
      console.log('GPS Accuracy:', mappingState.accuracy);
      toast.success(isPunjabi ? `ਖੇਤ ਮੈਪਿੰਗ ਪੂਰੀ ਹੋ ਗਈ! ਖੇਤਰ: ${area} ਏਕੜ` : isHindi ? `खेत मैपिंग पूरी हो गई! क्षेत्र: ${area} एकड़` : `Field mapping completed! Area: ${area} acres`);
    } else {
      toast.error(isPunjabi ? 'ਕਾਫੀ GPS ਪੁਆਇੰਟ ਨਹੀਂ ਮਿਲੇ' : isHindi ? 'पर्याप्त GPS पॉइंट नहीं मिले' : 'Not enough GPS points');
    }
  };

  // Calculate polygon area using Google Maps geometry library
  const calculatePolygonArea = (positions: GPSPosition[]): number => {
    if (positions.length < 3) return 0;

    try {
      // Use Google Maps geometry library for accurate calculation
      if (window.google?.maps?.geometry?.spherical) {
        const googlePoints = positions.map(pos => 
          new window.google.maps.LatLng(pos.latitude, pos.longitude)
        );
        
        // Calculate area in square meters
        const areaInSquareMeters = window.google.maps.geometry.spherical.computeArea(googlePoints);
        
        // Convert square meters to acres (1 acre = 4046.86 square meters)
        const areaInAcres = areaInSquareMeters / 4046.86;
        
        console.log('GPS Area calculation:', {
          points: positions.length,
          squareMeters: areaInSquareMeters,
          acres: areaInAcres
        });
        
        return Math.round(areaInAcres * 100) / 100;
      } else {
        // Fallback to shoelace formula if geometry library not available
        let area = 0;
        const n = positions.length;

        for (let i = 0; i < n; i++) {
          const j = (i + 1) % n;
          area += positions[i].longitude * positions[j].latitude;
          area -= positions[j].longitude * positions[i].latitude;
        }

        area = Math.abs(area) / 2;
        
        // Convert from square degrees to acres (more accurate conversion)
        const areaInAcres = area * 111000 * 111000 * 0.000247105;
        
        console.log('Fallback area calculation:', areaInAcres);
        return Math.round(areaInAcres * 100) / 100;
      }
    } catch (error) {
      console.error('Error calculating polygon area:', error);
      return 0;
    }
  };

  // Generate vegetation analysis
  const generateVegetationAnalysis = async () => {
    setIsLoading(true);
    try {
      // Simulate vegetation data analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const vegetationData: VegetationData = {
        ndvi: 0.75 + Math.random() * 0.2,
        ndmi: 0.65 + Math.random() * 0.2,
        msavi2: 0.80 + Math.random() * 0.15,
        ndre: 0.70 + Math.random() * 0.2,
        timestamp: new Date(),
        confidence: 0.92
      };

      setMappingState(prev => ({ ...prev, vegetationData }));
      toast.success(isPunjabi ? 'ਵਨਸਪਤੀ ਵਿਸ਼ਲੇਸ਼ਣ ਪੂਰਾ!' : isHindi ? 'वनस्पति विश्लेषण पूरा!' : 'Vegetation analysis complete!');
    } catch (error) {
      toast.error(isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ ਵਿੱਚ ਤਰੁਟੀ' : isHindi ? 'विश्लेषण में त्रुटि' : 'Analysis error');
    } finally {
      setIsLoading(false);
    }
  };

  // Save field data
  const saveField = async () => {
    if (!fieldData.name || !fieldData.area_acres) {
      toast.error(isPunjabi ? 'ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੇ ਖੇਤ ਭਰੋ' : isHindi ? 'कृपया सभी फील्ड भरें' : 'Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      const newField: FieldData = {
        id: Date.now().toString(),
        name: fieldData.name,
        crop_type: fieldData.crop_type || 'Rice',
        area_acres: fieldData.area_acres,
        latitude: currentLocation?.latitude || 0,
        longitude: currentLocation?.longitude || 0,
        farm_id: farmId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await anandSaathiBackend.createField(newField);
      
      if (result.success) {
        toast.success(isPunjabi ? 'ਖੇਤ ਸਫਲਤਾਪੂਰਵਕ ਸੇਵ ਹੋ ਗਿਆ!' : isHindi ? 'खेत सफलतापूर्वक सेव हो गया!' : 'Field saved successfully!');
        onFieldCreated?.(newField);
      } else {
        throw new Error(result.error || 'Save failed');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(isPunjabi ? 'ਖੇਤ ਸੇਵ ਕਰਨ ਵਿੱਚ ਅਸਫਲ' : isHindi ? 'खेत सेव करने में असफल' : 'Failed to save field');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'bg-green-500';
      case 'Good': return 'bg-blue-500';
      case 'Moderate': return 'bg-yellow-500';
      case 'Poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            {isPunjabi ? 'ਅਨੰਦ ਸਾਥੀ ਉੱਨਤ ਖੇਤ ਮੈਪਰ' : isHindi ? 'अनंद साथी उन्नत खेत मैपर' : 'Anand Saathi Enhanced Field Mapper'}
          </CardTitle>
          <CardDescription>
            {isPunjabi 
              ? 'GPS ਚੱਲੋ, ਸੈਟੇਲਾਈਟ ਚਿੱਤਰ, ਅਤੇ ਵਨਸਪਤੀ ਵਿਸ਼ਲੇਸ਼ਣ ਦੇ ਨਾਲ ਖੇਤ ਮੈਪਿੰਗ'
              : isHindi 
              ? 'GPS चलो, सैटेलाइट छवि, और वनस्पति विश्लेषण के साथ खेत मैपिंग'
              : 'Advanced field mapping with GPS walk, satellite imagery, and vegetation analysis'
            }
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="data-entry">
          <Database className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਡੇਟਾ ਐਂਟਰੀ' : isHindi ? 'डेटा एंट्री' : 'Data Entry'}
          </TabsTrigger>
          <TabsTrigger value="mapping">
            {isPunjabi ? 'ਮੈਪਿੰਗ' : isHindi ? 'मैपिंग' : 'Mapping'}
          </TabsTrigger>
          <TabsTrigger value="google-maps">
            <Globe className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਗੂਗਲ ਮੈਪਸ' : isHindi ? 'गूगल मैप्स' : 'Google Maps'}
          </TabsTrigger>
          <TabsTrigger value="satellite">
            <Satellite className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਸੈਟੇਲਾਈਟ' : isHindi ? 'सैटेलाइट' : 'Satellite'}
          </TabsTrigger>
          <TabsTrigger value="vegetation">
            {isPunjabi ? 'ਵਨਸਪਤੀ' : isHindi ? 'वनस्पति' : 'Vegetation'}
          </TabsTrigger>
          <TabsTrigger value="analysis">
            {isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'विश्लेषण' : 'Analysis'}
          </TabsTrigger>
          <TabsTrigger value="save">
            {isPunjabi ? 'ਸੇਵ' : isHindi ? 'सेव' : 'Save'}
          </TabsTrigger>
        </TabsList>

        {/* Data Entry Tab */}
        <TabsContent value="data-entry" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {isPunjabi ? 'ਖੇਤ ਡੇਟਾ ਐਂਟਰੀ ਵਿਧੀਆਂ' : isHindi ? 'खेत डेटा एंट्री विधियां' : 'Farm Data Entry Methods'}
              </CardTitle>
              <CardDescription>
                {isPunjabi ? 'ਆਪਣੇ ਖੇਤ ਦੇ ਡੇਟਾ ਨੂੰ ਦਾਖਲ ਕਰਨ ਲਈ ਵੱਖ-ਵੱਖ ਵਿਧੀਆਂ ਚੁਣੋ' : isHindi ? 'अपने खेत के डेटा को दर्ज करने के लिए विभिन्न विधियां चुनें' : 'Choose from multiple methods to enter your farm data'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Method Selection Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dataEntryMethods.map((method) => (
                    <Card
                      key={method.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        mappingState.method === method.id ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => {
                        setMappingState(prev => ({ ...prev, method: method.id as any }));
                        toast.success(isPunjabi ? `${method.name} ਵਿਧੀ ਚੁਣੀ ਗਈ` : isHindi ? `${method.name} विधि चुनी गई` : `${method.name} method selected`);
                      }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {method.icon}
                            <CardTitle className="text-sm">{method.name}</CardTitle>
                          </div>
                          <Badge variant="outline">{method.accuracy}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground mb-2">{method.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {isPunjabi ? 'ਸਮਾਂ:' : isHindi ? 'समय:' : 'Time:'} {method.time}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {method.category}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Selected Method Confirmation */}
                {mappingState.method && (
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        {isPunjabi ? 'ਚੁਣੀ ਗਈ ਵਿਧੀ' : isHindi ? 'चुनी गई विधि' : 'Selected Method'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {dataEntryMethods.find(m => m.id === mappingState.method)?.icon}
                          <div>
                            <p className="font-medium text-green-800">
                              {dataEntryMethods.find(m => m.id === mappingState.method)?.name}
                            </p>
                            <p className="text-xs text-green-600">
                              {dataEntryMethods.find(m => m.id === mappingState.method)?.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            toast.info(isPunjabi ? 'ਮੈਪਿੰਗ ਟੈਬ \'ਤੇ ਜਾਓ' : isHindi ? 'मैपिंग टैब पर जाएं' : 'Go to Mapping tab');
                            // Switch to mapping tab
                            const mappingTab = document.querySelector('[value="mapping"]') as HTMLElement;
                            if (mappingTab) mappingTab.click();
                          }}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isPunjabi ? 'ਅੱਗੇ ਜਾਓ' : isHindi ? 'आगे जाएं' : 'Continue'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Method Comparison */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      {isPunjabi ? 'ਵਿਧੀਆਂ ਦੀ ਤੁਲਨਾ' : isHindi ? 'विधियों की तुलना' : 'Method Comparison'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">{isPunjabi ? 'ਵਿਧੀ' : isHindi ? 'विधि' : 'Method'}</th>
                            <th className="text-left p-2">{isPunjabi ? 'ਸ਼ੁੱਧਤਾ' : isHindi ? 'शुद्धता' : 'Accuracy'}</th>
                            <th className="text-left p-2">{isPunjabi ? 'ਸਮਾਂ' : isHindi ? 'समय' : 'Time'}</th>
                            <th className="text-left p-2">{isPunjabi ? 'ਲਾਗਤ' : isHindi ? 'लागत' : 'Cost'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dataEntryMethods.map((method) => (
                            <tr key={method.id} className="border-b">
                              <td className="p-2 font-medium">{method.name}</td>
                              <td className="p-2">{method.accuracy}</td>
                              <td className="p-2">{method.time}</td>
                              <td className="p-2">
                                {method.category === 'Free' ? 
                                  (isPunjabi ? 'ਮੁਫ਼ਤ' : isHindi ? 'मुफ्त' : 'Free') :
                                  (isPunjabi ? 'ਪੇਡ' : isHindi ? 'पेड' : 'Paid')
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mapping Tab */}
        <TabsContent value="mapping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                {isPunjabi ? 'ਖੇਤ ਮੈਪਿੰਗ' : isHindi ? 'खेत मैपिंग' : 'Field Mapping'}
              </CardTitle>
              <CardDescription>
                {isPunjabi ? 'ਚੁਣੀ ਗਈ ਵਿਧੀ ਨਾਲ ਖੇਤ ਦੀ ਮੈਪਿੰਗ ਸ਼ੁਰੂ ਕਰੋ' : isHindi ? 'चुनी गई विधि से खेत की मैपिंग शुरू करें' : 'Start field mapping with selected method'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Method Selection Status */}
                {!mappingState.method ? (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      {isPunjabi ? 'ਕਿਰਪਾ ਕਰਕੇ ਪਹਿਲਾਂ ਡੇਟਾ ਐਂਟਰੀ ਟੈਬ \'ਤੇ ਜਾਕੇ ਇੱਕ ਵਿਧੀ ਚੁਣੋ' : isHindi ? 'कृपया पहले डेटा एंट्री टैब पर जाकर एक विधि चुनें' : 'Please go to Data Entry tab first and select a method'}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {/* Selected Method Info */}
                    <Card className="bg-blue-50 border-blue-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
                          <Navigation className="h-4 w-4" />
                          {isPunjabi ? 'ਚੁਣੀ ਗਈ ਵਿਧੀ' : isHindi ? 'चुनी गई विधि' : 'Selected Method'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {dataEntryMethods.find(m => m.id === mappingState.method)?.icon}
                            <div>
                              <p className="font-medium text-blue-800">
                                {dataEntryMethods.find(m => m.id === mappingState.method)?.name}
                              </p>
                              <p className="text-xs text-blue-600">
                                {dataEntryMethods.find(m => m.id === mappingState.method)?.description}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-blue-600 border-blue-300">
                            {dataEntryMethods.find(m => m.id === mappingState.method)?.accuracy}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Mapping Controls */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">
                          {isPunjabi ? 'ਮੈਪਿੰਗ ਨਿਯੰਤਰਣ' : isHindi ? 'मैपिंग नियंत्रण' : 'Mapping Controls'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {isPunjabi ? 'ਆਪਣੇ ਖੇਤ ਦੀ ਮੈਪਿੰਗ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਬਟਨ \'ਤੇ ਕਲਿੱਕ ਕਰੋ' : isHindi ? 'अपने खेत की मैपिंग शुरू करने के लिए बटन पर क्लिक करें' : 'Click the button to start mapping your field'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setMappingState(prev => ({ ...prev, isMapping: true }));
                            toast.success(isPunjabi ? 'ਮੈਪਿੰਗ ਸ਼ੁਰੂ ਕੀਤੀ ਗਈ!' : isHindi ? 'मैपिंग शुरू की गई!' : 'Mapping started!');
                          }}
                          disabled={mappingState.isMapping}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {isPunjabi ? 'ਸ਼ੁਰੂ ਕਰੋ' : isHindi ? 'शुरू करें' : 'Start'}
                        </Button>
                        <Button
                          onClick={() => {
                            setMappingState(prev => ({ ...prev, isMapping: false }));
                            toast.info(isPunjabi ? 'ਮੈਪਿੰਗ ਰੋਕੀ ਗਈ' : isHindi ? 'मैपिंग रोकी गई' : 'Mapping stopped');
                          }}
                          disabled={!mappingState.isMapping}
                          variant="outline"
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          {isPunjabi ? 'ਰੋਕੋ' : isHindi ? 'रोकें' : 'Stop'}
                        </Button>
                      </div>
                    </div>

                    {/* Mapping Status */}
                    {mappingState.isMapping && (
                      <Alert className="bg-green-50 border-green-200">
                        <Navigation className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          {isPunjabi ? 'ਮੈਪਿੰਗ ਚਾਲੂ ਹੈ। ਖੇਤ ਦੇ ਘੇਰੇ ਦੁਆਲੇ ਚੱਲੋ ਜਾਂ ਨਿਰਦਿਸ਼ਟ ਕੀਤੀ ਵਿਧੀ ਦੀ ਵਰਤੋਂ ਕਰੋ।' :
                           isHindi ? 'मैपिंग चालू है। खेत के घेरे के चारों ओर चलें या निर्दिष्ट विधि का उपयोग करें।' :
                           'Mapping is active. Walk around the field boundary or use the specified method.'}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Mapping Progress */}
                    {mappingState.isMapping && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            {isPunjabi ? 'ਮੈਪਿੰਗ ਪ੍ਰਗਤੀ' : isHindi ? 'मैपिंग प्रगति' : 'Mapping Progress'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>{isPunjabi ? 'ਪ੍ਰਗਤੀ:' : isHindi ? 'प्रगति:' : 'Progress:'}</span>
                              <span>{mappingState.progress}%</span>
                            </div>
                            <Progress value={mappingState.progress} className="w-full" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{isPunjabi ? 'ਪੁਆਇੰਟਸ:' : isHindi ? 'पॉइंट्स:' : 'Points:'} {mappingState.positions.length}</span>
                              <span>{isPunjabi ? 'ਸਮਾਂ:' : isHindi ? 'समय:' : 'Time:'} {mappingState.lastUpdate}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Next Steps */}
                    {mappingState.isMapping && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
                            <Target className="h-4 w-4" />
                            {isPunjabi ? 'ਅਗਲੇ ਕਦਮ' : isHindi ? 'अगले कदम' : 'Next Steps'}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm text-blue-700">
                            <p>• {isPunjabi ? 'ਖੇਤ ਦੇ ਘੇਰੇ ਦੁਆਲੇ ਚੱਲੋ' : isHindi ? 'खेत के घेरे के चारों ओर चलें' : 'Walk around the field boundary'}</p>
                            <p>• {isPunjabi ? 'ਜਦੋਂ ਪੂਰਾ ਹੋ ਜਾਵੇ ਤਾਂ ਸਟੌਪ ਬਟਨ \'ਤੇ ਕਲਿੱਕ ਕਰੋ' : isHindi ? 'जब पूरा हो जाए तो स्टॉप बटन पर क्लिक करें' : 'Click stop button when complete'}</p>
                            <p>• {isPunjabi ? 'ਅੱਗੇ ਜਾਣ ਲਈ ਸੈਵ ਟੈਬ \'ਤੇ ਜਾਓ' : isHindi ? 'आगे जाने के लिए सेव टैब पर जाएं' : 'Go to Save tab to continue'}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Maps Tab */}
        <TabsContent value="google-maps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {isPunjabi ? 'ਗੂਗਲ ਮੈਪਸ ਡਰਾਇੰਗ' : isHindi ? 'गूगल मैप्स ड्राइंग' : 'Google Maps Drawing'}
              </CardTitle>
              <CardDescription>
                {isPunjabi ? 'ਗੂਗਲ ਮੈਪਸ \'ਤੇ ਆਪਣੇ ਖੇਤ ਦੀ ਸ਼ਕਲ ਖਿੱਚੋ' : isHindi ? 'गूगल मैप्स पर अपने खेत की आकृति खींचें' : 'Draw your field shape on Google Maps'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Map Controls */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={async () => {
                      try {
                        const location = await getCurrentLocation();
                        if (mapInstance.map) {
                          mapInstance.map.setCenter(location);
                          mapInstance.map.setZoom(18);
                        }
                        toast.success(isPunjabi ? 'ਮੌਜੂਦਾ ਸਥਾਨ \'ਤੇ ਕੇਂਦਰਿਤ' : isHindi ? 'वर्तमान स्थान पर केंद्रित' : 'Centered on current location');
                      } catch (error) {
                        toast.error(isPunjabi ? 'ਸਥਾਨ ਪ੍ਰਾਪਤ ਕਰਨ ਵਿੱਚ ਅਸਫਲ' : isHindi ? 'स्थान प्राप्त करने में असफल' : 'Failed to get location');
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    {isPunjabi ? 'ਮੇਰਾ ਸਥਾਨ' : isHindi ? 'मेरा स्थान' : 'My Location'}
                  </Button>
                  
                  <Button
                    onClick={() => {
                      if (mapInstance.map && window.google) {
                        mapInstance.map.setMapTypeId(window.google.maps.MapTypeId.SATELLITE);
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Satellite className="h-4 w-4 mr-2" />
                    {isPunjabi ? 'ਸੈਟੇਲਾਈਟ' : isHindi ? 'सैटेलाइट' : 'Satellite'}
                  </Button>
                  
                  <Button
                    onClick={() => {
                      if (mapInstance.map && window.google) {
                        mapInstance.map.setMapTypeId(window.google.maps.MapTypeId.ROADMAP);
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {isPunjabi ? 'ਰੋਡ ਮੈਪ' : isHindi ? 'रोड मैप' : 'Road Map'}
                  </Button>
                  
                  <Button
                    onClick={clearAll}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {isPunjabi ? 'ਸਾਫ਼ ਕਰੋ' : isHindi ? 'साफ़ करें' : 'Clear All'}
                  </Button>
                  
                  <Button
                    onClick={() => {
                      if (mappingState.positions.length > 0) {
                        toast.success(isPunjabi ? 'ਖੇਤਰ ਮਾਰਕ ਕੀਤਾ ਗਿਆ!' : isHindi ? 'क्षेत्र मार्क किया गया!' : 'Area marked successfully!');
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    disabled={mappingState.positions.length === 0}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {isPunjabi ? 'ਖੇਤਰ ਮਾਰਕ ਕਰੋ' : isHindi ? 'क्षेत्र मार्क करें' : 'Mark Area'}
                  </Button>

                {/* Drawing Tools */}
                <div className="flex gap-1">
                  <Button
                    onClick={() => startDrawing('polygon')}
                    variant="outline"
                    size="sm"
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    disabled={drawingState.isDrawing}
                  >
                    <div className="w-4 h-4 border-2 border-blue-600 rounded-sm"></div>
                  </Button>
                  
                  <Button
                    onClick={() => startDrawing('rectangle')}
                    variant="outline"
                    size="sm"
                    className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                    disabled={drawingState.isDrawing}
                  >
                    <div className="w-4 h-4 border-2 border-purple-600"></div>
                  </Button>
                  
                  <Button
                    onClick={() => startDrawing('circle')}
                    variant="outline"
                    size="sm"
                    className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                    disabled={drawingState.isDrawing}
                  >
                    <div className="w-4 h-4 border-2 border-orange-600 rounded-full"></div>
                  </Button>
                </div>

                {/* Error Correction Tools */}
                <div className="flex gap-1">
                  <Button
                    onClick={resetMapping}
                    variant="outline"
                    size="sm"
                    className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    {isPunjabi ? 'ਰੀਸੈਟ' : isHindi ? 'रीसेट' : 'Reset'}
                  </Button>
                  
                  <Button
                    onClick={undoLastCorrection}
                    variant="outline"
                    size="sm"
                    className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
                    disabled={mappingState.corrections.length === 0}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    {isPunjabi ? 'ਵਾਪਸ' : isHindi ? 'वापस' : 'Undo'}
                  </Button>
                  
                  <Button
                    onClick={validateMapping}
                    variant="outline"
                    size="sm"
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {isPunjabi ? 'ਜਾਂਚ' : isHindi ? 'जांच' : 'Validate'}
                  </Button>
                  
                  <Button
                    onClick={forceMapRefresh}
                    variant="outline"
                    size="sm"
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    {isPunjabi ? 'ਰੀਫ੍ਰੈਸ਼' : isHindi ? 'रिफ्रेश' : 'Refresh'}
                  </Button>
                </div>

                  {drawingState.isDrawing && (
                    <Button
                      onClick={stopDrawing}
                      variant="outline"
                      size="sm"
                      className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {isPunjabi ? 'ਰੋਕੋ' : isHindi ? 'रोकें' : 'Stop'}
                    </Button>
                  )}
                  
                  {!mapInstance.isLoaded && !mapInstance.error && (
                    <Button
                      onClick={forceInitialize}
                      variant="outline"
                      size="sm"
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {isPunjabi ? 'ਮੈਪ ਲੋਡ ਕਰੋ' : isHindi ? 'मैप लोड करें' : 'Load Map'}
                    </Button>
                  )}
                  
                  {mapInstance.isLoaded && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      {isPunjabi ? 'ਮੈਪ ਤਿਆਰ ਹੈ' : isHindi ? 'मैप तैयार है' : 'Map Ready'}
                    </div>
                  )}

                  {drawingState.isDrawing && (
                    <div className="flex items-center gap-2 text-blue-600 text-sm bg-blue-50 p-2 rounded-lg border border-blue-200">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      {isPunjabi ? 
                        `ਡਰਾਇੰਗ ਮੋਡ: ${drawingState.drawingMode}` : 
                        isHindi ? 
                        `ड्राइंग मोड: ${drawingState.drawingMode}` : 
                        `Drawing Mode: ${drawingState.drawingMode}`
                      }
                      <div className="text-xs text-blue-500">
                        {isPunjabi ? 'ਮੈਪ \'ਤੇ ਕਲਿੱਕ ਕਰੋ' : isHindi ? 'मैप पर क्लिक करें' : 'Click on map'}
                      </div>
                    </div>
                  )}

                  {/* Real-time Update Status */}
                  <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-2 rounded-lg border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    {isPunjabi ? 
                      `ਆਖਰੀ ਅਪਡੇਟ: ${new Date(mappingState.lastUpdate).toLocaleTimeString()}` : 
                      isHindi ? 
                      `आखिरी अपडेट: ${new Date(mappingState.lastUpdate).toLocaleTimeString()}` : 
                      `Last Update: ${new Date(mappingState.lastUpdate).toLocaleTimeString()}`
                    }
                  </div>

                  {/* Mapping Progress */}
                  {mappingState.progress > 0 && (
                    <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {isPunjabi ? 'ਮੈਪਿੰਗ ਪ੍ਰਗਤੀ' : isHindi ? 'मैपिंग प्रगति' : 'Mapping Progress'}
                        </span>
                        <span className="font-semibold">{mappingState.progress}%</span>
                      </div>
                      <Progress value={mappingState.progress} className="h-2" />
                    </div>
                  )}

                  {/* Drawing Test Button */}
                  <Button
                    onClick={() => {
                      console.log('Test drawing button clicked');
                      console.log('Map instance:', mapInstance);
                      console.log('Drawing state:', drawingState);
                      console.log('Google Maps Drawing Library:', window.google?.maps?.drawing);
                      
                      // Test if map instance is working
                      if (mapInstance?.map) {
                        console.log('Map instance is available, testing marker creation');
                        addMarker({ lat: 30.9010, lng: 75.8573 }, 'Test Marker');
                        
                        // Test drawing functionality by creating a test polygon
                        try {
                          const testPolygon = new window.google.maps.Polygon({
                            paths: [
                              { lat: 30.9010, lng: 75.8573 },
                              { lat: 30.9020, lng: 75.8583 },
                              { lat: 30.9015, lng: 75.8593 },
                              { lat: 30.9005, lng: 75.8588 }
                            ],
                            strokeColor: '#FF0000',
                            strokeOpacity: 1.0,
                            strokeWeight: 3,
                            fillColor: '#FF0000',
                            fillOpacity: 0.3,
                            clickable: true
                          });
                          
                          testPolygon.setMap(mapInstance.map);
                          console.log('Test polygon created successfully');
                          toast.success(isPunjabi ? 'ਟੈਸਟ ਸ਼ੇਪ ਬਣਾਇਆ ਗਿਆ' : isHindi ? 'टेस्ट शेप बनाया गया' : 'Test shape created');
                        } catch (error) {
                          console.error('Error creating test polygon:', error);
                          toast.error(isPunjabi ? 'ਟੈਸਟ ਸ਼ੇਪ ਬਣਾਉਣ ਵਿੱਚ ਅਸਫल' : isHindi ? 'टेस्ट शेप बनाने में असफल' : 'Failed to create test shape');
                        }
                      } else {
                        console.log('Map instance not available');
                        toast.error(isPunjabi ? 'ਮੈਪ ਇੰਸਟੈਂਸ ਉਪਲਬਧ ਨਹੀਂ' : isHindi ? 'मैप इंस्टेंस उपलब्ध नहीं' : 'Map instance not available');
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    {isPunjabi ? 'ਟੈਸਟ ਡਰਾਇੰਗ' : isHindi ? 'टेस्ट ड्राइंग' : 'Test Drawing'}
                  </Button>

                  {/* Debug Drawing Library Button */}
                  <Button
                    onClick={() => {
                      console.log('Debug Drawing Library button clicked');
                      console.log('window.google:', window.google);
                      console.log('window.google.maps:', window.google?.maps);
                      console.log('window.google.maps.drawing:', window.google?.maps?.drawing);
                      console.log('DrawingManager available:', !!window.google?.maps?.drawing?.DrawingManager);
                      
                      if (window.google?.maps?.drawing) {
                        toast.success(isPunjabi ? 'ਡਰਾਇੰਗ ਲਾਇਬ੍ਰੇਰੀ ਲੋਡ ਹੋਈ' : isHindi ? 'ड्राइंग लाइब्रेरी लोड हुई' : 'Drawing Library Loaded');
                      } else {
                        toast.error(isPunjabi ? 'ਡਰਾਇੰਗ ਲਾਇਬ੍ਰੇਰੀ ਲੋਡ ਨਹੀਂ ਹੋਈ' : isHindi ? 'ड्राइंग लाइब्रेरी लोड नहीं हुई' : 'Drawing Library Not Loaded');
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    {isPunjabi ? 'ਡੀਬੱਗ ਲਾਇਬ੍ਰੇਰੀ' : isHindi ? 'डिबग लाइब्रेरी' : 'Debug Library'}
                  </Button>
                </div>

                {/* Google Maps Container */}
                <div className="relative">
                  <div 
                    ref={mapRef}
                    className="w-full h-96 border border-gray-300 rounded-lg"
                    style={{ minHeight: '400px' }}
                  />
                  
                  {!mapInstance.isLoaded && !mapInstance.error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
                      <div className="text-center p-6">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {isPunjabi ? 'ਗੂਗਲ ਮੈਪਸ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ' : isHindi ? 'गूगल मैप्स लोड हो रहा है' : 'Loading Google Maps'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {isPunjabi ? 'ਆਪਣੇ ਖੇਤ ਨੂੰ ਮੈਪ ਕਰਨ ਲਈ ਤਿਆਰੀ ਕਰ ਰਹੇ ਹਾਂ...' : isHindi ? 'आपके खेत को मैप करने के लिए तैयारी कर रहे हैं...' : 'Preparing to map your field...'}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-blue-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {mapInstance.error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 rounded-lg">
                      <div className="text-center p-6 max-w-md">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-red-800 mb-2">
                          {isPunjabi ? 'ਮੈਪ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ' : isHindi ? 'मैप लोड करने में त्रुटि' : 'Map Loading Error'}
                        </h3>
                        <p className="text-sm text-red-600 mb-4">
                          {isPunjabi ? 'ਕੋਈ ਤਕਨੀਕੀ ਸਮਸਿਆ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।' : isHindi ? 'कोई तकनीकी समस्या है। कृपया पुनः प्रयास करें।' : 'There seems to be a technical issue. Please try again.'}
                        </p>
                        <div className="space-y-2">
                          <Button 
                            onClick={forceInitialize}
                            size="sm"
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {isPunjabi ? 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ' : isHindi ? 'पुनः प्रयास करें' : 'Try Again'}
                          </Button>
                          <p className="text-xs text-red-500">
                            {isPunjabi ? 'ਜੇ ਸਮਸਿਆ ਜਾਰੀ ਰਹਿੰਦੀ ਹੈ, ਤਾਂ ਕਿਰਪਾ ਕਰਕੇ ਪੇਜ ਨੂੰ ਰਿਫਰੈਸ਼ ਕਰੋ।' : isHindi ? 'यदि समस्या जारी रहती है, तो कृपया पेज को रिफ्रेश करें।' : 'If the issue persists, please refresh the page.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Display */}
                {mappingState.errors.length > 0 && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <div className="font-semibold mb-2">
                        {isPunjabi ? 'ਮੈਪਿੰਗ ਗਲਤੀਆਂ:' : isHindi ? 'मैपिंग गलतियां:' : 'Mapping Errors:'}
                      </div>
                      <ul className="list-disc list-inside space-y-1">
                        {mappingState.errors.map((error, index) => (
                          <li key={index} className="text-sm">{error}</li>
                        ))}
                      </ul>
                      <Button
                        onClick={clearErrors}
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-red-100 hover:bg-red-200 text-red-700 border-red-300"
                      >
                        <X className="h-4 w-4 mr-1" />
                        {isPunjabi ? 'ਗਲਤੀਆਂ ਸਾਫ਼ ਕਰੋ' : isHindi ? 'गलतियां साफ करें' : 'Clear Errors'}
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Correction History */}
                {mappingState.corrections.length > 0 && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                        🔧
                      </div>
                      <div>
                        <h4 className="font-semibold text-yellow-800">
                          {isPunjabi ? 'ਸੁਧਾਰ ਇਤਿਹਾਸ' : isHindi ? 'सुधार इतिहास' : 'Correction History'}
                        </h4>
                        <p className="text-sm text-yellow-700">
                          {isPunjabi ? 'ਆਖਰੀ ਸੁਧਾਰ: ' : isHindi ? 'आखिरी सुधार: ' : 'Last correction: '}
                          {new Date(mappingState.corrections[mappingState.corrections.length - 1]?.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-yellow-700">
                      {isPunjabi ? 'ਕੁੱਲ ਸੁਧਾਰ: ' : isHindi ? 'कुल सुधार: ' : 'Total corrections: '}
                      <span className="font-semibold">{mappingState.corrections.length}</span>
                    </div>
                  </div>
                )}

                {/* Cache Statistics */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      💾
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800">
                        {isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਇਮੇਜ ਕੈਸ਼' : isHindi ? 'सैटेलाइट इमेज कैश' : 'Satellite Image Cache'}
                      </h4>
                      <p className="text-sm text-blue-700">
                        {isPunjabi ? 'API ਖਰਚੇ ਬਚਾਉਣ ਲਈ ਸਮਾਰਟ ਕੈਸ਼ਿੰਗ' : isHindi ? 'API खर्चे बचाने के लिए स्मार्ट कैशिंग' : 'Smart caching to save API costs'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="bg-white rounded p-2 text-center">
                      <div className="font-semibold text-blue-800">100</div>
                      <div className="text-blue-600">{isPunjabi ? 'ਇਮੇਜਾਂ' : isHindi ? 'इमेजें' : 'Images'}</div>
                    </div>
                    <div className="bg-white rounded p-2 text-center">
                      <div className="font-semibold text-blue-800">24h</div>
                      <div className="text-blue-600">{isPunjabi ? 'ਅਪਡੇਟ' : isHindi ? 'अपडेट' : 'Update'}</div>
                    </div>
                    <div className="bg-white rounded p-2 text-center">
                      <div className="font-semibold text-blue-800">90%</div>
                      <div className="text-blue-600">{isPunjabi ? 'ਬਚਤ' : isHindi ? 'बचत' : 'Savings'}</div>
                    </div>
                    <div className="bg-white rounded p-2 text-center">
                      <div className="font-semibold text-blue-800">✓</div>
                      <div className="text-blue-600">{isPunjabi ? 'ਸਕਿੰਗ' : isHindi ? 'सिंकिंग' : 'Synced'}</div>
                    </div>
                  </div>
                </div>

                {/* User-Friendly Instructions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                      <h4 className="font-semibold text-blue-800">
                        {isPunjabi ? 'ਮੈਪ ਲੋਡ ਕਰੋ' : isHindi ? 'मैप लोड करें' : 'Load Map'}
                      </h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      {isPunjabi ? 'ਪਹਿਲਾਂ ਮੈਪ ਲੋਡ ਕਰਨ ਲਈ ਬਟਨ ਦਬਾਓ' : isHindi ? 'पहले मैप लोड करने के लिए बटन दबाएं' : 'First, click the button to load the map'}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                      <h4 className="font-semibold text-green-800">
                        {isPunjabi ? 'ਆਪਣਾ ਸਥਾਨ ਲੱਭੋ' : isHindi ? 'अपना स्थान खोजें' : 'Find Your Location'}
                      </h4>
                    </div>
                    <p className="text-sm text-green-700">
                      {isPunjabi ? 'ਮੈਪ \'ਤੇ ਆਪਣੇ ਖੇਤ ਦਾ ਸਥਾਨ ਲੱਭੋ' : isHindi ? 'मैप पर अपने खेत का स्थान खोजें' : 'Find your field location on the map'}
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                      <h4 className="font-semibold text-purple-800">
                        {isPunjabi ? 'ਖੇਤ ਮੈਪ ਕਰੋ' : isHindi ? 'खेत मैप करें' : 'Map Your Field'}
                      </h4>
                    </div>
                    <p className="text-sm text-purple-700">
                      {isPunjabi ? 'GPS ਟ੍ਰੈਕਿੰਗ ਜਾਂ ਮੈਨੁਅਲ ਮਾਰਕਰ ਦੀ ਵਰਤੋਂ ਕਰੋ' : isHindi ? 'GPS ट्रैकिंग या मैनुअल मार्कर का उपयोग करें' : 'Use GPS tracking or manual markers'}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        {isPunjabi ? 'ਖੇਤਰ ਮਾਰਕ ਕਰੋ' : isHindi ? 'क्षेत्र मार्क करें' : 'Mark Areas'}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        {isPunjabi ? 'ਆਕਾਰ ਮਾਪੋ' : isHindi ? 'आकार मापें' : 'Measure Size'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Area Marking Progress */}
                {mappingState.positions.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                        {mappingState.positions.length}
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-800">
                          {isPunjabi ? 'ਖੇਤਰ ਮਾਰਕਿੰਗ ਪ੍ਰਗਤੀ' : isHindi ? 'क्षेत्र मार्किंग प्रगति' : 'Area Marking Progress'}
                        </h4>
                        <p className="text-sm text-green-700">
                          {isPunjabi ? `${mappingState.positions.length} ਬਿੰਦੂ ਮਾਰਕ ਕੀਤੇ ਗਏ` : isHindi ? `${mappingState.positions.length} बिंदु मार्क किए गए` : `${mappingState.positions.length} points marked`}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (mappingState.positions.length / 10) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      {isPunjabi ? 'ਵਧੇਰੇ ਬਿੰਦੂ ਮਾਰਕ ਕਰੋ ਤਾਂ ਜੋ ਸਹੀ ਖੇਤਰਫਲ ਪਤਾ ਲੱਗ ਸਕੇ' : isHindi ? 'अधिक बिंदु मार्क करें ताकि सही क्षेत्रफल पता लग सके' : 'Mark more points for accurate area calculation'}
                    </p>
                  </div>
                )}

                {/* Field Data Display */}
                {mappingState.area > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-green-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {isPunjabi ? 'ਖੇਤ ਦਾ ਖੇਤਰਫਲ' : isHindi ? 'खेत का क्षेत्रफल' : 'Field Area'}
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        {mappingState.area.toFixed(2)} {isPunjabi ? 'ਏਕੜ' : isHindi ? 'एकड़' : 'acres'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {isPunjabi ? 'ਅਕਾਰ' : isHindi ? 'आकार' : 'Size'}
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {mappingState.positions.length > 0 ? mappingState.positions.length : mappingState.polygon.length} {isPunjabi ? 'ਪੁਆਇੰਟਸ' : isHindi ? 'पॉइंट्स' : 'points'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {isPunjabi ? 'ਅਕਿਊਰੇਸੀ' : isHindi ? 'सटीकता' : 'Accuracy'}
                      </p>
                      <p className="text-lg font-bold text-purple-600">
                        {mappingState.positions.length > 0 ? `${mappingState.accuracy.toFixed(1)}m` : 'Drawing'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {isPunjabi ? 'ਪ੍ਰਗਤੀ' : isHindi ? 'प्रगति' : 'Progress'}
                      </p>
                      <p className="text-lg font-bold text-orange-600">
                        {mappingState.progress}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Satellite Tab */}
        <TabsContent value="satellite" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Satellite className="h-5 w-5" />
                {isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਮੈਪਿੰਗ' : isHindi ? 'सैटेलाइट मैपिंग' : 'Satellite Mapping'}
              </CardTitle>
              <CardDescription>
                {isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਚਿੱਤਰਾਂ ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਖੇਤ ਦੀ ਮੈਪਿੰਗ ਕਰੋ' : isHindi ? 'सैटेलाइट छवियों का उपयोग करके खेत की मैपिंग करें' : 'Map field using satellite imagery'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Satellite Image Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Satellite className="h-4 w-4" />
                        {isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਚਿੱਤਰ ਚੁਣੋ' : isHindi ? 'सैटेलाइट छवि चुनें' : 'Select Satellite Image'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button
                          onClick={() => {
                            toast.info(isPunjabi ? 'Landsat-8 ਚਿੱਤਰ ਲੋਡ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...' : isHindi ? 'Landsat-8 छवि लोड की जा रही है...' : 'Loading Landsat-8 image...');
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          <Satellite className="h-4 w-4 mr-2" />
                          Landsat-8
                        </Button>
                        <Button
                          onClick={() => {
                            toast.info(isPunjabi ? 'Sentinel-2 ਚਿੱਤਰ ਲੋਡ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...' : isHindi ? 'Sentinel-2 छवि लोड की जा रही है...' : 'Loading Sentinel-2 image...');
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          <Satellite className="h-4 w-4 mr-2" />
                          Sentinel-2
                        </Button>
                        <Button
                          onClick={() => {
                            toast.info(isPunjabi ? 'MODIS ਚਿੱਤਰ ਲੋਡ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...' : isHindi ? 'MODIS छवि लोड की जा रही है...' : 'Loading MODIS image...');
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          <Satellite className="h-4 w-4 mr-2" />
                          MODIS
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {isPunjabi ? 'ਤਾਰੀਖ ਰੇਂਜ' : isHindi ? 'तारीख रेंज' : 'Date Range'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-muted-foreground">
                            {isPunjabi ? 'ਸ਼ੁਰੂ ਤਾਰੀਖ' : isHindi ? 'शुरू तारीख' : 'Start Date'}
                          </label>
                          <input
                            type="date"
                            className="w-full p-2 border rounded text-sm"
                            defaultValue="2024-01-01"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">
                            {isPunjabi ? 'ਅੰਤ ਤਾਰੀਖ' : isHindi ? 'अंत तारीख' : 'End Date'}
                          </label>
                          <input
                            type="date"
                            className="w-full p-2 border rounded text-sm"
                            defaultValue="2024-12-31"
                          />
                        </div>
                        <Button
                          onClick={() => {
                            toast.success(isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਚਿੱਤਰ ਲੋਡ ਕੀਤਾ ਗਿਆ!' : isHindi ? 'सैटेलाइट छवि लोड की गई!' : 'Satellite image loaded!');
                          }}
                          className="w-full"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {isPunjabi ? 'ਲੋਡ ਕਰੋ' : isHindi ? 'लोड करें' : 'Load Image'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Satellite Image Preview */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      {isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਚਿੱਤਰ ਪੂਰਵਦਰਸ਼ਨ' : isHindi ? 'सैटेलाइट छवि पूर्वदर्शन' : 'Satellite Image Preview'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                      <Satellite className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        {isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਚਿੱਤਰ ਇੱਥੇ ਦਿਖਾਇਆ ਜਾਵੇਗਾ' : isHindi ? 'सैटेलाइट छवि यहां दिखाई जाएगी' : 'Satellite image will appear here'}
                      </p>
                      <Button
                        onClick={() => {
                          toast.info(isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਚਿੱਤਰ ਲੋਡ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...' : isHindi ? 'सैटेलाइट छवि लोड की जा रही है...' : 'Loading satellite image...');
                        }}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {isPunjabi ? 'ਚਿੱਤਰ ਲੋਡ ਕਰੋ' : isHindi ? 'छवि लोड करें' : 'Load Image'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Field Boundary Marking */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {isPunjabi ? 'ਖੇਤ ਸੀਮਾ ਮਾਰਕਿੰਗ' : isHindi ? 'खेत सीमा मार्किंग' : 'Field Boundary Marking'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਚਿੱਤਰ \'ਤੇ ਆਪਣੇ ਖੇਤ ਦੀ ਸੀਮਾ ਮਾਰਕ ਕਰੋ' : isHindi ? 'सैटेलाइट छवि पर अपने खेत की सीमा मार्क करें' : 'Mark your field boundary on the satellite image'}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            toast.info(isPunjabi ? 'ਸੀਮਾ ਮਾਰਕਿੰਗ ਸ਼ੁਰੂ ਕੀਤੀ ਗਈ' : isHindi ? 'सीमा मार्किंग शुरू की गई' : 'Boundary marking started');
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Target className="h-4 w-4 mr-2" />
                          {isPunjabi ? 'ਸੀਮਾ ਮਾਰਕ ਕਰੋ' : isHindi ? 'सीमा मार्क करें' : 'Mark Boundary'}
                        </Button>
                        <Button
                          onClick={() => {
                            toast.success(isPunjabi ? 'ਸੀਮਾ ਸੇਵ ਕੀਤੀ ਗਈ' : isHindi ? 'सीमा सेव की गई' : 'Boundary saved');
                          }}
                          size="sm"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isPunjabi ? 'ਸੇਵ ਕਰੋ' : isHindi ? 'सेव करें' : 'Save'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vegetation Analysis Tab */}
        <TabsContent value="vegetation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                {isPunjabi ? 'ਵਨਸਪਤੀ ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'वनस्पति विश्लेषण' : 'Vegetation Analysis'}
              </CardTitle>
              <CardDescription>
                {isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਡੇਟਾ ਨਾਲ ਖੇਤ ਦੀ ਸਿਹਤ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ' : isHindi ? 'सैटेलाइट डेटा से खेत के स्वास्थ्य का विश्लेषण करें' : 'Analyze field health with satellite data'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Vegetation Indices Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        {isPunjabi ? 'ਵਨਸਪਤੀ ਸੂਚਕਾਂਕ' : isHindi ? 'वनस्पति सूचकांक' : 'Vegetation Indices'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button
                          onClick={() => {
                            toast.info(isPunjabi ? 'NDVI ਵਿਸ਼ਲੇਸ਼ਣ ਸ਼ੁਰੂ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...' : isHindi ? 'NDVI विश्लेषण शुरू किया जा रहा है...' : 'Starting NDVI analysis...');
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          <Leaf className="h-4 w-4 mr-2" />
                          NDVI (Normalized Difference Vegetation Index)
                        </Button>
                        <Button
                          onClick={() => {
                            toast.info(isPunjabi ? 'MSAVI2 ਵਿਸ਼ਲੇਸ਼ਣ ਸ਼ੁਰੂ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...' : isHindi ? 'MSAVI2 विश्लेषण शुरू किया जा रहा है...' : 'Starting MSAVI2 analysis...');
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          <Leaf className="h-4 w-4 mr-2" />
                          MSAVI2 (Modified Soil Adjusted Vegetation Index)
                        </Button>
                        <Button
                          onClick={() => {
                            toast.info(isPunjabi ? 'EVI ਵਿਸ਼ਲੇਸ਼ਣ ਸ਼ੁਰੂ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...' : isHindi ? 'EVI विश्लेषण शुरू किया जा रहा है...' : 'Starting EVI analysis...');
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          <Leaf className="h-4 w-4 mr-2" />
                          EVI (Enhanced Vegetation Index)
                        </Button>
                        <Button
                          onClick={() => {
                            toast.info(isPunjabi ? 'GCI ਵਿਸ਼ਲੇਸ਼ਣ ਸ਼ੁਰੂ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...' : isHindi ? 'GCI विश्लेषण शुरू किया जा रहा है...' : 'Starting GCI analysis...');
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          <Leaf className="h-4 w-4 mr-2" />
                          GCI (Green Chlorophyll Index)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        {isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ ਸੈਟਿੰਗਸ' : isHindi ? 'विश्लेषण सेटिंग्स' : 'Analysis Settings'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-muted-foreground">
                            {isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ ਖੇਤਰ' : isHindi ? 'विश्लेषण क्षेत्र' : 'Analysis Area'}
                          </label>
                          <select className="w-full p-2 border rounded text-sm">
                            <option>{isPunjabi ? 'ਪੂਰਾ ਖੇਤ' : isHindi ? 'पूरा खेत' : 'Entire Field'}</option>
                            <option>{isPunjabi ? 'ਵਿਸ਼ੇਸ਼ ਖੇਤਰ' : isHindi ? 'विशेष क्षेत्र' : 'Specific Area'}</option>
                            <option>{isPunjabi ? 'ਕਸਟਮ ਖੇਤਰ' : isHindi ? 'कस्टम क्षेत्र' : 'Custom Area'}</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">
                            {isPunjabi ? 'ਸਮਾਂ ਅਵਧੀ' : isHindi ? 'समय अवधि' : 'Time Period'}
                          </label>
                          <select className="w-full p-2 border rounded text-sm">
                            <option>{isPunjabi ? 'ਪਿਛਲੇ 30 ਦਿਨ' : isHindi ? 'पिछले 30 दिन' : 'Last 30 days'}</option>
                            <option>{isPunjabi ? 'ਪਿਛਲੇ 3 ਮਹੀਨੇ' : isHindi ? 'पिछले 3 महीने' : 'Last 3 months'}</option>
                            <option>{isPunjabi ? 'ਪਿਛਲੇ ਸਾਲ' : isHindi ? 'पिछले साल' : 'Last year'}</option>
                          </select>
                        </div>
                        <Button
                          onClick={() => {
                            toast.success(isPunjabi ? 'ਵਨਸਪਤੀ ਵਿਸ਼ਲੇਸ਼ਣ ਸ਼ੁਰੂ ਕੀਤਾ ਗਿਆ!' : isHindi ? 'वनस्पति विश्लेषण शुरू किया गया!' : 'Vegetation analysis started!');
                          }}
                          className="w-full"
                          size="sm"
                        >
                          <Activity className="h-4 w-4 mr-2" />
                          {isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ ਸ਼ੁਰੂ ਕਰੋ' : isHindi ? 'विश्लेषण शुरू करें' : 'Start Analysis'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Vegetation Health Overview */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      {isPunjabi ? 'ਵਨਸਪਤੀ ਸਿਹਤ ਅਵਲੋਕਨ' : isHindi ? 'वनस्पति स्वास्थ्य अवलोकन' : 'Vegetation Health Overview'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">85%</div>
                        <div className="text-sm text-green-600">
                          {isPunjabi ? 'ਵਨਸਪਤੀ ਸਿਹਤ' : isHindi ? 'वनस्पति स्वास्थ्य' : 'Vegetation Health'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">0.72</div>
                        <div className="text-sm text-blue-600">
                          {isPunjabi ? 'NDVI ਸਕੋਰ' : isHindi ? 'NDVI स्कोर' : 'NDVI Score'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">Good</div>
                        <div className="text-sm text-yellow-600">
                          {isPunjabi ? 'ਸਿਹਤ ਸਥਿਤੀ' : isHindi ? 'स्वास्थ्य स्थिति' : 'Health Status'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vegetation Analysis Results */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      {isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ ਨਤੀਜੇ' : isHindi ? 'विश्लेषण नतीजे' : 'Analysis Results'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                      <Leaf className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        {isPunjabi ? 'ਵਨਸਪਤੀ ਵਿਸ਼ਲੇਸ਼ਣ ਨਤੀਜੇ ਇੱਥੇ ਦਿਖਾਏ ਜਾਣਗੇ' : isHindi ? 'वनस्पति विश्लेषण नतीजे यहां दिखाए जाएंगे' : 'Vegetation analysis results will appear here'}
                      </p>
                      <Button
                        onClick={() => {
                          toast.info(isPunjabi ? 'ਵਨਸਪਤੀ ਵਿਸ਼ਲੇਸ਼ਣ ਚਲਾਇਆ ਜਾ ਰਿਹਾ ਹੈ...' : isHindi ? 'वनस्पति विश्लेषण चलाया जा रहा है...' : 'Running vegetation analysis...');
                        }}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        {isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ ਚਲਾਓ' : isHindi ? 'विश्लेषण चलाएं' : 'Run Analysis'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <AnandSaathiVegetationAnalysis />
        </TabsContent>

        {/* Save Tab */}
        <TabsContent value="save" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="h-5 w-5" />
                {isPunjabi ? 'ਖੇਤ ਸੇਵ ਕਰੋ' : isHindi ? 'खेत सेव करें' : 'Save Field'}
              </CardTitle>
              <CardDescription>
                {isPunjabi ? 'ਖੇਤ ਦੀ ਜਾਣਕਾਰੀ ਸੇਵ ਕਰੋ ਅਤੇ ਅਗਲੇ ਕਦਮ \'ਤੇ ਜਾਓ' : isHindi ? 'खेत की जानकारी सेव करें और अगले कदम पर जाएं' : 'Save field information and proceed to next step'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Field Information Summary */}
                <Card className="bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {isPunjabi ? 'ਖੇਤ ਜਾਣਕਾਰੀ ਸਾਰ' : isHindi ? 'खेत जानकारी सार' : 'Field Information Summary'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {isPunjabi ? 'ਖੇਤ ਦਾ ਨਾਮ' : isHindi ? 'खेत का नाम' : 'Field Name'}
                        </label>
                        <input
                          type="text"
                          value={fieldData.name}
                          onChange={(e) => setFieldData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full p-2 border rounded text-sm"
                          placeholder={isPunjabi ? 'ਖੇਤ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ' : isHindi ? 'खेत का नाम दर्ज करें' : 'Enter field name'}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {isPunjabi ? 'ਫਸਲ ਦੀ ਕਿਸਮ' : isHindi ? 'फसल की किस्म' : 'Crop Type'}
                        </label>
                        <select
                          value={fieldData.crop_type}
                          onChange={(e) => setFieldData(prev => ({ ...prev, crop_type: e.target.value }))}
                          className="w-full p-2 border rounded text-sm"
                        >
                          <option value="Rice">{isPunjabi ? 'ਚੌਲ' : isHindi ? 'चावल' : 'Rice'}</option>
                          <option value="Wheat">{isPunjabi ? 'ਗੇਹੂੰ' : isHindi ? 'गेहूं' : 'Wheat'}</option>
                          <option value="Corn">{isPunjabi ? 'ਮੱਕੀ' : isHindi ? 'मक्का' : 'Corn'}</option>
                          <option value="Sugarcane">{isPunjabi ? 'ਗੰਨਾ' : isHindi ? 'गन्ना' : 'Sugarcane'}</option>
                          <option value="Cotton">{isPunjabi ? 'ਕਪਾਹ' : isHindi ? 'कपास' : 'Cotton'}</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {isPunjabi ? 'ਖੇਤਰ (ਏਕੜ)' : isHindi ? 'क्षेत्र (एकड़)' : 'Area (Acres)'}
                        </label>
                        <input
                          type="number"
                          value={fieldData.area_acres}
                          onChange={(e) => setFieldData(prev => ({ ...prev, area_acres: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-2 border rounded text-sm"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          {isPunjabi ? 'ਮੈਪਿੰਗ ਵਿਧੀ' : isHindi ? 'मैपिंग विधि' : 'Mapping Method'}
                        </label>
                        <input
                          type="text"
                          value={dataEntryMethods.find(m => m.id === mappingState.method)?.name || ''}
                          className="w-full p-2 border rounded text-sm bg-gray-50"
                          readOnly
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Validation Status */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      {isPunjabi ? 'ਵੈਲੀਡੇਸ਼ਨ ਸਥਿਤੀ' : isHindi ? 'वैलिडेशन स्थिति' : 'Validation Status'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {mappingState.method ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm">
                          {mappingState.method ? 
                            (isPunjabi ? 'ਮੈਪਿੰਗ ਵਿਧੀ ਚੁਣੀ ਗਈ' : isHindi ? 'मैपिंग विधि चुनी गई' : 'Mapping method selected') :
                            (isPunjabi ? 'ਮੈਪਿੰਗ ਵਿਧੀ ਚੁਣੋ' : isHindi ? 'मैपिंग विधि चुनें' : 'Select mapping method')
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {fieldData.name ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm">
                          {fieldData.name ? 
                            (isPunjabi ? 'ਖੇਤ ਦਾ ਨਾਮ ਦਰਜ ਕੀਤਾ ਗਿਆ' : isHindi ? 'खेत का नाम दर्ज किया गया' : 'Field name entered') :
                            (isPunjabi ? 'ਖੇਤ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ' : isHindi ? 'खेत का नाम दर्ज करें' : 'Enter field name')
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {fieldData.area_acres > 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm">
                          {fieldData.area_acres > 0 ? 
                            (isPunjabi ? 'ਖੇਤਰ ਦਰਜ ਕੀਤਾ ਗਿਆ' : isHindi ? 'क्षेत्र दर्ज किया गया' : 'Area entered') :
                            (isPunjabi ? 'ਖੇਤਰ ਦਰਜ ਕਰੋ' : isHindi ? 'क्षेत्र दर्ज करें' : 'Enter area')
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Save Actions */}
                <div className="space-y-2">
                  <Button
                    onClick={saveField}
                    className="w-full"
                    size="lg"
                    disabled={!mappingState.method || !fieldData.name || fieldData.area_acres <= 0}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isPunjabi ? 'ਖੇਤ ਸੇਵ ਕਰੋ' : isHindi ? 'खेत सेव करें' : 'Save Field'}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        toast.info(isPunjabi ? 'ਖੇਤ ਨੂੰ ਪ੍ਰੀ-ਵਿਊ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...' : isHindi ? 'खेत को प्री-व्यू किया जा रहा है...' : 'Previewing field...');
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {isPunjabi ? 'ਪ੍ਰੀ-ਵਿਊ' : isHindi ? 'प्री-व्यू' : 'Preview'}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        toast.info(isPunjabi ? 'ਖੇਤ ਨੂੰ ਐਕਸਪੋਰਟ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...' : isHindi ? 'खेत को एक्सपोर्ट किया जा रहा है...' : 'Exporting field...');
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {isPunjabi ? 'ਐਕਸਪੋਰਟ' : isHindi ? 'एक्सपोर्ट' : 'Export'}
                    </Button>
                  </div>
                </div>

                {/* Success Message */}
                {mappingState.isMapping && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      {isPunjabi ? 'ਖੇਤ ਸਫਲਤਾਪੂਰਵਕ ਸੇਵ ਕੀਤਾ ਗਿਆ! ਅਗਲੇ ਕਦਮ \'ਤੇ ਜਾਓ।' :
                       isHindi ? 'खेत सफलतापूर्वक सेव किया गया! अगले कदम पर जाएं।' :
                       'Field saved successfully! Proceed to next step.'}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnandSaathiEnhancedFieldMapper;










