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
  Sprout,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { getRealFieldAnalysis, storeFieldData, RealFieldData } from "@/lib/realFieldData";

interface FieldPoint {
  lat: number;
  lng: number;
  id: string;
}

interface SimpleSatelliteMapperProps {
  onComplete: (fieldData: any) => void;
}

const SimpleSatelliteMapper = ({ onComplete }: SimpleSatelliteMapperProps) => {
  const [mappingMode, setMappingMode] = useState<'walk' | 'pin' | null>(null);
  const [fieldPoints, setFieldPoints] = useState<FieldPoint[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [fieldArea, setFieldArea] = useState(0);
  const [cropType, setCropType] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 });
  const [zoomLevel, setZoomLevel] = useState(16);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  // Generate Google Maps embed URL for satellite view
  const getSatelliteMapUrl = () => {
    const { lat, lng } = mapCenter;
    const zoom = Math.max(15, zoomLevel);

    // Use Google Maps Embed API for reliable satellite imagery
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBZlJtstGEj9wCMP5_O5PaGytIi-iForN0';
    return `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=${zoom}&maptype=satellite`;
  };

  // Handle manual coordinate input for pin placement
  const addPointByCoordinates = (lat: number, lng: number) => {
    const newPoint: FieldPoint = {
      lat,
      lng,
      id: `point-${Date.now()}`
    };
    
    setFieldPoints(prev => [...prev, newPoint]);
    toast.success(`Field corner ${fieldPoints.length + 1} marked at ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
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

      const location = currentLocation || mapCenter;

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
        realAnalysis: true
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
        center: currentLocation || mapCenter,
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
              Satellite Field Mapper
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Map your field boundary using satellite imagery and GPS tracking
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
                    Use satellite imagery to mark field corners by coordinates
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
                    Ground Truth Precise
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

        {/* Satellite Map Interface */}
        {mappingMode === 'pin' && cropType && (
          <div className="space-y-4">
            {/* Map Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    <span className="text-sm font-medium">Location:</span>
                    <Badge variant="outline">
                      {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setZoomLevel(prev => Math.min(20, prev + 1))}
                    >
                      <ZoomIn className="h-3 w-3" />
                    </Button>
                    <span className="text-sm">Zoom: {zoomLevel}</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setZoomLevel(prev => Math.max(10, prev - 1))}
                    >
                      <ZoomOut className="h-3 w-3" />
                    </Button>
                  </div>

                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      if (currentLocation) {
                        setMapCenter(currentLocation);
                        toast.success("Map centered on your location");
                      } else {
                        toast.error("Location not available");
                      }
                    }}
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    Center on Me
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Satellite Map Embed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Satellite className="h-5 w-5" />
                    Google Satellite View
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => window.open(`https://www.google.com/maps/@${mapCenter.lat},${mapCenter.lng},${zoomLevel}z/data=!3m1!1e3`, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Full Map
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Embedded Satellite Map */}
                  <div className="w-full h-96 rounded-lg border-2 border-primary/20 overflow-hidden">
                    <iframe
                      ref={iframeRef}
                      src={getSatelliteMapUrl()}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Satellite Map View"
                    />
                  </div>

                  {/* Manual Coordinate Input */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-2">
                      <Label>Latitude</Label>
                      <Input
                        type="number"
                        step="0.000001"
                        placeholder="28.613900"
                        id="lat-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Longitude</Label>
                      <Input
                        type="number"
                        step="0.000001"
                        placeholder="77.209000"
                        id="lng-input"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={() => {
                          const latInput = document.getElementById('lat-input') as HTMLInputElement;
                          const lngInput = document.getElementById('lng-input') as HTMLInputElement;
                          
                          const lat = parseFloat(latInput.value);
                          const lng = parseFloat(lngInput.value);
                          
                          if (isNaN(lat) || isNaN(lng)) {
                            toast.error("Please enter valid coordinates");
                            return;
                          }
                          
                          if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                            toast.error("Coordinates out of valid range");
                            return;
                          }
                          
                          addPointByCoordinates(lat, lng);
                          latInput.value = '';
                          lngInput.value = '';
                        }}
                        className="w-full"
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Add Point
                      </Button>
                    </div>
                  </div>

                  {/* Field Points List */}
                  {fieldPoints.length > 0 && (
                    <div className="space-y-2">
                      <Label>Field Corners ({fieldPoints.length} points)</Label>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {fieldPoints.map((point, index) => (
                          <div key={point.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                            <span>Corner {index + 1}: {point.lat.toFixed(6)}, {point.lng.toFixed(6)}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setFieldPoints(prev => prev.filter(p => p.id !== point.id));
                                toast.info(`Corner ${index + 1} removed`);
                              }}
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Field Area Display */}
                  {fieldArea > 0 && (
                    <div className="p-3 bg-success/10 rounded-lg">
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
                </div>
              </CardContent>
            </Card>

            {/* Map Controls */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={removeLastPoint} variant="outline" disabled={fieldPoints.length === 0}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Remove Last Point
              </Button>
              <Button onClick={clearAllPoints} variant="outline" disabled={fieldPoints.length === 0}>
                <Target className="h-4 w-4 mr-2" />
                Clear All Points
              </Button>
            </div>
          </div>
        )}

        {/* GPS Walk Mode */}
        {mappingMode === 'walk' && cropType && (
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
              setCropType('');
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

export default SimpleSatelliteMapper;
