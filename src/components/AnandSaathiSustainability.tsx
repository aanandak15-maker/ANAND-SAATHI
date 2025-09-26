/**
 * Anand Saathi Sustainability Component
 * Environmental impact tracking and sustainability metrics
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Leaf, 
  Droplets, 
  Sun, 
  Wind, 
  Target, 
  CheckCircle,
  AlertTriangle,
  Info,
  MapPin,
  BarChart3,
  Calendar,
  Zap,
  Activity,
  FileText,
  Globe,
  TreePine,
  Recycle,
  Thermometer,
  Gauge
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { anandSaathiBackend, FieldData } from '@/lib/anandSaathiBackend';
import { toast } from 'sonner';

interface SustainabilityMetric {
  id: string;
  fieldId: string;
  metric: string;
  value: number;
  unit: string;
  target: number;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  impact: 'positive' | 'negative' | 'neutral';
  category: 'water' | 'soil' | 'air' | 'biodiversity' | 'energy' | 'waste';
  timestamp: string;
  description: string;
}

interface CarbonFootprint {
  id: string;
  fieldId: string;
  activity: string;
  emissions: number;
  unit: string;
  category: 'fuel' | 'fertilizer' | 'pesticide' | 'machinery' | 'transport';
  date: string;
  reduction: number;
}

interface WaterUsage {
  id: string;
  fieldId: string;
  source: string;
  amount: number;
  unit: string;
  efficiency: number;
  date: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface BiodiversityIndex {
  id: string;
  fieldId: string;
  species: string;
  count: number;
  category: 'plants' | 'animals' | 'insects' | 'microorganisms';
  date: string;
  health: 'excellent' | 'good' | 'fair' | 'poor';
}

interface SustainabilityProps {
  fieldData?: FieldData;
  onMetricUpdated?: (metric: SustainabilityMetric) => void;
}

export const AnandSaathiSustainability: React.FC<SustainabilityProps> = ({
  fieldData,
  onMetricUpdated
}) => {
  const { t, language, isPunjabi, isHindi } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [sustainabilityMetrics, setSustainabilityMetrics] = useState<SustainabilityMetric[]>([]);
  const [carbonFootprint, setCarbonFootprint] = useState<CarbonFootprint[]>([]);
  const [waterUsage, setWaterUsage] = useState<WaterUsage[]>([]);
  const [biodiversityIndex, setBiodiversityIndex] = useState<BiodiversityIndex[]>([]);

  // Form state
  const [metricForm, setMetricForm] = useState({
    metric: '',
    value: '',
    unit: '',
    category: '',
    description: ''
  });

  // Sustainability categories
  const sustainabilityCategories = {
    water: { icon: Droplets, color: 'blue', name: isPunjabi ? 'ਪਾਣੀ' : isHindi ? 'पानी' : 'Water' },
    soil: { icon: Leaf, color: 'green', name: isPunjabi ? 'ਮਿੱਟੀ' : isHindi ? 'मिट्टी' : 'Soil' },
    air: { icon: Wind, color: 'gray', name: isPunjabi ? 'ਹਵਾ' : isHindi ? 'हवा' : 'Air' },
    biodiversity: { icon: TreePine, color: 'emerald', name: isPunjabi ? 'ਜੈਵਿਕ ਵਿਭਿੰਨਤਾ' : isHindi ? 'जैविक विविधता' : 'Biodiversity' },
    energy: { icon: Zap, color: 'yellow', name: isPunjabi ? 'ਊਰਜਾ' : isHindi ? 'ऊर्जा' : 'Energy' },
    waste: { icon: Recycle, color: 'orange', name: isPunjabi ? 'ਕਚਰਾ' : isHindi ? 'कचरा' : 'Waste' }
  };

  useEffect(() => {
    loadSustainabilityData();
  }, []);

  const loadSustainabilityData = async () => {
    setIsLoading(true);
    try {
      // Mock sustainability metrics
      const mockMetrics: SustainabilityMetric[] = [
        {
          id: '1',
          fieldId: '1',
          metric: 'Water Use Efficiency',
          value: 85,
          unit: '%',
          target: 90,
          status: 'good',
          impact: 'positive',
          category: 'water',
          timestamp: new Date().toISOString(),
          description: 'Efficient water usage for irrigation'
        },
        {
          id: '2',
          fieldId: '1',
          metric: 'Soil Organic Matter',
          value: 3.2,
          unit: '%',
          target: 4.0,
          status: 'fair',
          impact: 'positive',
          category: 'soil',
          timestamp: new Date().toISOString(),
          description: 'Soil health and organic content'
        },
        {
          id: '3',
          fieldId: '1',
          metric: 'Carbon Sequestration',
          value: 2.5,
          unit: 'tons/acre/year',
          target: 3.0,
          status: 'good',
          impact: 'positive',
          category: 'air',
          timestamp: new Date().toISOString(),
          description: 'Carbon storage in soil and vegetation'
        },
        {
          id: '4',
          fieldId: '1',
          metric: 'Biodiversity Index',
          value: 7.8,
          unit: 'score',
          target: 8.5,
          status: 'good',
          impact: 'positive',
          category: 'biodiversity',
          timestamp: new Date().toISOString(),
          description: 'Species diversity and ecosystem health'
        }
      ];

      // Mock carbon footprint
      const mockCarbonFootprint: CarbonFootprint[] = [
        {
          id: '1',
          fieldId: '1',
          activity: 'Tractor Operations',
          emissions: 45.2,
          unit: 'kg CO2',
          category: 'fuel',
          date: '2024-09-24',
          reduction: 15
        },
        {
          id: '2',
          fieldId: '1',
          activity: 'Fertilizer Application',
          emissions: 23.8,
          unit: 'kg CO2',
          category: 'fertilizer',
          date: '2024-09-24',
          reduction: 8
        }
      ];

      // Mock water usage
      const mockWaterUsage: WaterUsage[] = [
        {
          id: '1',
          fieldId: '1',
          source: 'Groundwater',
          amount: 1200,
          unit: 'liters',
          efficiency: 85,
          date: '2024-09-24',
          quality: 'good'
        },
        {
          id: '2',
          fieldId: '1',
          source: 'Rainwater',
          amount: 800,
          unit: 'liters',
          efficiency: 95,
          date: '2024-09-24',
          quality: 'excellent'
        }
      ];

      // Mock biodiversity index
      const mockBiodiversityIndex: BiodiversityIndex[] = [
        {
          id: '1',
          fieldId: '1',
          species: 'Earthworms',
          count: 45,
          category: 'microorganisms',
          date: '2024-09-24',
          health: 'excellent'
        },
        {
          id: '2',
          fieldId: '1',
          species: 'Birds',
          count: 12,
          category: 'animals',
          date: '2024-09-24',
          health: 'good'
        }
      ];

      setSustainabilityMetrics(mockMetrics);
      setCarbonFootprint(mockCarbonFootprint);
      setWaterUsage(mockWaterUsage);
      setBiodiversityIndex(mockBiodiversityIndex);
    } catch (error) {
      console.error('Error loading sustainability data:', error);
      toast.error(isPunjabi ? 'ਸਸਟੇਨੇਬਿਲਿਟੀ ਡੇਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ' : isHindi ? 'सस्टेनेबिलिटी डेटा लोड करने में त्रुटि' : 'Error loading sustainability data');
    } finally {
      setIsLoading(false);
    }
  };

  const addSustainabilityMetric = async () => {
    if (!metricForm.metric || !metricForm.value || !metricForm.category) {
      toast.error(isPunjabi ? 'ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੇ ਖੇਤ ਭਰੋ' : isHindi ? 'कृपया सभी फील्ड भरें' : 'Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      const value = parseFloat(metricForm.value);
      const target = value * 1.2; // Set target 20% higher
      
      const newMetric: SustainabilityMetric = {
        id: Date.now().toString(),
        fieldId: fieldData?.id.toString() || '1',
        metric: metricForm.metric,
        value: value,
        unit: metricForm.unit,
        target: target,
        status: value >= target * 0.9 ? 'excellent' : value >= target * 0.7 ? 'good' : value >= target * 0.5 ? 'fair' : 'poor',
        impact: 'positive',
        category: metricForm.category as any,
        timestamp: new Date().toISOString(),
        description: metricForm.description
      };

      setSustainabilityMetrics(prev => [newMetric, ...prev]);
      
      if (onMetricUpdated) {
        onMetricUpdated(newMetric);
      }

      // Reset form
      setMetricForm({
        metric: '',
        value: '',
        unit: '',
        category: '',
        description: ''
      });

      toast.success(isPunjabi ? 'ਸਸਟੇਨੇਬਿਲਿਟੀ ਮੈਟ੍ਰਿਕ ਜੋੜਿਆ ਗਿਆ' : isHindi ? 'सस्टेनेबिलिटी मैट्रिक जोड़ा गया' : 'Sustainability metric added');
    } catch (error) {
      console.error('Error adding sustainability metric:', error);
      toast.error(isPunjabi ? 'ਸਸਟੇਨੇਬਿਲਿਟੀ ਮੈਟ੍ਰਿਕ ਜੋੜਨ ਵਿੱਚ ਗਲਤੀ' : isHindi ? 'सस्टेनेबिलिटी मैट्रिक जोड़ने में त्रुटि' : 'Error adding sustainability metric');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setMetricForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = sustainabilityCategories[category as keyof typeof sustainabilityCategories];
    if (cat) {
      const IconComponent = cat.icon;
      return <IconComponent className="h-5 w-5" />;
    }
    return <Activity className="h-5 w-5" />;
  };

  const getCategoryColor = (category: string) => {
    const cat = sustainabilityCategories[category as keyof typeof sustainabilityCategories];
    return cat ? cat.color : 'gray';
  };

  const calculateOverallScore = () => {
    if (sustainabilityMetrics.length === 0) return 0;
    const totalScore = sustainabilityMetrics.reduce((sum, metric) => {
      const score = metric.status === 'excellent' ? 100 : 
                   metric.status === 'good' ? 80 : 
                   metric.status === 'fair' ? 60 : 
                   metric.status === 'poor' ? 40 : 20;
      return sum + score;
    }, 0);
    return Math.round(totalScore / sustainabilityMetrics.length);
  };

  const getOverallStatus = (score: number) => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 40) return 'poor';
    return 'critical';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Leaf className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isPunjabi ? 'ਸਸਟੇਨੇਬਿਲਿਟੀ' : isHindi ? 'सस्टेनेबिलिटी' : 'Sustainability'}
              </h1>
              <p className="text-gray-600">
                {isPunjabi ? 'ਵਾਤਾਵਰਣ ਪ੍ਰਭਾਵ ਟ੍ਰੈਕਿੰਗ ਅਤੇ ਸਸਟੇਨੇਬਿਲਿਟੀ ਮੈਟ੍ਰਿਕਸ' : isHindi ? 'पर्यावरण प्रभाव ट्रैकिंग और सस्टेनेबिलिटी मैट्रिक्स' : 'Environmental impact tracking and sustainability metrics'}
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

        {/* Overall Score */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {isPunjabi ? 'ਕੁੱਲ ਸਸਟੇਨੇਬਿਲਿਟੀ ਸਕੋਰ' : isHindi ? 'कुल सस्टेनेबिलिटी स्कोर' : 'Overall Sustainability Score'}
                </h3>
                <p className="text-gray-600">
                  {isPunjabi ? 'ਵਾਤਾਵਰਣ ਪ੍ਰਭਾਵ ਅਤੇ ਸਸਟੇਨੇਬਿਲਿਟੀ ਮੈਟ੍ਰਿਕਸ ਦਾ ਸੰਯੁਕਤ ਮੁਲਾਂਕਣ' : isHindi ? 'पर्यावरण प्रभाव और सस्टेनेबिलिटी मैट्रिक्स का संयुक्त मूल्यांकन' : 'Combined assessment of environmental impact and sustainability metrics'}
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {calculateOverallScore()}
                </div>
                <Badge className={getStatusColor(getOverallStatus(calculateOverallScore()))}>
                  {getOverallStatus(calculateOverallScore()).toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              {isPunjabi ? 'ਅਵਲੋਕਨ' : isHindi ? 'अवलोकन' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="metrics">
              {isPunjabi ? 'ਮੈਟ੍ਰਿਕਸ' : isHindi ? 'मैट्रिक्स' : 'Metrics'}
            </TabsTrigger>
            <TabsTrigger value="carbon">
              {isPunjabi ? 'ਕਾਰਬਨ' : isHindi ? 'कार्बन' : 'Carbon'}
            </TabsTrigger>
            <TabsTrigger value="water">
              {isPunjabi ? 'ਪਾਣੀ' : isHindi ? 'पानी' : 'Water'}
            </TabsTrigger>
            <TabsTrigger value="biodiversity">
              {isPunjabi ? 'ਜੈਵਿਕ ਵਿਭਿੰਨਤਾ' : isHindi ? 'जैविक विविधता' : 'Biodiversity'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(sustainabilityCategories).map(([key, category]) => {
                const IconComponent = category.icon;
                const metrics = sustainabilityMetrics.filter(m => m.category === key);
                const avgScore = metrics.length > 0 ? 
                  metrics.reduce((sum, m) => sum + (m.status === 'excellent' ? 100 : m.status === 'good' ? 80 : m.status === 'fair' ? 60 : m.status === 'poor' ? 40 : 20), 0) / metrics.length : 0;
                
                return (
                  <Card key={key}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconComponent className={`h-5 w-5 text-${category.color}-600`} />
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-2" style={{ color: `var(--${category.color}-600)` }}>
                          {Math.round(avgScore)}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {isPunjabi ? 'ਸਕੋਰ' : isHindi ? 'स्कोर' : 'Score'}
                        </div>
                        <Badge className={getStatusColor(getOverallStatus(avgScore))}>
                          {getOverallStatus(avgScore).toUpperCase()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Metric Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    {isPunjabi ? 'ਨਵਾਂ ਮੈਟ੍ਰਿਕ ਜੋੜੋ' : isHindi ? 'नया मैट्रिक जोड़ें' : 'Add New Metric'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="metric">{isPunjabi ? 'ਮੈਟ੍ਰਿਕ ਨਾਮ' : isHindi ? 'मैट्रिक नाम' : 'Metric Name'}</Label>
                    <Input
                      id="metric"
                      value={metricForm.metric}
                      onChange={(e) => handleInputChange('metric', e.target.value)}
                      placeholder={isPunjabi ? 'ਮੈਟ੍ਰਿਕ ਦਾ ਨਾਮ' : isHindi ? 'मैट्रिक का नाम' : 'Metric name'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="value">{isPunjabi ? 'ਮੁੱਲ' : isHindi ? 'मूल्य' : 'Value'}</Label>
                      <Input
                        id="value"
                        type="number"
                        value={metricForm.value}
                        onChange={(e) => handleInputChange('value', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">{isPunjabi ? 'ਯੂਨਿਟ' : isHindi ? 'यूनिट' : 'Unit'}</Label>
                      <Input
                        id="unit"
                        value={metricForm.unit}
                        onChange={(e) => handleInputChange('unit', e.target.value)}
                        placeholder="%"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">{isPunjabi ? 'ਸ਼੍ਰੇਣੀ' : isHindi ? 'श्रेणी' : 'Category'}</Label>
                    <Select value={metricForm.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={isPunjabi ? 'ਸ਼੍ਰੇਣੀ ਚੁਣੋ' : isHindi ? 'श्रेणी चुनें' : 'Select Category'} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(sustainabilityCategories).map(([key, category]) => (
                          <SelectItem key={key} value={key}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">{isPunjabi ? 'ਵਰਣਨ' : isHindi ? 'वर्णन' : 'Description'}</Label>
                    <Input
                      id="description"
                      value={metricForm.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder={isPunjabi ? 'ਮੈਟ੍ਰਿਕ ਦਾ ਵਰਣਨ' : isHindi ? 'मैट्रिक का वर्णन' : 'Metric description'}
                    />
                  </div>

                  <Button 
                    onClick={addSustainabilityMetric}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    {isLoading 
                      ? (isPunjabi ? 'ਜੋੜ ਰਿਹਾ ਹੈ...' : isHindi ? 'जोड़ रहा है...' : 'Adding...')
                      : (isPunjabi ? 'ਮੈਟ੍ਰਿਕ ਜੋੜੋ' : isHindi ? 'मैट्रिक जोड़ें' : 'Add Metric')
                    }
                  </Button>
                </CardContent>
              </Card>

              {/* Metrics List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    {isPunjabi ? 'ਮੌਜੂਦਾ ਮੈਟ੍ਰਿਕਸ' : isHindi ? 'मौजूदा मैट्रिक्स' : 'Current Metrics'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sustainabilityMetrics.map((metric) => (
                      <div key={metric.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{metric.metric}</h4>
                            <p className="text-sm text-gray-600">{metric.description}</p>
                          </div>
                          <Badge className={getStatusColor(metric.status)}>
                            {metric.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(metric.category)}
                            <span className="text-sm text-gray-600">
                              {sustainabilityCategories[metric.category as keyof typeof sustainabilityCategories]?.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">
                              {metric.value} {metric.unit}
                            </div>
                            <div className="text-sm text-gray-600">
                              {isPunjabi ? 'ਲਕਸ਼:' : isHindi ? 'लक्ष्य:' : 'Target:'} {metric.target} {metric.unit}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Carbon Tab */}
          <TabsContent value="carbon" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-red-600" />
                  {isPunjabi ? 'ਕਾਰਬਨ ਫੁਟਪ੍ਰਿੰਟ' : isHindi ? 'कार्बन फुटप्रिंट' : 'Carbon Footprint'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {carbonFootprint.map((footprint) => (
                    <div key={footprint.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{footprint.activity}</h4>
                          <p className="text-sm text-gray-600">{footprint.date}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-600">
                            {footprint.emissions} {footprint.unit}
                          </div>
                          <div className="text-sm text-green-600">
                            {isPunjabi ? 'ਕਮੀ:' : isHindi ? 'कमी:' : 'Reduction:'} {footprint.reduction}%
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{footprint.category}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Water Tab */}
          <TabsContent value="water" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-600" />
                  {isPunjabi ? 'ਪਾਣੀ ਦੀ ਵਰਤੋਂ' : isHindi ? 'पानी की वर्तो' : 'Water Usage'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {waterUsage.map((usage) => (
                    <div key={usage.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{usage.source}</h4>
                          <p className="text-sm text-gray-600">{usage.date}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">
                            {usage.amount} {usage.unit}
                          </div>
                          <div className="text-sm text-gray-600">
                            {isPunjabi ? 'ਕੁਸ਼ਲਤਾ:' : isHindi ? 'कुशलता:' : 'Efficiency:'} {usage.efficiency}%
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(usage.quality)}>
                          {usage.quality.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Biodiversity Tab */}
          <TabsContent value="biodiversity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5 text-emerald-600" />
                  {isPunjabi ? 'ਜੈਵਿਕ ਵਿਭਿੰਨਤਾ ਸੂਚਕ' : isHindi ? 'जैविक विविधता सूचक' : 'Biodiversity Index'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {biodiversityIndex.map((biodiversity) => (
                    <div key={biodiversity.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{biodiversity.species}</h4>
                          <p className="text-sm text-gray-600">{biodiversity.date}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-emerald-600">
                            {biodiversity.count}
                          </div>
                          <div className="text-sm text-gray-600">
                            {sustainabilityCategories.biodiversity.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{biodiversity.category}</Badge>
                        <Badge className={getStatusColor(biodiversity.health)}>
                          {biodiversity.health.toUpperCase()}
                        </Badge>
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

export default AnandSaathiSustainability;
