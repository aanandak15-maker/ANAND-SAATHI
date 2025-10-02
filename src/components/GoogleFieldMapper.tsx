import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Navigation,
  Target,
  RotateCcw,
  Satellite,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { loadGoogleMaps } from '@/lib/googleMapsLoader';

interface GPSPoint {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: Date;
}

const GoogleFieldMapper = ({ onComplete }: { onComplete: (fieldData: any) => void }) => {
  const [mappingMode, setMappingMode] = useState<'walk' | 'pin' | null>(null);
  const [gpsPoints, setGpsPoints] = useState<GPSPoint[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GPSPoint | null>(null);
  const [fieldArea, setFieldArea] = useState(0);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polygonRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Load Google Maps using centralized loader
  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        console.log('Loading Google Maps for field mapper...');
        await loadGoogleMaps();
        console.log('Google Maps loaded successfully for field mapper');
        setIsMapLoaded(true);
      } catch (error) {
        console.error('Failed to load Google Maps for field mapper:', error);
      }
    };

    initializeGoogleMaps();
  }, []);

  // Initialize map when in pin mode
  useEffect(() => {
    if (mappingMode === 'pin' && isMapLoaded && mapRef.current) {
      initializeMap();
    }
  }, [mappingMode, isMapLoaded]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 28.6139, lng: 77.2090 }, // Default to Delhi
      zoom: 18,
      mapTypeId: window.google.maps.MapTypeId.SATELLITE,
      gestureHandling: 'cooperative'
    });

    mapInstanceRef.current = map;

    // Add click listener for pinning points
    map.addListener('click', (event: any) => {
      if (mappingMode === 'pin') {
        const newPoint: GPSPoint = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
          accuracy: 3, // Assumed accuracy for manual pinning
          timestamp: new Date()
        };
        
        setGpsPoints(prev => [...prev, newPoint]);
        addMarker(newPoint, gpsPoints.length);
        updatePolygon([...gpsPoints, newPoint]);
      }
    });

    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          map.setCenter(userLocation);
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  };

  const addMarker = (point: GPSPoint, index: number) => {
    if (!mapInstanceRef.current) return;

    const marker = new window.google.maps.Marker({
      position: { lat: point.lat, lng: point.lng },
      map: mapInstanceRef.current,
      title: `Point ${index + 1}`,
      label: (index + 1).toString(),
      draggable: true
    });

    // Update point when marker is dragged
    marker.addListener('dragend', (event: any) => {
      const updatedPoints = [...gpsPoints];
      updatedPoints[index] = {
        ...updatedPoints[index],
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      setGpsPoints(updatedPoints);
      updatePolygon(updatedPoints);
    });

    markersRef.current.push(marker);
  };

  const updatePolygon = (points: GPSPoint[]) => {
    if (!mapInstanceRef.current || points.length < 3) return;

    // Remove existing polygon
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }

    const path = points.map(p => ({ lat: p.lat, lng: p.lng }));
    
    polygonRef.current = new window.google.maps.Polygon({
      paths: path,
      strokeColor: '#10b981',
      strokeOpacity: 1,
      strokeWeight: 2,
      fillColor: '#10b981',
      fillOpacity: 0.3,
      map: mapInstanceRef.current
    });

    // Calculate area
    const area = window.google.maps.geometry.spherical.computeArea(polygonRef.current.getPath());
    setFieldArea(area / 10000); // Convert to hectares
  };

  // Simulate GPS tracking
  useEffect(() => {
    if (isRecording && mappingMode === 'walk') {
      const interval = setInterval(() => {
        // In a real app, this would use navigator.geolocation.watchPosition
        const baseLocation = gpsPoints.length > 0 
          ? gpsPoints[gpsPoints.length - 1] 
          : { lat: 28.6139, lng: 77.2090 };
        
        const newPoint: GPSPoint = {
          lat: baseLocation.lat + (Math.random() - 0.5) * 0.001,
          lng: baseLocation.lng + (Math.random() - 0.5) * 0.001,
          accuracy: Math.random() * 10 + 3,
          timestamp: new Date()
        };
        
        setCurrentLocation(newPoint);
        if (gpsPoints.length === 0 || 
            getDistance(newPoint, gpsPoints[gpsPoints.length - 1]) > 10) {
          setGpsPoints(prev => [...prev, newPoint]);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isRecording, mappingMode, gpsPoints]);

  const getDistance = (p1: GPSPoint, p2: GPSPoint) => {
    const R = 6371e3;
    const φ1 = p1.lat * Math.PI/180;
    const φ2 = p2.lat * Math.PI/180;
    const Δφ = (p2.lat-p1.lat) * Math.PI/180;
    const Δλ = (p2.lng-p1.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  useEffect(() => {
    if (gpsPoints.length >= 3 && mappingMode === 'walk') {
      const area = gpsPoints.length * 0.1;
      setFieldArea(area);
    }
  }, [gpsPoints]);

  const startRecording = () => {
    setIsRecording(true);
    setGpsPoints([]);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const clearPoints = () => {
    setGpsPoints([]);
    setFieldArea(0);
    setIsRecording(false);
    
    // Clear map elements
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }
  };

  const saveField = () => {
    const fieldData = {
      boundary: gpsPoints,
      area: fieldArea,
      mappingMode,
      createdAt: new Date(),
      accuracy: gpsPoints.reduce((sum, p) => sum + p.accuracy, 0) / gpsPoints.length
    };
    onComplete(fieldData);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Map Your Field with Google Maps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Choose how you want to create your field boundary using Google Maps
            </p>
          </CardContent>
        </Card>

        {/* Mapping Mode Selection */}
        {!mappingMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setMappingMode('walk')}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <Navigation className="h-12 w-12 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Walk the Boundary</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Walk around your field perimeter with GPS tracking
                  </p>
                  <Badge className="mt-2 bg-success/10 text-success">
                    Most Accurate
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setMappingMode('pin')}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <Target className="h-12 w-12 text-accent mx-auto mb-2" />
                  <h3 className="font-semibold">Pin on Satellite Map</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mark field corners by clicking on Google satellite imagery
                  </p>
                  <Badge className="mt-2 bg-accent/10 text-accent">
                    Quick & Easy
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Walk Mode Interface */}
        {mappingMode === 'walk' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    GPS Tracking
                  </span>
                  <Badge variant={isRecording ? "default" : "outline"}>
                    {isRecording ? 'Recording' : 'Stopped'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentLocation && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span>Current Location:</span>
                      <Badge variant="outline">
                        ±{currentLocation.accuracy.toFixed(1)}m
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm">Points Collected:</span>
                  <Badge>{gpsPoints.length}</Badge>
                </div>

                {fieldArea > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Estimated Area:</span>
                    <Badge className="bg-success/10 text-success">
                      {fieldArea.toFixed(2)} hectares
                    </Badge>
                  </div>
                )}

                <div className="bg-accent/10 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-accent mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Instructions:</p>
                      <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                        <li>• Walk slowly around field boundary</li>
                        <li>• Keep phone steady and upright</li>
                        <li>• Stay close to the actual field edge</li>
                        <li>• Complete the full perimeter</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {!isRecording ? (
                    <Button onClick={startRecording} className="flex items-center gap-2">
                      <Navigation className="h-4 w-4" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button onClick={stopRecording} variant="destructive" className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Stop Recording
                    </Button>
                  )}
                  
                  <Button onClick={clearPoints} variant="outline" className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pin Mode Interface */}
        {mappingMode === 'pin' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Satellite className="h-5 w-5" />
                  Google Satellite Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isMapLoaded ? (
                  <div>
                    <div ref={mapRef} className="w-full h-96 rounded-lg border" />
                    <div className="flex justify-between items-center mt-3 text-sm">
                      <span>Corners marked: {gpsPoints.length}</span>
                      {fieldArea > 0 && (
                        <Badge className="bg-success/10 text-success">
                          {fieldArea.toFixed(2)} hectares
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Click on the map to mark field corners. Drag markers to adjust position.
                    </p>
                  </div>
                ) : (
                  <div className="bg-muted rounded-lg h-96 flex items-center justify-center">
                    <div className="text-center">
                      <Satellite className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Loading Google Maps...</p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Button onClick={clearPoints} variant="outline" className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Clear All Points
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Save Button */}
        {mappingMode && (gpsPoints.length >= 3 || (mappingMode === 'pin' && gpsPoints.length >= 3)) && (
          <Button onClick={saveField} className="w-full flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Save Field Boundary ({fieldArea.toFixed(2)} hectares)
          </Button>
        )}

        {/* Back Button */}
        {mappingMode && (
          <Button 
            onClick={() => setMappingMode(null)} 
            variant="outline" 
            className="w-full"
          >
            Choose Different Method
          </Button>
        )}
      </div>
    </div>
  );
};

export default GoogleFieldMapper;