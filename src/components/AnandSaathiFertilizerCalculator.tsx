/**
 * Anand Saathi Fertilizer Calculator Component
 * Precise fertilizer recommendations based on soil analysis and crop requirements
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
  Calculator, 
  Leaf, 
  Droplets, 
  Zap, 
  Target, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
  MapPin,
  Calendar,
  BarChart3,
  Package,
  Scale,
  TreePine
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { anandSaathiBackend, FieldData } from '@/lib/anandSaathiBackend';
import { toast } from 'sonner';

interface FertilizerRecommendation {
  id: string;
  fieldId: string;
  cropType: string;
  area: number;
  soilType: string;
  currentNPK: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  targetNPK: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  recommendations: {
    fertilizer: string;
    quantity: number;
    unit: string;
    applicationMethod: string;
    timing: string;
    cost: number;
  }[];
  totalCost: number;
  applicationSchedule: {
    stage: string;
    date: string;
    fertilizer: string;
    quantity: number;
    method: string;
  }[];
  createdAt: string;
}

interface FertilizerCalculatorProps {
  fieldData?: FieldData;
  soilData?: any;
  onRecommendationGenerated?: (recommendation: FertilizerRecommendation) => void;
}

export const AnandSaathiFertilizerCalculator: React.FC<FertilizerCalculatorProps> = ({
  fieldData,
  soilData,
  onRecommendationGenerated
}) => {
  const { t, language, isPunjabi, isHindi } = useTranslation();
  const [activeTab, setActiveTab] = useState('calculator');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<FertilizerRecommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<FertilizerRecommendation | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    cropType: '',
    area: '',
    soilType: '',
    currentNitrogen: '',
    currentPhosphorus: '',
    currentPotassium: '',
    targetYield: '',
    season: '',
    irrigationType: ''
  });

  // Mock fertilizer data
  const fertilizerTypes = [
    { name: 'Urea (46-0-0)', npk: { n: 46, p: 0, k: 0 }, price: 25 },
    { name: 'DAP (18-46-0)', npk: { n: 18, p: 46, k: 0 }, price: 35 },
    { name: 'MOP (0-0-60)', npk: { n: 0, p: 0, k: 60 }, price: 20 },
    { name: 'NPK 20-20-20', npk: { n: 20, p: 20, k: 20 }, price: 40 },
    { name: 'NPK 19-19-19', npk: { n: 19, p: 19, k: 19 }, price: 38 },
    { name: 'SSP (0-16-0)', npk: { n: 0, p: 16, k: 0 }, price: 15 },
    { name: 'Organic Compost', npk: { n: 2, p: 1, k: 1 }, price: 5 }
  ];

  const cropRequirements = {
    'Rice': { n: 120, p: 60, k: 60 },
    'Wheat': { n: 100, p: 50, k: 50 },
    'Maize': { n: 150, p: 70, k: 80 },
    'Cotton': { n: 80, p: 40, k: 40 },
    'Sugarcane': { n: 200, p: 100, k: 120 },
    'Potato': { n: 100, p: 80, k: 120 },
    'Tomato': { n: 120, p: 60, k: 100 }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from the backend
      const mockRecommendations: FertilizerRecommendation[] = [
        {
          id: '1',
          fieldId: '1',
          cropType: 'Rice',
          area: 2.5,
          soilType: 'Loamy',
          currentNPK: { nitrogen: 45, phosphorus: 25, potassium: 180 },
          targetNPK: { nitrogen: 120, phosphorus: 60, potassium: 60 },
          recommendations: [
            {
              fertilizer: 'Urea (46-0-0)',
              quantity: 50,
              unit: 'kg/acre',
              applicationMethod: 'Broadcast',
              timing: 'Basal + Top dressing',
              cost: 1250
            },
            {
              fertilizer: 'DAP (18-46-0)',
              quantity: 30,
              unit: 'kg/acre',
              applicationMethod: 'Band placement',
              timing: 'Basal',
              cost: 1050
            },
            {
              fertilizer: 'MOP (0-0-60)',
              quantity: 20,
              unit: 'kg/acre',
              applicationMethod: 'Broadcast',
              timing: 'Basal',
              cost: 400
            }
          ],
          totalCost: 2700,
          applicationSchedule: [
            {
              stage: 'Basal',
              date: '2024-09-25',
              fertilizer: 'DAP + MOP',
              quantity: 50,
              method: 'Band placement'
            },
            {
              stage: 'Top Dressing 1',
              date: '2024-10-15',
              fertilizer: 'Urea',
              quantity: 25,
              method: 'Broadcast'
            },
            {
              stage: 'Top Dressing 2',
              date: '2024-11-05',
              fertilizer: 'Urea',
              quantity: 25,
              method: 'Broadcast'
            }
          ],
          createdAt: '2024-09-24'
        }
      ];
      setRecommendations(mockRecommendations);
      if (mockRecommendations.length > 0) {
        setSelectedRecommendation(mockRecommendations[0]);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast.error(isPunjabi ? 'ਫਰਟੀਲਾਈਜ਼ਰ ਸਿਫਾਰਸ਼ਾਂ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ' : isHindi ? 'उर्वरक सिफारिशें लोड करने में त्रुटि' : 'Error loading fertilizer recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFertilizer = async () => {
    if (!formData.cropType || !formData.area) {
      toast.error(isPunjabi ? 'ਕਿਰਪਾ ਕਰਕੇ ਫਸਲ ਦੀ ਕਿਸਮ ਅਤੇ ਖੇਤਰ ਭਰੋ' : isHindi ? 'कृपया फसल प्रकार और क्षेत्र भरें' : 'Please fill crop type and area');
      return;
    }

    setIsLoading(true);
    try {
      const area = parseFloat(formData.area);
      const cropReq = cropRequirements[formData.cropType as keyof typeof cropRequirements];
      
      if (!cropReq) {
        toast.error(isPunjabi ? 'ਇਸ ਫਸਲ ਲਈ ਡੇਟਾ ਉਪਲਬਧ ਨਹੀਂ' : isHindi ? 'इस फसल के लिए डेटा उपलब्ध नहीं' : 'Data not available for this crop');
        return;
      }

      // Calculate fertilizer requirements
      const currentN = parseFloat(formData.currentNitrogen) || 0;
      const currentP = parseFloat(formData.currentPhosphorus) || 0;
      const currentK = parseFloat(formData.currentPotassium) || 0;

      const requiredN = Math.max(0, cropReq.n - currentN);
      const requiredP = Math.max(0, cropReq.p - currentP);
      const requiredK = Math.max(0, cropReq.k - currentK);

      const newRecommendation: FertilizerRecommendation = {
        id: Date.now().toString(),
        fieldId: fieldData?.id.toString() || '1',
        cropType: formData.cropType,
        area: area,
        soilType: formData.soilType,
        currentNPK: { nitrogen: currentN, phosphorus: currentP, potassium: currentK },
        targetNPK: { nitrogen: cropReq.n, phosphorus: cropReq.p, potassium: cropReq.k },
        recommendations: [],
        totalCost: 0,
        applicationSchedule: [],
        createdAt: new Date().toISOString()
      };

      // Calculate specific fertilizer recommendations
      let totalCost = 0;
      const recs = [];

      if (requiredN > 0) {
        const ureaNeeded = (requiredN / 46) * area;
        recs.push({
          fertilizer: 'Urea (46-0-0)',
          quantity: Math.ceil(ureaNeeded),
          unit: 'kg/acre',
          applicationMethod: 'Broadcast',
          timing: 'Basal + Top dressing',
          cost: Math.ceil(ureaNeeded) * 25
        });
        totalCost += Math.ceil(ureaNeeded) * 25;
      }

      if (requiredP > 0) {
        const dapNeeded = (requiredP / 46) * area;
        recs.push({
          fertilizer: 'DAP (18-46-0)',
          quantity: Math.ceil(dapNeeded),
          unit: 'kg/acre',
          applicationMethod: 'Band placement',
          timing: 'Basal',
          cost: Math.ceil(dapNeeded) * 35
        });
        totalCost += Math.ceil(dapNeeded) * 35;
      }

      if (requiredK > 0) {
        const mopNeeded = (requiredK / 60) * area;
        recs.push({
          fertilizer: 'MOP (0-0-60)',
          quantity: Math.ceil(mopNeeded),
          unit: 'kg/acre',
          applicationMethod: 'Broadcast',
          timing: 'Basal',
          cost: Math.ceil(mopNeeded) * 20
        });
        totalCost += Math.ceil(mopNeeded) * 20;
      }

      newRecommendation.recommendations = recs;
      newRecommendation.totalCost = totalCost;

      // Generate application schedule
      newRecommendation.applicationSchedule = [
        {
          stage: 'Basal',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          fertilizer: 'DAP + MOP',
          quantity: Math.ceil((requiredP / 46 + requiredK / 60) * area),
          method: 'Band placement'
        },
        {
          stage: 'Top Dressing 1',
          date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          fertilizer: 'Urea',
          quantity: Math.ceil((requiredN / 46) * area * 0.5),
          method: 'Broadcast'
        },
        {
          stage: 'Top Dressing 2',
          date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          fertilizer: 'Urea',
          quantity: Math.ceil((requiredN / 46) * area * 0.5),
          method: 'Broadcast'
        }
      ];

      setRecommendations(prev => [newRecommendation, ...prev]);
      setSelectedRecommendation(newRecommendation);
      
      if (onRecommendationGenerated) {
        onRecommendationGenerated(newRecommendation);
      }

      toast.success(isPunjabi ? 'ਫਰਟੀਲਾਈਜ਼ਰ ਗਣਨਾ ਪੂਰੀ ਹੋਈ' : isHindi ? 'उर्वरक गणना पूरी हुई' : 'Fertilizer calculation completed');
    } catch (error) {
      console.error('Error calculating fertilizer:', error);
      toast.error(isPunjabi ? 'ਫਰਟੀਲਾਈਜ਼ਰ ਗਣਨਾ ਵਿੱਚ ਗਲਤੀ' : isHindi ? 'उर्वरक गणना में त्रुटि' : 'Error in fertilizer calculation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calculator className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isPunjabi ? 'ਫਰਟੀਲਾਈਜ਼ਰ ਕੈਲਕੁਲੇਟਰ' : isHindi ? 'उर्वरक कैलकुलेटर' : 'Fertilizer Calculator'}
              </h1>
              <p className="text-gray-600">
                {isPunjabi ? 'ਮਿੱਟੀ ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਫਸਲ ਲੋੜਾਂ ਦੇ ਆਧਾਰ \'ਤੇ ਸਹੀ ਫਰਟੀਲਾਈਜ਼ਰ ਸਿਫਾਰਸ਼ਾਂ' : isHindi ? 'मिट्टी विश्लेषण और फसल आवश्यकताओं के आधार पर सटीक उर्वरक सिफारिशें' : 'Precise fertilizer recommendations based on soil analysis and crop requirements'}
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

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calculator">
              {isPunjabi ? 'ਕੈਲਕੁਲੇਟਰ' : isHindi ? 'कैलकुलेटर' : 'Calculator'}
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              {isPunjabi ? 'ਸਿਫਾਰਸ਼ਾਂ' : isHindi ? 'सिफारिशें' : 'Recommendations'}
            </TabsTrigger>
            <TabsTrigger value="schedule">
              {isPunjabi ? 'ਸਮਾਂ ਸਾਰਣੀ' : isHindi ? 'समय सारणी' : 'Schedule'}
            </TabsTrigger>
            <TabsTrigger value="history">
              {isPunjabi ? 'ਇਤਿਹਾਸ' : isHindi ? 'इतिहास' : 'History'}
            </TabsTrigger>
          </TabsList>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-600" />
                    {isPunjabi ? 'ਫਸਲ ਅਤੇ ਮਿੱਟੀ ਦੀ ਜਾਣਕਾਰੀ' : isHindi ? 'फसल और मिट्टी की जानकारी' : 'Crop and Soil Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cropType">{isPunjabi ? 'ਫਸਲ ਦੀ ਕਿਸਮ' : isHindi ? 'फसल का प्रकार' : 'Crop Type'}</Label>
                      <Select value={formData.cropType} onValueChange={(value) => handleInputChange('cropType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={isPunjabi ? 'ਫਸਲ ਚੁਣੋ' : isHindi ? 'फसल चुनें' : 'Select Crop'} />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(cropRequirements).map((crop) => (
                            <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="area">{isPunjabi ? 'ਖੇਤਰ (ਏਕੜ)' : isHindi ? 'क्षेत्र (एकड़)' : 'Area (Acres)'}</Label>
                      <Input
                        id="area"
                        type="number"
                        value={formData.area}
                        onChange={(e) => handleInputChange('area', e.target.value)}
                        placeholder="2.5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="soilType">{isPunjabi ? 'ਮਿੱਟੀ ਦੀ ਕਿਸਮ' : isHindi ? 'मिट्टी का प्रकार' : 'Soil Type'}</Label>
                    <Select value={formData.soilType} onValueChange={(value) => handleInputChange('soilType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={isPunjabi ? 'ਮਿੱਟੀ ਚੁਣੋ' : isHindi ? 'मिट्टी चुनें' : 'Select Soil Type'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sandy">{isPunjabi ? 'ਰੇਤਲੀ' : isHindi ? 'रेतली' : 'Sandy'}</SelectItem>
                        <SelectItem value="Loamy">{isPunjabi ? 'ਦੋਮਟ' : isHindi ? 'दोमट' : 'Loamy'}</SelectItem>
                        <SelectItem value="Clayey">{isPunjabi ? 'ਮਿੱਟੀਲੀ' : isHindi ? 'मिट्टीली' : 'Clayey'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">{isPunjabi ? 'ਮੌਜੂਦਾ ਮਿੱਟੀ ਦੇ ਪੋਸ਼ਕ ਤੱਤ (kg/acre)' : isHindi ? 'वर्तमान मिट्टी के पोषक तत्व (kg/acre)' : 'Current Soil Nutrients (kg/acre)'}</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="nitrogen">N</Label>
                        <Input
                          id="nitrogen"
                          type="number"
                          value={formData.currentNitrogen}
                          onChange={(e) => handleInputChange('currentNitrogen', e.target.value)}
                          placeholder="45"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phosphorus">P</Label>
                        <Input
                          id="phosphorus"
                          type="number"
                          value={formData.currentPhosphorus}
                          onChange={(e) => handleInputChange('currentPhosphorus', e.target.value)}
                          placeholder="25"
                        />
                      </div>
                      <div>
                        <Label htmlFor="potassium">K</Label>
                        <Input
                          id="potassium"
                          type="number"
                          value={formData.currentPotassium}
                          onChange={(e) => handleInputChange('currentPotassium', e.target.value)}
                          placeholder="180"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={calculateFertilizer}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    {isLoading 
                      ? (isPunjabi ? 'ਗਣਨਾ ਕਰ ਰਿਹਾ ਹੈ...' : isHindi ? 'गणना कर रहा है...' : 'Calculating...')
                      : (isPunjabi ? 'ਫਰਟੀਲਾਈਜ਼ਰ ਗਣਨਾ ਕਰੋ' : isHindi ? 'उर्वरक गणना करें' : 'Calculate Fertilizer')
                    }
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Reference */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    {isPunjabi ? 'ਤੇਜ਼ ਰੈਫਰੈਂਸ' : isHindi ? 'त्वरित संदर्भ' : 'Quick Reference'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{isPunjabi ? 'ਫਸਲ ਲੋੜਾਂ' : isHindi ? 'फसल आवश्यकताएं' : 'Crop Requirements'}</h4>
                    <div className="space-y-2">
                      {Object.entries(cropRequirements).map(([crop, req]) => (
                        <div key={crop} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{crop}</span>
                          <Badge variant="outline">N:{req.n} P:{req.p} K:{req.k}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">{isPunjabi ? 'ਫਰਟੀਲਾਈਜ਼ਰ ਕਿਸਮਾਂ' : isHindi ? 'उर्वरक प्रकार' : 'Fertilizer Types'}</h4>
                    <div className="space-y-2">
                      {fertilizerTypes.map((fertilizer) => (
                        <div key={fertilizer.name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{fertilizer.name}</span>
                          <Badge variant="outline">₹{fertilizer.price}/kg</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            {selectedRecommendation ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      {isPunjabi ? 'ਫਰਟੀਲਾਈਜ਼ਰ ਸਿਫਾਰਸ਼ਾਂ' : isHindi ? 'उर्वरक सिफारिशें' : 'Fertilizer Recommendations'}
                    </CardTitle>
                    <CardDescription>
                      {selectedRecommendation.cropType} • {selectedRecommendation.area} acres • {selectedRecommendation.soilType}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">{isPunjabi ? 'ਮੌਜੂਦਾ vs ਟੀਚਾ NPK' : isHindi ? 'वर्तमान vs लक्ष्य NPK' : 'Current vs Target NPK'}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Nitrogen (N)</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{selectedRecommendation.currentNPK.nitrogen}</span>
                              <span className="text-gray-400">→</span>
                              <span className="text-sm font-medium">{selectedRecommendation.targetNPK.nitrogen}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Phosphorus (P)</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{selectedRecommendation.currentNPK.phosphorus}</span>
                              <span className="text-gray-400">→</span>
                              <span className="text-sm font-medium">{selectedRecommendation.targetNPK.phosphorus}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Potassium (K)</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{selectedRecommendation.currentNPK.potassium}</span>
                              <span className="text-gray-400">→</span>
                              <span className="text-sm font-medium">{selectedRecommendation.targetNPK.potassium}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">{isPunjabi ? 'ਕੁੱਲ ਲਾਗਤ' : isHindi ? 'कुल लागत' : 'Total Cost'}</h4>
                        <div className="text-3xl font-bold text-green-600">
                          ₹{selectedRecommendation.totalCost.toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-600">
                          {isPunjabi ? 'ਕੁੱਲ ਖੇਤਰ ਲਈ' : isHindi ? 'कुल क्षेत्र के लिए' : 'For total area'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      {isPunjabi ? 'ਫਰਟੀਲਾਈਜ਼ਰ ਵਿਸਤਾਰ' : isHindi ? 'उर्वरक विवरण' : 'Fertilizer Details'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedRecommendation.recommendations.map((rec, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium">{rec.fertilizer}</h5>
                            <Badge variant="outline">₹{rec.cost.toLocaleString()}</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">{isPunjabi ? 'ਮਾਤਰਾ:' : isHindi ? 'मात्रा:' : 'Quantity:'}</span>
                              <div className="font-medium">{rec.quantity} {rec.unit}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">{isPunjabi ? 'ਢੰਗ:' : isHindi ? 'तरीका:' : 'Method:'}</span>
                              <div className="font-medium">{rec.applicationMethod}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">{isPunjabi ? 'ਸਮਾਂ:' : isHindi ? 'समय:' : 'Timing:'}</span>
                              <div className="font-medium">{rec.timing}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">{isPunjabi ? 'ਲਾਗਤ:' : isHindi ? 'लागत:' : 'Cost:'}</span>
                              <div className="font-medium">₹{rec.cost.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calculator className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isPunjabi ? 'ਕੋਈ ਸਿਫਾਰਸ਼ ਨਹੀਂ ਮਿਲੀ' : isHindi ? 'कोई सिफारिश नहीं मिली' : 'No Recommendations Found'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {isPunjabi ? 'ਪਹਿਲਾਂ ਫਰਟੀਲਾਈਜ਼ਰ ਗਣਨਾ ਕਰੋ' : isHindi ? 'पहले उर्वरक गणना करें' : 'Calculate fertilizer first'}
                  </p>
                  <Button onClick={() => setActiveTab('calculator')}>
                    <Calculator className="h-4 w-4 mr-2" />
                    {isPunjabi ? 'ਕੈਲਕੁਲੇਟਰ \'ਤੇ ਜਾਓ' : isHindi ? 'कैलकुलेटर पर जाएं' : 'Go to Calculator'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            {selectedRecommendation ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    {isPunjabi ? 'ਫਰਟੀਲਾਈਜ਼ਰ ਲਗਾਉਣ ਦੀ ਸਮਾਂ ਸਾਰਣੀ' : isHindi ? 'उर्वरक लगाने की समय सारणी' : 'Fertilizer Application Schedule'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedRecommendation.applicationSchedule.map((schedule, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{schedule.stage}</h5>
                            <p className="text-sm text-gray-600">{schedule.fertilizer}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{schedule.date}</Badge>
                            <p className="text-sm text-gray-600 mt-1">{schedule.quantity} kg</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="text-sm text-gray-600">{isPunjabi ? 'ਢੰਗ:' : isHindi ? 'तरीका:' : 'Method:'}</span>
                          <span className="text-sm font-medium ml-1">{schedule.method}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isPunjabi ? 'ਕੋਈ ਸਮਾਂ ਸਾਰਣੀ ਨਹੀਂ ਮਿਲੀ' : isHindi ? 'कोई समय सारणी नहीं मिली' : 'No Schedule Found'}
                  </h3>
                  <p className="text-gray-600">
                    {isPunjabi ? 'ਪਹਿਲਾਂ ਫਰਟੀਲਾਈਜ਼ਰ ਗਣਨਾ ਕਰੋ' : isHindi ? 'पहले उर्वरक गणना करें' : 'Calculate fertilizer first'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isPunjabi ? 'ਫਰਟੀਲਾਈਜ਼ਰ ਗਣਨਾ ਇਤਿਹਾਸ' : isHindi ? 'उर्वरक गणना इतिहास' : 'Fertilizer Calculation History'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div 
                      key={rec.id} 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedRecommendation?.id === rec.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRecommendation(rec)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{rec.cropType} - {rec.area} acres</h4>
                          <p className="text-sm text-gray-600">{rec.soilType} • {new Date(rec.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">₹{rec.totalCost.toLocaleString()}</Badge>
                          <p className="text-sm text-gray-600 mt-1">{rec.recommendations.length} {isPunjabi ? 'ਫਰਟੀਲਾਈਜ਼ਰ' : isHindi ? 'उर्वरक' : 'fertilizers'}</p>
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

export default AnandSaathiFertilizerCalculator;
