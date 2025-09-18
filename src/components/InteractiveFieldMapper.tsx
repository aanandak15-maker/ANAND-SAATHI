import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Crosshair
} from "lucide-react";
import { toast } from "sonner";

interface FieldPoint {
  lat: number;
  lng: number;
  id: string;
}

interface InteractiveFieldMapperProps {
  onComplete: (fieldData: any) => void;
}

const InteractiveFieldMapper = ({ onComplete }: InteractiveFieldMapperProps) => {
  const [mappingMode, setMappingMode] = useState<'walk' | 'pin' | null>(null);
  const [fieldPoints, setFieldPoints] = useState<FieldPoint[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [fieldArea, setFieldArea] = useState(0);
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi
  const [zoomLevel, setZoomLevel] = useState(16);
  const [satelliteLayer, setSatelliteLayer] = useState<'satellite' | 'hybrid' | 'terrain'>('satellite');
  const mapRef = useRef<HTMLDivElement>(null);

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
          setMapCenter(location);
          toast.success("Location found! Map centered on your location.");
        },
        (error) => {
          console.warn("Location access denied:", error);
          toast.info("Using default location. Enable GPS for better accuracy.");
        }
      );
    }
  }, []);

  // Calculate field area using Shoelace formula
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
    const area = calculateArea(fieldPoints);
    setFieldArea(area);
  }, [fieldPoints]);

  // Handle map click for pin placement
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (mappingMode !== 'pin') return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert pixel coordinates to lat/lng (simplified calculation)
    const mapWidth = rect.width;
    const mapHeight = rect.height;
    
    // Calculate approximate lat/lng based on current map center and zoom
    const latRange = 0.01 / Math.pow(2, zoomLevel - 10); // Approximate degree range
    const lngRange = 0.01 / Math.pow(2, zoomLevel - 10);
    
    const lat = mapCenter.lat + ((mapHeight / 2 - y) / mapHeight) * latRange;
    const lng = mapCenter.lng + ((x - mapWidth / 2) / mapWidth) * lngRange;
    
    const newPoint: FieldPoint = {
      lat,
      lng,
      id: `point-${Date.now()}`
    };
    
    setFieldPoints(prev => [...prev, newPoint]);
    toast.success(`Field corner ${fieldPoints.length + 1} marked!`);
  };

  // Remove last point
  const removeLastPoint = () => {
    if (fieldPoints.length > 0) {
      setFieldPoints(prev => prev.slice(0, -1));
      toast.info("Last point removed");
    }
  };

  // Clear all points
  const clearAllPoints = () => {
    setFieldPoints([]);
    setFieldArea(0);
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
          setFieldPoints(prev => [...prev, newPoint]);
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

  // Save field data
  const saveField = () => {
    if (fieldPoints.length < 3) {
      toast.error("Please mark at least 3 points to create a field boundary");
      return;
    }

    const fieldData = {
      boundary: {
        coordinates: [[...fieldPoints.map(p => [p.lng, p.lat]), [fieldPoints[0].lng, fieldPoints[0].lat]]]
      },
      area: fieldArea,
      mappingMode,
      pointCount: fieldPoints.length,
      createdAt: new Date(),
      center: mapCenter
    };
    
    toast.success(`Field saved! Area: ${fieldArea.toFixed(2)} hectares`);
    onComplete(fieldData);
  };

  // Get satellite imagery URL (using Google Maps Static API as example)
  const getSatelliteImageUrl = () => {
    const { lat, lng } = mapCenter;
    const size = "640x640";
    const maptype = satelliteLayer === 'satellite' ? 'satellite' : 
                   satelliteLayer === 'hybrid' ? 'hybrid' : 'terrain';
    
    // Note: In production, you'd use a proper API key
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoomLevel}&size=${size}&maptype=${maptype}&key=YOUR_API_KEY`;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Satellite className="h-5 w-5 text-primary" />
              Interactive Field Mapper
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Mark your field boundary using satellite imagery or GPS tracking
            </p>
          </CardContent>
        </Card>

        {/* Mode Selection */}
        {!mappingMode && (
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
                    Click on satellite imagery to mark field corners precisely
                  </p>
                  <Badge className="mt-3 bg-primary/10 text-primary">
                    Visual & Accurate
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
                    Most Precise
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Satellite Map Interface */}
        {mappingMode === 'pin' && (
          <div className="space-y-4">
            {/* Map Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    <span className="text-sm font-medium">Layer:</span>
                    <div className="flex gap-1">
                      {(['satellite', 'hybrid', 'terrain'] as const).map((layer) => (
                        <Button
                          key={layer}
                          size="sm"
                          variant={satelliteLayer === layer ? "default" : "outline"}
                          onClick={() => setSatelliteLayer(layer)}
                          className="text-xs"
                        >
                          {layer.charAt(0).toUpperCase() + layer.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setZoomLevel(prev => Math.min(20, prev + 1))}>
                      <ZoomIn className="h-3 w-3" />
                    </Button>
                    <span className="text-sm">Zoom: {zoomLevel}</span>
                    <Button size="sm" variant="outline" onClick={() => setZoomLevel(prev => Math.max(10, prev - 1))}>
                      <ZoomOut className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Crosshair className="h-5 w-5" />
                    Click to Mark Corners
                  </span>
                  <Badge variant="outline">
                    {fieldPoints.length} points
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  ref={mapRef}
                  className="relative w-full h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg cursor-crosshair overflow-hidden border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors"
                  onClick={handleMapClick}
                  style={{
                    backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%23e5e7eb" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>')`,
                    backgroundSize: '20px 20px'
                  }}
                >
                  {/* Satellite imagery placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-200/50 to-amber-200/50">
                    <div className="absolute inset-4 bg-gradient-to-br from-green-300/30 to-green-600/30 rounded"></div>
                    <div className="absolute top-8 right-8 w-16 h-16 bg-blue-400/40 rounded-full"></div>
                    <div className="absolute bottom-12 left-12 w-24 h-8 bg-amber-400/40 rounded"></div>
                  </div>

                  {/* Field points */}
                  {fieldPoints.map((point, index) => {
                    const rect = mapRef.current?.getBoundingClientRect();
                    if (!rect) return null;
                    
                    // Convert lat/lng back to pixel coordinates
                    const latRange = 0.01 / Math.pow(2, zoomLevel - 10);
                    const lngRange = 0.01 / Math.pow(2, zoomLevel - 10);
                    
                    const x = ((point.lng - mapCenter.lng) / lngRange) * rect.width + rect.width / 2;
                    const y = rect.height / 2 - ((point.lat - mapCenter.lat) / latRange) * rect.height;
                    
                    return (
                      <div
                        key={point.id}
                        className="absolute w-4 h-4 bg-primary border-2 border-white rounded-full shadow-lg transform -translate-x-2 -translate-y-2 animate-pulse"
                        style={{
                          left: Math.max(0, Math.min(rect.width - 16, x)),
                          top: Math.max(0, Math.min(rect.height - 16, y))
                        }}
                      >
                        <div className="absolute -top-6 -left-2 text-xs font-bold text-primary bg-white px-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    );
                  })}

                  {/* Field boundary lines */}
                  {fieldPoints.length > 1 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      {fieldPoints.map((point, index) => {
                        if (index === fieldPoints.length - 1) return null;
                        
                        const rect = mapRef.current?.getBoundingClientRect();
                        if (!rect) return null;
                        
                        const latRange = 0.01 / Math.pow(2, zoomLevel - 10);
                        const lngRange = 0.01 / Math.pow(2, zoomLevel - 10);
                        
                        const x1 = ((point.lng - mapCenter.lng) / lngRange) * rect.width + rect.width / 2;
                        const y1 = rect.height / 2 - ((point.lat - mapCenter.lat) / latRange) * rect.height;
                        
                        const nextPoint = fieldPoints[index + 1];
                        const x2 = ((nextPoint.lng - mapCenter.lng) / lngRange) * rect.width + rect.width / 2;
                        const y2 = rect.height / 2 - ((nextPoint.lat - mapCenter.lat) / latRange) * rect.height;
                        
                        return (
                          <line
                            key={`line-${index}`}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeDasharray="4,4"
                          />
                        );
                      })}
                    </svg>
                  )}

                  {/* Instructions overlay */}
                  {fieldPoints.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg text-center">
                        <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="font-medium">Click to mark field corners</p>
                        <p className="text-sm text-muted-foreground">Start by clicking the first corner of your field</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Field info */}
                {fieldArea > 0 && (
                  <div className="flex justify-between items-center mt-4 p-3 bg-success/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium">Field Area:</span>
                    </div>
                    <Badge className="bg-success text-success-foreground">
                      {fieldArea.toFixed(3)} hectares
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Map controls */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={removeLastPoint} variant="outline" disabled={fieldPoints.length === 0}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Remove Last Point
              </Button>
              <Button onClick={clearAllPoints} variant="outline" disabled={fieldPoints.length === 0}>
                <Target className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
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
                    <div className="text-2xl font-bold text-success">{fieldArea.toFixed(2)}</div>
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
          </div>
        )}

        {/* Save Button */}
        {mappingMode && fieldPoints.length >= 3 && (
          <Button onClick={saveField} size="lg" className="w-full">
            <Save className="h-5 w-5 mr-2" />
            Save Field ({fieldArea.toFixed(3)} hectares)
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
            }} 
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

export default InteractiveFieldMapper;
