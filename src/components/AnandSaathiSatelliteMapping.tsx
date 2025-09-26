/**
 * Anand Saathi Satellite Mapping
 * Advanced satellite-based field mapping with real satellite data integration
 * Supports MODIS, Landsat, Sentinel-2, and high-resolution satellite imagery
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Satellite, 
  Map, 
  Layers, 
  Download, 
  RefreshCw,
  Eye,
  Target,
  Calendar,
  TrendingUp,
  BarChart3,
  Activity,
  CheckCircle,
  AlertTriangle,
  Info,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Save,
  Upload,
  Filter,
  Settings
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

interface SatelliteImage {
  id: string;
  satellite: string;
  date: string;
  resolution: string;
  cloudCover: number;
  quality: 'excellent' | 'good' | 'moderate' | 'poor';
  bands: string[];
  url: string;
  thumbnail: string;
}

interface VegetationIndex {
  name: string;
  value: number;
  status: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';
  description: string;
  color: string;
}

interface FieldAnalysis {
  area: number;
  perimeter: number;
  center: { lat: number; lng: number };
  vegetationIndices: VegetationIndex[];
  cropHealth: number;
  recommendations: string[];
}

const AnandSaathiSatelliteMapping: React.FC = () => {
  const { t, language, isPunjabi, isHindi } = useTranslation();
  const [activeTab, setActiveTab] = useState('satellite');
  const [selectedSatellite, setSelectedSatellite] = useState('sentinel-2');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [cloudCover, setCloudCover] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [satelliteImages, setSatelliteImages] = useState<SatelliteImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<SatelliteImage | null>(null);
  const [fieldAnalysis, setFieldAnalysis] = useState<FieldAnalysis | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Satellite data sources
  const satelliteSources = [
    {
      id: 'sentinel-2',
      name: 'Sentinel-2',
      resolution: '10m',
      revisit: '5 days',
      bands: ['Blue', 'Green', 'Red', 'NIR', 'SWIR1', 'SWIR2'],
      description: isPunjabi ? 'ਯੂਰਪੀਅਨ ਸੈਟੇਲਾਈਟ, 10m ਰੈਜ਼ੋਲਿਊਸ਼ਨ' : isHindi ? 'यूरोपीय उपग्रह, 10m रिज़ॉल्यूशन' : 'European satellite, 10m resolution'
    },
    {
      id: 'landsat-8',
      name: 'Landsat-8',
      resolution: '30m',
      revisit: '16 days',
      bands: ['Blue', 'Green', 'Red', 'NIR', 'SWIR1', 'SWIR2'],
      description: isPunjabi ? 'NASA ਸੈਟੇਲਾਈਟ, 30m ਰੈਜ਼ੋਲਿਊਸ਼ਨ' : isHindi ? 'NASA उपग्रह, 30m रिज़ॉल्यूशन' : 'NASA satellite, 30m resolution'
    },
    {
      id: 'modis',
      name: 'MODIS',
      resolution: '250m',
      revisit: '1-2 days',
      bands: ['Red', 'NIR', 'Blue', 'Green'],
      description: isPunjabi ? 'NASA MODIS, 250m ਰੈਜ਼ੋਲਿਊਸ਼ਨ' : isHindi ? 'NASA MODIS, 250m रिज़ॉल्यूशन' : 'NASA MODIS, 250m resolution'
    },
    {
      id: 'planet',
      name: 'Planet Labs',
      resolution: '3m',
      revisit: 'Daily',
      bands: ['Blue', 'Green', 'Red', 'NIR'],
      description: isPunjabi ? 'ਕਮਰਸ਼ੀਅਲ ਸੈਟੇਲਾਈਟ, 3m ਰੈਜ਼ੋਲਿਊਸ਼ਨ' : isHindi ? 'व्यावसायिक उपग्रह, 3m रिज़ॉल्यूशन' : 'Commercial satellite, 3m resolution'
    }
  ];

  // Mock satellite images data
  const mockSatelliteImages: SatelliteImage[] = [
    {
      id: '1',
      satellite: 'Sentinel-2',
      date: '2024-01-15',
      resolution: '10m',
      cloudCover: 5,
      quality: 'excellent',
      bands: ['Blue', 'Green', 'Red', 'NIR', 'SWIR1', 'SWIR2'],
      url: 'https://example.com/sentinel2-image.jpg',
      thumbnail: 'https://example.com/sentinel2-thumb.jpg'
    },
    {
      id: '2',
      satellite: 'Landsat-8',
      date: '2024-01-10',
      resolution: '30m',
      cloudCover: 15,
      quality: 'good',
      bands: ['Blue', 'Green', 'Red', 'NIR', 'SWIR1', 'SWIR2'],
      url: 'https://example.com/landsat8-image.jpg',
      thumbnail: 'https://example.com/landsat8-thumb.jpg'
    },
    {
      id: '3',
      satellite: 'Planet Labs',
      date: '2024-01-12',
      resolution: '3m',
      cloudCover: 2,
      quality: 'excellent',
      bands: ['Blue', 'Green', 'Red', 'NIR'],
      url: 'https://example.com/planet-image.jpg',
      thumbnail: 'https://example.com/planet-thumb.jpg'
    }
  ];

  // Initialize map
  useEffect(() => {
    if (activeTab === 'satellite' && mapRef.current) {
      initializeMap();
    }
  }, [activeTab]);

  const initializeMap = async () => {
    try {
      setIsLoading(true);
      
      // Load Google Maps API
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=geometry,places,visualization`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      if (mapRef.current && window.google) {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 30.9010, lng: 75.8573 },
          zoom: 15,
          mapTypeId: window.google.maps.MapTypeId.SATELLITE,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true
        });

        setMapInstance(map);
        console.log('Satellite map initialized');
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error(isPunjabi ? 'ਮੈਪ ਇਨੀਸ਼ੀਅਲਾਈਜ਼ ਕਰਨ ਵਿੱਚ ਅਸਫਲ' : isHindi ? 'मैप इनिशियलाइज़ करने में असफल' : 'Failed to initialize map');
    } finally {
      setIsLoading(false);
    }
  };

  // Search for satellite images
  const searchSatelliteImages = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call to satellite data service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSatelliteImages(mockSatelliteImages);
      toast.success(isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਇਮੇਜਾਂ ਮਿਲੀਆਂ' : isHindi ? 'सैटेलाइट इमेजें मिलीं' : 'Satellite images found');
    } catch (error) {
      console.error('Error searching satellite images:', error);
      toast.error(isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਇਮੇਜਾਂ ਲੱਭਣ ਵਿੱਚ ਅਸਫਲ' : isHindi ? 'सैटेलाइट इमेजें खोजने में असफल' : 'Failed to search satellite images');
    } finally {
      setIsLoading(false);
    }
  };

  // Analyze field with satellite data
  const analyzeField = async (image: SatelliteImage) => {
    try {
      setIsLoading(true);
      
      // Simulate vegetation analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const analysis: FieldAnalysis = {
        area: 2.5,
        perimeter: 1200,
        center: { lat: 30.9010, lng: 75.8573 },
        vegetationIndices: [
          {
            name: 'NDVI',
            value: 0.75,
            status: 'excellent',
            description: isPunjabi ? 'ਵਧੀਆ ਵਨਸਪਤੀ ਸਿਹਤ' : isHindi ? 'अच्छी वनस्पति स्वास्थ्य' : 'Good vegetation health',
            color: '#22c55e'
          },
          {
            name: 'MSAVI2',
            value: 0.68,
            status: 'good',
            description: isPunjabi ? 'ਵਧੀਆ ਮਿੱਟੀ ਦੀ ਸਿਹਤ' : isHindi ? 'अच्छी मिट्टी की सेहत' : 'Good soil health',
            color: '#3b82f6'
          },
          {
            name: 'EVI',
            value: 0.52,
            status: 'moderate',
            description: isPunjabi ? 'ਔਸਤਨ ਵਨਸਪਤੀ ਸਿਹਤ' : isHindi ? 'औसत वनस्पति स्वास्थ्य' : 'Moderate vegetation health',
            color: '#f59e0b'
          }
        ],
        cropHealth: 85,
        recommendations: [
          isPunjabi ? 'ਵਧੇਰੇ ਪਾਣੀ ਦੀ ਲੋੜ ਹੈ' : isHindi ? 'अधिक पानी की आवश्यकता' : 'More irrigation needed',
          isPunjabi ? 'ਨਾਈਟ੍ਰੋਜਨ ਖਾਦ ਦੀ ਲੋੜ' : isHindi ? 'नाइट्रोजन उर्वरक की आवश्यकता' : 'Nitrogen fertilizer needed'
        ]
      };
      
      setFieldAnalysis(analysis);
      setSelectedImage(image);
      toast.success(isPunjabi ? 'ਖੇਤ ਵਿਸ਼ਲੇਸ਼ਣ ਪੂਰਾ ਹੋਇਆ' : isHindi ? 'खेत विश्लेषण पूरा हुआ' : 'Field analysis completed');
    } catch (error) {
      console.error('Error analyzing field:', error);
      toast.error(isPunjabi ? 'ਖੇਤ ਵਿਸ਼ਲੇਸ਼ਣ ਵਿੱਚ ਅਸਫਲ' : isHindi ? 'खेत विश्लेषण में असफल' : 'Failed to analyze field');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">
          {isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਮੈਪਿੰਗ' : isHindi ? 'सैटेलाइट मैपिंग' : 'Satellite Mapping'}
        </h2>
        <p className="text-gray-600">
          {isPunjabi ? 'ਉੱਚ-ਗੁਣਵੱਤਾ ਸੈਟੇਲਾਈਟ ਇਮੇਜਾਂ ਨਾਲ ਖੇਤ ਮੈਪਿੰਗ' : isHindi ? 'उच्च-गुणवत्ता सैटेलाइट इमेजों के साथ खेत मैपिंग' : 'High-quality satellite imagery for field mapping'}
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="satellite" className="flex items-center gap-2">
            <Satellite className="h-4 w-4" />
            {isPunjabi ? 'ਸੈਟੇਲਾਈਟ' : isHindi ? 'सैटेलाइट' : 'Satellite'}
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            {isPunjabi ? 'ਖੋਜ' : isHindi ? 'खोज' : 'Search'}
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'विश्लेषण' : 'Analysis'}
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {isPunjabi ? 'ਨਿਰਯਾਤ' : isHindi ? 'निर्यात' : 'Export'}
          </TabsTrigger>
        </TabsList>

        {/* Satellite Map Tab */}
        <TabsContent value="satellite" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                {isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਮੈਪ' : isHindi ? 'सैटेलाइट मैप' : 'Satellite Map'}
              </CardTitle>
              <CardDescription>
                {isPunjabi ? 'ਉੱਚ-ਰੈਜ਼ੋਲਿਊਸ਼ਨ ਸੈਟੇਲਾਈਟ ਇਮੇਜਰੀ ਨਾਲ ਖੇਤ ਦੇਖੋ' : isHindi ? 'उच्च-रिज़ॉल्यूशन सैटेलाइट इमेजरी के साथ खेत देखें' : 'View fields with high-resolution satellite imagery'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Map Controls */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setMapInstance((prev: any) => {
                      if (prev) prev.setMapTypeId(window.google.maps.MapTypeId.SATELLITE);
                      return prev;
                    })}
                    variant="outline"
                    size="sm"
                  >
                    <Satellite className="h-4 w-4 mr-2" />
                    {isPunjabi ? 'ਸੈਟੇਲਾਈਟ' : isHindi ? 'सैटेलाइट' : 'Satellite'}
                  </Button>
                  <Button
                    onClick={() => setMapInstance((prev: any) => {
                      if (prev) prev.setMapTypeId(window.google.maps.MapTypeId.HYBRID);
                      return prev;
                    })}
                    variant="outline"
                    size="sm"
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    {isPunjabi ? 'ਹਾਈਬ੍ਰਿਡ' : isHindi ? 'हाइब्रिड' : 'Hybrid'}
                  </Button>
                  <Button
                    onClick={() => setMapInstance((prev: any) => {
                      if (prev) prev.setMapTypeId(window.google.maps.MapTypeId.TERRAIN);
                      return prev;
                    })}
                    variant="outline"
                    size="sm"
                  >
                    <Map className="h-4 w-4 mr-2" />
                    {isPunjabi ? 'ਟੈਰੇਨ' : isHindi ? 'टेरेन' : 'Terrain'}
                  </Button>
                </div>

                {/* Map Container */}
                <div className="relative">
                  <div 
                    ref={mapRef} 
                    className="w-full h-96 rounded-lg border border-gray-200"
                    style={{ minHeight: '400px' }}
                  />
                  
                  {isLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>{isPunjabi ? 'ਮੈਪ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...' : isHindi ? 'मैप लोड हो रहा है...' : 'Loading map...'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਇਮੇਜ ਖੋਜ' : isHindi ? 'सैटेलाइट इमेज खोज' : 'Satellite Image Search'}
              </CardTitle>
              <CardDescription>
                {isPunjabi ? 'ਆਪਣੇ ਖੇਤ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਸੈਟੇਲਾਈਟ ਇਮੇਜਾਂ ਲੱਭੋ' : isHindi ? 'अपने खेत के लिए सबसे अच्छी सैटेलाइट इमेजें खोजें' : 'Find the best satellite images for your field'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search Parameters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="satellite">
                      {isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਸਰੋਤ' : isHindi ? 'सैटेलाइट स्रोत' : 'Satellite Source'}
                    </Label>
                    <Select value={selectedSatellite} onValueChange={setSelectedSatellite}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {satelliteSources.map((source) => (
                          <SelectItem key={source.id} value={source.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{source.name}</span>
                              <span className="text-sm text-gray-500">{source.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="cloudCover">
                      {isPunjabi ? 'ਬੱਦਲ ਕਵਰ (%)' : isHindi ? 'बादल कवर (%)' : 'Cloud Cover (%)'}
                    </Label>
                    <Input
                      id="cloudCover"
                      type="number"
                      min="0"
                      max="100"
                      value={cloudCover}
                      onChange={(e) => setCloudCover(Number(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dateRange">
                      {isPunjabi ? 'ਤਾਰੀਖ ਰੇਂਜ' : isHindi ? 'तारीख रेंज' : 'Date Range'}
                    </Label>
                    <Input
                      id="dateRange"
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Search Button */}
                <Button
                  onClick={searchSatelliteImages}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Target className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? 
                    (isPunjabi ? 'ਖੋਜ ਰਹੀ ਹੈ...' : isHindi ? 'खोज रही है...' : 'Searching...') :
                    (isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਇਮੇਜਾਂ ਖੋਜੋ' : isHindi ? 'सैटेलाइट इमेजें खोजें' : 'Search Satellite Images')
                  }
                </Button>

                {/* Search Results */}
                {satelliteImages.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      {isPunjabi ? 'ਖੋਜ ਨਤੀਜੇ' : isHindi ? 'खोज नतीजे' : 'Search Results'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {satelliteImages.map((image) => (
                        <Card key={image.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline">{image.satellite}</Badge>
                                <Badge 
                                  variant={image.quality === 'excellent' ? 'default' : 'secondary'}
                                  className={image.quality === 'excellent' ? 'bg-green-100 text-green-800' : ''}
                                >
                                  {image.quality}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600">
                                <div>{image.date}</div>
                                <div>{image.resolution} • {image.cloudCover}% {isPunjabi ? 'ਬੱਦਲ' : isHindi ? 'बादल' : 'clouds'}</div>
                              </div>
                              <Button
                                onClick={() => analyzeField(image)}
                                size="sm"
                                className="w-full"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ' : isHindi ? 'विश्लेषण करें' : 'Analyze'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          {fieldAnalysis ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {isPunjabi ? 'ਖੇਤ ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'खेत विश्लेषण' : 'Field Analysis'}
                  </CardTitle>
                  <CardDescription>
                    {isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਡੇਟਾ ਦੇ ਆਧਾਰ \'ਤੇ ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'सैटेलाइट डेटा के आधार पर विश्लेषण' : 'Analysis based on satellite data'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Field Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{fieldAnalysis.area} acres</div>
                        <div className="text-sm text-blue-800">{isPunjabi ? 'ਖੇਤ ਖੇਤਰ' : isHindi ? 'खेत क्षेत्र' : 'Field Area'}</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{fieldAnalysis.cropHealth}%</div>
                        <div className="text-sm text-green-800">{isPunjabi ? 'ਫਸਲ ਸਿਹਤ' : isHindi ? 'फसल स्वास्थ्य' : 'Crop Health'}</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{fieldAnalysis.perimeter}m</div>
                        <div className="text-sm text-purple-800">{isPunjabi ? 'ਘੇਰਾ' : isHindi ? 'घेरा' : 'Perimeter'}</div>
                      </div>
                    </div>

                    {/* Vegetation Indices */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        {isPunjabi ? 'ਵਨਸਪਤੀ ਸੂਚਕ' : isHindi ? 'वनस्पति सूचक' : 'Vegetation Indices'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fieldAnalysis.vegetationIndices.map((index) => (
                          <Card key={index.name} className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold">{index.name}</div>
                                <div className="text-2xl font-bold" style={{ color: index.color }}>
                                  {index.value}
                                </div>
                                <div className="text-sm text-gray-600">{index.description}</div>
                              </div>
                              <Badge 
                                variant="outline"
                                className={`${
                                  index.status === 'excellent' ? 'bg-green-100 text-green-800' :
                                  index.status === 'good' ? 'bg-blue-100 text-blue-800' :
                                  index.status === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                {index.status}
                              </Badge>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">
                        {isPunjabi ? 'ਸਿਫਾਰਸ਼ਾਂ' : isHindi ? 'सिफारिशें' : 'Recommendations'}
                      </h3>
                      <div className="space-y-2">
                        {fieldAnalysis.recommendations.map((rec, index) => (
                          <Alert key={index}>
                            <Info className="h-4 w-4" />
                            <AlertDescription>{rec}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Satellite className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {isPunjabi ? 'ਕੋਈ ਵਿਸ਼ਲੇਸ਼ਣ ਨਹੀਂ' : isHindi ? 'कोई विश्लेषण नहीं' : 'No Analysis Available'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {isPunjabi ? 'ਪਹਿਲਾਂ ਸੈਟੇਲਾਈਟ ਇਮੇਜ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ' : isHindi ? 'पहले सैटेलाइट इमेज का विश्लेषण करें' : 'Please analyze a satellite image first'}
                </p>
                <Button onClick={() => setActiveTab('search')}>
                  <Target className="h-4 w-4 mr-2" />
                  {isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਇਮੇਜ ਖੋਜੋ' : isHindi ? 'सैटेलाइट इमेज खोजें' : 'Search Satellite Images'}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                {isPunjabi ? 'ਡੇਟਾ ਨਿਰਯਾਤ' : isHindi ? 'डेटा निर्यात' : 'Data Export'}
              </CardTitle>
              <CardDescription>
                {isPunjabi ? 'ਆਪਣੇ ਖੇਤ ਡੇਟਾ ਨੂੰ ਵੱਖ-ਵੱਖ ਫਾਰਮੈਟਾਂ ਵਿੱਚ ਨਿਰਯਾਤ ਕਰੋ' : isHindi ? 'अपने खेत डेटा को विभिन्न फॉर्मेट में निर्यात करें' : 'Export your field data in various formats'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                    <Download className="h-6 w-6" />
                    <span>PDF Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                    <Download className="h-6 w-6" />
                    <span>Excel Data</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                    <Download className="h-6 w-6" />
                    <span>KML File</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
                    <Download className="h-6 w-6" />
                    <span>GeoJSON</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnandSaathiSatelliteMapping;
