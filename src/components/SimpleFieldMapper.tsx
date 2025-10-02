import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, 
  Target, 
  Save, 
  RotateCcw,
  Satellite,
  CheckCircle,
  Loader2,
  Sprout,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { getRealFieldAnalysis, getRealFieldAnalysisWithProgress, storeFieldData } from "@/lib/realFieldData";
import { Progress } from "@/components/ui/progress";

interface FieldPoint {
  lat: number;
  lng: number;
  id: string;
}

interface SimpleFieldMapperProps {
  onComplete: (fieldData: any) => void;
  onBack?: () => void;
}

const SimpleFieldMapper = ({ onComplete, onBack }: SimpleFieldMapperProps) => {
  const [fieldPoints, setFieldPoints] = useState<FieldPoint[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [fieldArea, setFieldArea] = useState(0);
  const [cropType, setCropType] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 });
  const [zoomLevel, setZoomLevel] = useState(18);
  const [isLocating, setIsLocating] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });

  // Auto-fetch location on mount
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
          setIsLocating(false);
          toast.success(`📍 Location found!`);
        },
        () => {
          setIsLocating(false);
          toast.error("Location access denied. Using default location.");
        }
      );
    } else {
      setIsLocating(false);
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
    const hectares = area * 111320 * 111320 / 10000;
    return Math.max(0.01, hectares);
  };

  useEffect(() => {
    setFieldArea(calculateArea(fieldPoints));
  }, [fieldPoints]);

  // Add point by coordinates
  const addPointByCoordinates = (lat: number, lng: number) => {
    const newPoint: FieldPoint = {
      lat,
      lng,
      id: `point-${Date.now()}`
    };
    
    setFieldPoints(prev => [...prev, newPoint]);
    toast.success(`📍 Corner ${fieldPoints.length + 1} marked`);
  };

  // Convert click position to coordinates
  const clickToCoordinates = (clickX: number, clickY: number, mapWidth: number, mapHeight: number) => {
    const relativeX = clickX / mapWidth;
    const relativeY = clickY / mapHeight;
    
    const zoomFactor = Math.pow(2, zoomLevel);
    const latOffset = (0.5 - relativeY) * (180 / zoomFactor);
    const lngOffset = (relativeX - 0.5) * (360 / zoomFactor);
    
    return {
      lat: mapCenter.lat + latOffset,
      lng: mapCenter.lng + lngOffset
    };
  };

  // Handle map panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setMapOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    // Convert pan offset to new map center
    const zoomFactor = Math.pow(2, zoomLevel);
    const latOffset = (mapOffset.y / 400) * (180 / zoomFactor); // 400 is approximate map height
    const lngOffset = (mapOffset.x / 400) * (360 / zoomFactor);
    
    setMapCenter(prev => ({
      lat: prev.lat - latOffset,
      lng: prev.lng - lngOffset
    }));
    
    setMapOffset({ x: 0, y: 0 });
    setIsDragging(false);
  };

  // Reset map position
  const resetMapPosition = () => {
    setMapOffset({ x: 0, y: 0 });
    if (currentLocation) {
      setMapCenter(currentLocation);
    }
  };

  // Remove last point
  const removeLastPoint = () => {
    if (fieldPoints.length > 0) {
      setFieldPoints(prev => prev.slice(0, -1));
    }
  };

  // Clear all points
  const clearAllPoints = () => {
    setFieldPoints([]);
  };

  // Save field data
  const saveField = async () => {
    if (fieldPoints.length < 3) {
      toast.error("Please mark at least 3 corners");
      return;
    }

    if (!cropType.trim()) {
      toast.error("Please select crop type");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep('Preparing field analysis...');
    setAnalysisProgress(10);
    
    try {
      const boundary = {
        coordinates: [[...fieldPoints.map(p => [p.lng, p.lat]), [fieldPoints[0].lng, fieldPoints[0].lat]]]
      };

      const location = currentLocation || mapCenter;

      // Progressive analysis with user feedback
      setAnalysisStep('Generating satellite image...');
      setAnalysisProgress(30);
      
      // Get real field analysis with progressive feedback
      const realFieldData = await getRealFieldAnalysisWithProgress(boundary, cropType, location, (step, progress) => {
        setAnalysisStep(step);
        setAnalysisProgress(progress);
      });
      
      setAnalysisStep('Saving field data...');
      setAnalysisProgress(90);
      storeFieldData(realFieldData);
      
      const fieldData = {
        boundary,
        area: realFieldData.area,
        pointCount: fieldPoints.length,
        createdAt: new Date(),
        center: location,
        analysis: realFieldData.analysis,
        recommendations: realFieldData.recommendations,
        crop: cropType,
        realAnalysis: true,
        fieldBoundary: {
          corners: fieldPoints,
          area: fieldArea,
          description: `Field with ${fieldPoints.length} corners`
        }
      };
      
      setAnalysisStep('Analysis complete!');
      setAnalysisProgress(100);
      toast.success(`✅ Field analyzed! ${realFieldData.area.toFixed(3)} hectares`);
      
      // Small delay to show completion
      setTimeout(() => {
        onComplete(fieldData);
      }, 500);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisStep('Analysis failed - using fallback data');
      setAnalysisProgress(0);
      toast.error('Analysis failed. Saved basic data.');
      
      const basicFieldData = {
        boundary: {
          coordinates: [[...fieldPoints.map(p => [p.lng, p.lat]), [fieldPoints[0].lng, fieldPoints[0].lat]]]
        },
        area: fieldArea,
        pointCount: fieldPoints.length,
        createdAt: new Date(),
        center: currentLocation || mapCenter,
        crop: cropType,
        realAnalysis: false,
        fieldBoundary: {
          corners: fieldPoints,
          area: fieldArea,
          description: `Field with ${fieldPoints.length} corners`
        }
      };
      
      onComplete(basicFieldData);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header with Back Button */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Satellite className="h-5 w-5 text-primary" />
                Field Boundary Mapper
                {isLocating && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              </CardTitle>
              {onBack && (
                <Button variant="outline" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Mark your field corners on the satellite map to get precise crop analysis
            </p>
          </CardContent>
        </Card>

        {/* Crop Selection */}
        {!cropType && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-green-600" />
                Select Your Crop
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={setCropType}>
                <SelectTrigger>
                  <SelectValue placeholder="What crop are you growing?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rice">🌾 Rice</SelectItem>
                  <SelectItem value="wheat">🌾 Wheat</SelectItem>
                  <SelectItem value="cotton">🌱 Cotton</SelectItem>
                  <SelectItem value="sugarcane">🎋 Sugarcane</SelectItem>
                  <SelectItem value="maize">🌽 Maize</SelectItem>
                  <SelectItem value="soybean">🫘 Soybean</SelectItem>
                  <SelectItem value="mustard">🌻 Mustard</SelectItem>
                  <SelectItem value="potato">🥔 Potato</SelectItem>
                  <SelectItem value="tomato">🍅 Tomato</SelectItem>
                  <SelectItem value="other">🌱 Other</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Interactive Map */}
        {cropType && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Satellite className="h-5 w-5" />
                  Satellite Map
                </span>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setZoomLevel(prev => Math.min(22, prev + 1))}
                  >
                    <ZoomIn className="h-3 w-3" />
                  </Button>
                  <span className="text-sm px-2">Zoom: {zoomLevel}</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setZoomLevel(prev => Math.max(10, prev - 1))}
                  >
                    <ZoomOut className="h-3 w-3" />
                  </Button>
                  {currentLocation && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setMapCenter(currentLocation);
                        setMapOffset({ x: 0, y: 0 });
                        toast.success("Map centered on your location");
                      }}
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      My Location
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={resetMapPosition}
                  >
                    <Target className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Interactive Map Area */}
              <div className="w-full h-96 rounded-lg border-2 border-primary/20 overflow-hidden relative bg-gradient-to-br from-green-100 to-blue-100">
                {/* Map Background with Satellite Imagery */}
                <div 
                  className="absolute inset-0 bg-muted/20 flex items-center justify-center"
                  style={{
                    transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                  }}
                >
                  <img 
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${mapCenter.lat},${mapCenter.lng}&zoom=${zoomLevel}&size=800x600&maptype=satellite&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBZlJtstGEj9wCMP5_O5PaGytIi-iForN0'}`}
                    alt="Satellite Map"
                    className="w-full h-full object-cover opacity-80"
                    onError={(e) => {
                      // Fallback to a simple map background
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                
                {/* Interactive Click Area */}
                <div 
                  className={`absolute inset-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onClick={(e) => {
                    if (isDragging) return; // Don't add points while dragging
                    
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const clickY = e.clientY - rect.top;
                    
                    const coords = clickToCoordinates(clickX, clickY, rect.width, rect.height);
                    addPointByCoordinates(coords.lat, coords.lng);
                  }}
                >
                  {/* Field Corner Markers */}
                  {fieldPoints.map((point, index) => {
                    const latDiff = point.lat - mapCenter.lat;
                    const lngDiff = point.lng - mapCenter.lng;
                    
                    const zoomFactor = Math.pow(2, zoomLevel);
                    const relativeX = 0.5 + (lngDiff * zoomFactor / 360);
                    const relativeY = 0.5 - (latDiff * zoomFactor / 180);
                    
                    const x = Math.max(5, Math.min(95, relativeX * 100));
                    const y = Math.max(5, Math.min(95, relativeY * 100));
                    
                    return (
                      <div
                        key={point.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                        }}
                      >
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-lg">
                          {index + 1}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Field Boundary Lines */}
                  {fieldPoints.length > 1 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <polyline
                        points={fieldPoints.map((point) => {
                          const latDiff = point.lat - mapCenter.lat;
                          const lngDiff = point.lng - mapCenter.lng;
                          
                          const zoomFactor = Math.pow(2, zoomLevel);
                          const relativeX = 0.5 + (lngDiff * zoomFactor / 360);
                          const relativeY = 0.5 - (latDiff * zoomFactor / 180);
                          
                          const x = Math.max(5, Math.min(95, relativeX * 100));
                          const y = Math.max(5, Math.min(95, relativeY * 100));
                          
                          return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeDasharray="5,5"
                      />
                    </svg>
                  )}
                </div>
                
                {/* Instructions Overlay */}
                <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-lg shadow-lg">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    Drag to move map • Click to mark corners
                  </div>
                  <div className="text-xs text-gray-600">
                    {fieldPoints.length} corners marked
                  </div>
                </div>
                
                {/* Open Full Map Button */}
                <div className="absolute top-4 right-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => window.open(`https://www.google.com/maps/@${mapCenter.lat},${mapCenter.lng},${zoomLevel}z/data=!3m1!1e3`, '_blank')}
                    className="bg-white/90"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Full Map
                  </Button>
                </div>
              </div>

              {/* Manual Coordinate Input */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder={currentLocation?.lat.toFixed(6) || "28.613900"}
                    id="lat-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder={currentLocation?.lng.toFixed(6) || "77.209000"}
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

              {/* Field Info */}
              {fieldPoints.length > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Field Boundary ({fieldPoints.length} corners)</Label>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {fieldPoints.length >= 3 ? "Ready" : "Need 3+ corners"}
                    </Badge>
                  </div>
                  
                  {fieldArea > 0 && (
                    <div className="p-3 bg-success/10 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-success" />
                          <span className="font-medium">Field Area:</span>
                        </div>
                        <div className="text-lg font-bold text-success">
                          {fieldArea.toFixed(3)} hectares
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Controls */}
              <div className="mt-4 flex gap-2">
                <Button onClick={removeLastPoint} variant="outline" disabled={fieldPoints.length === 0}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Remove Last
                </Button>
                <Button onClick={clearAllPoints} variant="outline" disabled={fieldPoints.length === 0}>
                  <Target className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        {cropType && fieldPoints.length >= 3 && (
          <Button 
            onClick={saveField} 
            size="lg" 
            className="w-full bg-green-600 hover:bg-green-700" 
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Analyzing Field...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Analyze My Field ({fieldArea.toFixed(3)} hectares)
              </>
            )}
          </Button>
        )}

        {/* Progress Indicator */}
        {isAnalyzing && (
          <Card className="w-full">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {analysisStep}
                  </span>
                  <span className="text-sm text-gray-500">
                    {analysisProgress}%
                  </span>
                </div>
                <Progress value={analysisProgress} className="w-full" />
                <div className="text-xs text-gray-500 text-center">
                  {analysisProgress < 100 ? 'Processing your field data...' : 'Analysis complete!'}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SimpleFieldMapper;
