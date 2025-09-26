/**
 * Anand Saathi Vegetation Analysis
 * Advanced satellite-based vegetation analysis with NDVI, MSAVI2, and crop health monitoring
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Leaf, 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Eye, 
  Download, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Map,
  Satellite,
  Layers,
  Target,
  Zap
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { vegetationAnalysisService, VegetationAnalysisOptions } from '@/services/vegetationAnalysisService';

interface VegetationIndex {
  name: string;
  value: number;
  status: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';
  description: string;
  color: string;
}

interface VegetationData {
  ndvi: VegetationIndex;
  msavi2: VegetationIndex;
  evi: VegetationIndex;
  gci: VegetationIndex;
  overallHealth: number;
  analysisDate: string;
  fieldArea: number;
  cropType: string;
  recommendations: string[];
}

const AnandSaathiVegetationAnalysis: React.FC = () => {
  const { t, language, isPunjabi, isHindi } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [vegetationData, setVegetationData] = useState<VegetationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedField, setSelectedField] = useState<string>('');
  const [analysisOptions, setAnalysisOptions] = useState<VegetationAnalysisOptions>({
    fieldCoordinates: [{ lat: 30.9010, lng: 75.8573 }],
    satelliteSource: 'sentinel-2',
    dateRange: { start: '2024-01-01', end: '2024-12-31' },
    cloudCoverThreshold: 20,
    analysisType: 'all'
  });

  // Mock vegetation data
  const mockVegetationData: VegetationData = {
    ndvi: {
      name: 'NDVI',
      value: 0.75,
      status: 'excellent',
      description: isPunjabi ? 'ਬਹੁਤ ਵਧੀਆ ਵਨਸਪਤੀ ਸਿਹਤ' : isHindi ? 'बहुत अच्छी वनस्पति स्वास्थ्य' : 'Excellent vegetation health',
      color: '#22c55e'
    },
    msavi2: {
      name: 'MSAVI2',
      value: 0.68,
      status: 'good',
      description: isPunjabi ? 'ਵਧੀਆ ਮਿੱਟੀ ਦੀ ਸਿਹਤ' : isHindi ? 'अच्छी मिट्टी की सेहत' : 'Good soil health',
      color: '#3b82f6'
    },
    evi: {
      name: 'EVI',
      value: 0.52,
      status: 'moderate',
      description: isPunjabi ? 'ਔਸਤਨ ਵਨਸਪਤੀ ਸਿਹਤ' : isHindi ? 'औसत वनस्पति स्वास्थ्य' : 'Moderate vegetation health',
      color: '#f59e0b'
    },
    gci: {
      name: 'GCI',
      value: 0.45,
      status: 'poor',
      description: isPunjabi ? 'ਘੱਟ ਗ੍ਰੀਨ ਕਵਰ' : isHindi ? 'कम हरा आवरण' : 'Low green cover',
      color: '#ef4444'
    },
    overallHealth: 85,
    analysisDate: new Date().toLocaleDateString(),
    fieldArea: 2.5,
    cropType: isPunjabi ? 'ਚੌਲ' : isHindi ? 'चावल' : 'Rice',
    recommendations: [
      isPunjabi ? 'ਵਧੇਰੇ ਪਾਣੀ ਦੀ ਲੋੜ ਹੈ' : isHindi ? 'अधिक पानी की आवश्यकता' : 'More irrigation needed',
      isPunjabi ? 'ਨਾਈਟ੍ਰੋਜਨ ਖਾਦ ਦੀ ਲੋੜ' : isHindi ? 'नाइट्रोजन उर्वरक की आवश्यकता' : 'Nitrogen fertilizer needed',
      isPunjabi ? 'ਪ੍ਰਾਈਡ ਟ੍ਰੀਟਮੈਂਟ ਲੋੜੀਂਦਾ' : isHindi ? 'कीटनाशक उपचार आवश्यक' : 'Pest treatment required'
    ]
  };

  useEffect(() => {
    loadVegetationData();
  }, [selectedField]);

  const loadVegetationData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setVegetationData(mockVegetationData);
    } catch (error) {
      console.error('Error loading vegetation data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Real vegetation analysis function
  const performRealAnalysis = async () => {
    try {
      setIsLoading(true);
      
      const analysis = await vegetationAnalysisService.analyzeField(analysisOptions);
      
      // Convert analysis to VegetationData format
      const vegetationData: VegetationData = {
        ndvi: analysis.vegetationIndices.find(idx => idx.name === 'NDVI') || mockVegetationData.ndvi,
        msavi2: analysis.vegetationIndices.find(idx => idx.name === 'MSAVI2') || mockVegetationData.msavi2,
        evi: analysis.vegetationIndices.find(idx => idx.name === 'EVI') || mockVegetationData.evi,
        gci: analysis.vegetationIndices.find(idx => idx.name === 'GCI') || mockVegetationData.gci,
        overallHealth: analysis.cropHealth,
        analysisDate: analysis.analysisDate,
        fieldArea: analysis.area,
        cropType: isPunjabi ? 'ਚੌਲ' : isHindi ? 'चावल' : 'Rice',
        recommendations: analysis.recommendations
      };
      
      setVegetationData(vegetationData);
      toast.success(isPunjabi ? 'ਵਾਸਤਵਿਕ ਵਿਸ਼ਲੇਸ਼ਣ ਪੂਰਾ ਹੋਇਆ' : isHindi ? 'वास्तविक विश्लेषण पूरा हुआ' : 'Real analysis completed');
    } catch (error) {
      console.error('Error performing real analysis:', error);
      toast.error(isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ ਵਿੱਚ ਅਸਫਲ' : isHindi ? 'विश्लेषण में असफल' : 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />;
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'moderate': return <AlertTriangle className="h-4 w-4" />;
      case 'poor': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-600" />
            {isPunjabi ? 'ਵਨਸਪਤੀ ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'वनस्पति विश्लेषण' : 'Vegetation Analysis'}
          </CardTitle>
          <CardDescription>
            {isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਡੇਟਾ ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਫਸਲ ਦੀ ਸਿਹਤ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ' : 
             isHindi ? 'सैटेलाइट डेटा का उपयोग करके फसल स्वास्थ्य का विश्लेषण' : 
             'Satellite-based crop health analysis using advanced vegetation indices'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">
                {isPunjabi ? 'ਅਵਲੋਕਨ' : isHindi ? 'अवलोकन' : 'Overview'}
              </TabsTrigger>
              <TabsTrigger value="indices">
                {isPunjabi ? 'ਇੰਡੈਕਸ' : isHindi ? 'इंडेक्स' : 'Indices'}
              </TabsTrigger>
              <TabsTrigger value="analysis">
                {isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'विश्लेषण' : 'Analysis'}
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
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">
                    {isPunjabi ? 'ਵਨਸਪਤੀ ਡੇਟਾ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...' : 
                     isHindi ? 'वनस्पति डेटा लोड हो रहा है...' : 
                     'Loading vegetation data...'}
                  </span>
                </div>
              ) : vegetationData ? (
                <div className="space-y-6">
                  {/* Real Analysis Button */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Satellite className="h-5 w-5 text-blue-600" />
                        {isPunjabi ? 'ਵਾਸਤਵਿਕ ਸੈਟੇਲਾਈਟ ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'वास्तविक सैटेलाइट विश्लेषण' : 'Real Satellite Analysis'}
                      </CardTitle>
                      <CardDescription>
                        {isPunjabi ? 'ਅਸਲ ਸੈਟੇਲਾਈਟ ਡੇਟਾ ਦੇ ਆਧਾਰ \'ਤੇ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ' : isHindi ? 'असल सैटेलाइट डेटा के आधार पर विश्लेषण करें' : 'Analyze using real satellite data'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={performRealAnalysis}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Satellite className="h-4 w-4 mr-2" />
                        )}
                        {isLoading ? 
                          (isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ...' : isHindi ? 'विश्लेषण हो रहा है...' : 'Analyzing...') :
                          (isPunjabi ? 'ਵਾਸਤਵਿਕ ਵਿਸ਼ਲੇਸ਼ਣ ਸ਼ੁਰੂ ਕਰੋ' : isHindi ? 'वास्तविक विश्लेषण शुरू करें' : 'Start Real Analysis')
                        }
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Overall Health Score */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-green-600" />
                        {isPunjabi ? 'ਕੁੱਲ ਸਿਹਤ ਸਕੋਰ' : isHindi ? 'कुल स्वास्थ्य स्कोर' : 'Overall Health Score'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="text-4xl font-bold text-green-600">
                          {vegetationData.overallHealth}%
                        </div>
                        <div className="flex-1">
                          <Progress value={vegetationData.overallHealth} className="h-3" />
                          <p className="text-sm text-muted-foreground mt-2">
                            {isPunjabi ? 'ਫਸਲ ਦੀ ਸਿਹਤ ਬਹੁਤ ਵਧੀਆ ਹੈ' : 
                             isHindi ? 'फसल की सेहत बहुत अच्छी है' : 
                             'Crop health is excellent'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Field Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Map className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold">
                            {isPunjabi ? 'ਖੇਤ ਦਾ ਖੇਤਰਫਲ' : isHindi ? 'खेत का क्षेत्रफल' : 'Field Area'}
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                          {vegetationData.fieldArea} acres
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Leaf className="h-4 w-4 text-green-600" />
                          <span className="font-semibold">
                            {isPunjabi ? 'ਫਸਲ ਦੀ ਕਿਸਮ' : isHindi ? 'फसल की किस्म' : 'Crop Type'}
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                          {vegetationData.cropType}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Satellite className="h-4 w-4 text-purple-600" />
                          <span className="font-semibold">
                            {isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ ਦੀ ਤਾਰੀਖ' : isHindi ? 'विश्लेषण की तारीख' : 'Analysis Date'}
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">
                          {vegetationData.analysisDate}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button onClick={loadVegetationData} disabled={isLoading}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {isPunjabi ? 'ਤਾਜ਼ਾ ਕਰੋ' : isHindi ? 'ताज़ा करें' : 'Refresh'}
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      {isPunjabi ? 'ਰਿਪੋਰਟ ਡਾਊਨਲੋਡ' : isHindi ? 'रिपोर्ट डाउनलोड' : 'Download Report'}
                    </Button>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {isPunjabi ? 'ਵਨਸਪਤੀ ਡੇਟਾ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕਿਆ' : 
                     isHindi ? 'वनस्पति डेटा लोड नहीं हो सका' : 
                     'Failed to load vegetation data'}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Vegetation Indices Tab */}
            <TabsContent value="indices" className="space-y-6">
              {vegetationData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(vegetationData).filter(([key]) => 
                    ['ndvi', 'msavi2', 'evi', 'gci'].includes(key)
                  ).map(([key, index]) => (
                    <Card key={key}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {getStatusIcon(index.status)}
                          <span>{index.name}</span>
                          <Badge className={getStatusColor(index.status)}>
                            {index.status}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold" style={{ color: index.color }}>
                              {index.value.toFixed(2)}
                            </span>
                            <div className="w-24">
                              <Progress value={index.value * 100} className="h-2" />
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {index.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    {isPunjabi ? 'ਵਿਸਤ੍ਰਿਤ ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'विस्तृत विश्लेषण' : 'Detailed Analysis'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">
                          {isPunjabi ? 'NDVI ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'NDVI विश्लेषण' : 'NDVI Analysis'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {isPunjabi ? 'ਵਨਸਪਤੀ ਦੀ ਘਣਤਾ ਅਤੇ ਸਿਹਤ ਦਾ ਸੂਚਕ' : 
                           isHindi ? 'वनस्पति घनत्व और स्वास्थ्य का सूचक' : 
                           'Indicator of vegetation density and health'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">
                          {isPunjabi ? 'MSAVI2 ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'MSAVI2 विश्लेषण' : 'MSAVI2 Analysis'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {isPunjabi ? 'ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਅਤੇ ਵਨਸਪਤੀ ਦਾ ਸੂਚਕ' : 
                           isHindi ? 'मिट्टी की सेहत और वनस्पति का सूचक' : 
                           'Indicator of soil health and vegetation'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    {isPunjabi ? 'ਸਿਫਾਰਸ਼ਾਂ' : isHindi ? 'सिफारिशें' : 'Recommendations'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vegetationData?.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                        <Zap className="h-5 w-5 text-orange-600 mt-0.5" />
                        <p className="text-sm">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    {isPunjabi ? 'ਇਤਿਹਾਸਕ ਡੇਟਾ' : isHindi ? 'ऐतिहासिक डेटा' : 'Historical Data'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {isPunjabi ? 'ਇਤਿਹਾਸਕ ਡੇਟਾ ਜਲਦੀ ਉਪਲਬਧ ਹੋਵੇਗਾ' : 
                       isHindi ? 'ऐतिहासिक डेटा जल्दी उपलब्ध होगा' : 
                       'Historical data will be available soon'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnandSaathiVegetationAnalysis;
