/**
 * Anand Saathi Health Assessment Dashboard
 * Comprehensive crop health monitoring and disease detection
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Droplets, 
  Volume2, 
  FileText, 
  ShoppingCart, 
  MapPin, 
  Clock, 
  TrendingUp, 
  RefreshCw, 
  Brain,
  Heart,
  Shield,
  Zap,
  Eye,
  Thermometer,
  Wind,
  Sun,
  Moon,
  Leaf,
  AlertCircle,
  Info,
  Play,
  Pause,
  Download,
  Upload
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { anandSaathiBackend, FieldData } from '@/lib/anandSaathiBackend';
import { toast } from 'sonner';

interface HealthMetrics {
  overallHealth: number;
  soilHealth: number;
  cropHealth: number;
  pestRisk: number;
  diseaseRisk: number;
  nutrientLevel: number;
  moistureLevel: number;
  temperatureStress: number;
}

interface DiseaseAlert {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedArea: number;
  confidence: number;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
  economicImpact: number;
}

interface PestAlert {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedArea: number;
  confidence: number;
  lifecycle: string;
  treatment: string[];
  prevention: string[];
  economicImpact: number;
}

interface NutrientDeficiency {
  nutrient: string;
  level: number;
  optimal: number;
  deficiency: number;
  symptoms: string[];
  treatment: string[];
  urgency: 'low' | 'medium' | 'high';
}

const AnandSaathiHealthAssessment: React.FC = () => {
  const { t, isPunjabi, isHindi } = useTranslation();
  const [selectedField, setSelectedField] = useState<FieldData | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const [diseaseAlerts, setDiseaseAlerts] = useState<DiseaseAlert[]>([]);
  const [pestAlerts, setPestAlerts] = useState<PestAlert[]>([]);
  const [nutrientDeficiencies, setNutrientDeficiencies] = useState<NutrientDeficiency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Sample data for demonstration
  useEffect(() => {
    // Initialize with sample health data
    setHealthMetrics({
      overallHealth: 85,
      soilHealth: 78,
      cropHealth: 92,
      pestRisk: 25,
      diseaseRisk: 15,
      nutrientLevel: 88,
      moistureLevel: 75,
      temperatureStress: 20
    });

    setDiseaseAlerts([
      {
        id: 'rust-1',
        name: 'Leaf Rust',
        severity: 'medium',
        affectedArea: 15,
        confidence: 87,
        symptoms: ['Orange-brown spots on leaves', 'Premature leaf drop', 'Reduced photosynthesis'],
        treatment: ['Apply fungicide spray', 'Remove infected leaves', 'Improve air circulation'],
        prevention: ['Plant resistant varieties', 'Avoid overhead irrigation', 'Regular field monitoring'],
        economicImpact: 12
      }
    ]);

    setPestAlerts([
      {
        id: 'aphid-1',
        name: 'Aphid Infestation',
        severity: 'low',
        affectedArea: 8,
        confidence: 92,
        lifecycle: 'Nymph → Adult → Reproduction',
        treatment: ['Apply neem oil', 'Introduce beneficial insects', 'Use insecticidal soap'],
        prevention: ['Plant companion crops', 'Maintain field hygiene', 'Monitor regularly'],
        economicImpact: 5
      }
    ]);

    setNutrientDeficiencies([
      {
        nutrient: 'Nitrogen',
        level: 45,
        optimal: 70,
        deficiency: 25,
        symptoms: ['Yellowing leaves', 'Stunted growth', 'Reduced yield'],
        treatment: ['Apply urea fertilizer', 'Use organic compost', 'Plant nitrogen-fixing crops'],
        urgency: 'high'
      },
      {
        nutrient: 'Phosphorus',
        level: 60,
        optimal: 75,
        deficiency: 15,
        symptoms: ['Purple leaves', 'Poor root development', 'Delayed maturity'],
        treatment: ['Apply DAP fertilizer', 'Use bone meal', 'Improve soil pH'],
        urgency: 'medium'
      }
    ]);
  }, []);

  const generateHealthReport = async () => {
    if (!selectedField) {
      toast.error(t('healthAssessment.fieldRequired'));
      return;
    }

    setIsGeneratingReport(true);
    try {
      // Simulate API call to generate comprehensive health report
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(isPunjabi ? 'ਸਿਹਤ ਰਿਪੋਰਟ ਤਿਆਰ ਹੋ ਗਈ!' : isHindi ? 'स्वास्थ्य रिपोर्ट तैयार हो गई!' : 'Health report generated successfully!');
    } catch (error) {
      console.error('Error generating health report:', error);
      toast.error(t('healthAssessment.reportError'));
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    if (value >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            {isPunjabi ? 'ਫਸਲ ਸਿਹਤ ਮੁਲਾਂਕਣ' : isHindi ? 'फसल स्वास्थ्य मूल्यांकन' : 'Crop Health Assessment'}
          </CardTitle>
          <CardDescription>
            {isPunjabi 
              ? 'ਆਪਣੇ ਖੇਤਾਂ ਦੀ ਸਿਹਤ ਦਾ ਵਿਆਪਕ ਮੁਲਾਂਕਣ ਅਤੇ ਬਿਮਾਰੀ ਖੋਜ'
              : isHindi 
              ? 'अपने खेतों का व्यापक स्वास्थ्य मूल्यांकन और रोग खोज'
              : 'Comprehensive health assessment and disease detection for your fields'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              onClick={generateHealthReport}
              disabled={isGeneratingReport}
              className="flex items-center gap-2"
            >
              {isGeneratingReport ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {isPunjabi ? 'ਸਿਹਤ ਰਿਪੋਰਟ ਬਣਾਓ' : isHindi ? 'स्वास्थ्य रिपोर्ट बनाएं' : 'Generate Health Report'}
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              {isPunjabi ? 'ਰਿਪੋਰਟ ਡਾਊਨਲੋਡ ਕਰੋ' : isHindi ? 'रिपोर्ट डाउनलोड करें' : 'Download Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Health Metrics Overview */}
      {healthMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {isPunjabi ? 'ਸਿਹਤ ਮੈਟ੍ਰਿਕਸ' : isHindi ? 'स्वास्थ्य मेट्रिक्स' : 'Health Metrics'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getHealthColor(healthMetrics.overallHealth)}`}>
                  {healthMetrics.overallHealth}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {isPunjabi ? 'ਕੁੱਲ ਸਿਹਤ' : isHindi ? 'कुल स्वास्थ्य' : 'Overall Health'}
                </div>
                <Progress value={healthMetrics.overallHealth} className="mt-2" />
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getHealthColor(healthMetrics.soilHealth)}`}>
                  {healthMetrics.soilHealth}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {isPunjabi ? 'ਮਿੱਟੀ ਸਿਹਤ' : isHindi ? 'मिट्टी स्वास्थ्य' : 'Soil Health'}
                </div>
                <Progress value={healthMetrics.soilHealth} className="mt-2" />
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getHealthColor(healthMetrics.cropHealth)}`}>
                  {healthMetrics.cropHealth}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {isPunjabi ? 'ਫਸਲ ਸਿਹਤ' : isHindi ? 'फसल स्वास्थ्य' : 'Crop Health'}
                </div>
                <Progress value={healthMetrics.cropHealth} className="mt-2" />
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getHealthColor(100 - healthMetrics.pestRisk)}`}>
                  {100 - healthMetrics.pestRisk}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {isPunjabi ? 'ਕੀਟ ਸੁਰੱਖਿਆ' : isHindi ? 'कीट सुरक्षा' : 'Pest Protection'}
                </div>
                <Progress value={100 - healthMetrics.pestRisk} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="diseases" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="diseases" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {isPunjabi ? 'ਰੋਗ' : isHindi ? 'रोग' : 'Diseases'}
          </TabsTrigger>
          <TabsTrigger value="pests" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {isPunjabi ? 'ਕੀਟ' : isHindi ? 'कीट' : 'Pests'}
          </TabsTrigger>
          <TabsTrigger value="nutrients" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            {isPunjabi ? 'ਪੋਸ਼ਣ' : isHindi ? 'पोषण' : 'Nutrients'}
          </TabsTrigger>
          <TabsTrigger value="environment" className="flex items-center gap-2">
            <Thermometer className="h-4 w-4" />
            {isPunjabi ? 'ਮਾਹੌਲ' : isHindi ? 'माहौल' : 'Environment'}
          </TabsTrigger>
        </TabsList>

        {/* Disease Analysis */}
        <TabsContent value="diseases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                {isPunjabi ? 'ਰੋਗ ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'रोग विश्लेषण' : 'Disease Analysis'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {diseaseAlerts.length > 0 ? (
                <div className="space-y-4">
                  {diseaseAlerts.map((disease) => (
                    <Alert key={disease.id} className={getSeverityColor(disease.severity)}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{disease.name}</h4>
                            <Badge variant="outline">{disease.severity.toUpperCase()}</Badge>
                          </div>
                          <p className="text-sm">
                            {isPunjabi 
                              ? `${disease.affectedArea}% ਖੇਤਰ ਪ੍ਰਭਾਵਿਤ, ${disease.confidence}% ਭਰੋਸਾ`
                              : isHindi 
                              ? `${disease.affectedArea}% क्षेत्र प्रभावित, ${disease.confidence}% भरोसा`
                              : `${disease.affectedArea}% area affected, ${disease.confidence}% confidence`
                            }
                          </p>
                          <div className="text-sm">
                            <strong>{isPunjabi ? 'ਲੱਛਣ:' : isHindi ? 'लक्षण:' : 'Symptoms:'}</strong>
                            <ul className="list-disc list-inside ml-2">
                              {disease.symptoms.map((symptom, index) => (
                                <li key={index}>{symptom}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="text-sm">
                            <strong>{isPunjabi ? 'ਇਲਾਜ:' : isHindi ? 'इलाज:' : 'Treatment:'}</strong>
                            <ul className="list-disc list-inside ml-2">
                              {disease.treatment.map((treatment, index) => (
                                <li key={index}>{treatment}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isPunjabi ? 'ਕੋਈ ਰੋਗ ਨਹੀਂ ਲੱਭੇ ਗਏ' : isHindi ? 'कोई रोग नहीं मिले' : 'No diseases detected'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pest Analysis */}
        <TabsContent value="pests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                {isPunjabi ? 'ਕੀਟ ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'कीट विश्लेषण' : 'Pest Analysis'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pestAlerts.length > 0 ? (
                <div className="space-y-4">
                  {pestAlerts.map((pest) => (
                    <Alert key={pest.id} className={getSeverityColor(pest.severity)}>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{pest.name}</h4>
                            <Badge variant="outline">{pest.severity.toUpperCase()}</Badge>
                          </div>
                          <p className="text-sm">
                            {isPunjabi 
                              ? `${pest.affectedArea}% ਖੇਤਰ ਪ੍ਰਭਾਵਿਤ, ${pest.confidence}% ਭਰੋਸਾ`
                              : isHindi 
                              ? `${pest.affectedArea}% क्षेत्र प्रभावित, ${pest.confidence}% भरोसा`
                              : `${pest.affectedArea}% area affected, ${pest.confidence}% confidence`
                            }
                          </p>
                          <div className="text-sm">
                            <strong>{isPunjabi ? 'ਜੀਵਨ ਚੱਕਰ:' : isHindi ? 'जीवन चक्र:' : 'Lifecycle:'}</strong> {pest.lifecycle}
                          </div>
                          <div className="text-sm">
                            <strong>{isPunjabi ? 'ਇਲਾਜ:' : isHindi ? 'इलाज:' : 'Treatment:'}</strong>
                            <ul className="list-disc list-inside ml-2">
                              {pest.treatment.map((treatment, index) => (
                                <li key={index}>{treatment}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isPunjabi ? 'ਕੋਈ ਕੀਟ ਨਹੀਂ ਲੱਭੇ ਗਏ' : isHindi ? 'कोई कीट नहीं मिले' : 'No pests detected'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nutrient Analysis */}
        <TabsContent value="nutrients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-500" />
                {isPunjabi ? 'ਪੋਸ਼ਣ ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'पोषण विश्लेषण' : 'Nutrient Analysis'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nutrientDeficiencies.length > 0 ? (
                <div className="space-y-4">
                  {nutrientDeficiencies.map((deficiency, index) => (
                    <Card key={index} className="border-l-4 border-l-yellow-500">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{deficiency.nutrient}</h4>
                            <Badge variant="outline" className={getSeverityColor(deficiency.urgency === 'high' ? 30 : deficiency.urgency === 'medium' ? 60 : 80)}>
                              {deficiency.urgency.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">{isPunjabi ? 'ਮੌਜੂਦਾ:' : isHindi ? 'मौजूदा:' : 'Current:'}</span>
                              <div className="font-semibold">{deficiency.level}%</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{isPunjabi ? 'ਆਦਰਸ਼:' : isHindi ? 'आदर्श:' : 'Optimal:'}</span>
                              <div className="font-semibold">{deficiency.optimal}%</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{isPunjabi ? 'ਕਮੀ:' : isHindi ? 'कमी:' : 'Deficiency:'}</span>
                              <div className="font-semibold text-red-600">{deficiency.deficiency}%</div>
                            </div>
                          </div>
                          <Progress value={deficiency.level} className="h-2" />
                          <div className="text-sm">
                            <strong>{isPunjabi ? 'ਲੱਛਣ:' : isHindi ? 'लक्षण:' : 'Symptoms:'}</strong>
                            <ul className="list-disc list-inside ml-2">
                              {deficiency.symptoms.map((symptom, idx) => (
                                <li key={idx}>{symptom}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="text-sm">
                            <strong>{isPunjabi ? 'ਇਲਾਜ:' : isHindi ? 'इलाज:' : 'Treatment:'}</strong>
                            <ul className="list-disc list-inside ml-2">
                              {deficiency.treatment.map((treatment, idx) => (
                                <li key={idx}>{treatment}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isPunjabi ? 'ਸਾਰੇ ਪੋਸ਼ਣ ਪੱਧਰ ਠੀਕ ਹਨ' : isHindi ? 'सभी पोषण स्तर ठीक हैं' : 'All nutrient levels are optimal'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Environment Analysis */}
        <TabsContent value="environment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-blue-500" />
                {isPunjabi ? 'ਮਾਹੌਲ ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'माहौल विश्लेषण' : 'Environment Analysis'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Thermometer className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">28°C</div>
                  <div className="text-sm text-muted-foreground">
                    {isPunjabi ? 'ਤਾਪਮਾਨ' : isHindi ? 'तापमान' : 'Temperature'}
                  </div>
                  <Badge variant="outline" className="mt-1">Optimal</Badge>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Droplets className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">65%</div>
                  <div className="text-sm text-muted-foreground">
                    {isPunjabi ? 'ਨਮੀ' : isHindi ? 'नमी' : 'Humidity'}
                  </div>
                  <Badge variant="outline" className="mt-1">Good</Badge>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Wind className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-600">12 km/h</div>
                  <div className="text-sm text-muted-foreground">
                    {isPunjabi ? 'ਹਵਾ' : isHindi ? 'हवा' : 'Wind Speed'}
                  </div>
                  <Badge variant="outline" className="mt-1">Normal</Badge>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Sun className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600">8.5h</div>
                  <div className="text-sm text-muted-foreground">
                    {isPunjabi ? 'ਸੂਰਜੀ ਚਾਨਣ' : isHindi ? 'सूरजी चांदनी' : 'Sunlight'}
                  </div>
                  <Badge variant="outline" className="mt-1">Optimal</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            {isPunjabi ? 'ਸਿਫਾਰਸ਼ਾਂ' : isHindi ? 'सिफारिशें' : 'Recommendations'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>{isPunjabi ? 'ਤੁਰੰਤ ਕਾਰਵਾਈ:' : isHindi ? 'तुरंत कार्यवाही:' : 'Immediate Action:'}</strong>
                {isPunjabi 
                  ? ' ਨਾਈਟ੍ਰੋਜਨ ਖਾਦ ਦੀ ਘਾਟ ਨੂੰ ਪੂਰਾ ਕਰਨ ਲਈ ਯੂਰੀਆ ਲਗਾਓ'
                  : isHindi 
                  ? ' नाइट्रोजन की कमी को पूरा करने के लिए यूरिया लगाएं'
                  : ' Apply urea fertilizer to address nitrogen deficiency'
                }
              </AlertDescription>
            </Alert>
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>{isPunjabi ? 'ਰੋਕਥਾਮ:' : isHindi ? 'रोकथाम:' : 'Prevention:'}</strong>
                {isPunjabi 
                  ? ' ਰੋਗ ਰੋਕਥਾਮ ਲਈ ਨਿਯਮਿਤ ਫੀਲਡ ਮਾਨੀਟਰਿੰਗ ਕਰੋ'
                  : isHindi 
                  ? ' रोग रोकथाम के लिए नियमित फील्ड मॉनिटरिंग करें'
                  : ' Conduct regular field monitoring for disease prevention'
                }
              </AlertDescription>
            </Alert>
            
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription>
                <strong>{isPunjabi ? 'ਵਿਕਾਸ:' : isHindi ? 'विकास:' : 'Development:'}</strong>
                {isPunjabi 
                  ? ' ਫਸਲ ਵਿਕਾਸ ਲਈ ਸੰਤੁਲਿਤ ਪੋਸ਼ਣ ਪ੍ਰਬੰਧਨ ਅਪਣਾਓ'
                  : isHindi 
                  ? ' फसल विकास के लिए संतुलित पोषण प्रबंधन अपनाएं'
                  : ' Adopt balanced nutrition management for crop development'
                }
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnandSaathiHealthAssessment;

