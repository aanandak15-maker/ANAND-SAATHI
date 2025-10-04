/**
 * AI Forecasting Dashboard
 * Complete UI for TimesFM predictions with real-time updates
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAppState } from '@/contexts/AppStateContext';
import { timesFMService } from '@/services/integrations/TimesFMService';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { DollarSign, Cloud, Sprout, RefreshCw, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export const AIForecastingDashboard: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { isPunjabi, isHindi } = useTranslation();
  
  const [selectedField, setSelectedField] = useState(state.fields[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('yield');
  
  const selectedFieldForecasts = state.forecasts.filter(f => f.fieldId === selectedField?.id.toString());
  const yieldForecast = selectedFieldForecasts.find(f => f.type === 'yield');
  const marketForecast = selectedFieldForecasts.find(f => f.type === 'market');
  const weatherForecast = selectedFieldForecasts.find(f => f.type === 'weather');

  // Generate forecasts for selected field
  const generateForecasts = async () => {
    if (!selectedField) {
      toast.error(isPunjabi ? 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਖੇਤ ਚੁਣੋ' : isHindi ? 'कृपया एक खेत चुनें' : 'Please select a field');
      return;
    }

    setIsLoading(true);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Generate historical data (placeholder - replace with actual data)
      const historicalYield = Array(30).fill(0).map(() => 12 + Math.random() * 4);
      const historicalPrices = Array(30).fill(0).map(() => 2000 + Math.random() * 400);

      // Get comprehensive forecast with location for 14-day weather
      const result = await timesFMService.getComprehensiveForecast(
        selectedField.id.toString(),
        selectedField.crop_type,
        {
          yield: historicalYield,
          prices: historicalPrices,
        },
        selectedField.latitude && selectedField.longitude ? {
          lat: selectedField.latitude,
          lng: selectedField.longitude
        } : undefined
      );

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to generate forecast');
      }

      // Add yield forecast to state
      dispatch({
        type: 'ADD_FORECAST',
        payload: {
          id: `yield_${selectedField.id}_${Date.now()}`,
          fieldId: selectedField.id.toString(),
          type: 'yield',
          predictions: result.data.yield.predictions,
          confidence: result.data.yield.confidenceScore,
          generatedAt: result.data.yield.generatedAt,
          modelVersion: result.data.yield.modelVersion,
        },
      });

      // Add market forecast to state
      dispatch({
        type: 'ADD_FORECAST',
        payload: {
          id: `market_${selectedField.id}_${Date.now()}`,
          fieldId: selectedField.id.toString(),
          type: 'market',
          predictions: result.data.market.predictions,
          confidence: result.data.market.confidenceScore,
          generatedAt: result.data.market.generatedAt,
          modelVersion: result.data.market.modelVersion,
        },
      });

      // Add weather forecast to state (14-day forecast)
      dispatch({
        type: 'ADD_FORECAST',
        payload: {
          id: `weather_${selectedField.id}_${Date.now()}`,
          fieldId: selectedField.id.toString(),
          type: 'weather',
          predictions: result.data.weather.predictions,
          confidence: result.data.weather.confidenceScore,
          generatedAt: result.data.weather.generatedAt,
          modelVersion: result.data.weather.modelVersion,
        },
      });

      toast.success(
        isPunjabi 
          ? 'AI ਭਵਿੱਖਬਾਣੀ ਸਫਲਤਾਪੂਰਵਕ ਤਿਆਰ ਹੋ ਗਈ!' 
          : isHindi 
          ? 'AI भविष्यवाणी सफलतापूर्वक तैयार हो गई!' 
          : 'AI forecasts generated successfully!'
      );
    } catch (error) {
      console.error('Forecast error:', error);
      toast.error(isPunjabi ? 'ਭਵਿੱਖਬਾਣੀ ਤਿਆਰ ਕਰਨ ਵਿੱਚ ਅਸਫਲ' : isHindi ? 'भविष्यवाणी तैयार करने में असफल' : 'Failed to generate forecasts');
    } finally {
      setIsLoading(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Prepare chart data
  const yieldChartData = yieldForecast ? yieldForecast.predictions.map((value, index) => ({
    day: index + 1,
    yield: value,
    lower: value * 0.9,
    upper: value * 1.1,
  })) : [];

  const marketChartData = marketForecast ? marketForecast.predictions.map((value, index) => ({
    day: index + 1,
    price: value,
    lower: value * 0.95,
    upper: value * 1.05,
  })) : [];

  const weatherChartData = weatherForecast ? weatherForecast.predictions.map((value, index) => ({
    day: `Day ${index + 1}`,
    temperature: value,
  })) : [];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return isPunjabi ? 'ਉੱਚ' : isHindi ? 'उच्च' : 'High';
    if (confidence >= 0.6) return isPunjabi ? 'ਮੱਧਮ' : isHindi ? 'मध्यम' : 'Medium';
    return isPunjabi ? 'ਨੀਵਾਂ' : isHindi ? 'निम्न' : 'Low';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isPunjabi ? 'AI ਭਵਿੱਖਬਾਣੀ' : isHindi ? 'AI भविष्यवाणी' : 'AI Forecasting'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isPunjabi ? 'TimesFM ਨਾਲ ਸੰਚਾਲਿਤ ਬੁੱਧੀਮਾਨ ਭਵਿੱਖਬਾਣੀਆਂ' : isHindi ? 'TimesFM द्वारा संचालित बुद्धिमान भविष्यवाणियां' : 'Intelligent predictions powered by TimesFM'}
          </p>
        </div>
        <Button onClick={generateForecasts} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isPunjabi ? 'ਤਿਆਰ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...' : isHindi ? 'तैयार किया जा रहा है...' : 'Generating...'}
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              {isPunjabi ? 'ਭਵਿੱਖਬਾਣੀ ਤਿਆਰ ਕਰੋ' : isHindi ? 'भविष्यवाणी तैयार करें' : 'Generate Forecasts'}
            </>
          )}
        </Button>
      </div>

      {/* Field Selector */}
      {state.fields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {isPunjabi ? 'ਖੇਤ ਚੁਣੋ' : isHindi ? 'खेत चुनें' : 'Select Field'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {state.fields.map((field) => (
                <Button
                  key={field.id}
                  variant={selectedField?.id === field.id ? 'default' : 'outline'}
                  onClick={() => setSelectedField(field)}
                  size="sm"
                >
                  {field.name} ({field.crop_type})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forecast Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Yield Forecast Summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sprout className="h-4 w-4 text-green-600" />
                {isPunjabi ? 'ਉਪਜ ਭਵਿੱਖਬਾਣੀ' : isHindi ? 'उपज भविष्यवाणी' : 'Yield Forecast'}
              </CardTitle>
              {yieldForecast && (
                <Badge className={getConfidenceColor(yieldForecast.confidence)}>
                  {getConfidenceLabel(yieldForecast.confidence)}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {yieldForecast ? (
              <>
                <div className="text-2xl font-bold">
                  {yieldForecast.predictions[yieldForecast.predictions.length - 1].toFixed(2)} {isPunjabi ? 'ਕੁਇੰਟਲ/ਏਕੜ' : isHindi ? 'क्विंटल/एकड़' : 'quintals/acre'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isPunjabi ? 'ਅਗਲੇ 30 ਦਿਨਾਂ ਲਈ ਅਨੁਮਾਨ' : isHindi ? 'अगले 30 दिनों के लिए अनुमान' : 'Forecast for next 30 days'}
                </p>
                <Progress value={yieldForecast.confidence * 100} className="mt-2" />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isPunjabi ? 'ਕੋਈ ਡੇਟਾ ਉਪਲਬਧ ਨਹੀਂ' : isHindi ? 'कोई डेटा उपलब्ध नहीं' : 'No data available'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Market Forecast Summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                {isPunjabi ? 'ਬਾਜ਼ਾਰ ਭਵਿੱਖਬਾਣੀ' : isHindi ? 'बाजार भविष्यवाणी' : 'Market Forecast'}
              </CardTitle>
              {marketForecast && (
                <Badge className={getConfidenceColor(marketForecast.confidence)}>
                  {getConfidenceLabel(marketForecast.confidence)}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {marketForecast ? (
              <>
                <div className="text-2xl font-bold">
                  ₹{marketForecast.predictions[marketForecast.predictions.length - 1].toFixed(0)} {isPunjabi ? '/ਕੁਇੰਟਲ' : isHindi ? '/क्विंटल' : '/quintal'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isPunjabi ? 'ਅਗਲੇ 30 ਦਿਨਾਂ ਲਈ ਕੀਮਤ' : isHindi ? 'अगले 30 दिनों के लिए कीमत' : 'Price for next 30 days'}
                </p>
                <Progress value={marketForecast.confidence * 100} className="mt-2" />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isPunjabi ? 'ਕੋਈ ਡੇਟਾ ਉਪਲਬਧ ਨਹੀਂ' : isHindi ? 'कोई डेटा उपलब्ध नहीं' : 'No data available'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Weather Forecast Summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Cloud className="h-4 w-4 text-orange-600" />
                {isPunjabi ? 'ਮੌਸਮ ਭਵਿੱਖਬਾਣੀ' : isHindi ? 'मौसम भविष्यवाणी' : 'Weather Forecast'}
              </CardTitle>
              {weatherForecast && (
                <Badge className={getConfidenceColor(weatherForecast.confidence)}>
                  {getConfidenceLabel(weatherForecast.confidence)}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {weatherForecast ? (
              <>
                <div className="text-2xl font-bold">
                  {weatherForecast.predictions[weatherForecast.predictions.length - 1].toFixed(1)}°C
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isPunjabi ? 'ਅਗਲੇ 14 ਦਿਨਾਂ ਲਈ ਔਸਤ' : isHindi ? 'अगले 14 दिनों के लिए औसत' : 'Average for next 14 days'}
                </p>
                <Progress value={weatherForecast.confidence * 100} className="mt-2" />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isPunjabi ? 'ਕੋਈ ਡੇਟਾ ਉਪਲਬਧ ਨਹੀਂ' : isHindi ? 'कोई डेटा उपलब्ध नहीं' : 'No data available'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Charts */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="yield">
            <Sprout className="h-4 w-4 mr-2" />
            {isPunjabi ? 'ਉਪਜ' : isHindi ? 'उपज' : 'Yield'}
          </TabsTrigger>
          <TabsTrigger value="market">
            <DollarSign className="h-4 w-4 mr-2" />
            {isPunjabi ? 'ਬਾਜ਼ਾਰ' : isHindi ? 'बाजार' : 'Market'}
          </TabsTrigger>
          <TabsTrigger value="weather">
            <Cloud className="h-4 w-4 mr-2" />
            {isPunjabi ? 'ਮੌਸਮ' : isHindi ? 'मौसम' : 'Weather'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="yield" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isPunjabi ? 'ਉਪਜ ਭਵਿੱਖਬਾਣੀ ਰੁਝਾਨ' : isHindi ? 'उपज भविष्यवाणी रुझान' : 'Yield Forecast Trend'}</CardTitle>
              <CardDescription>
                {isPunjabi ? 'ਅਗਲੇ 30 ਦਿਨਾਂ ਲਈ ਅਨੁਮਾਨਿਤ ਉਪਜ' : isHindi ? 'अगले 30 दिनों के लिए अनुमानित उपज' : 'Predicted yield for next 30 days'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {yieldChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={yieldChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" label={{ value: isPunjabi ? 'ਦਿਨ' : isHindi ? 'दिन' : 'Day', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: isPunjabi ? 'ਕੁਇੰਟਲ/ਏਕੜ' : isHindi ? 'क्विंटल/एकड़' : 'Quintals/Acre', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="upper" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name={isPunjabi ? 'ਉੱਚ ਅਨੁਮਾਨ' : isHindi ? 'उच्च अनुमान' : 'Upper Bound'} />
                    <Area type="monotone" dataKey="yield" stackId="2" stroke="#8884d8" fill="#8884d8" name={isPunjabi ? 'ਅਨੁਮਾਨ' : isHindi ? 'अनुमान' : 'Prediction'} />
                    <Area type="monotone" dataKey="lower" stackId="1" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} name={isPunjabi ? 'ਨੀਵਾਂ ਅਨੁਮਾਨ' : isHindi ? 'निम्न अनुमान' : 'Lower Bound'} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  {isPunjabi ? 'ਭਵਿੱਖਬਾਣੀ ਤਿਆਰ ਕਰਨ ਲਈ ਭਵਿੱਖਬਾਣੀ ਤਿਆਰ ਕਰੋ ਬਟਨ ਤੇ ਕਲਿੱਕ ਕਰੋ' : isHindi ? 'भविष्यवाणी तैयार करने के लिए भविष्यवाणी तैयार करें बटन पर क्लिक करें' : 'Click "Generate Forecasts" to see predictions'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isPunjabi ? 'ਬਾਜ਼ਾਰ ਮੁੱਲ ਰੁਝਾਨ' : isHindi ? 'बाजार मूल्य रुझान' : 'Market Price Trend'}</CardTitle>
              <CardDescription>
                {isPunjabi ? 'ਅਗਲੇ 30 ਦਿਨਾਂ ਲਈ ਅਨੁਮਾਨਿਤ ਕੀਮਤਾਂ' : isHindi ? 'अगले 30 दिनों के लिए अनुमानित कीमतें' : 'Predicted prices for next 30 days'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {marketChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={marketChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" label={{ value: isPunjabi ? 'ਦਿਨ' : isHindi ? 'दिन' : 'Day', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: isPunjabi ? 'ਕੀਮਤ (₹)' : isHindi ? 'कीमत (₹)' : 'Price (₹)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} name={isPunjabi ? 'ਕੀਮਤ' : isHindi ? 'कीमत' : 'Price'} />
                    <Line type="monotone" dataKey="upper" stroke="#82ca9d" strokeDasharray="5 5" name={isPunjabi ? 'ਉੱਚ' : isHindi ? 'उच्च' : 'Upper'} />
                    <Line type="monotone" dataKey="lower" stroke="#ffc658" strokeDasharray="5 5" name={isPunjabi ? 'ਨੀਵਾਂ' : isHindi ? 'निम्न' : 'Lower'} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  {isPunjabi ? 'ਭਵਿੱਖਬਾਣੀ ਤਿਆਰ ਕਰਨ ਲਈ ਭਵਿੱਖਬਾਣੀ ਤਿਆਰ ਕਰੋ ਬਟਨ ਤੇ ਕਲਿੱਕ ਕਰੋ' : isHindi ? 'भविष्यवाणी तैयार करने के लिए भविष्यवाणी तैयार करें बटन पर क्लिक करें' : 'Click "Generate Forecasts" to see predictions'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weather" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isPunjabi ? 'ਮੌਸਮ ਰੁਝਾਨ' : isHindi ? 'मौसम रुझान' : 'Weather Trend'}</CardTitle>
              <CardDescription>
                {isPunjabi ? 'ਅਗਲੇ 14 ਦਿਨਾਂ ਲਈ ਤਾਪਮਾਨ ਅਨੁਮਾਨ' : isHindi ? 'अगले 14 दिनों के लिए तापमान अनुमान' : 'Temperature forecast for next 14 days'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weatherChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weatherChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" label={{ value: isPunjabi ? 'ਦਿਨ' : isHindi ? 'दिन' : 'Day', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: isPunjabi ? 'ਤਾਪਮਾਨ (°C)' : isHindi ? 'तापमान (°C)' : 'Temperature (°C)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="temperature" fill="#ff7300" name={isPunjabi ? 'ਤਾਪਮਾਨ' : isHindi ? 'तापमान' : 'Temperature'} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  {isPunjabi ? 'ਭਵਿੱਖਬਾਣੀ ਤਿਆਰ ਕਰਨ ਲਈ ਭਵਿੱਖਬਾਣੀ ਤਿਆਰ ਕਰੋ ਬਟਨ ਤੇ ਕਲਿੱਕ ਕਰੋ' : isHindi ? 'भविष्यवाणी तैयार करने के लिए भविष्यवाणी तैयार करें बटन पर क्लिक करें' : 'Click "Generate Forecasts" to see predictions'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIForecastingDashboard;
