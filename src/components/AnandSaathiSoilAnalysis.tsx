/**
 * Anand Saathi Soil Analysis Component
 * Comprehensive soil testing, analysis, and recommendations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TestTube, 
  Droplets, 
  Thermometer, 
  Leaf, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
  Upload,
  MapPin,
  Calendar,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { anandSaathiBackend, FieldData } from '@/lib/anandSaathiBackend';
import { toast } from 'sonner';

interface SoilTestResult {
  id: string;
  fieldId: string;
  testDate: string;
  ph: number;
  organicMatter: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  calcium: number;
  magnesium: number;
  sulfur: number;
  micronutrients: {
    iron: number;
    manganese: number;
    zinc: number;
    copper: number;
    boron: number;
    molybdenum: number;
  };
  texture: string;
  moisture: number;
  temperature: number;
  recommendations: string[];
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

interface SoilAnalysisProps {
  fieldData?: FieldData;
  onAnalysisComplete?: (result: SoilTestResult) => void;
}

export const AnandSaathiSoilAnalysis: React.FC<SoilAnalysisProps> = ({
  fieldData,
  onAnalysisComplete
}) => {
  const { t, language, isPunjabi, isHindi } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [soilTests, setSoilTests] = useState<SoilTestResult[]>([]);
  const [selectedTest, setSelectedTest] = useState<SoilTestResult | null>(null);

  // Mock soil test data
  const mockSoilTests: SoilTestResult[] = [
    {
      id: '1',
      fieldId: '1',
      testDate: '2024-09-15',
      ph: 6.8,
      organicMatter: 3.2,
      nitrogen: 45,
      phosphorus: 25,
      potassium: 180,
      calcium: 2500,
      magnesium: 450,
      sulfur: 35,
      micronutrients: {
        iron: 12,
        manganese: 8,
        zinc: 2.5,
        copper: 1.8,
        boron: 0.8,
        molybdenum: 0.3
      },
      texture: 'Loamy',
      moisture: 65,
      temperature: 22,
      recommendations: [
        'Add 50kg/acre of NPK 20:20:20 fertilizer',
        'Apply 2 tons/acre of organic compost',
        'Maintain pH between 6.5-7.0',
        'Monitor soil moisture levels'
      ],
      status: 'good'
    }
  ];

  useEffect(() => {
    loadSoilTests();
  }, []);

  const loadSoilTests = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from the backend
      setSoilTests(mockSoilTests);
      if (mockSoilTests.length > 0) {
        setSelectedTest(mockSoilTests[0]);
      }
    } catch (error) {
      console.error('Error loading soil tests:', error);
      toast.error(isPunjabi ? 'ਮਿੱਟੀ ਟੈਸਟ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ' : isHindi ? 'मिट्टी परीक्षण लोड करने में त्रुटि' : 'Error loading soil tests');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSoilAnalysis = async () => {
    if (!fieldData) {
      toast.error(isPunjabi ? 'ਖੇਤ ਡੇਟਾ ਚੁਣੋ' : isHindi ? 'खेत डेटा चुनें' : 'Select field data');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate soil analysis generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newTest: SoilTestResult = {
        id: Date.now().toString(),
        fieldId: fieldData.id.toString(),
        testDate: new Date().toISOString().split('T')[0],
        ph: 6.5 + Math.random() * 1.5,
        organicMatter: 2.5 + Math.random() * 2,
        nitrogen: 30 + Math.random() * 40,
        phosphorus: 15 + Math.random() * 30,
        potassium: 120 + Math.random() * 100,
        calcium: 2000 + Math.random() * 1000,
        magnesium: 300 + Math.random() * 300,
        sulfur: 20 + Math.random() * 30,
        micronutrients: {
          iron: 8 + Math.random() * 8,
          manganese: 5 + Math.random() * 6,
          zinc: 1 + Math.random() * 3,
          copper: 1 + Math.random() * 2,
          boron: 0.5 + Math.random() * 1,
          molybdenum: 0.2 + Math.random() * 0.4
        },
        texture: ['Sandy', 'Loamy', 'Clayey'][Math.floor(Math.random() * 3)],
        moisture: 50 + Math.random() * 30,
        temperature: 18 + Math.random() * 10,
        recommendations: [
          'Apply balanced NPK fertilizer',
          'Add organic matter to improve soil structure',
          'Monitor pH levels regularly',
          'Implement crop rotation'
        ],
        status: 'good'
      };

      setSoilTests(prev => [newTest, ...prev]);
      setSelectedTest(newTest);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(newTest);
      }

      toast.success(isPunjabi ? 'ਮਿੱਟੀ ਵਿਸ਼ਲੇਸ਼ਣ ਪੂਰਾ ਹੋਇਆ' : isHindi ? 'मिट्टी विश्लेषण पूरा हुआ' : 'Soil analysis completed');
    } catch (error) {
      console.error('Error generating soil analysis:', error);
      toast.error(isPunjabi ? 'ਮਿੱਟੀ ਵਿਸ਼ਲੇਸ਼ਣ ਵਿੱਚ ਗਲਤੀ' : isHindi ? 'मिट्टी विश्लेषण में त्रुटि' : 'Error in soil analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />;
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'fair': return <AlertTriangle className="h-4 w-4" />;
      case 'poor': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TestTube className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isPunjabi ? 'ਮਿੱਟੀ ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'मिट्टी विश्लेषण' : 'Soil Analysis'}
              </h1>
              <p className="text-gray-600">
                {isPunjabi ? 'ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਅਤੇ ਫਰਟੀਲਾਈਜ਼ਰ ਸਿਫਾਰਸ਼ਾਂ' : isHindi ? 'मिट्टी की सेहत और उर्वरक सिफारिशें' : 'Soil health and fertilizer recommendations'}
              </p>
            </div>
          </div>

          {/* Field Info */}
          {fieldData && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <MapPin className="h-5 w-5 text-green-600" />
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
            onClick={generateSoilAnalysis}
            disabled={isLoading || !fieldData}
            className="bg-green-600 hover:bg-green-700"
          >
            <TestTube className="h-4 w-4 mr-2" />
            {isLoading 
              ? (isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਿਹਾ ਹੈ...' : isHindi ? 'विश्लेषण कर रहा है...' : 'Analyzing...')
              : (isPunjabi ? 'ਨਵਾਂ ਮਿੱਟੀ ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'नया मिट्टी विश्लेषण' : 'New Soil Analysis')
            }
          </Button>
          
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            {isPunjabi ? 'ਟੈਸਟ ਰਿਪੋਰਟ ਅਪਲੋਡ ਕਰੋ' : isHindi ? 'टेस्ट रिपोर्ट अपलोड करें' : 'Upload Test Report'}
          </Button>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {isPunjabi ? 'ਰਿਪੋਰਟ ਡਾਊਨਲੋਡ ਕਰੋ' : isHindi ? 'रिपोर्ट डाउनलोड करें' : 'Download Report'}
          </Button>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              {isPunjabi ? 'ਅਵਲੋਕਨ' : isHindi ? 'अवलोकन' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="nutrients">
              {isPunjabi ? 'ਪੋਸ਼ਕ ਤੱਤ' : isHindi ? 'पोषक तत्व' : 'Nutrients'}
            </TabsTrigger>
            <TabsTrigger value="physical">
              {isPunjabi ? 'ਭੌਤਿਕ' : isHindi ? 'भौतिक' : 'Physical'}
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              {isPunjabi ? 'ਸਿਫਾਰਸ਼ਾਂ' : isHindi ? 'सिफारिशें' : 'Recommendations'}
            </TabsTrigger>
            <TabsTrigger value="history">
              {isPunjabi ? 'ਇਤਿਹਾਸ' : isHindi ? 'इतिहास' : 'History'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {selectedTest ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Soil Health Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      {isPunjabi ? 'ਮਿੱਟੀ ਸਿਹਤ ਸਕੋਰ' : isHindi ? 'मिट्टी स्वास्थ्य स्कोर' : 'Soil Health Score'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">85</div>
                      <Badge className={getStatusColor(selectedTest.status)}>
                        {getStatusIcon(selectedTest.status)}
                        <span className="ml-1 capitalize">{selectedTest.status}</span>
                      </Badge>
                      <p className="text-sm text-gray-600 mt-2">
                        {isPunjabi ? 'ਅਧਿਕਤਮ 100 ਤੋਂ' : isHindi ? 'अधिकतम 100 से' : 'Out of 100'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      {isPunjabi ? 'ਮੁੱਖ ਮੈਟ੍ਰਿਕਸ' : isHindi ? 'मुख्य मैट्रिक्स' : 'Key Metrics'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{isPunjabi ? 'pH ਪੱਧਰ' : isHindi ? 'pH स्तर' : 'pH Level'}</span>
                      <Badge variant="outline">{selectedTest.ph.toFixed(1)}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{isPunjabi ? 'ਜੈਵਿਕ ਪਦਾਰਥ' : isHindi ? 'जैविक पदार्थ' : 'Organic Matter'}</span>
                      <Badge variant="outline">{selectedTest.organicMatter.toFixed(1)}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{isPunjabi ? 'ਨਮੀ' : isHindi ? 'नमी' : 'Moisture'}</span>
                      <Badge variant="outline">{selectedTest.moisture.toFixed(0)}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{isPunjabi ? 'ਤਾਪਮਾਨ' : isHindi ? 'तापमान' : 'Temperature'}</span>
                      <Badge variant="outline">{selectedTest.temperature.toFixed(0)}°C</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      {isPunjabi ? 'ਤੇਜ਼ ਕਾਰਵਾਈਆਂ' : isHindi ? 'त्वरित कार्य' : 'Quick Actions'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button size="sm" className="w-full" variant="outline">
                      {isPunjabi ? 'ਫਰਟੀਲਾਈਜ਼ਰ ਕੈਲਕੁਲੇਟਰ' : isHindi ? 'उर्वरक कैलकुलेटर' : 'Fertilizer Calculator'}
                    </Button>
                    <Button size="sm" className="w-full" variant="outline">
                      {isPunjabi ? 'ਪੌਦੇ ਦੀ ਸਿਹਤ ਚੈਕ' : isHindi ? 'पौधे की सेहत चेक' : 'Plant Health Check'}
                    </Button>
                    <Button size="sm" className="w-full" variant="outline">
                      {isPunjabi ? 'ਮਿੱਟੀ ਸੁਧਾਰ ਯੋਜਨਾ' : isHindi ? 'मिट्टी सुधार योजना' : 'Soil Improvement Plan'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <TestTube className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isPunjabi ? 'ਕੋਈ ਮਿੱਟੀ ਟੈਸਟ ਨਹੀਂ ਮਿਲਿਆ' : isHindi ? 'कोई मिट्टी टेस्ट नहीं मिला' : 'No Soil Tests Found'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {isPunjabi ? 'ਪਹਿਲਾਂ ਮਿੱਟੀ ਵਿਸ਼ਲੇਸ਼ਣ ਸ਼ੁਰੂ ਕਰੋ' : isHindi ? 'पहले मिट्टी विश्लेषण शुरू करें' : 'Start with a soil analysis'}
                  </p>
                  <Button onClick={generateSoilAnalysis} disabled={!fieldData}>
                    <TestTube className="h-4 w-4 mr-2" />
                    {isPunjabi ? 'ਮਿੱਟੀ ਵਿਸ਼ਲੇਸ਼ਣ ਸ਼ੁਰੂ ਕਰੋ' : isHindi ? 'मिट्टी विश्लेषण शुरू करें' : 'Start Soil Analysis'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Nutrients Tab */}
          <TabsContent value="nutrients" className="space-y-6">
            {selectedTest && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Macronutrients */}
                <Card>
                  <CardHeader>
                    <CardTitle>{isPunjabi ? 'ਮੈਕਰੋਨਿਊਟਰੀਐਂਟਸ' : isHindi ? 'मैक्रोन्यूट्रिएंट्स' : 'Macronutrients'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{isPunjabi ? 'ਨਾਈਟ੍ਰੋਜਨ (N)' : isHindi ? 'नाइट्रोजन (N)' : 'Nitrogen (N)'}</span>
                        <Badge variant="outline">{selectedTest.nitrogen} ppm</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{isPunjabi ? 'ਫਾਸਫੋਰਸ (P)' : isHindi ? 'फॉस्फोरस (P)' : 'Phosphorus (P)'}</span>
                        <Badge variant="outline">{selectedTest.phosphorus} ppm</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{isPunjabi ? 'ਪੋਟਾਸ਼ੀਅਮ (K)' : isHindi ? 'पोटैशियम (K)' : 'Potassium (K)'}</span>
                        <Badge variant="outline">{selectedTest.potassium} ppm</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{isPunjabi ? 'ਕੈਲਸ਼ੀਅਮ (Ca)' : isHindi ? 'कैल्शियम (Ca)' : 'Calcium (Ca)'}</span>
                        <Badge variant="outline">{selectedTest.calcium} ppm</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{isPunjabi ? 'ਮੈਗਨੀਸ਼ੀਅਮ (Mg)' : isHindi ? 'मैग्नीशियम (Mg)' : 'Magnesium (Mg)'}</span>
                        <Badge variant="outline">{selectedTest.magnesium} ppm</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{isPunjabi ? 'ਸਲਫਰ (S)' : isHindi ? 'सल्फर (S)' : 'Sulfur (S)'}</span>
                        <Badge variant="outline">{selectedTest.sulfur} ppm</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Micronutrients */}
                <Card>
                  <CardHeader>
                    <CardTitle>{isPunjabi ? 'ਮਾਈਕ੍ਰੋਨਿਊਟਰੀਐਂਟਸ' : isHindi ? 'माइक्रोन्यूट्रिएंट्स' : 'Micronutrients'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{isPunjabi ? 'ਆਇਰਨ (Fe)' : isHindi ? 'आयरन (Fe)' : 'Iron (Fe)'}</span>
                        <Badge variant="outline">{selectedTest.micronutrients.iron} ppm</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{isPunjabi ? 'ਮੈਂਗਨੀਜ਼ (Mn)' : isHindi ? 'मैंगनीज (Mn)' : 'Manganese (Mn)'}</span>
                        <Badge variant="outline">{selectedTest.micronutrients.manganese} ppm</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{isPunjabi ? 'ਜ਼ਿੰਕ (Zn)' : isHindi ? 'जिंक (Zn)' : 'Zinc (Zn)'}</span>
                        <Badge variant="outline">{selectedTest.micronutrients.zinc} ppm</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{isPunjabi ? 'ਕਾਪਰ (Cu)' : isHindi ? 'कॉपर (Cu)' : 'Copper (Cu)'}</span>
                        <Badge variant="outline">{selectedTest.micronutrients.copper} ppm</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{isPunjabi ? 'ਬੋਰੋਨ (B)' : isHindi ? 'बोरॉन (B)' : 'Boron (B)'}</span>
                        <Badge variant="outline">{selectedTest.micronutrients.boron} ppm</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{isPunjabi ? 'ਮੋਲੀਬਡੇਨਮ (Mo)' : isHindi ? 'मोलिब्डेनम (Mo)' : 'Molybdenum (Mo)'}</span>
                        <Badge variant="outline">{selectedTest.micronutrients.molybdenum} ppm</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Physical Properties Tab */}
          <TabsContent value="physical" className="space-y-6">
            {selectedTest && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{isPunjabi ? 'ਭੌਤਿਕ ਗੁਣ' : isHindi ? 'भौतिक गुण' : 'Physical Properties'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{isPunjabi ? 'ਬਣਾਵਟ' : isHindi ? 'बनावट' : 'Texture'}</span>
                        <Badge variant="outline">{selectedTest.texture}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{isPunjabi ? 'ਨਮੀ ਪੱਧਰ' : isHindi ? 'नमी स्तर' : 'Moisture Level'}</span>
                        <Badge variant="outline">{selectedTest.moisture.toFixed(0)}%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{isPunjabi ? 'ਤਾਪਮਾਨ' : isHindi ? 'तापमान' : 'Temperature'}</span>
                        <Badge variant="outline">{selectedTest.temperature.toFixed(0)}°C</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{isPunjabi ? 'pH ਪੱਧਰ' : isHindi ? 'pH स्तर' : 'pH Level'}</span>
                        <Badge variant="outline">{selectedTest.ph.toFixed(1)}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{isPunjabi ? 'ਮਿੱਟੀ ਸਿਹਤ ਸੂਚਕ' : isHindi ? 'मिट्टी स्वास्थ्य सूचक' : 'Soil Health Indicators'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{isPunjabi ? 'ਜੈਵਿਕ ਪਦਾਰਥ: ਚੰਗਾ' : isHindi ? 'जैविक पदार्थ: अच्छा' : 'Organic Matter: Good'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">{isPunjabi ? 'pH ਪੱਧਰ: ਉਚਿਤ' : isHindi ? 'pH स्तर: उचित' : 'pH Level: Optimal'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">{isPunjabi ? 'ਨਮੀ: ਮੱਧਮ' : isHindi ? 'नमी: मध्यम' : 'Moisture: Moderate'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{isPunjabi ? 'ਬਣਾਵਟ: ਚੰਗੀ' : isHindi ? 'बनावट: अच्छी' : 'Texture: Good'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            {selectedTest && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-600" />
                      {isPunjabi ? 'ਮਿੱਟੀ ਸੁਧਾਰ ਸਿਫਾਰਸ਼ਾਂ' : isHindi ? 'मिट्टी सुधार सिफारिशें' : 'Soil Improvement Recommendations'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedTest.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{isPunjabi ? 'ਫਰਟੀਲਾਈਜ਼ਰ ਸਿਫਾਰਸ਼ਾਂ' : isHindi ? 'उर्वरक सिफारिशें' : 'Fertilizer Recommendations'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-1">NPK 20:20:20</h4>
                        <p className="text-sm text-blue-700">50kg per acre</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-1">Organic Compost</h4>
                        <p className="text-sm text-green-700">2 tons per acre</p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <h4 className="font-medium text-yellow-900 mb-1">Lime (if needed)</h4>
                        <p className="text-sm text-yellow-700">500kg per acre</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{isPunjabi ? 'ਕਾਰਵਾਈ ਯੋਜਨਾ' : isHindi ? 'कार्य योजना' : 'Action Plan'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{isPunjabi ? 'ਹਫ਼ਤੇ 1-2: ਮਿੱਟੀ ਟੈਸਟਿੰਗ' : isHindi ? 'सप्ताह 1-2: मिट्टी परीक्षण' : 'Week 1-2: Soil Testing'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{isPunjabi ? 'ਹਫ਼ਤੇ 3-4: ਫਰਟੀਲਾਈਜ਼ਰ ਲਗਾਉਣਾ' : isHindi ? 'सप्ताह 3-4: उर्वरक लगाना' : 'Week 3-4: Fertilizer Application'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">{isPunjabi ? 'ਹਫ਼ਤੇ 5-6: ਨਿਗਰਾਨੀ' : isHindi ? 'सप्ताह 5-6: निगरानी' : 'Week 5-6: Monitoring'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isPunjabi ? 'ਮਿੱਟੀ ਟੈਸਟ ਇਤਿਹਾਸ' : isHindi ? 'मिट्टी टेस्ट इतिहास' : 'Soil Test History'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {soilTests.map((test) => (
                    <div 
                      key={test.id} 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTest?.id === test.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTest(test)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{test.fieldId}</h4>
                          <p className="text-sm text-gray-600">{test.testDate}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(test.status)}>
                            {getStatusIcon(test.status)}
                            <span className="ml-1 capitalize">{test.status}</span>
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">pH: {test.ph.toFixed(1)}</p>
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

export default AnandSaathiSoilAnalysis;
