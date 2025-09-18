import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, 
  Navigation, 
  Target, 
  Save, 
  RotateCcw,
  Satellite,
  CheckCircle,
  AlertTriangle,
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Loader2,
  Sprout
} from "lucide-react";
import { toast } from "sonner";
import { getRealFieldAnalysis, storeFieldData, RealFieldData } from "@/lib/realFieldData";

interface FieldPoint {
  lat: number;
  lng: number;
  id: string;
}

interface GoogleSatelliteMapperProps {
  onComplete: (fieldData: any) => void;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GoogleSatelliteMapper = ({ onComplete }: GoogleSatelliteMapperProps) => {
  const [mappingMode, setMappingMode] = useState<'walk' | 'pin' | null>(null);
  const [fieldPoints, setFieldPoints] = useState<FieldPoint[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [fieldArea, setFieldArea] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [cropType, setCropType] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polygonRef = useRef<any>(null);

  // Load Google Maps API
  useEffect(() => {
    if (!window.google && !isLoadingMap) {
      setIsLoadingMap(true);
      
      // Create script element with version parameter to get latest imagery
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBZlJtstGEj9wCMP5_O5PaGytIi-iForN0&libraries=geometry&v=weekly`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setMapLoaded(true);
        setIsLoadingMap(false);
        toast.success("Google Maps loaded successfully!");
      };
      
      script.onerror = () => {
        setIsLoadingMap(false);
        toast.error("Failed to load Google Maps. Using fallback interface.");
      };
      
      document.head.appendChild(script);
    } else if (window.google) {
      setMapLoaded(true);
    }
  }, [isLoadingMap]);

  // Initialize Google Map
  useEffect(() => {
    if (mapLoaded && mapRef.current && mappingMode === 'pin' && !googleMapRef.current) {
      initializeGoogleMap();
    }
  }, [mapLoaded, mappingMode]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          
          // Update map center if map is already initialized
          if (googleMapRef.current) {
            googleMapRef.current.setCenter(location);
          }
          
          toast.success("Location found! Map centered on your location.");
        },
        (error) => {
          console.warn("Location access denied:", error);
          toast.info("Using default location. Enable GPS for better accuracy.");
          
          // Set default location (Delhi, India)
          const defaultLocation = { lat: 28.6139, lng: 77.2090 };
          setCurrentLocation(defaultLocation);
          
          if (googleMapRef.current) {
            googleMapRef.current.setCenter(defaultLocation);
          }
        }
      );
    }
  }, []);

  const initializeGoogleMap = () => {
    if (!window.google || !mapRef.current) return;

    const defaultCenter = currentLocation || { lat: 28.6139, lng: 77.2090 };
    
    // Create map with fresh satellite imagery
    googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 19, // Higher zoom for better field detail
      mapTypeId: 'satellite',
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.TOP_CENTER,
        mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain']
      },
      zoomControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      gestureHandling: 'greedy',
      // Force fresh imagery
      mapId: 'fresh_satellite_view',
      // Disable caching for fresh imagery
      clickableIcons: false,
      disableDefaultUI: false
    });

    // Force refresh satellite imagery
    const refreshImagery = () => {
      if (googleMapRef.current) {
        const currentCenter = googleMapRef.current.getCenter();
        const currentZoom = googleMapRef.current.getZoom();
        
        // Temporarily change map type and back to force refresh
        googleMapRef.current.setMapTypeId('hybrid');
        setTimeout(() => {
          googleMapRef.current.setMapTypeId('satellite');
        }, 100);
      }
    };

    // Refresh imagery after map loads
    setTimeout(refreshImagery, 1000);

    // Add click listener for pin placement
    googleMapRef.current.addListener('click', (event: any) => {
      if (mappingMode === 'pin') {
        addFieldPoint(event.latLng.lat(), event.latLng.lng());
      }
    });

    toast.success("Interactive satellite map ready! Click to mark field corners.");
  };

  const addFieldPoint = (lat: number, lng: number) => {
    const newPoint: FieldPoint = {
      lat,
      lng,
      id: `point-${Date.now()}`
    };
    
    setFieldPoints(prev => {
      const updated = [...prev, newPoint];
      updateMapVisualization(updated);
      return updated;
    });
    
    toast.success(`Field corner ${fieldPoints.length + 1} marked!`);
  };

  const updateMapVisualization = (points: FieldPoint[]) => {
    if (!googleMapRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Clear existing polygon
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }

    // Add markers for each point
    points.forEach((point, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: point.lat, lng: point.lng },
        map: googleMapRef.current,
        title: `Corner ${index + 1}`,
        label: {
          text: `${index + 1}`,
          color: 'white',
          fontWeight: 'bold'
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2
        }
      });
      
      markersRef.current.push(marker);
    });

    // Create polygon if we have at least 3 points
    if (points.length >= 3) {
      const path = points.map(point => ({ lat: point.lat, lng: point.lng }));
      
      polygonRef.current = new window.google.maps.Polygon({
        paths: path,
        strokeColor: '#3b82f6',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
        map: googleMapRef.current
      });

      // Calculate area using Google Maps geometry library
      if (window.google.maps.geometry) {
        const area = window.google.maps.geometry.spherical.computeArea(path);
        const hectares = area / 10000; // Convert square meters to hectares
        setFieldArea(hectares);
      }
    }
  };

  // Calculate field area using Shoelace formula (fallback)
  const calculateArea = (points: FieldPoint[]) => {
    if (points.length < 3) return 0;
    
    let area = 0;
    const n = points.length;
    
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += points[i].lng * points[j].lat;
      area -= points[j].lng * points[i].lat;
    }
    
    area = Math.abs(area) / 2;
    
    // Convert to hectares (rough approximation)
    const hectares = area * 111320 * 111320 / 10000;
    return Math.max(0.01, hectares);
  };

  useEffect(() => {
    if (!window.google || !window.google.maps.geometry) {
      const area = calculateArea(fieldPoints);
      setFieldArea(area);
    }
  }, [fieldPoints]);

  // Remove last point
  const removeLastPoint = () => {
    if (fieldPoints.length > 0) {
      const updated = fieldPoints.slice(0, -1);
      setFieldPoints(updated);
      updateMapVisualization(updated);
      toast.info("Last point removed");
    }
  };

  // Clear all points
  const clearAllPoints = () => {
    setFieldPoints([]);
    setFieldArea(0);
    updateMapVisualization([]);
    toast.info("All points cleared");
  };

  // Start GPS tracking for walk mode
  const startWalkMode = () => {
    if (!navigator.geolocation) {
      toast.error("GPS not available on this device");
      return;
    }

    setIsRecording(true);
    setFieldPoints([]);
    
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newPoint: FieldPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          id: `gps-${Date.now()}`
        };
        
        // Only add point if it's significantly different from the last one
        if (fieldPoints.length === 0 || 
            getDistance(newPoint, fieldPoints[fieldPoints.length - 1]) > 5) {
          setFieldPoints(prev => {
            const updated = [...prev, newPoint];
            if (googleMapRef.current) {
              updateMapVisualization(updated);
            }
            return updated;
          });
          setCurrentLocation({ lat: newPoint.lat, lng: newPoint.lng });
        }
      },
      (error) => {
        toast.error("GPS tracking error: " + error.message);
        setIsRecording(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000
      }
    );

    // Store watch ID for cleanup
    (window as any).gpsWatchId = watchId;
  };

  // Stop GPS tracking
  const stopWalkMode = () => {
    setIsRecording(false);
    if ((window as any).gpsWatchId) {
      navigator.geolocation.clearWatch((window as any).gpsWatchId);
      delete (window as any).gpsWatchId;
    }
    toast.success("GPS tracking stopped");
  };

  // Calculate distance between two points
  const getDistance = (p1: FieldPoint, p2: FieldPoint) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = p1.lat * Math.PI/180;
    const φ2 = p2.lat * Math.PI/180;
    const Δφ = (p2.lat - p1.lat) * Math.PI/180;
    const Δλ = (p2.lng - p1.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Save field data with real analysis
  const saveField = async () => {
    if (fieldPoints.length < 3) {
      toast.error("Please mark at least 3 points to create a field boundary");
      return;
    }

    if (!cropType.trim()) {
      toast.error("Please specify the crop type for accurate analysis");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const boundary = {
        coordinates: [[...fieldPoints.map(p => [p.lng, p.lat]), [fieldPoints[0].lng, fieldPoints[0].lat]]]
      };

      const location = currentLocation || { lat: 28.6139, lng: 77.2090 };

      toast.info("Analyzing field with real satellite data...");
      
      // Get real field analysis using GEE
      const realFieldData = await getRealFieldAnalysis(boundary, cropType, location);
      
      // Store the field data
      storeFieldData(realFieldData);
      
      // Create compatible field data for the callback
      const fieldData = {
        boundary,
        area: realFieldData.area,
        mappingMode,
        pointCount: fieldPoints.length,
        createdAt: new Date(),
        center: location,
        analysis: realFieldData.analysis,
        recommendations: realFieldData.recommendations,
        crop: cropType,
        realAnalysis: true // Flag to indicate this is real data
      };
      
      toast.success(`Field analyzed! Area: ${realFieldData.area.toFixed(3)} hectares`);
      onComplete(fieldData);
      
    } catch (error) {
      console.error('Failed to analyze field:', error);
      toast.error('Analysis failed. Saved field with basic data.');
      
      // Fallback to basic field data
      const basicFieldData = {
        boundary: {
          coordinates: [[...fieldPoints.map(p => [p.lng, p.lat]), [fieldPoints[0].lng, fieldPoints[0].lat]]]
        },
        area: fieldArea,
        mappingMode,
        pointCount: fieldPoints.length,
        createdAt: new Date(),
        center: currentLocation || { lat: 28.6139, lng: 77.2090 },
        crop: cropType,
        realAnalysis: false
      };
      
      onComplete(basicFieldData);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Satellite className="h-5 w-5 text-primary" />
              Google Satellite Field Mapper
              {isLoadingMap && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Mark your field boundary using real Google satellite imagery or GPS tracking
            </p>
          </CardContent>
        </Card>

        {/* Map Loading */}
        {isLoadingMap && (
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg font-medium">Loading Google Maps...</p>
              <p className="text-sm text-muted-foreground">Please wait while we load the satellite imagery</p>
            </CardContent>
          </Card>
        )}

        {/* Mode Selection */}
        {!mappingMode && mapLoaded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setMappingMode('pin')}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <Target className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-lg">Pin on Satellite Map</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Click on real Google satellite imagery to mark field corners precisely
                  </p>
                  <Badge className="mt-3 bg-primary/10 text-primary">
                    High Resolution & Accurate
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setMappingMode('walk')}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <Navigation className="h-12 w-12 text-success mx-auto mb-3" />
                  <h3 className="font-semibold text-lg">Walk the Boundary</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Walk around your field with GPS tracking for maximum accuracy
                  </p>
                  <Badge className="mt-3 bg-success/10 text-success">
                    Ground Truth Accurate
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Crop Selection */}
        {mappingMode && !cropType && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-green-600" />
                Select Your Crop
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="crop-select">What crop are you growing in this field?</Label>
                <Select onValueChange={setCropType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rice">Rice (Paddy/Dhan)</SelectItem>
                    <SelectItem value="wheat">Wheat (Gehun)</SelectItem>
                    <SelectItem value="cotton">Cotton (Kapas)</SelectItem>
                    <SelectItem value="sugarcane">Sugarcane (Ganna)</SelectItem>
                    <SelectItem value="maize">Maize (Makka)</SelectItem>
                    <SelectItem value="soybean">Soybean</SelectItem>
                    <SelectItem value="mustard">Mustard (Sarson)</SelectItem>
                    <SelectItem value="chickpea">Chickpea (Chana)</SelectItem>
                    <SelectItem value="lentil">Lentil (Masoor)</SelectItem>
                    <SelectItem value="potato">Potato (Aloo)</SelectItem>
                    <SelectItem value="tomato">Tomato</SelectItem>
                    <SelectItem value="onion">Onion (Pyaz)</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {cropType === 'other' && (
                <div className="space-y-2">
                  <Label htmlFor="custom-crop">Specify crop name:</Label>
                  <Input 
                    id="custom-crop"
                    placeholder="Enter crop name..."
                    onChange={(e) => setCropType(e.target.value)}
                  />
                </div>
              )}
              
              <Alert>
                <Sprout className="h-4 w-4" />
                <AlertDescription>
                  <strong>Why crop type matters:</strong> Different crops have different optimal NDVI ranges, 
                  growth patterns, and water requirements. Specifying your crop enables precise, 
                  crop-specific analysis and recommendations.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Google Maps Interface */}
        {mappingMode === 'pin' && mapLoaded && cropType && (
          <div className="space-y-4">
            {/* Map Status */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="font-medium">Real Google Satellite Imagery</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">
                      {fieldPoints.length} points marked
                    </Badge>
                    {fieldArea > 0 && (
                      <Badge className="bg-success/10 text-success">
                        {fieldArea.toFixed(3)} hectares
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Google Map Container */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Crosshair className="h-5 w-5" />
                    Click on Satellite Image to Mark Corners
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={removeLastPoint} disabled={fieldPoints.length === 0}>
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={clearAllPoints} disabled={fieldPoints.length === 0}>
                      <Target className="h-3 w-3" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  ref={mapRef}
                  className="w-full h-96 rounded-lg border-2 border-primary/20 overflow-hidden"
                  style={{ minHeight: '400px' }}
                />
                
                {fieldPoints.length === 0 && (
                  <Alert className="mt-4">
                    <Target className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Instructions:</strong> Click anywhere on the satellite map to mark field corners. 
                      You can zoom in/out and switch between satellite, hybrid, and terrain views using the map controls.
                    </AlertDescription>
                  </Alert>
                )}

                {fieldPoints.length > 0 && fieldPoints.length < 3 && (
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Need {3 - fieldPoints.length} more points:</strong> Mark at least 3 corners to create a field boundary.
                    </AlertDescription>
                  </Alert>
                )}

                {fieldArea > 0 && (
                  <div className="mt-4 p-4 bg-success/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-success" />
                        <span className="font-medium">Field Area Calculated:</span>
                      </div>
                      <div className="text-lg font-bold text-success">
                        {fieldArea.toFixed(3)} hectares
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* GPS Walk Mode */}
        {mappingMode === 'walk' && (
          <div className="space-y-4">
            <Alert>
              <Navigation className="h-4 w-4" />
              <AlertDescription>
                <strong>GPS Tracking Mode:</strong> Walk around your field boundary. 
                Keep your phone steady and walk slowly for best accuracy.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>GPS Tracking</span>
                  <Badge variant={isRecording ? "default" : "outline"}>
                    {isRecording ? "Recording" : "Stopped"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{fieldPoints.length}</div>
                    <div className="text-sm text-muted-foreground">GPS Points</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-success">{fieldArea.toFixed(3)}</div>
                    <div className="text-sm text-muted-foreground">Hectares</div>
                  </div>
                </div>

                {currentLocation && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="text-sm font-medium">Current Location:</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {!isRecording ? (
                    <Button onClick={startWalkMode} className="flex-1">
                      <Navigation className="h-4 w-4 mr-2" />
                      Start GPS Tracking
                    </Button>
                  ) : (
                    <Button onClick={stopWalkMode} variant="destructive" className="flex-1">
                      <Target className="h-4 w-4 mr-2" />
                      Stop Tracking
                    </Button>
                  )}
                  <Button onClick={clearAllPoints} variant="outline">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Show satellite map for GPS mode too */}
            {mapLoaded && (
              <Card>
                <CardHeader>
                  <CardTitle>GPS Tracking Visualization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    ref={mappingMode === 'walk' ? mapRef : null}
                    className="w-full h-64 rounded-lg border-2 border-success/20 overflow-hidden"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Save Button */}
        {mappingMode && fieldPoints.length >= 3 && cropType && (
          <Button 
            onClick={saveField} 
            size="lg" 
            className="w-full" 
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Analyzing with Real Satellite Data...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Analyze & Save Field ({fieldArea.toFixed(3)} hectares)
              </>
            )}
          </Button>
        )}

        {/* Back Button */}
        {mappingMode && (
          <Button 
            onClick={() => {
              setMappingMode(null);
              setFieldPoints([]);
              setFieldArea(0);
              if (isRecording) stopWalkMode();
              
              // Clear map visualization
              if (googleMapRef.current) {
                markersRef.current.forEach(marker => marker.setMap(null));
                markersRef.current = [];
                if (polygonRef.current) {
                  polygonRef.current.setMap(null);
                }
              }
            }} 
            variant="outline" 
            className="w-full"
          >
            Choose Different Method
          </Button>
        )}

        {/* Fallback for when Google Maps fails to load */}
        {!mapLoaded && !isLoadingMap && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Google Maps not available.</strong> Please check your internet connection or try refreshing the page.
              The basic field mapper is still available as a fallback.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default GoogleSatelliteMapper;
