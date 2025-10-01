/**
 * Unified AI Intelligence Dashboard
 * Aggregates all data sources for comprehensive farm intelligence
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppState } from '@/contexts/AppStateContext';
import { Brain, AlertCircle, CheckCircle, Lightbulb, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'irrigation' | 'fertilizer' | 'pest' | 'harvest' | 'market';
  confidence: number;
}

interface RiskAssessment {
  level: 'low' | 'medium' | 'high';
  factors: string[];
  mitigation: string[];
}

export const UnifiedIntelligenceDashboard: React.FC = () => {
  const { state } = useAppState();
  const { isPunjabi, isHindi } = useTranslation();
  
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);

  // Generate AI recommendations based on all data sources
  useEffect(() => {
    generateRecommendations();
    assessRisks();
  }, [state.fields, state.forecasts, state.sensors, state.vegetationData]);

  const generateRecommendations = () => {
    const newRecommendations: Recommendation[] = [];

    // Analyze sensor data
    state.sensors.forEach(sensor => {
      const sensorHistory = state.sensorData.get(sensor.id);
      if (sensorHistory && sensorHistory.length > 0) {
        const latestReading = sensorHistory[sensorHistory.length - 1];
        
        if (sensor.type === 'soil_moisture' && latestReading.value < 30) {
          newRecommendations.push({
            id: `irrigation_${sensor.id}`,
            title: isPunjabi ? 'ਸਿੰਚਾਈ ਦੀ ਲੋੜ' : isHindi ? 'सिंचाई की आवश्यकता' : 'Irrigation Needed',
            description: isPunjabi 
              ? `ਮਿੱਟੀ ਦੀ ਨਮੀ ਘੱਟ ਹੈ (${latestReading.value}%). ਜਲਦੀ ਸਿੰਚਾਈ ਦੀ ਸਿਫਾਰਸ਼ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।`
              : isHindi 
              ? `मिट्टी की नमी कम है (${latestReading.value}%)। जल्द सिंचाई की सिफारिश की जाती है।`
              : `Soil moisture is low (${latestReading.value}%). Immediate irrigation recommended.`,
            priority: 'high',
            category: 'irrigation',
            confidence: 0.9,
          });
        }
      }
    });

    // Analyze vegetation data
    state.vegetationData.forEach(veg => {
      if (veg.ndvi < 0.5) {
        newRecommendations.push({
          id: `health_${veg.fieldId}`,
          title: isPunjabi ? 'ਫਸਲ ਸਿਹਤ ਚਿੰਤਾ' : isHindi ? 'फसल स्वास्थ्य चिंता' : 'Crop Health Concern',
          description: isPunjabi 
            ? 'NDVI ਘੱਟ ਹੈ। ਪੋਸ਼ਕ ਤੱਤਾਂ ਦੀ ਜਾਂਚ ਅਤੇ ਸੰਭਵ ਉਪਚਾਰ ਦੀ ਸਿਫਾਰਸ਼।'
            : isHindi 
            ? 'NDVI कम है। पोषक तत्वों की जांच और संभावित उपचार की सिफारिश।'
            : 'NDVI is low. Recommend nutrient check and possible treatment.',
          priority: 'high',
          category: 'fertilizer',
          confidence: 0.85,
        });
      }
    });

    // Analyze market forecasts
    const marketForecasts = state.forecasts.filter(f => f.type === 'market');
    marketForecasts.forEach(forecast => {
      const trend = forecast.predictions[forecast.predictions.length - 1] - forecast.predictions[0];
      if (trend > 0) {
        newRecommendations.push({
          id: `market_${forecast.fieldId}`,
          title: isPunjabi ? 'ਬਾਜ਼ਾਰ ਦਾ ਮੌਕਾ' : isHindi ? 'बाजार का अवसर' : 'Market Opportunity',
          description: isPunjabi 
            ? 'ਕੀਮਤਾਂ ਵਧ ਰਹੀਆਂ ਹਨ। ਵੇਚਣ ਲਈ ਚੰਗਾ ਸਮਾਂ।'
            : isHindi 
            ? 'कीमतें बढ़ रही हैं। बेचने का अच्छा समय।'
            : 'Prices are rising. Good time to sell.',
          priority: 'medium',
          category: 'market',
          confidence: forecast.confidence,
        });
      }
    });

    setRecommendations(newRecommendations);
  };

  const assessRisks = () => {
    const factors: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Check sensor alerts
    if (state.sensors.some(s => s.status === 'error')) {
      factors.push(isPunjabi ? 'ਸੈਂਸਰ ਗਲਤੀ' : isHindi ? 'सेंसर त्रुटि' : 'Sensor malfunction');
      riskLevel = 'medium';
    }

    // Check vegetation health
    const poorHealthCount = state.vegetationData.filter(
      v => v.healthStatus === 'poor'
    ).length;
    if (poorHealthCount > 0) {
      factors.push(isPunjabi ? 'ਫਸਲ ਸਿਹਤ ਸਮੱਸਿਆ' : isHindi ? 'फसल स्वास्थ्य समस्या' : 'Crop health issues');
      riskLevel = 'high';
    }

    // Check forecast confidence
    const lowConfidenceForecasts = state.forecasts.filter(f => f.confidence < 0.6).length;
    if (lowConfidenceForecasts > 0) {
      factors.push(isPunjabi ? 'ਘੱਟ ਭਵਿੱਖਬਾਣੀ ਵਿਸ਼ਵਾਸ' : isHindi ? 'कम पूर्वानुमान विश्वास' : 'Low forecast confidence');
    }

    setRiskAssessment({
      level: riskLevel,
      factors,
      mitigation: generateMitigation(factors),
    });
  };

  const generateMitigation = (factors: string[]): string[] => {
    return factors.map(factor => {
      if (factor.includes('Sensor') || factor.includes('ਸੈਂਸਰ') || factor.includes('सेंसर')) {
        return isPunjabi ? 'ਸੈਂਸਰ ਮੁਰੰਮਤ/ਬਦਲੋ' : isHindi ? 'सेंसर मरम्मत/बदलें' : 'Repair/replace sensors';
      }
      if (factor.includes('health') || factor.includes('ਸਿਹਤ') || factor.includes('स्वास्थ्य')) {
        return isPunjabi ? 'ਖੇਤ ਦਾ ਮੁਆਇਨਾ, ਉਪਚਾਰ ਲਾਗੂ ਕਰੋ' : isHindi ? 'खेत का निरीक्षण, उपचार लागू करें' : 'Inspect field, apply treatment';
      }
      return isPunjabi ? 'ਡੇਟਾ ਸੁਧਾਰੋ' : isHindi ? 'डेटा सुधारें' : 'Improve data quality';
    });
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-blue-100 text-blue-700',
    };
    return colors[priority as keyof typeof colors];
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      high: isPunjabi ? 'ਉੱਚ' : isHindi ? 'उच्च' : 'High',
      medium: isPunjabi ? 'ਮੱਧਮ' : isHindi ? 'मध्यम' : 'Medium',
      low: isPunjabi ? 'ਨੀਵਾਂ' : isHindi ? 'निम्न' : 'Low',
    };
    return labels[priority as keyof typeof labels];
  };

  const getRiskColor = (level: string) => {
    const colors = {
      low: 'border-green-500 bg-green-50',
      medium: 'border-yellow-500 bg-yellow-50',
      high: 'border-red-500 bg-red-50',
    };
    return colors[level as keyof typeof colors];
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="h-8 w-8 text-purple-600" />
          {isPunjabi ? 'ਏਕੀਕ੍ਰਿਤ AI ਬੁੱਧੀ' : isHindi ? 'एकीकृत AI बुद्धि' : 'Unified AI Intelligence'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isPunjabi 
            ? 'ਸਾਰੇ ਡੇਟਾ ਸਰੋਤਾਂ ਤੋਂ ਸੰਪੂਰਨ ਸਮਝ' 
            : isHindi 
            ? 'सभी डेटा स्रोतों से व्यापक समझ' 
            : 'Comprehensive insights from all data sources'}
        </p>
      </div>

      {/* Data Source Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isPunjabi ? 'ਏਕੀਕਰਣ ਸਥਿਤੀ' : isHindi ? 'एकीकरण स्थिति' : 'Integration Status'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(state.integrationStatus).map(([key, status]) => (
              <div key={key} className="flex items-center gap-2">
                {status === 'connected' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm capitalize">{key}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      {riskAssessment && (
        <Alert className={`border-2 ${getRiskColor(riskAssessment.level)}`}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {isPunjabi ? 'ਜੋਖਮ ਪੱਧਰ' : isHindi ? 'जोखिम स्तर' : 'Risk Level'}:
                </span>
                <Badge className={getPriorityColor(riskAssessment.level)}>
                  {getPriorityLabel(riskAssessment.level)}
                </Badge>
              </div>
              {riskAssessment.factors.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">
                    {isPunjabi ? 'ਕਾਰਕ' : isHindi ? 'कारक' : 'Factors'}:
                  </p>
                  <ul className="text-sm space-y-1">
                    {riskAssessment.factors.map((factor, i) => (
                      <li key={i}>• {factor}</li>
                    ))}
                  </ul>
                </div>
              )}
              {riskAssessment.mitigation.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">
                    {isPunjabi ? 'ਉਪਾਅ' : isHindi ? 'उपाय' : 'Mitigation'}:
                  </p>
                  <ul className="text-sm space-y-1">
                    {riskAssessment.mitigation.map((action, i) => (
                      <li key={i}>• {action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            {isPunjabi ? 'AI ਸਿਫਾਰਸ਼ਾਂ' : isHindi ? 'AI सिफारिशें' : 'AI Recommendations'}
          </CardTitle>
          <CardDescription>
            {isPunjabi 
              ? 'ਤੁਹਾਡੇ ਡੇਟਾ ਦੇ ਅਧਾਰ \'ਤੇ ਬੁੱਧੀਮਾਨ ਸੁਝਾਅ' 
              : isHindi 
              ? 'आपके डेटा के आधार पर बुद्धिमान सुझाव' 
              : 'Intelligent suggestions based on your data'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map(rec => (
                <div key={rec.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{rec.title}</h4>
                        <Badge className={getPriorityColor(rec.priority)}>
                          {getPriorityLabel(rec.priority)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {(rec.confidence * 100).toFixed(0)}% {isPunjabi ? 'ਵਿਸ਼ਵਾਸ' : isHindi ? 'विश्वास' : 'confidence'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{isPunjabi ? 'ਕੋਈ ਸਿਫਾਰਸ਼ ਉਪਲਬਧ ਨਹੀਂ' : isHindi ? 'कोई सिफारिश उपलब्ध नहीं' : 'No recommendations available'}</p>
              <p className="text-sm mt-1">
                {isPunjabi ? 'ਹੋਰ ਡੇਟਾ ਇਕੱਠਾ ਕਰੋ' : isHindi ? 'अधिक डेटा एकत्र करें' : 'Collect more data for insights'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              {isPunjabi ? 'ਕੁੱਲ ਖੇਤ' : isHindi ? 'कुल खेत' : 'Total Fields'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{state.fields.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              {isPunjabi ? 'ਸਰਗਰਮ ਸੈਂਸਰ' : isHindi ? 'सक्रिय सेंसर' : 'Active Sensors'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {state.sensors.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              {isPunjabi ? 'ਭਵਿੱਖਬਾਣੀਆਂ' : isHindi ? 'पूर्वानुमान' : 'Forecasts'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{state.forecasts.length}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnifiedIntelligenceDashboard;
