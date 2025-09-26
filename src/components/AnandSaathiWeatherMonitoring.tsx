/**
 * Anand Saathi Weather Monitoring Component
 * Real-time weather tracking, alerts, and forecasting
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Thermometer, 
  Droplets, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Info,
  MapPin,
  Calendar,
  BarChart3,
  Target,
  Zap,
  CloudSnow,
  CloudLightning,
  Sunrise,
  Sunset
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { anandSaathiBackend, FieldData } from '@/lib/anandSaathiBackend';
import { toast } from 'sonner';

interface WeatherData {
  id: string;
  fieldId: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  precipitation: number;
  condition: string;
  icon: string;
}

interface WeatherAlert {
  id: string;
  type: 'warning' | 'info' | 'danger';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  startTime: string;
  endTime: string;
  affectedFields: string[];
}

interface WeatherForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
  windSpeed: number;
  humidity: number;
}

interface WeatherMonitoringProps {
  fieldData?: FieldData;
  onAlertReceived?: (alert: WeatherAlert) => void;
}

export const AnandSaathiWeatherMonitoring: React.FC<WeatherMonitoringProps> = ({
  fieldData,
  onAlertReceived
}) => {
  const { t, language, isPunjabi, isHindi } = useTranslation();
  const [activeTab, setActiveTab] = useState('current');
  const [isLoading, setIsLoading] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [historicalData, setHistoricalData] = useState<WeatherData[]>([]);

  // Mock weather data
  const mockCurrentWeather: WeatherData = {
    id: '1',
    fieldId: '1',
    timestamp: new Date().toISOString(),
    temperature: 28.5,
    humidity: 65,
    windSpeed: 12,
    windDirection: 'NW',
    pressure: 1013.2,
    visibility: 10,
    uvIndex: 6,
    precipitation: 0,
    condition: 'Partly Cloudy',
    icon: 'partly-cloudy'
  };

  const mockAlerts: WeatherAlert[] = [
    {
      id: '1',
      type: 'warning',
      title: 'Heavy Rain Warning',
      description: 'Heavy rainfall expected in the next 24 hours. Prepare for potential flooding.',
      severity: 'high',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
      affectedFields: ['1', '2']
    },
    {
      id: '2',
      type: 'info',
      title: 'Temperature Drop',
      description: 'Temperature expected to drop below 15°C tonight. Protect sensitive crops.',
      severity: 'medium',
      startTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      affectedFields: ['1']
    }
  ];

  const mockForecast: WeatherForecast[] = [
    { date: '2024-09-25', high: 32, low: 22, condition: 'Sunny', precipitation: 0, windSpeed: 8, humidity: 55 },
    { date: '2024-09-26', high: 30, low: 20, condition: 'Partly Cloudy', precipitation: 10, windSpeed: 12, humidity: 65 },
    { date: '2024-09-27', high: 28, low: 18, condition: 'Rain', precipitation: 25, windSpeed: 15, humidity: 80 },
    { date: '2024-09-28', high: 26, low: 16, condition: 'Cloudy', precipitation: 5, windSpeed: 10, humidity: 70 },
    { date: '2024-09-29', high: 29, low: 19, condition: 'Sunny', precipitation: 0, windSpeed: 6, humidity: 50 }
  ];

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from the backend
      setCurrentWeather(mockCurrentWeather);
      setWeatherAlerts(mockAlerts);
      setForecast(mockForecast);
      
      // Simulate historical data
      const historical = Array.from({ length: 7 }, (_, i) => ({
        ...mockCurrentWeather,
        id: (i + 1).toString(),
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        temperature: 25 + Math.random() * 10,
        humidity: 60 + Math.random() * 20,
        windSpeed: 8 + Math.random() * 8
      }));
      setHistoricalData(historical);
    } catch (error) {
      console.error('Error loading weather data:', error);
      toast.error(isPunjabi ? 'ਮੌਸਮ ਡੇਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ' : isHindi ? 'मौसम डेटा लोड करने में त्रुटि' : 'Error loading weather data');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWeatherData = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      loadWeatherData();
      toast.success(isPunjabi ? 'ਮੌਸਮ ਡੇਟਾ ਤਾਜ਼ਾ ਕੀਤਾ ਗਿਆ' : isHindi ? 'मौसम डेटा ताज़ा किया गया' : 'Weather data refreshed');
    } catch (error) {
      console.error('Error refreshing weather data:', error);
      toast.error(isPunjabi ? 'ਮੌਸਮ ਡੇਟਾ ਤਾਜ਼ਾ ਕਰਨ ਵਿੱਚ ਗਲਤੀ' : isHindi ? 'मौसम डेटा ताज़ा करने में त्रुटि' : 'Error refreshing weather data');
    } finally {
      setIsLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'partly cloudy': return <Cloud className="h-8 w-8 text-gray-500" />;
      case 'cloudy': return <Cloud className="h-8 w-8 text-gray-600" />;
      case 'rain': return <CloudRain className="h-8 w-8 text-blue-500" />;
      case 'snow': return <CloudSnow className="h-8 w-8 text-blue-300" />;
      case 'storm': return <CloudLightning className="h-8 w-8 text-purple-500" />;
      default: return <Cloud className="h-8 w-8 text-gray-500" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'danger': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'info': return <Info className="h-5 w-5 text-blue-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Cloud className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isPunjabi ? 'ਮੌਸਮ ਨਿਗਰਾਨੀ' : isHindi ? 'मौसम निगरानी' : 'Weather Monitoring'}
              </h1>
              <p className="text-gray-600">
                {isPunjabi ? 'ਰੀਅਲ-ਟਾਈਮ ਮੌਸਮ ਟ੍ਰੈਕਿੰਗ ਅਤੇ ਚੇਤਾਵਨੀਆਂ' : isHindi ? 'रियल-टाइम मौसम ट्रैकिंग और चेतावनियां' : 'Real-time weather tracking and alerts'}
              </p>
            </div>
          </div>

          {/* Field Info */}
          {fieldData && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">{fieldData.name}</h3>
                    <p className="text-sm text-gray-600">
                      {fieldData.crop_type} • {fieldData.area_acres} acres
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={refreshWeatherData}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Cloud className="h-4 w-4 mr-2" />
            {isLoading 
              ? (isPunjabi ? 'ਤਾਜ਼ਾ ਕਰ ਰਿਹਾ ਹੈ...' : isHindi ? 'ताज़ा कर रहा है...' : 'Refreshing...')
              : (isPunjabi ? 'ਮੌਸਮ ਡੇਟਾ ਤਾਜ਼ਾ ਕਰੋ' : isHindi ? 'मौसम डेटा ताज़ा करें' : 'Refresh Weather Data')
            }
          </Button>
          
          <Button variant="outline">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {isPunjabi ? 'ਚੇਤਾਵਨੀ ਸੈਟਿੰਗਸ' : isHindi ? 'चेतावनी सेटिंग्स' : 'Alert Settings'}
          </Button>
          
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            {isPunjabi ? 'ਮੌਸਮ ਰਿਪੋਰਟ' : isHindi ? 'मौसम रिपोर्ट' : 'Weather Report'}
          </Button>
        </div>

        {/* Weather Alerts */}
        {weatherAlerts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {isPunjabi ? 'ਮੌਸਮ ਚੇਤਾਵਨੀਆਂ' : isHindi ? 'मौसम चेतावनियां' : 'Weather Alerts'}
            </h3>
            <div className="space-y-3">
              {weatherAlerts.map((alert) => (
                <Alert key={alert.id} className={getAlertColor(alert.severity)}>
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <AlertDescription>
                        <div className="font-medium">{alert.title}</div>
                        <div className="text-sm mt-1">{alert.description}</div>
                        <div className="text-xs mt-2 opacity-75">
                          {new Date(alert.startTime).toLocaleString()}
                        </div>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="current">
              {isPunjabi ? 'ਮੌਜੂਦਾ' : isHindi ? 'वर्तमान' : 'Current'}
            </TabsTrigger>
            <TabsTrigger value="forecast">
              {isPunjabi ? 'ਪੂਰਵਾਨੁਮਾਨ' : isHindi ? 'पूर्वानुमान' : 'Forecast'}
            </TabsTrigger>
            <TabsTrigger value="historical">
              {isPunjabi ? 'ਇਤਿਹਾਸ' : isHindi ? 'इतिहास' : 'Historical'}
            </TabsTrigger>
            <TabsTrigger value="alerts">
              {isPunjabi ? 'ਚੇਤਾਵਨੀਆਂ' : isHindi ? 'चेतावनियां' : 'Alerts'}
            </TabsTrigger>
          </TabsList>

          {/* Current Weather Tab */}
          <TabsContent value="current" className="space-y-6">
            {currentWeather ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Weather Card */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getWeatherIcon(currentWeather.condition)}
                      <span>{currentWeather.condition}</span>
                    </CardTitle>
                    <CardDescription>
                      {new Date(currentWeather.timestamp).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6">
                      <div className="text-6xl font-bold text-blue-600 mb-2">
                        {currentWeather.temperature.toFixed(0)}°
                      </div>
                      <p className="text-gray-600">
                        {isPunjabi ? 'ਤਾਪਮਾਨ' : isHindi ? 'तापमान' : 'Temperature'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Droplets className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                        <div className="font-semibold">{currentWeather.humidity}%</div>
                        <div className="text-sm text-gray-600">
                          {isPunjabi ? 'ਨਮੀ' : isHindi ? 'नमी' : 'Humidity'}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Wind className="h-6 w-6 text-gray-600 mx-auto mb-1" />
                        <div className="font-semibold">{currentWeather.windSpeed} km/h</div>
                        <div className="text-sm text-gray-600">
                          {isPunjabi ? 'ਹਵਾ' : isHindi ? 'हवा' : 'Wind'}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <Eye className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                        <div className="font-semibold">{currentWeather.visibility} km</div>
                        <div className="text-sm text-gray-600">
                          {isPunjabi ? 'ਦ੍ਰਿਸ਼ਟੀ' : isHindi ? 'दृष्टि' : 'Visibility'}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <Sun className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                        <div className="font-semibold">{currentWeather.uvIndex}</div>
                        <div className="text-sm text-gray-600">
                          {isPunjabi ? 'UV ਇੰਡੈਕਸ' : isHindi ? 'UV इंडेक्स' : 'UV Index'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Info */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Thermometer className="h-5 w-5 text-red-600" />
                        {isPunjabi ? 'ਵਾਤਾਵਰਣ ਦੇ ਹਾਲਾਤ' : isHindi ? 'वातावरण की स्थिति' : 'Atmospheric Conditions'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{isPunjabi ? 'ਦਬਾਅ' : isHindi ? 'दबाव' : 'Pressure'}</span>
                        <Badge variant="outline">{currentWeather.pressure} hPa</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{isPunjabi ? 'ਹਵਾ ਦੀ ਦਿਸ਼ਾ' : isHindi ? 'हवा की दिशा' : 'Wind Direction'}</span>
                        <Badge variant="outline">{currentWeather.windDirection}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{isPunjabi ? 'ਬਾਰਿਸ਼' : isHindi ? 'बारिश' : 'Precipitation'}</span>
                        <Badge variant="outline">{currentWeather.precipitation} mm</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-600" />
                        {isPunjabi ? 'ਫਸਲ ਸਿਫਾਰਸ਼ਾਂ' : isHindi ? 'फसल सिफारिशें' : 'Crop Recommendations'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">
                            {isPunjabi ? 'ਆਪਟੀਮਲ ਸਿੰਚਾਈ ਸਮਾਂ' : isHindi ? 'इष्टतम सिंचाई समय' : 'Optimal irrigation time'}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">
                            {isPunjabi ? 'ਫਸਲ ਸੁਰੱਖਿਆ ਲੋੜੀਂਦੀ' : isHindi ? 'फसल सुरक्षा आवश्यक' : 'Crop protection needed'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Cloud className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isPunjabi ? 'ਮੌਸਮ ਡੇਟਾ ਲੋਡ ਕਰ ਰਿਹਾ ਹੈ...' : isHindi ? 'मौसम डेटा लोड हो रहा है...' : 'Loading weather data...'}
                  </h3>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isPunjabi ? '5-ਦਿਨ ਦਾ ਮੌਸਮ ਪੂਰਵਾਨੁਮਾਨ' : isHindi ? '5-दिन का मौसम पूर्वानुमान' : '5-Day Weather Forecast'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {forecast.map((day, index) => (
                    <div key={index} className="p-4 border rounded-lg text-center">
                      <div className="font-medium mb-2">
                        {index === 0 
                          ? (isPunjabi ? 'ਅੱਜ' : isHindi ? 'आज' : 'Today')
                          : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })
                        }
                      </div>
                      <div className="mb-2">
                        {getWeatherIcon(day.condition)}
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {day.high}°
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {day.low}° {isPunjabi ? 'ਘੱਟ' : isHindi ? 'कम' : 'low'}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        {day.condition}
                      </div>
                      <div className="text-xs text-gray-500">
                        {day.precipitation}% {isPunjabi ? 'ਬਾਰਿਸ਼' : isHindi ? 'बारिश' : 'rain'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Historical Data Tab */}
          <TabsContent value="historical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isPunjabi ? 'ਪਿਛਲੇ 7 ਦਿਨਾਂ ਦਾ ਡੇਟਾ' : isHindi ? 'पिछले 7 दिनों का डेटा' : 'Last 7 Days Data'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {historicalData.map((data) => (
                    <div key={data.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">
                            {new Date(data.timestamp).toLocaleDateString()}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {data.condition} • {data.humidity}% {isPunjabi ? 'ਨਮੀ' : isHindi ? 'नमी' : 'humidity'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {data.temperature.toFixed(0)}°
                          </div>
                          <div className="text-sm text-gray-600">
                            {data.windSpeed} km/h {isPunjabi ? 'ਹਵਾ' : isHindi ? 'हवा' : 'wind'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isPunjabi ? 'ਮੌਸਮ ਚੇਤਾਵਨੀਆਂ' : isHindi ? 'मौसम चेतावनियां' : 'Weather Alerts'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weatherAlerts.map((alert) => (
                    <div key={alert.id} className={`p-4 border rounded-lg ${getAlertColor(alert.severity)}`}>
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm mt-1">{alert.description}</p>
                          <div className="flex justify-between items-center mt-3">
                            <Badge variant="outline" className="text-xs">
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <span className="text-xs opacity-75">
                              {new Date(alert.startTime).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnandSaathiWeatherMonitoring;
