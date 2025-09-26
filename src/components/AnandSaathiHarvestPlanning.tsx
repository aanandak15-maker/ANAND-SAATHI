/**
 * Anand Saathi Harvest Planning Component
 * Optimal harvest timing, logistics, and yield optimization
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
  Calendar, 
  Truck, 
  TrendingUp, 
  Target, 
  CheckCircle,
  AlertTriangle,
  Info,
  MapPin,
  BarChart3,
  Clock,
  DollarSign,
  Package,
  Users,
  Zap,
  Activity,
  FileText
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { anandSaathiBackend, FieldData } from '@/lib/anandSaathiBackend';
import { toast } from 'sonner';

interface HarvestPlan {
  id: string;
  fieldId: string;
  cropType: string;
  variety: string;
  plantingDate: string;
  expectedHarvestDate: string;
  actualHarvestDate?: string;
  area: number;
  expectedYield: number;
  actualYield?: number;
  maturityStage: 'early' | 'optimal' | 'late';
  qualityGrade: 'A' | 'B' | 'C' | 'D';
  marketPrice: number;
  totalValue: number;
  logistics: {
    transport: string;
    storage: string;
    processing: string;
    cost: number;
  };
  workforce: {
    required: number;
    available: number;
    cost: number;
  };
  equipment: {
    required: string[];
    available: string[];
    rental: number;
  };
  status: 'planned' | 'ready' | 'harvesting' | 'completed' | 'delayed';
  createdAt: string;
}

interface HarvestLogistics {
  id: string;
  planId: string;
  transportType: 'truck' | 'tractor' | 'manual';
  distance: number;
  cost: number;
  time: number;
  capacity: number;
  availability: boolean;
}

interface HarvestPlanningProps {
  fieldData?: FieldData;
  onPlanCreated?: (plan: HarvestPlan) => void;
}

export const AnandSaathiHarvestPlanning: React.FC<HarvestPlanningProps> = ({
  fieldData,
  onPlanCreated
}) => {
  const { t, language, isPunjabi, isHindi } = useTranslation();
  const [activeTab, setActiveTab] = useState('planner');
  const [isLoading, setIsLoading] = useState(false);
  const [harvestPlans, setHarvestPlans] = useState<HarvestPlan[]>([]);
  const [logistics, setLogistics] = useState<HarvestLogistics[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<HarvestPlan | null>(null);

  // Form state
  const [planForm, setPlanForm] = useState({
    cropType: '',
    variety: '',
    plantingDate: '',
    area: '',
    expectedYield: '',
    marketPrice: ''
  });

  // Crop maturity data
  const cropMaturityData = {
    'Rice': { duration: 120, optimalHarvest: 110, qualityWindow: 10 },
    'Wheat': { duration: 150, optimalHarvest: 140, qualityWindow: 15 },
    'Maize': { duration: 100, optimalHarvest: 95, qualityWindow: 8 },
    'Cotton': { duration: 180, optimalHarvest: 170, qualityWindow: 20 },
    'Sugarcane': { duration: 365, optimalHarvest: 350, qualityWindow: 30 },
    'Potato': { duration: 90, optimalHarvest: 85, qualityWindow: 7 },
    'Tomato': { duration: 120, optimalHarvest: 110, qualityWindow: 12 }
  };

  useEffect(() => {
    loadHarvestData();
  }, []);

  const loadHarvestData = async () => {
    setIsLoading(true);
    try {
      // Mock harvest plans
      const mockPlans: HarvestPlan[] = [
        {
          id: '1',
          fieldId: '1',
          cropType: 'Rice',
          variety: 'Punjab Basmati',
          plantingDate: '2024-06-15',
          expectedHarvestDate: '2024-10-15',
          area: 2.5,
          expectedYield: 4.5,
          maturityStage: 'optimal',
          qualityGrade: 'A',
          marketPrice: 2500,
          totalValue: 28125,
          logistics: {
            transport: 'Truck',
            storage: 'Warehouse',
            processing: 'Milling',
            cost: 2500
          },
          workforce: {
            required: 8,
            available: 6,
            cost: 4000
          },
          equipment: {
            required: ['Combine Harvester', 'Tractor'],
            available: ['Tractor'],
            rental: 3000
          },
          status: 'ready',
          createdAt: '2024-09-24'
        }
      ];

      // Mock logistics
      const mockLogistics: HarvestLogistics[] = [
        {
          id: '1',
          planId: '1',
          transportType: 'truck',
          distance: 15,
          cost: 1500,
          time: 2,
          capacity: 5,
          availability: true
        }
      ];

      setHarvestPlans(mockPlans);
      setLogistics(mockLogistics);
      if (mockPlans.length > 0) {
        setSelectedPlan(mockPlans[0]);
      }
    } catch (error) {
      console.error('Error loading harvest data:', error);
      toast.error(isPunjabi ? 'ਕਟਾਈ ਡੇਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ' : isHindi ? 'कटाई डेटा लोड करने में त्रुटि' : 'Error loading harvest data');
    } finally {
      setIsLoading(false);
    }
  };

  const createHarvestPlan = async () => {
    if (!planForm.cropType || !planForm.plantingDate || !planForm.area) {
      toast.error(isPunjabi ? 'ਕਿਰਪਾ ਕਰਕੇ ਸਾਰੇ ਖੇਤ ਭਰੋ' : isHindi ? 'कृपया सभी फील्ड भरें' : 'Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      const cropData = cropMaturityData[planForm.cropType as keyof typeof cropMaturityData];
      if (!cropData) {
        toast.error(isPunjabi ? 'ਇਸ ਫਸਲ ਲਈ ਡੇਟਾ ਉਪਲਬਧ ਨਹੀਂ' : isHindi ? 'इस फसल के लिए डेटा उपलब्ध नहीं' : 'Data not available for this crop');
        return;
      }

      const plantingDate = new Date(planForm.plantingDate);
      const harvestDate = new Date(plantingDate.getTime() + cropData.optimalHarvest * 24 * 60 * 60 * 1000);
      const area = parseFloat(planForm.area);
      const expectedYield = parseFloat(planForm.expectedYield);
      const marketPrice = parseFloat(planForm.marketPrice);

      const newPlan: HarvestPlan = {
        id: Date.now().toString(),
        fieldId: fieldData?.id.toString() || '1',
        cropType: planForm.cropType,
        variety: planForm.variety,
        plantingDate: planForm.plantingDate,
        expectedHarvestDate: harvestDate.toISOString().split('T')[0],
        area: area,
        expectedYield: expectedYield,
        maturityStage: 'optimal',
        qualityGrade: 'A',
        marketPrice: marketPrice,
        totalValue: expectedYield * marketPrice * area,
        logistics: {
          transport: 'Truck',
          storage: 'Warehouse',
          processing: 'Standard',
          cost: area * 1000
        },
        workforce: {
          required: Math.ceil(area * 3),
          available: Math.ceil(area * 2.5),
          cost: area * 1500
        },
        equipment: {
          required: ['Combine Harvester', 'Tractor'],
          available: ['Tractor'],
          rental: area * 1200
        },
        status: 'planned',
        createdAt: new Date().toISOString()
      };

      setHarvestPlans(prev => [newPlan, ...prev]);
      setSelectedPlan(newPlan);
      
      if (onPlanCreated) {
        onPlanCreated(newPlan);
      }

      // Reset form
      setPlanForm({
        cropType: '',
        variety: '',
        plantingDate: '',
        area: '',
        expectedYield: '',
        marketPrice: ''
      });

      toast.success(isPunjabi ? 'ਕਟਾਈ ਯੋਜਨਾ ਬਣਾਈ ਗਈ' : isHindi ? 'कटाई योजना बनाई गई' : 'Harvest plan created');
    } catch (error) {
      console.error('Error creating harvest plan:', error);
      toast.error(isPunjabi ? 'ਕਟਾਈ ਯੋਜਨਾ ਬਣਾਉਣ ਵਿੱਚ ਗਲਤੀ' : isHindi ? 'कटाई योजना बनाने में त्रुटि' : 'Error creating harvest plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setPlanForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'harvesting': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaturityColor = (stage: string) => {
    switch (stage) {
      case 'early': return 'bg-green-100 text-green-800';
      case 'optimal': return 'bg-blue-100 text-blue-800';
      case 'late': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isPunjabi ? 'ਕਟਾਈ ਯੋਜਨਾਬੰਦੀ' : isHindi ? 'कटाई योजनाबंदी' : 'Harvest Planning'}
              </h1>
              <p className="text-gray-600">
                {isPunjabi ? 'ਅਨੁਕੂਲ ਕਟਾਈ ਸਮਾਂ, ਲੌਜਿਸਟਿਕਸ ਅਤੇ ਉਪਜ ਆਪਟੀਮਾਈਜੇਸ਼ਨ' : isHindi ? 'अनुकूल कटाई समय, लॉजिस्टिक्स और उपज अनुकूलन' : 'Optimal harvest timing, logistics, and yield optimization'}
              </p>
            </div>
          </div>

          {/* Field Info */}
          {fieldData && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <MapPin className="h-5 w-5 text-yellow-600" />
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="planner">
              {isPunjabi ? 'ਪਲੈਨਰ' : isHindi ? 'प्लानर' : 'Planner'}
            </TabsTrigger>
            <TabsTrigger value="plans">
              {isPunjabi ? 'ਯੋਜਨਾਵਾਂ' : isHindi ? 'योजनाएं' : 'Plans'}
            </TabsTrigger>
            <TabsTrigger value="logistics">
              {isPunjabi ? 'ਲੌਜਿਸਟਿਕਸ' : isHindi ? 'लॉजिस्टिक्स' : 'Logistics'}
            </TabsTrigger>
            <TabsTrigger value="timeline">
              {isPunjabi ? 'ਸਮਾਂ ਸਾਰਣੀ' : isHindi ? 'समय सारणी' : 'Timeline'}
            </TabsTrigger>
            <TabsTrigger value="analytics">
              {isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'विश्लेषण' : 'Analytics'}
            </TabsTrigger>
          </TabsList>

          {/* Planner Tab */}
          <TabsContent value="planner" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create Plan Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-yellow-600" />
                    {isPunjabi ? 'ਨਵੀਂ ਕਟਾਈ ਯੋਜਨਾ' : isHindi ? 'नई कटाई योजना' : 'New Harvest Plan'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cropType">{isPunjabi ? 'ਫਸਲ ਦੀ ਕਿਸਮ' : isHindi ? 'फसल का प्रकार' : 'Crop Type'}</Label>
                      <Select value={planForm.cropType} onValueChange={(value) => handleInputChange('cropType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={isPunjabi ? 'ਫਸਲ ਚੁਣੋ' : isHindi ? 'फसल चुनें' : 'Select Crop'} />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(cropMaturityData).map((crop) => (
                            <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="variety">{isPunjabi ? 'ਕਿਸਮ' : isHindi ? 'किस्म' : 'Variety'}</Label>
                      <Input
                        id="variety"
                        value={planForm.variety}
                        onChange={(e) => handleInputChange('variety', e.target.value)}
                        placeholder={isPunjabi ? 'ਕਿਸਮ ਦਾ ਨਾਮ' : isHindi ? 'किस्म का नाम' : 'Variety name'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plantingDate">{isPunjabi ? 'ਬੀਜਾਈ ਦੀ ਤਾਰੀਖ' : isHindi ? 'बुआई की तारीख' : 'Planting Date'}</Label>
                      <Input
                        id="plantingDate"
                        type="date"
                        value={planForm.plantingDate}
                        onChange={(e) => handleInputChange('plantingDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="area">{isPunjabi ? 'ਖੇਤਰ (ਏਕੜ)' : isHindi ? 'क्षेत्र (एकड़)' : 'Area (Acres)'}</Label>
                      <Input
                        id="area"
                        type="number"
                        value={planForm.area}
                        onChange={(e) => handleInputChange('area', e.target.value)}
                        placeholder="2.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expectedYield">{isPunjabi ? 'ਅਪੇਖਿਤ ਉਪਜ (ਟਨ/ਏਕੜ)' : isHindi ? 'अपेक्षित उपज (टन/एकड़)' : 'Expected Yield (tons/acre)'}</Label>
                      <Input
                        id="expectedYield"
                        type="number"
                        value={planForm.expectedYield}
                        onChange={(e) => handleInputChange('expectedYield', e.target.value)}
                        placeholder="4.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="marketPrice">{isPunjabi ? 'ਮਾਰਕੀਟ ਮੁੱਲ (₹/ਟਨ)' : isHindi ? 'मार्केट मूल्य (₹/टन)' : 'Market Price (₹/ton)'}</Label>
                      <Input
                        id="marketPrice"
                        type="number"
                        value={planForm.marketPrice}
                        onChange={(e) => handleInputChange('marketPrice', e.target.value)}
                        placeholder="2500"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={createHarvestPlan}
                    disabled={isLoading}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {isLoading 
                      ? (isPunjabi ? 'ਯੋਜਨਾ ਬਣਾ ਰਿਹਾ ਹੈ...' : isHindi ? 'योजना बना रहा है...' : 'Creating plan...')
                      : (isPunjabi ? 'ਕਟਾਈ ਯੋਜਨਾ ਬਣਾਓ' : isHindi ? 'कटाई योजना बनाएं' : 'Create Harvest Plan')
                    }
                  </Button>
                </CardContent>
              </Card>

              {/* Crop Maturity Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    {isPunjabi ? 'ਫਸਲ ਪਰਿਪੱਕਤਾ ਜਾਣਕਾਰੀ' : isHindi ? 'फसल परिपक्वता जानकारी' : 'Crop Maturity Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(cropMaturityData).map(([crop, data]) => (
                      <div key={crop} className="p-3 border rounded-lg">
                        <h4 className="font-medium mb-2">{crop}</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>{isPunjabi ? 'ਕੁੱਲ ਅਵਧੀ:' : isHindi ? 'कुल अवधि:' : 'Total Duration:'} {data.duration} {isPunjabi ? 'ਦਿਨ' : isHindi ? 'दिन' : 'days'}</div>
                          <div>{isPunjabi ? 'ਅਨੁਕੂਲ ਕਟਾਈ:' : isHindi ? 'अनुकूल कटाई:' : 'Optimal Harvest:'} {data.optimalHarvest} {isPunjabi ? 'ਦਿਨ' : isHindi ? 'दिन' : 'days'}</div>
                          <div>{isPunjabi ? 'ਗੁਣਵੱਤਾ ਵਿੰਡੋ:' : isHindi ? 'गुणवत्ता विंडो:' : 'Quality Window:'} {data.qualityWindow} {isPunjabi ? 'ਦਿਨ' : isHindi ? 'दिन' : 'days'}</div>
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
            {harvestPlans.length > 0 ? (
              <div className="space-y-4">
                {harvestPlans.map((plan) => (
                  <Card key={plan.id} className={`border-l-4 ${
                    plan.status === 'ready' ? 'border-green-500' :
                    plan.status === 'harvesting' ? 'border-yellow-500' :
                    plan.status === 'completed' ? 'border-gray-500' :
                    plan.status === 'delayed' ? 'border-red-500' : 'border-blue-500'
                  }`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-yellow-600" />
                            {plan.cropType} - {plan.variety}
                          </CardTitle>
                          <CardDescription>
                            {plan.plantingDate} → {plan.expectedHarvestDate} • {plan.area} acres
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(plan.status)}>
                            {plan.status.toUpperCase()}
                          </Badge>
                          <Badge className={getMaturityColor(plan.maturityStage)}>
                            {plan.maturityStage.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{plan.expectedYield}</div>
                          <div className="text-sm text-gray-600">{isPunjabi ? 'ਟਨ/ਏਕੜ' : isHindi ? 'टन/एकड़' : 'tons/acre'}</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">₹{plan.marketPrice}</div>
                          <div className="text-sm text-gray-600">{isPunjabi ? 'ਪ੍ਰਤੀ ਟਨ' : isHindi ? 'प्रति टन' : 'per ton'}</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">₹{plan.totalValue.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">{isPunjabi ? 'ਕੁੱਲ ਮੁੱਲ' : isHindi ? 'कुल मूल्य' : 'total value'}</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{plan.qualityGrade}</div>
                          <div className="text-sm text-gray-600">{isPunjabi ? 'ਗੁਣਵੱਤਾ' : isHindi ? 'गुणवत्ता' : 'quality'}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isPunjabi ? 'ਕੋਈ ਕਟਾਈ ਯੋਜਨਾ ਨਹੀਂ ਮਿਲੀ' : isHindi ? 'कोई कटाई योजना नहीं मिली' : 'No Harvest Plans Found'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {isPunjabi ? 'ਪਹਿਲਾਂ ਕਟਾਈ ਯੋਜਨਾ ਬਣਾਓ' : isHindi ? 'पहले कटाई योजना बनाएं' : 'Create a harvest plan first'}
                  </p>
                  <Button onClick={() => setActiveTab('planner')}>
                    <Calendar className="h-4 w-4 mr-2" />
                    {isPunjabi ? 'ਪਲੈਨਰ \'ਤੇ ਜਾਓ' : isHindi ? 'प्लानर पर जाएं' : 'Go to Planner'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Logistics Tab */}
          <TabsContent value="logistics" className="space-y-6">
            {selectedPlan ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-blue-600" />
                      {isPunjabi ? 'ਪਰਿਵਹਨ ਲੌਜਿਸਟਿਕਸ' : isHindi ? 'परिवहन लॉजिस्टिक्स' : 'Transport Logistics'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{selectedPlan.logistics.transport}</span>
                        <Badge variant="outline">₹{selectedPlan.logistics.cost}</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {isPunjabi ? 'ਸਟੋਰੇਜ:' : isHindi ? 'स्टोरेज:' : 'Storage:'} {selectedPlan.logistics.storage}
                      </div>
                      <div className="text-sm text-gray-600">
                        {isPunjabi ? 'ਪ੍ਰੋਸੈਸਿੰਗ:' : isHindi ? 'प्रोसेसिंग:' : 'Processing:'} {selectedPlan.logistics.processing}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      {isPunjabi ? 'ਕਰਮਚਾਰੀ ਯੋਜਨਾ' : isHindi ? 'कर्मचारी योजना' : 'Workforce Planning'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{isPunjabi ? 'ਲੋੜੀਂਦੇ ਕਰਮਚਾਰੀ' : isHindi ? 'आवश्यक कर्मचारी' : 'Required Workers'}</span>
                        <Badge variant="outline">{selectedPlan.workforce.required}</Badge>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{isPunjabi ? 'ਉਪਲਬਧ ਕਰਮਚਾਰੀ' : isHindi ? 'उपलब्ध कर्मचारी' : 'Available Workers'}</span>
                        <Badge variant="outline">{selectedPlan.workforce.available}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{isPunjabi ? 'ਲਾਗਤ' : isHindi ? 'लागत' : 'Cost'}</span>
                        <Badge variant="outline">₹{selectedPlan.workforce.cost}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-purple-600" />
                      {isPunjabi ? 'ਉਪਕਰਣ ਯੋਜਨਾ' : isHindi ? 'उपकरण योजना' : 'Equipment Planning'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h5 className="font-medium mb-2">{isPunjabi ? 'ਲੋੜੀਂਦੇ ਉਪਕਰਣ:' : isHindi ? 'आवश्यक उपकरण:' : 'Required Equipment:'}</h5>
                      <div className="space-y-1">
                        {selectedPlan.equipment.required.map((equipment, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{equipment}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">{isPunjabi ? 'ਉਪਲਬਧ ਉਪਕਰਣ:' : isHindi ? 'उपलब्ध उपकरण:' : 'Available Equipment:'}</h5>
                      <div className="space-y-1">
                        {selectedPlan.equipment.available.map((equipment, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">{equipment}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{isPunjabi ? 'ਕਿਰਾਏ ਦੀ ਲਾਗਤ' : isHindi ? 'किराए की लागत' : 'Rental Cost'}</span>
                        <Badge variant="outline">₹{selectedPlan.equipment.rental}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      {isPunjabi ? 'ਲਾਗਤ ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'लागत विश्लेषण' : 'Cost Analysis'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{isPunjabi ? 'ਪਰਿਵਹਨ:' : isHindi ? 'परिवहन:' : 'Transport:'}</span>
                        <span className="font-medium">₹{selectedPlan.logistics.cost}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{isPunjabi ? 'ਕਰਮਚਾਰੀ:' : isHindi ? 'कर्मचारी:' : 'Workforce:'}</span>
                        <span className="font-medium">₹{selectedPlan.workforce.cost}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{isPunjabi ? 'ਉਪਕਰਣ:' : isHindi ? 'उपकरण:' : 'Equipment:'}</span>
                        <span className="font-medium">₹{selectedPlan.equipment.rental}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{isPunjabi ? 'ਕੁੱਲ ਲਾਗਤ:' : isHindi ? 'कुल लागत:' : 'Total Cost:'}</span>
                        <span className="font-bold text-lg">₹{(selectedPlan.logistics.cost + selectedPlan.workforce.cost + selectedPlan.equipment.rental).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isPunjabi ? 'ਕੋਈ ਲੌਜਿਸਟਿਕਸ ਡੇਟਾ ਨਹੀਂ ਮਿਲਿਆ' : isHindi ? 'कोई लॉजिस्टिक्स डेटा नहीं मिला' : 'No Logistics Data Found'}
                  </h3>
                  <p className="text-gray-600">
                    {isPunjabi ? 'ਪਹਿਲਾਂ ਕਟਾਈ ਯੋਜਨਾ ਬਣਾਓ' : isHindi ? 'पहले कटाई योजना बनाएं' : 'Create a harvest plan first'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            {selectedPlan ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    {isPunjabi ? 'ਕਟਾਈ ਸਮਾਂ ਸਾਰਣੀ' : isHindi ? 'कटाई समय सारणी' : 'Harvest Timeline'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <h4 className="font-medium">{isPunjabi ? 'ਬੀਜਾਈ' : isHindi ? 'बुआई' : 'Planting'}</h4>
                        <p className="text-sm text-gray-600">{selectedPlan.plantingDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div>
                        <h4 className="font-medium">{isPunjabi ? 'ਅਨੁਕੂਲ ਕਟਾਈ ਸਮਾਂ' : isHindi ? 'अनुकूल कटाई समय' : 'Optimal Harvest Time'}</h4>
                        <p className="text-sm text-gray-600">{selectedPlan.expectedHarvestDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <h4 className="font-medium">{isPunjabi ? 'ਗੁਣਵੱਤਾ ਗ੍ਰੇਡ' : isHindi ? 'गुणवत्ता ग्रेड' : 'Quality Grade'}</h4>
                        <p className="text-sm text-gray-600">{selectedPlan.qualityGrade} {isPunjabi ? 'ਗ੍ਰੇਡ' : isHindi ? 'ग्रेड' : 'Grade'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isPunjabi ? 'ਕੋਈ ਸਮਾਂ ਸਾਰਣੀ ਨਹੀਂ ਮਿਲੀ' : isHindi ? 'कोई समय सारणी नहीं मिली' : 'No Timeline Found'}
                  </h3>
                  <p className="text-gray-600">
                    {isPunjabi ? 'ਪਹਿਲਾਂ ਕਟਾਈ ਯੋਜਨਾ ਬਣਾਓ' : isHindi ? 'पहले कटाई योजना बनाएं' : 'Create a harvest plan first'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  {isPunjabi ? 'ਕਟਾਈ ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'कटाई विश्लेषण' : 'Harvest Analytics'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {harvestPlans.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      {isPunjabi ? 'ਕੁੱਲ ਯੋਜਨਾਵਾਂ' : isHindi ? 'कुल योजनाएं' : 'Total Plans'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {harvestPlans.filter(p => p.status === 'ready').length}
                    </div>
                    <div className="text-sm text-gray-600">
                      {isPunjabi ? 'ਤਿਆਰ ਯੋਜਨਾਵਾਂ' : isHindi ? 'तैयार योजनाएं' : 'Ready Plans'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {harvestPlans.filter(p => p.status === 'harvesting').length}
                    </div>
                    <div className="text-sm text-gray-600">
                      {isPunjabi ? 'ਕਟਾਈ ਵਿੱਚ' : isHindi ? 'कटाई में' : 'Harvesting'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      ₹{harvestPlans.reduce((sum, plan) => sum + plan.totalValue, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {isPunjabi ? 'ਕੁੱਲ ਮੁੱਲ' : isHindi ? 'कुल मूल्य' : 'Total Value'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnandSaathiHarvestPlanning;
