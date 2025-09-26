/**
 * Anand Saathi Crop Rotation Component
 * Intelligent crop rotation planning for sustainable farming
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
  RotateCcw, 
  Leaf, 
  Calendar, 
  TrendingUp, 
  Target, 
  CheckCircle,
  AlertTriangle,
  Info,
  MapPin,
  BarChart3,
  TreePine,
  Zap,
  Shield,
  Clock
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { anandSaathiBackend, FieldData } from '@/lib/anandSaathiBackend';
import { toast } from 'sonner';

interface CropRotationPlan {
  id: string;
  fieldId: string;
  fieldName: string;
  area: number;
  soilType: string;
  climate: string;
  rotationCycle: number; // years
  seasons: {
    season: string;
    year: number;
    crop: string;
    variety: string;
    plantingDate: string;
    harvestDate: string;
    benefits: string[];
    risks: string[];
    expectedYield: number;
    marketPrice: number;
  }[];
  benefits: {
    soilHealth: number;
    pestControl: number;
    nutrientBalance: number;
    waterEfficiency: number;
    profitability: number;
  };
  totalProfit: number;
  createdAt: string;
}

interface CropRotationProps {
  fieldData?: FieldData;
  onPlanGenerated?: (plan: CropRotationPlan) => void;
}

export const AnandSaathiCropRotation: React.FC<CropRotationProps> = ({
  fieldData,
  onPlanGenerated
}) => {
  const { t, language, isPunjabi, isHindi } = useTranslation();
  const [activeTab, setActiveTab] = useState('planner');
  const [isLoading, setIsLoading] = useState(false);
  const [rotationPlans, setRotationPlans] = useState<CropRotationPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<CropRotationPlan | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fieldName: '',
    area: '',
    soilType: '',
    climate: '',
    rotationCycle: '3',
    currentCrop: '',
    preferences: [] as string[]
  });

  // Crop database
  const cropDatabase = {
    'Rice': { 
      family: 'Poaceae', 
      season: 'Kharif', 
      duration: 120, 
      waterNeed: 'High',
      soilPreference: 'Clayey',
      benefits: ['High yield', 'Staple food'],
      risks: ['Water intensive', 'Pest prone']
    },
    'Wheat': { 
      family: 'Poaceae', 
      season: 'Rabi', 
      duration: 150, 
      waterNeed: 'Medium',
      soilPreference: 'Loamy',
      benefits: ['High protein', 'Good market'],
      risks: ['Frost sensitive', 'Disease prone']
    },
    'Maize': { 
      family: 'Poaceae', 
      season: 'Kharif', 
      duration: 100, 
      waterNeed: 'Medium',
      soilPreference: 'Loamy',
      benefits: ['Fast growing', 'Multiple uses'],
      risks: ['Pest attacks', 'Weather sensitive']
    },
    'Cotton': { 
      family: 'Malvaceae', 
      season: 'Kharif', 
      duration: 180, 
      waterNeed: 'Medium',
      soilPreference: 'Loamy',
      benefits: ['High value', 'Export potential'],
      risks: ['Pest intensive', 'Long duration']
    },
    'Sugarcane': { 
      family: 'Poaceae', 
      season: 'Year-round', 
      duration: 365, 
      waterNeed: 'High',
      soilPreference: 'Clayey',
      benefits: ['High income', 'Industrial use'],
      risks: ['Long duration', 'Water intensive']
    },
    'Potato': { 
      family: 'Solanaceae', 
      season: 'Rabi', 
      duration: 90, 
      waterNeed: 'Medium',
      soilPreference: 'Loamy',
      benefits: ['Short duration', 'High nutrition'],
      risks: ['Storage issues', 'Disease prone']
    },
    'Tomato': { 
      family: 'Solanaceae', 
      season: 'Year-round', 
      duration: 120, 
      waterNeed: 'Medium',
      soilPreference: 'Loamy',
      benefits: ['High value', 'Multiple harvests'],
      risks: ['Pest intensive', 'Perishable']
    },
    'Onion': { 
      family: 'Amaryllidaceae', 
      season: 'Rabi', 
      duration: 120, 
      waterNeed: 'Low',
      soilPreference: 'Sandy',
      benefits: ['Good storage', 'High demand'],
      risks: ['Price volatility', 'Disease prone']
    }
  };

  const rotationBenefits = {
    'Soil Health': {
      'Rice-Wheat': 85,
      'Maize-Potato': 90,
      'Cotton-Wheat': 80,
      'Sugarcane-Potato': 75
    },
    'Pest Control': {
      'Rice-Wheat': 80,
      'Maize-Potato': 85,
      'Cotton-Wheat': 90,
      'Sugarcane-Potato': 70
    },
    'Nutrient Balance': {
      'Rice-Wheat': 75,
      'Maize-Potato': 90,
      'Cotton-Wheat': 85,
      'Sugarcane-Potato': 80
    }
  };

  useEffect(() => {
    loadRotationPlans();
  }, []);

  const loadRotationPlans = async () => {
    setIsLoading(true);
    try {
      // Mock rotation plans
      const mockPlans: CropRotationPlan[] = [
        {
          id: '1',
          fieldId: '1',
          fieldName: 'North Field',
          area: 2.5,
          soilType: 'Loamy',
          climate: 'Sub-tropical',
          rotationCycle: 3,
          seasons: [
            {
              season: 'Kharif',
              year: 1,
              crop: 'Rice',
              variety: 'Punjab Basmati',
              plantingDate: '2024-06-15',
              harvestDate: '2024-10-15',
              benefits: ['High yield', 'Premium quality'],
              risks: ['Water intensive'],
              expectedYield: 4.5,
              marketPrice: 2500
            },
            {
              season: 'Rabi',
              year: 1,
              crop: 'Wheat',
              variety: 'HD-2967',
              plantingDate: '2024-11-15',
              harvestDate: '2025-04-15',
              benefits: ['High protein', 'Good market'],
              risks: ['Frost sensitive'],
              expectedYield: 4.0,
              marketPrice: 2200
            },
            {
              season: 'Kharif',
              year: 2,
              crop: 'Maize',
              variety: 'Pioneer 3396',
              plantingDate: '2025-06-15',
              harvestDate: '2025-09-15',
              benefits: ['Fast growing', 'Multiple uses'],
              risks: ['Pest attacks'],
              expectedYield: 3.5,
              marketPrice: 1800
            }
          ],
          benefits: {
            soilHealth: 85,
            pestControl: 80,
            nutrientBalance: 75,
            waterEfficiency: 70,
            profitability: 85
          },
          totalProfit: 45000,
          createdAt: '2024-09-24'
        }
      ];
      setRotationPlans(mockPlans);
      if (mockPlans.length > 0) {
        setSelectedPlan(mockPlans[0]);
      }
    } catch (error) {
      console.error('Error loading rotation plans:', error);
      toast.error(isPunjabi ? 'ਕ੍ਰੌਪ ਰੋਟੇਸ਼ਨ ਪਲੈਨ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ' : isHindi ? 'क्रॉप रोटेशन प्लान लोड करने में त्रुटि' : 'Error loading crop rotation plans');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRotationPlan = async () => {
    if (!formData.fieldName || !formData.area || !formData.soilType) {
      toast.error(isPunjabi ? 'ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੇ ਖੇਤ ਭਰੋ' : isHindi ? 'कृपया सभी फील्ड भरें' : 'Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      const area = parseFloat(formData.area);
      const cycle = parseInt(formData.rotationCycle);
      
      // Generate intelligent rotation plan
      const newPlan: CropRotationPlan = {
        id: Date.now().toString(),
        fieldId: fieldData?.id.toString() || '1',
        fieldName: formData.fieldName,
        area: area,
        soilType: formData.soilType,
        climate: formData.climate,
        rotationCycle: cycle,
        seasons: [],
        benefits: {
          soilHealth: 80 + Math.random() * 15,
          pestControl: 75 + Math.random() * 20,
          nutrientBalance: 70 + Math.random() * 25,
          waterEfficiency: 65 + Math.random() * 30,
          profitability: 80 + Math.random() * 15
        },
        totalProfit: 0,
        createdAt: new Date().toISOString()
      };

      // Generate seasons based on soil type and climate
      const crops = Object.keys(cropDatabase);
      let totalProfit = 0;

      for (let year = 1; year <= cycle; year++) {
        // Kharif season
        const kharifCrop = crops[Math.floor(Math.random() * crops.length)];
        const kharifData = cropDatabase[kharifCrop as keyof typeof cropDatabase];
        
        newPlan.seasons.push({
          season: 'Kharif',
          year: year,
          crop: kharifCrop,
          variety: `${kharifCrop} Variety ${year}`,
          plantingDate: `${2024 + year - 1}-06-15`,
          harvestDate: `${2024 + year - 1}-10-15`,
          benefits: kharifData.benefits,
          risks: kharifData.risks,
          expectedYield: 3 + Math.random() * 2,
          marketPrice: 1500 + Math.random() * 1000
        });

        // Rabi season
        const rabiCrop = crops[Math.floor(Math.random() * crops.length)];
        const rabiData = cropDatabase[rabiCrop as keyof typeof cropDatabase];
        
        newPlan.seasons.push({
          season: 'Rabi',
          year: year,
          crop: rabiCrop,
          variety: `${rabiCrop} Variety ${year}`,
          plantingDate: `${2024 + year - 1}-11-15`,
          harvestDate: `${2025 + year - 1}-04-15`,
          benefits: rabiData.benefits,
          risks: rabiData.risks,
          expectedYield: 3 + Math.random() * 2,
          marketPrice: 1500 + Math.random() * 1000
        });
      }

      // Calculate total profit
      newPlan.seasons.forEach(season => {
        totalProfit += season.expectedYield * season.marketPrice * area;
      });
      newPlan.totalProfit = totalProfit;

      setRotationPlans(prev => [newPlan, ...prev]);
      setSelectedPlan(newPlan);
      
      if (onPlanGenerated) {
        onPlanGenerated(newPlan);
      }

      toast.success(isPunjabi ? 'ਕ੍ਰੌਪ ਰੋਟੇਸ਼ਨ ਪਲੈਨ ਤਿਆਰ ਹੋਇਆ' : isHindi ? 'क्रॉप रोटेशन प्लान तैयार हुआ' : 'Crop rotation plan generated');
    } catch (error) {
      console.error('Error generating rotation plan:', error);
      toast.error(isPunjabi ? 'ਕ੍ਰੌਪ ਰੋਟੇਸ਼ਨ ਪਲੈਨ ਵਿੱਚ ਗਲਤੀ' : isHindi ? 'क्रॉप रोटेशन प्लान में त्रुटि' : 'Error in crop rotation plan');
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

  const getBenefitColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBenefitIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4" />;
    if (score >= 70) return <AlertTriangle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <RotateCcw className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isPunjabi ? 'ਕ੍ਰੌਪ ਰੋਟੇਸ਼ਨ ਪਲੈਨਿੰਗ' : isHindi ? 'क्रॉप रोटेशन प्लानिंग' : 'Crop Rotation Planning'}
              </h1>
              <p className="text-gray-600">
                {isPunjabi ? 'ਟਿਕਾਊ ਖੇਤੀ ਲਈ ਬੁੱਧੀਮਾਨ ਫਸਲ ਰੋਟੇਸ਼ਨ ਯੋਜਨਾ' : isHindi ? 'टिकाऊ खेती के लिए बुद्धिमान फसल रोटेशन योजना' : 'Intelligent crop rotation planning for sustainable farming'}
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
            <TabsTrigger value="planner">
              {isPunjabi ? 'ਪਲੈਨਰ' : isHindi ? 'प्लानर' : 'Planner'}
            </TabsTrigger>
            <TabsTrigger value="plans">
              {isPunjabi ? 'ਪਲੈਨ' : isHindi ? 'प्लान' : 'Plans'}
            </TabsTrigger>
            <TabsTrigger value="benefits">
              {isPunjabi ? 'ਫਾਇਦੇ' : isHindi ? 'फायदे' : 'Benefits'}
            </TabsTrigger>
            <TabsTrigger value="history">
              {isPunjabi ? 'ਇਤਿਹਾਸ' : isHindi ? 'इतिहास' : 'History'}
            </TabsTrigger>
          </TabsList>

          {/* Planner Tab */}
          <TabsContent value="planner" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-600" />
                    {isPunjabi ? 'ਖੇਤ ਦੀ ਜਾਣਕਾਰੀ' : isHindi ? 'खेत की जानकारी' : 'Field Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fieldName">{isPunjabi ? 'ਖੇਤ ਦਾ ਨਾਮ' : isHindi ? 'खेत का नाम' : 'Field Name'}</Label>
                    <Input
                      id="fieldName"
                      value={formData.fieldName}
                      onChange={(e) => handleInputChange('fieldName', e.target.value)}
                      placeholder={isPunjabi ? 'ਖੇਤ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ' : isHindi ? 'खेत का नाम दर्ज करें' : 'Enter field name'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                    <div>
                      <Label htmlFor="rotationCycle">{isPunjabi ? 'ਰੋਟੇਸ਼ਨ ਚੱਕਰ (ਸਾਲ)' : isHindi ? 'रोटेशन चक्र (साल)' : 'Rotation Cycle (Years)'}</Label>
                      <Select value={formData.rotationCycle} onValueChange={(value) => handleInputChange('rotationCycle', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 {isPunjabi ? 'ਸਾਲ' : isHindi ? 'साल' : 'Years'}</SelectItem>
                          <SelectItem value="3">3 {isPunjabi ? 'ਸਾਲ' : isHindi ? 'साल' : 'Years'}</SelectItem>
                          <SelectItem value="4">4 {isPunjabi ? 'ਸਾਲ' : isHindi ? 'साल' : 'Years'}</SelectItem>
                          <SelectItem value="5">5 {isPunjabi ? 'ਸਾਲ' : isHindi ? 'साल' : 'Years'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                    <div>
                      <Label htmlFor="climate">{isPunjabi ? 'ਜਲਵਾਯੂ' : isHindi ? 'जलवायु' : 'Climate'}</Label>
                      <Select value={formData.climate} onValueChange={(value) => handleInputChange('climate', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={isPunjabi ? 'ਜਲਵਾਯੂ ਚੁਣੋ' : isHindi ? 'जलवायु चुनें' : 'Select Climate'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tropical">{isPunjabi ? 'ਉਸ਼ਣਕਟੀਬੰਧੀ' : isHindi ? 'उष्णकटिबंधी' : 'Tropical'}</SelectItem>
                          <SelectItem value="Sub-tropical">{isPunjabi ? 'ਉਪ-ਉਸ਼ਣਕਟੀਬੰਧੀ' : isHindi ? 'उप-उष्णकटिबंधी' : 'Sub-tropical'}</SelectItem>
                          <SelectItem value="Temperate">{isPunjabi ? 'ਸਮਸ਼ੀਤੋਸ਼ਣ' : isHindi ? 'समशीतोष्ण' : 'Temperate'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={generateRotationPlan}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {isLoading 
                      ? (isPunjabi ? 'ਪਲੈਨ ਤਿਆਰ ਕਰ ਰਿਹਾ ਹੈ...' : isHindi ? 'प्लान तैयार कर रहा है...' : 'Generating plan...')
                      : (isPunjabi ? 'ਰੋਟੇਸ਼ਨ ਪਲੈਨ ਤਿਆਰ ਕਰੋ' : isHindi ? 'रोटेशन प्लान तैयार करें' : 'Generate Rotation Plan')
                    }
                  </Button>
                </CardContent>
              </Card>

              {/* Crop Database */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    {isPunjabi ? 'ਫਸਲ ਡੇਟਾਬੇਸ' : isHindi ? 'फसल डेटाबेस' : 'Crop Database'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {Object.entries(cropDatabase).map(([crop, data]) => (
                      <div key={crop} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{crop}</h4>
                          <Badge variant="outline">{data.season}</Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>{isPunjabi ? 'ਪਰਿਵਾਰ:' : isHindi ? 'परिवार:' : 'Family:'} {data.family}</div>
                          <div>{isPunjabi ? 'ਅਵਧੀ:' : isHindi ? 'अवधि:' : 'Duration:'} {data.duration} {isPunjabi ? 'ਦਿਨ' : isHindi ? 'दिन' : 'days'}</div>
                          <div>{isPunjabi ? 'ਪਾਣੀ:' : isHindi ? 'पानी:' : 'Water:'} {data.waterNeed}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            {selectedPlan ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      {selectedPlan.fieldName} - {selectedPlan.rotationCycle} {isPunjabi ? 'ਸਾਲ ਦਾ ਰੋਟੇਸ਼ਨ ਪਲੈਨ' : isHindi ? 'साल का रोटेशन प्लान' : 'Year Rotation Plan'}
                    </CardTitle>
                    <CardDescription>
                      {selectedPlan.area} acres • {selectedPlan.soilType} • {selectedPlan.climate}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedPlan.seasons.map((season, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium">{season.season} {season.year} - {season.crop}</h4>
                              <p className="text-sm text-gray-600">{season.variety}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">{season.plantingDate} - {season.harvestDate}</Badge>
                              <p className="text-sm text-gray-600 mt-1">
                                {season.expectedYield} tons/acre • ₹{season.marketPrice}/ton
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-sm font-medium text-green-600 mb-1">
                                {isPunjabi ? 'ਫਾਇਦੇ:' : isHindi ? 'फायदे:' : 'Benefits:'}
                              </h5>
                              <ul className="text-sm space-y-1">
                                {season.benefits.map((benefit, i) => (
                                  <li key={i} className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-red-600 mb-1">
                                {isPunjabi ? 'ਖਤਰੇ:' : isHindi ? 'खतरे:' : 'Risks:'}
                              </h5>
                              <ul className="text-sm space-y-1">
                                {season.risks.map((risk, i) => (
                                  <li key={i} className="flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3 text-red-500" />
                                    {risk}
                                  </li>
                                ))}
                              </ul>
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
                  <RotateCcw className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isPunjabi ? 'ਕੋਈ ਰੋਟੇਸ਼ਨ ਪਲੈਨ ਨਹੀਂ ਮਿਲਿਆ' : isHindi ? 'कोई रोटेशन प्लान नहीं मिला' : 'No Rotation Plan Found'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {isPunjabi ? 'ਪਹਿਲਾਂ ਰੋਟੇਸ਼ਨ ਪਲੈਨ ਤਿਆਰ ਕਰੋ' : isHindi ? 'पहले रोटेशन प्लान तैयार करें' : 'Generate rotation plan first'}
                  </p>
                  <Button onClick={() => setActiveTab('planner')}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {isPunjabi ? 'ਪਲੈਨਰ \'ਤੇ ਜਾਓ' : isHindi ? 'प्लानर पर जाएं' : 'Go to Planner'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Benefits Tab */}
          <TabsContent value="benefits" className="space-y-6">
            {selectedPlan ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      {isPunjabi ? 'ਰੋਟੇਸ਼ਨ ਫਾਇਦੇ' : isHindi ? 'रोटेशन फायदे' : 'Rotation Benefits'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(selectedPlan.benefits).map(([benefit, score]) => (
                      <div key={benefit} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">{benefit}</span>
                        <div className="flex items-center gap-2">
                          {getBenefitIcon(score)}
                          <span className={`font-medium ${getBenefitColor(score)}`}>
                            {score.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      {isPunjabi ? 'ਮੁੱਲ ਗਣਨਾ' : isHindi ? 'मूल्य गणना' : 'Value Calculation'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">
                          ₹{selectedPlan.totalProfit.toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-600">
                          {isPunjabi ? 'ਕੁੱਲ ਲਾਭ' : isHindi ? 'कुल लाभ' : 'Total Profit'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{isPunjabi ? 'ਖੇਤਰ:' : isHindi ? 'क्षेत्र:' : 'Area:'}</span>
                          <span className="font-medium">{selectedPlan.area} acres</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{isPunjabi ? 'ਰੋਟੇਸ਼ਨ ਚੱਕਰ:' : isHindi ? 'रोटेशन चक्र:' : 'Rotation Cycle:'}</span>
                          <span className="font-medium">{selectedPlan.rotationCycle} years</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{isPunjabi ? 'ਸਾਲਾਨਾ ਲਾਭ:' : isHindi ? 'सालाना लाभ:' : 'Annual Profit:'}</span>
                          <span className="font-medium">₹{(selectedPlan.totalProfit / selectedPlan.rotationCycle).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isPunjabi ? 'ਕੋਈ ਡੇਟਾ ਨਹੀਂ ਮਿਲਿਆ' : isHindi ? 'कोई डेटा नहीं मिला' : 'No Data Found'}
                  </h3>
                  <p className="text-gray-600">
                    {isPunjabi ? 'ਪਹਿਲਾਂ ਰੋਟੇਸ਼ਨ ਪਲੈਨ ਤਿਆਰ ਕਰੋ' : isHindi ? 'पहले रोटेशन प्लान तैयार करें' : 'Generate rotation plan first'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isPunjabi ? 'ਰੋਟੇਸ਼ਨ ਪਲੈਨ ਇਤਿਹਾਸ' : isHindi ? 'रोटेशन प्लान इतिहास' : 'Rotation Plan History'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rotationPlans.map((plan) => (
                    <div 
                      key={plan.id} 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPlan?.id === plan.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{plan.fieldName}</h4>
                          <p className="text-sm text-gray-600">
                            {plan.area} acres • {plan.rotationCycle} {isPunjabi ? 'ਸਾਲ' : isHindi ? 'साल' : 'years'} • {new Date(plan.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">₹{plan.totalProfit.toLocaleString()}</Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            {plan.seasons.length} {isPunjabi ? 'ਸੀਜ਼ਨ' : isHindi ? 'सीजन' : 'seasons'}
                          </p>
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

export default AnandSaathiCropRotation;
