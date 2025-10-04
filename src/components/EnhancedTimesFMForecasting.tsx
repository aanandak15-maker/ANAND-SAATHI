/**
 * Enhanced TimesFM Forecasting Component
 * Follows system design with proper integration and comprehensive forecasting
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Cloud, 
  DollarSign, 
  BarChart3,
  Target,
  Zap,
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Moon,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Settings,
  Info,
  Shield,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { enhancedTimesFMService, type TimesFMRequest, type TimesFMComprehensiveResponse } from '@/services/integrations/EnhancedTimesFMService';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

interface EnhancedTimesFMForecastingProps {
  fieldData: {
    id: string;
    name: string;
    crop_type: string;
    variety?: string;
    area_acres: number;
    latitude?: number;
    longitude?: number;
    region?: string;
    district?: string;
    planting_date?: string;
  };
  onAnalysisComplete?: (analysis: TimesFMComprehensiveResponse) => void;
}

interface ForecastState {
  comprehensiveAnalysis: TimesFMComprehensiveResponse | null;
  isLoading: boolean;
  error: string | null;
  activeTab: string;
  serviceStatus: {
    isHealthy: boolean;
    isUsingMockData: boolean;
    circuitBreakerOpen: boolean;
    lastFailureTime?: number;
    failureCount: number;
  };
}

export const EnhancedTimesFMForecasting: React.FC<EnhancedTimesFMForecastingProps> = ({
  fieldData,
  onAnalysisComplete
}) => {
  const { t, language, isPunjabi, isHindi } = useTranslation();
  const [forecastState, setForecastState] = useState<ForecastState>({
    comprehensiveAnalysis: null,
    isLoading: false,
    error: null,
    activeTab: 'overview',
    serviceStatus: {
      isHealthy: true,
      isUsingMockData: true,
      circuitBreakerOpen: false,
      failureCount: 0
    }
  });

  // Update service status
  useEffect(() => {
    const updateServiceStatus = () => {
      const status = enhancedTimesFMService.getServiceStatus();
      setForecastState(prev => ({ ...prev, serviceStatus: status }));
    };

    updateServiceStatus();
    const interval = setInterval(updateServiceStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Generate comprehensive TimesFM analysis
  const generateComprehensiveAnalysis = async () => {
    if (!fieldData) {
      toast.error(t('aiForecasting.locationRequired'));
      return;
    }

    setForecastState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const request: TimesFMRequest = {
        fieldId: fieldData.id,
        cropType: fieldData.crop_type,
        variety: fieldData.variety,
        region: fieldData.region || 'punjab',
        district: fieldData.district,
        coordinates: fieldData.latitude && fieldData.longitude ? {
          lat: fieldData.latitude,
          lng: fieldData.longitude
        } : undefined,
        plantingDate: fieldData.planting_date,
        area: fieldData.area_acres,
        forecastType: 'comprehensive',
        metadata: {
          source: 'anand-saathi',
          version: '1.0.0'
        }
      };

      const result = await enhancedTimesFMService.getComprehensiveForecast(request);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to generate comprehensive forecast');
      }

      setForecastState(prev => ({
        ...prev,
        comprehensiveAnalysis: result.data,
        isLoading: false,
        error: null
      }));

      onAnalysisComplete?.(result.data);

      const successMessage = isPunjabi 
        ? 'TimesFM ਸੰਪੂਰਨ ਭਵਿੱਖਬਾਣੀ ਪੂਰੀ!' 
        : isHindi 
        ? 'TimesFM संपूर्ण भविष्यवाणी पूरी!' 
        : 'TimesFM comprehensive forecast complete!';

      toast.success(successMessage, {
        description: result.metadata?.source === 'mock-data' 
          ? (isPunjabi ? 'Mock ਡੇਟਾ ਦੀ ਵਰਤੋਂ ਕੀਤੀ ਗਈ' : isHindi ? 'Mock डेटा का उपयोग किया गया' : 'Using mock data')
          : undefined
      });

    } catch (error) {
      console.error('TimesFM comprehensive forecast error:', error);
      setForecastState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : t('aiForecasting.analysisError')
      }));
      toast.error(t('aiForecasting.analysisError'));
    }
  };

  // Reset circuit breaker
  const resetCircuitBreaker = () => {
    enhancedTimesFMService.resetCircuitBreaker();
    setForecastState(prev => ({
      ...prev,
      serviceStatus: enhancedTimesFMService.getServiceStatus()
    }));
    toast.success(isPunjabi ? 'Circuit breaker reset ਕੀਤਾ ਗਿਆ' : isHindi ? 'Circuit breaker reset किया गया' : 'Circuit breaker reset');
  };

  // Chart data preparation
  const prepareYieldChartData = () => {
    if (!forecastState.comprehensiveAnalysis?.yield) return [];
    
    const yieldData = forecastState.comprehensiveAnalysis.yield;
    return [
      { stage: 'Drought', value: yieldData.scenarios.drought, color: '#ef4444' },
      { stage: 'Normal', value: yieldData.scenarios.normal, color: '#3b82f6' },
      { stage: 'Optimal', value: yieldData.scenarios.optimal, color: '#10b981' }
    ];
  };

  const prepareMarketChartData = () => {
    if (!forecastState.comprehensiveAnalysis?.market) return [];
    
    const marketData = forecastState.comprehensiveAnalysis.market;
    return marketData.forecast.map((forecast, index) => ({
      week: `Week ${forecast.weekOffset}`,
      predicted: forecast.predicted,
      low: forecast.low,
      high: forecast.high,
      confidence: forecast.confidence
    }));
  };

  const prepareWeatherChartData = () => {
    if (!forecastState.comprehensiveAnalysis?.weather) return [];
    
    const weatherData = forecastState.comprehensiveAnalysis.weather;
    return weatherData.forecast.map((forecast, index) => ({
      day: new Date(forecast.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      temperature: forecast.temperature.avg,
      min: forecast.temperature.min,
      max: forecast.temperature.max,
      precipitation: forecast.precipitation
    }));
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'rising':
      case 'warming':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
      case 'falling':
      case 'cooling':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'rising':
      case 'warming':
        return 'text-green-600';
      case 'down':
      case 'falling':
      case 'cooling':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {isPunjabi ? 'TimesFM AI ਭਵਿੱਖਬਾਣੀ' : isHindi ? 'TimesFM AI भविष्यवाणी' : 'TimesFM AI Forecasting'}
              </CardTitle>
              <CardDescription>
                {isPunjabi ? 'ਉੱਨਤ AI ਭਵਿੱਖਬਾਣੀ ਸਿਸਟਮ' : isHindi ? 'उन्नत AI भविष्यवाणी सिस्टम' : 'Advanced AI Forecasting System'} - {fieldData.name} ({fieldData.crop_type})
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {fieldData.area_acres} {t('units.acres')}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                TimesFM AI
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Service Status */}
              <div className="flex items-center gap-2">
                {forecastState.serviceStatus.isHealthy ? (
                  <Wifi className="h-4 w-4 text-green-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {forecastState.serviceStatus.isUsingMockData 
                    ? (isPunjabi ? 'Mock ਡੇਟਾ' : isHindi ? 'Mock डेटा' : 'Mock Data')
                    : (isPunjabi ? 'Live API' : isHindi ? 'Live API' : 'Live API')
                  }
                </span>
              </div>

              {/* Circuit Breaker Status */}
              {forecastState.serviceStatus.circuitBreakerOpen && (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-600">
                    {isPunjabi ? 'Circuit Breaker Open' : isHindi ? 'Circuit Breaker Open' : 'Circuit Breaker Open'}
                  </span>
                  <Button size="sm" variant="outline" onClick={resetCircuitBreaker}>
                    {isPunjabi ? 'Reset' : isHindi ? 'Reset' : 'Reset'}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button 
                onClick={generateComprehensiveAnalysis}
                disabled={forecastState.isLoading}
                className="flex items-center gap-2"
              >
                {forecastState.isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                {isPunjabi ? 'ਸੰਪੂਰਨ ਭਵਿੱਖਬਾਣੀ' : isHindi ? 'संपूर्ण भविष्यवाणी' : 'Generate Comprehensive Forecast'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {forecastState.error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{forecastState.error}</AlertDescription>
        </Alert>
      )}

      {/* Comprehensive Analysis */}
      {forecastState.comprehensiveAnalysis && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Yield Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-green-600" />
                  {isPunjabi ? 'ਉਪਜ ਭਵਿੱਖਬਾਣੀ' : isHindi ? 'उपज भविष्यवाणी' : 'Yield Forecast'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  {forecastState.comprehensiveAnalysis.yield.predictedYield.tonsPerAcre.toFixed(2)} {t('units.tons')}
                </div>
                <p className="text-sm text-green-700">
                  {isPunjabi ? 'ਆਤਮਵਿਸ਼ਵਾਸ' : isHindi ? 'आत्मविश्वास' : 'Confidence'}: {(forecastState.comprehensiveAnalysis.yield.predictedYield.confidence * 100).toFixed(0)}%
                </p>
                <Progress value={forecastState.comprehensiveAnalysis.yield.predictedYield.confidence * 100} className="mt-2" />
              </CardContent>
            </Card>

            {/* Market Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  {isPunjabi ? 'ਬਾਜ਼ਾਰ ਭਵਿੱਖਬਾਣੀ' : isHindi ? 'बाजार भविष्यवाणी' : 'Market Forecast'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">
                  ₹{forecastState.comprehensiveAnalysis.market.currentPrice}
                </div>
                <p className="text-sm text-blue-700 flex items-center gap-1">
                  {getTrendIcon(forecastState.comprehensiveAnalysis.market.priceTrend)}
                  <span className={getTrendColor(forecastState.comprehensiveAnalysis.market.priceTrend)}>
                    {forecastState.comprehensiveAnalysis.market.priceTrend}
                  </span>
                </p>
                <Progress value={forecastState.comprehensiveAnalysis.market.volatility * 100} className="mt-2" />
              </CardContent>
            </Card>

            {/* Weather Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-orange-600" />
                  {isPunjabi ? 'ਮੌਸਮ ਭਵਿੱਖਬਾਣੀ' : isHindi ? 'मौसम भविष्यवाणी' : 'Weather Forecast'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">
                  {forecastState.comprehensiveAnalysis.weather.current.temperature.toFixed(1)}°C
                </div>
                <p className="text-sm text-orange-700">
                  {isPunjabi ? 'ਨਮੀ' : isHindi ? 'नमी' : 'Humidity'}: {forecastState.comprehensiveAnalysis.weather.current.humidity}%
                </p>
                <Progress value={forecastState.comprehensiveAnalysis.weather.current.humidity} className="mt-2" />
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  {isPunjabi ? 'ਕੁਲ ਸਕੋਰ' : isHindi ? 'कुल स्कोर' : 'Overall Score'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">
                  {forecastState.comprehensiveAnalysis.performanceMetrics.overallScore}/100
                </div>
                <p className="text-sm text-purple-700">
                  {isPunjabi ? 'ਜੋਖਮ' : isHindi ? 'जोखिम' : 'Risk'}: {forecastState.comprehensiveAnalysis.performanceMetrics.riskLevel}
                </p>
                <Progress value={forecastState.comprehensiveAnalysis.performanceMetrics.overallScore} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis Tabs */}
          <Tabs value={forecastState.activeTab} onValueChange={(tab) => setForecastState(prev => ({ ...prev, activeTab: tab }))}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                {isPunjabi ? 'ਅਵਲੋਕਨ' : isHindi ? 'अवलोकन' : 'Overview'}
              </TabsTrigger>
              <TabsTrigger value="yield" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {isPunjabi ? 'ਉਪਜ' : isHindi ? 'उपज' : 'Yield'}
              </TabsTrigger>
              <TabsTrigger value="market" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {isPunjabi ? 'ਬਾਜ਼ਾਰ' : isHindi ? 'बाजार' : 'Market'}
              </TabsTrigger>
              <TabsTrigger value="weather" className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                {isPunjabi ? 'ਮੌਸਮ' : isHindi ? 'मौसम' : 'Weather'}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Risk Factors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {isPunjabi ? 'ਜੋਖਮ ਕਾਰਕ' : isHindi ? 'जोखिम कारक' : 'Risk Factors'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {forecastState.comprehensiveAnalysis.yield.riskFactors.map((risk, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(risk.severity)}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{risk.factor}</span>
                            <Badge variant="outline" className={getSeverityColor(risk.severity)}>
                              {risk.severity}
                            </Badge>
                          </div>
                          <p className="text-sm mb-2">{risk.impact}</p>
                          <p className="text-sm font-medium">{risk.recommendation}</p>
                          <div className="mt-2">
                            <span className="text-xs text-gray-600">
                              {isPunjabi ? 'ਸੰਭਾਵਨਾ' : isHindi ? 'संभावना' : 'Probability'}: {(risk.probability * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Integrated Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {isPunjabi ? 'ਸਿਫਾਰਿਸ਼ਾਂ' : isHindi ? 'सिफारिशें' : 'Recommendations'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {forecastState.comprehensiveAnalysis.integratedRecommendations.map((rec, index) => (
                        <div key={index} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{rec.title}</span>
                            <Badge variant="outline" className={getSeverityColor(rec.priority)}>
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-sm mb-2">{rec.description}</p>
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">
                              {isPunjabi ? 'ਲਾਗਤ' : isHindi ? 'लागत' : 'Cost'}: ₹{rec.estimatedCost}
                            </span>
                            <span className="ml-4">
                              {isPunjabi ? 'ਸਮਾਂ' : isHindi ? 'समय' : 'Time'}: {rec.implementationWindow}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Yield Tab */}
            <TabsContent value="yield" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isPunjabi ? 'ਉਪਜ ਭਵਿੱਖਬਾਣੀ' : isHindi ? 'उपज भविष्यवाणी' : 'Yield Forecast'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prepareYieldChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="stage" />
                        <YAxis label={{ value: isPunjabi ? 'ਟਨ/ਏਕੜ' : isHindi ? 'टन/एकड़' : 'Tons/Acre', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Market Tab */}
            <TabsContent value="market" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isPunjabi ? 'ਬਾਜ਼ਾਰ ਮੁੱਲ ਭਵਿੱਖਬਾਣੀ' : isHindi ? 'बाजार मूल्य भविष्यवाणी' : 'Market Price Forecast'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prepareMarketChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis label={{ value: isPunjabi ? 'ਕੀਮਤ (₹)' : isHindi ? 'कीमत (₹)' : 'Price (₹)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="high" stroke="#10b981" strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="low" stroke="#ef4444" strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Weather Tab */}
            <TabsContent value="weather" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isPunjabi ? 'ਮੌਸਮ ਭਵਿੱਖਬਾਣੀ' : isHindi ? 'मौसम भविष्यवाणी' : 'Weather Forecast'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={prepareWeatherChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis label={{ value: isPunjabi ? 'ਤਾਪਮਾਨ (°C)' : isHindi ? 'तापमान (°C)' : 'Temperature (°C)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="temperature" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Loading State */}
      {forecastState.isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-lg font-medium">
                {isPunjabi ? 'TimesFM ਭਵਿੱਖਬਾਣੀ ਤਿਆਰ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...' : isHindi ? 'TimesFM भविष्यवाणी तैयार की जा रही है...' : 'Generating TimesFM forecast...'}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {isPunjabi ? 'ਕਿਰਪਾ ਕਰਕੇ ਉਡੀਕ ਕਰੋ' : isHindi ? 'कृपया प्रतीक्षा करें' : 'Please wait'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedTimesFMForecasting;

