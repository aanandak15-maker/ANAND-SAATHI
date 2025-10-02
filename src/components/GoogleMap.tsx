import { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin, Settings, Satellite, AlertTriangle } from 'lucide-react';
import { loadGoogleMaps } from '@/lib/googleMapsLoader';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GoogleMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showBoundary, setShowBoundary] = useState(true);
  const [showNDVIOverlay, setShowNDVIOverlay] = useState(false);
  const [mapType, setMapType] = useState('satellite');
  const fieldBoundaryRef = useRef<any>(null);
  const ndviMarkersRef = useRef<any[]>([]);

  // Demo field coordinates (near Pusa, Samastipur, Bihar)
  const demoFieldCoordinates = [
    { lat: 25.9856, lng: 85.6699 },
    { lat: 25.9856, lng: 85.6720 },
    { lat: 25.9840, lng: 85.6720 },
    { lat: 25.9840, lng: 85.6699 }
  ];
  const fieldCenter = { lat: 25.9848, lng: 85.6709 };

  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        console.log('Loading Google Maps...');
        await loadGoogleMaps();
        console.log('Google Maps loaded successfully');
        setIsLoaded(true);
        initializeMap();
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
      }
    };

    initializeGoogleMaps();
  }, []);
  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: fieldCenter,
      zoom: 16,
      mapTypeId: window.google.maps.MapTypeId.SATELLITE,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      gestureHandling: 'cooperative'
    });

    mapInstanceRef.current = map;

    // Add field boundary
    addFieldBoundary();
    
    // Add center marker
    new window.google.maps.Marker({
      position: fieldCenter,
      map: map,
      title: 'Demo Field - Pusa',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#10b981',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      }
    });

    // Add info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 8px;">
          <h3 style="font-weight: 600; margin: 0 0 4px 0;">Demo Field - Pusa</h3>
          <p style="margin: 2px 0; color: #666; font-size: 14px;">Health: 78% (Good)</p>
          <p style="margin: 2px 0; color: #666; font-size: 14px;">Area: 2.1 acres</p>
          <p style="margin: 2px 0; color: #666; font-size: 14px;">Crop: Paddy (Mid-season)</p>
        </div>
      `
    });

    const marker = new window.google.maps.Marker({
      position: fieldCenter,
      map: map,
      title: 'Demo Field - Pusa'
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });
  };

  const addFieldBoundary = () => {
    if (!mapInstanceRef.current || !window.google) return;

    if (fieldBoundaryRef.current) {
      fieldBoundaryRef.current.setMap(null);
    }

    fieldBoundaryRef.current = new window.google.maps.Polygon({
      paths: demoFieldCoordinates,
      strokeColor: '#f59e0b',
      strokeOpacity: showBoundary ? 1 : 0,
      strokeWeight: 2,
      fillColor: '#f59e0b',
      fillOpacity: showBoundary ? 0.3 : 0,
      map: mapInstanceRef.current
    });

    addNDVIOverlay();
  };

  const addNDVIOverlay = () => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    ndviMarkersRef.current.forEach(marker => marker.setMap(null));
    ndviMarkersRef.current = [];

    if (!showNDVIOverlay) return;

    // Create NDVI data points
    for (let i = 0; i < 20; i++) {
      const lat = 25.9840 + Math.random() * 0.0016;
      const lng = 85.6699 + Math.random() * 0.0021;
      const ndviValue = 0.3 + Math.random() * 0.5;
      
      let color = '#ff0000'; // Red for low NDVI
      if (ndviValue > 0.6) color = '#00ff00'; // Green for high NDVI
      else if (ndviValue > 0.4) color = '#ffff00'; // Yellow for medium NDVI

      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: color,
          fillOpacity: 0.7,
          strokeColor: color,
          strokeOpacity: 1,
          strokeWeight: 1
        },
        title: `NDVI: ${ndviValue.toFixed(2)}`
      });

      ndviMarkersRef.current.push(marker);
    }
  };

  const updateMapType = (type: string) => {
    if (!mapInstanceRef.current) return;
    
    const mapTypeMap = {
      satellite: window.google.maps.MapTypeId.SATELLITE,
      roadmap: window.google.maps.MapTypeId.ROADMAP,
      hybrid: window.google.maps.MapTypeId.HYBRID,
      terrain: window.google.maps.MapTypeId.TERRAIN
    };

    mapInstanceRef.current.setMapTypeId(mapTypeMap[type as keyof typeof mapTypeMap] || mapTypeMap.satellite);
  };

  useEffect(() => {
    if (isLoaded) {
      addFieldBoundary();
    }
  }, [showBoundary, showNDVIOverlay, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      updateMapType(mapType);
    }
  }, [mapType, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Loading Google Maps...</h3>
          </div>
          <div className="bg-muted rounded-lg h-[500px] flex items-center justify-center">
            <div className="text-center">
              <Satellite className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground mb-2">Initializing map...</p>
              <p className="text-sm text-muted-foreground">If the map doesn't load, check:</p>
              <ul className="text-sm text-muted-foreground text-left mt-2">
                <li>• Google Maps API key is valid</li>
                <li>• API key has correct domain permissions</li>
                <li>• No network connectivity issues</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!window.google || !window.google.maps) {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-yellow-700">Google Maps API Not Loaded</h3>
          </div>
          <div className="bg-yellow-50 rounded-lg h-[500px] flex items-center justify-center">
            <div className="text-center max-w-md">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-yellow-700 mb-4">Google Maps failed to load. This could be due to:</p>
              <ul className="text-sm text-yellow-600 text-left mb-4 space-y-1">
                <li>• Invalid API key</li>
                <li>• API key domain restrictions</li>
                <li>• Network connectivity issues</li>
                <li>• API key quota exceeded</li>
              </ul>
              <p className="text-sm text-yellow-600">
                Check the browser console for detailed error messages and verify your Google Maps API key configuration.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <h3 className="font-semibold">Bihar Field Map - Pusa, Samastipur</h3>
          </div>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="map-type">Map Type</Label>
            <Select value={mapType} onValueChange={setMapType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="satellite">Satellite</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="roadmap">Roadmap</SelectItem>
                <SelectItem value="terrain">Terrain</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="field-boundary"
              checked={showBoundary}
              onCheckedChange={setShowBoundary}
            />
            <Label htmlFor="field-boundary">Field Boundary</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="ndvi-overlay"
              checked={showNDVIOverlay}
              onCheckedChange={setShowNDVIOverlay}
            />
            <Label htmlFor="ndvi-overlay">NDVI Overlay</Label>
          </div>
        </div>
      </Card>

      {/* Map Container */}
      <Card className="p-0 overflow-hidden">
        <div ref={mapRef} className="h-[500px] w-full" />
      </Card>

      {/* Map Legend */}
      <Card className="p-4">
        <h4 className="font-semibold mb-2">Map Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded"></div>
            <span>Field Boundary (78% Health)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>High NDVI (0.7-0.8)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Medium NDVI (0.5-0.7)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Low NDVI (0.3-0.5)</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GoogleMap;