/**
 * Vegetation Analysis Dashboard
 * NDVI, satellite imagery, and crop health monitoring
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppState } from '@/contexts/AppStateContext';
import { satelliteService } from '@/services/integrations/SatelliteService';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Satellite, Leaf, TrendingUp, RefreshCw, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export const VegetationAnalysisDashboard: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { isPunjabi, isHindi } = useTranslation();
  
  const [selectedField, setSelectedField] = useState(state.fields[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeField = async () => {
    if (!selectedField) {
      toast.error(isPunjabi ? 'ਖੇਤ ਚੁਣੋ' : isHindi ? 'खेत चुनें' : 'Select a field');
      return;
    }

    setIsAnalyzing(true);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const result = await satelliteService.analyzeField(
        selectedField.id.toString(),
        [[selectedField.longitude, selectedField.latitude]]
      );

      if (result.success && result.data) {
        dispatch({
          type: 'ADD_VEGETATION_ANALYSIS',
          payload: {
            id: `veg_${selectedField.id}_${Date.now()}`,
            fieldId: selectedField.id.toString(),
            ndvi: result.data.indices.ndvi,
            ndmi: result.data.indices.ndmi,
            msavi2: result.data.indices.msavi2,
            ndre: result.data.indices.ndre,
            timestamp: new Date(),
            healthStatus: result.data.healthStatus as 'excellent' | 'good' | 'moderate' | 'poor',
          },
        });

        dispatch({
          type: 'UPDATE_INTEGRATION_STATUS',
          payload: { satellite: 'connected' },
        });

        toast.success(
          isPunjabi 
            ? 'ਵਿਸ਼ਲੇਸ਼ਣ ਪੂਰਾ!' 
            : isHindi 
            ? 'विश्लेषण पूरा!' 
            : 'Analysis complete!'
        );
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ ਅਸਫਲ' : isHindi ? 'विश्लेषण असफल' : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fieldVegetationData = state.vegetationData.filter(
    v => v.fieldId === selectedField?.id.toString()
  );
  const latestAnalysis = fieldVegetationData[fieldVegetationData.length - 1];

  const getHealthColor = (status: string) => {
    const colors = {
      excellent: 'text-green-600 bg-green-100',
      good: 'text-blue-600 bg-blue-100',
      moderate: 'text-yellow-600 bg-yellow-100',
      poor: 'text-orange-600 bg-orange-100',
      critical: 'text-red-600 bg-red-100',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getHealthLabel = (status: string) => {
    const labels = {
      excellent: isPunjabi ? 'ਸ਼ਾਨਦਾਰ' : isHindi ? 'उत्कृष्ट' : 'Excellent',
      good: isPunjabi ? 'ਚੰਗਾ' : isHindi ? 'अच्छा' : 'Good',
      moderate: isPunjabi ? 'ਮੱਧਮ' : isHindi ? 'मध्यम' : 'Moderate',
      poor: isPunjabi ? 'ਖਰਾਬ' : isHindi ? 'खराब' : 'Poor',
      critical: isPunjabi ? 'ਗੰਭੀਰ' : isHindi ? 'गंभीर' : 'Critical',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const indicesData = latestAnalysis ? [
    { name: 'NDVI', value: latestAnalysis.ndvi, description: isPunjabi ? 'ਵਨਸਪਤੀ ਸਿਹਤ' : isHindi ? 'वनस्पति स्वास्थ्य' : 'Vegetation Health' },
    { name: 'NDMI', value: latestAnalysis.ndmi, description: isPunjabi ? 'ਮਿੱਟੀ ਨਮੀ' : isHindi ? 'मिट्टी नमी' : 'Soil Moisture' },
    { name: 'MSAVI2', value: latestAnalysis.msavi2, description: isPunjabi ? 'ਮਿੱਟੀ-ਮੁਕਤ ਸੂਚਕ' : isHindi ? 'मिट्टी-मुक्त सूचक' : 'Soil-free Index' },
    { name: 'NDRE', value: latestAnalysis.ndre, description: isPunjabi ? 'ਪੱਤੇ ਦੀ ਸਿਹਤ' : isHindi ? 'पत्ती स्वास्थ्य' : 'Leaf Health' },
  ] : [];

  const historicalData = fieldVegetationData.map((d, i) => ({
    day: i + 1,
    ndvi: d.ndvi,
    ndmi: d.ndmi,
    msavi2: d.msavi2,
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Satellite className="h-8 w-8 text-primary" />
            {isPunjabi ? 'ਵਨਸਪਤੀ ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'वनस्पति विश्लेषण' : 'Vegetation Analysis'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isPunjabi 
              ? 'ਸੈਟੇਲਾਈਟ ਚਿੱਤਰਾਂ ਤੋਂ ਫਸਲ ਸਿਹਤ ਨਿਗਰਾਨੀ' 
              : isHindi 
              ? 'उपग्रह छवियों से फसल स्वास्थ्य निगरानी' 
              : 'Crop health monitoring from satellite imagery'}
          </p>
        </div>
        <Button onClick={analyzeField} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ...' : isHindi ? 'विश्लेषण...' : 'Analyzing...'}
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              {isPunjabi ? 'ਖੇਤ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ' : isHindi ? 'खेत का विश्लेषण करें' : 'Analyze Field'}
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

      {/* Health Status Card */}
      {latestAnalysis && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                {isPunjabi ? 'ਫਸਲ ਸਿਹਤ ਸਥਿਤੀ' : isHindi ? 'फसल स्वास्थ्य स्थिति' : 'Crop Health Status'}
              </CardTitle>
              <Badge className={getHealthColor(latestAnalysis.healthStatus)}>
                {getHealthLabel(latestAnalysis.healthStatus)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="text-5xl font-bold text-green-600">
                  {(latestAnalysis.ndvi * 100).toFixed(0)}%
                </div>
                <p className="text-muted-foreground mt-2">
                  {isPunjabi ? 'ਸਮੁੱਚੀ ਵਨਸਪਤੀ ਸਿਹਤ' : isHindi ? 'समग्र वनस्पति स्वास्थ्य' : 'Overall Vegetation Health'}
                </p>
              </div>
              <Progress value={latestAnalysis.ndvi * 100} className="h-3" />
              <p className="text-sm text-muted-foreground text-center">
                {isPunjabi ? 'ਆਖਰੀ ਅਪਡੇਟ' : isHindi ? 'अंतिम अद्यतन' : 'Last updated'}: {new Date(latestAnalysis.timestamp).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vegetation Indices */}
      {indicesData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {indicesData.map(index => (
            <Card key={index.name}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{index.name}</CardTitle>
                <CardDescription className="text-xs">{index.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{index.value.toFixed(3)}</div>
                <Progress value={index.value * 100} className="mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Historical Trend */}
      {historicalData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {isPunjabi ? 'ਇਤਿਹਾਸਕ ਰੁਝਾਨ' : isHindi ? 'ऐतिहासिक रुझान' : 'Historical Trend'}
            </CardTitle>
            <CardDescription>
              {isPunjabi ? 'ਸਮੇਂ ਦੇ ਨਾਲ ਵਨਸਪਤੀ ਸੂਚਕਾਂਕ' : isHindi ? 'समय के साथ वनस्पति सूचकांक' : 'Vegetation indices over time'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" label={{ value: isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ #' : isHindi ? 'विश्लेषण #' : 'Analysis #', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: isPunjabi ? 'ਮੁੱਲ' : isHindi ? 'मान' : 'Value', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ndvi" stroke="#10b981" strokeWidth={2} name="NDVI" />
                <Line type="monotone" dataKey="ndmi" stroke="#3b82f6" strokeWidth={2} name="NDMI" />
                <Line type="monotone" dataKey="msavi2" stroke="#8b5cf6" strokeWidth={2} name="MSAVI2" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* No data state */}
      {!latestAnalysis && (
        <Card>
          <CardContent className="text-center py-12">
            <Satellite className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">
              {isPunjabi ? 'ਕੋਈ ਵਿਸ਼ਲੇਸ਼ਣ ਡੇਟਾ ਨਹੀਂ' : isHindi ? 'कोई विश्लेषण डेटा नहीं' : 'No Analysis Data'}
            </p>
            <p className="text-sm text-muted-foreground">
              {isPunjabi 
                ? 'ਵਨਸਪਤੀ ਸਿਹਤ ਵਿਸ਼ਲੇਸ਼ਣ ਤਿਆਰ ਕਰਨ ਲਈ "ਖੇਤ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ" \'ਤੇ ਕਲਿੱਕ ਕਰੋ' 
                : isHindi 
                ? 'वनस्पति स्वास्थ्य विश्लेषण तैयार करने के लिए "खेत का विश्लेषण करें" पर क्लिक करें' 
                : 'Click "Analyze Field" to generate vegetation health analysis'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VegetationAnalysisDashboard;
