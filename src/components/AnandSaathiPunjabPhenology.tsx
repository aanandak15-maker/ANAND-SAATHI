/**
 * Anand Saathi Punjab Phenology System
 * Regional crop timing and alerts for Punjab farmers
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Calendar,
  Clock,
  Droplets,
  Sun,
  Thermometer,
  TrendingUp,
  MapPin,
  Bell,
  Brain,
  Leaf,
  BarChart3,
  Target,
  Zap,
  Shield,
  TreePine,
  Waves,
  Bug,
  Mountain,
  Droplet,
  Wind,
  Cloud,
  AlertTriangle,
  CheckCircle,
  Info,
  Activity,
  Globe,
  Smartphone,
  MessageSquare,
  Users,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Heart,
  Star,
  TrendingDown,
  Minus,
  CloudSnow,
  Package
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

interface PhenologyStage {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  duration: number; // in days
  status: 'upcoming' | 'current' | 'completed';
  progress: number; // percentage
  activities: string[];
  weatherRequirements: {
    temperature: { min: number; max: number; optimal: number };
    humidity: { min: number; max: number; optimal: number };
    rainfall: { min: number; max: number; optimal: number };
  };
  risks: string[];
  recommendations: string[];
}

interface CropVariety {
  id: string;
  name: string;
  type: 'rice' | 'wheat' | 'maize' | 'cotton' | 'sugarcane';
  maturity: 'early' | 'medium' | 'late';
  yield: { min: number; max: number; average: number };
  waterRequirement: number;
  fertilizerRequirement: { nitrogen: number; phosphorus: number; potassium: number };
  diseaseResistance: string[];
  pestResistance: string[];
  phenologyStages: PhenologyStage[];
}

interface WeatherAlert {
  id: string;
  type: 'temperature' | 'rainfall' | 'wind' | 'humidity' | 'frost' | 'heatwave';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  startDate: Date;
  endDate: Date;
  affectedStages: string[];
  recommendations: string[];
  impact: 'positive' | 'negative' | 'neutral';
}

interface MarketAlert {
  id: string;
  type: 'price' | 'demand' | 'supply' | 'export' | 'import';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  currentPrice: number;
  previousPrice: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  recommendations: string[];
}

const AnandSaathiPunjabPhenology: React.FC = () => {
  const { t, isPunjabi, isHindi } = useTranslation();
  const [selectedCrop, setSelectedCrop] = useState<CropVariety | null>(null);
  const [selectedStage, setSelectedStage] = useState<PhenologyStage | null>(null);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [marketAlerts, setMarketAlerts] = useState<MarketAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('phenology');

  // Sample data initialization
  useEffect(() => {
    // Initialize with Punjab Basmati Rice variety
    const punjabBasmati: CropVariety = {
      id: 'punjab-basmati',
      name: isPunjabi ? 'ਪੰਜਾਬ ਬਾਸਮਤੀ' : isHindi ? 'पंजाब बासमती' : 'Punjab Basmati',
      type: 'rice',
      maturity: 'medium',
      yield: { min: 25, max: 35, average: 30 },
      waterRequirement: 1200,
      fertilizerRequirement: { nitrogen: 120, phosphorus: 60, potassium: 60 },
      diseaseResistance: ['blast', 'brown_spot', 'bacterial_blight'],
      pestResistance: ['brown_planthopper', 'whitebacked_planthopper', 'stem_borer'],
      phenologyStages: [
        {
          id: 'sowing',
          name: isPunjabi ? 'ਬੀਜਾਈ' : isHindi ? 'बुआई' : 'Sowing',
          description: isPunjabi ? 'ਬੀਜ ਦੀ ਬੀਜਾਈ ਅਤੇ ਅੰਕੁਰਨ' : isHindi ? 'बीज की बुआई और अंकुरण' : 'Seed sowing and germination',
          startDate: new Date('2024-06-15'),
          endDate: new Date('2024-06-30'),
          duration: 15,
          status: 'completed',
          progress: 100,
          activities: [
            isPunjabi ? 'ਬੀਜ ਦੀ ਤਿਆਰੀ' : isHindi ? 'बीज की तैयारी' : 'Seed preparation',
            isPunjabi ? 'ਖੇਤ ਦੀ ਤਿਆਰੀ' : isHindi ? 'खेत की तैयारी' : 'Field preparation',
            isPunjabi ? 'ਬੀਜਾਈ' : isHindi ? 'बुआई' : 'Sowing'
          ],
          weatherRequirements: {
            temperature: { min: 20, max: 35, optimal: 28 },
            humidity: { min: 60, max: 80, optimal: 70 },
            rainfall: { min: 50, max: 100, optimal: 75 }
          },
          risks: [
            isPunjabi ? 'ਬੀਜ ਦਾ ਖਰਾਬ ਹੋਣਾ' : isHindi ? 'बीज का खराब होना' : 'Seed damage',
            isPunjabi ? 'ਅੰਕੁਰਨ ਵਿੱਚ ਦੇਰੀ' : isHindi ? 'अंकुरण में देरी' : 'Delayed germination'
          ],
          recommendations: [
            isPunjabi ? 'ਉੱਚ ਗੁਣਵੱਤਾ ਦੇ ਬੀਜ ਦੀ ਵਰਤੋਂ ਕਰੋ' : isHindi ? 'उच्च गुणवत्ता के बीज का उपयोग करें' : 'Use high-quality seeds',
            isPunjabi ? 'ਉੱਚਿਤ ਮਾਤਰਾ ਵਿੱਚ ਪਾਣੀ ਦੇਓ' : isHindi ? 'उचित मात्रा में पानी दें' : 'Provide adequate water'
          ]
        },
        {
          id: 'vegetative',
          name: isPunjabi ? 'ਵਨਸਪਤੀ ਵਿਕਾਸ' : isHindi ? 'वनस्पति विकास' : 'Vegetative Growth',
          description: isPunjabi ? 'ਪੌਦੇ ਦਾ ਵਿਕਾਸ ਅਤੇ ਪੱਤਿਆਂ ਦਾ ਵਿਕਾਸ' : isHindi ? 'पौधे का विकास और पत्तियों का विकास' : 'Plant growth and leaf development',
          startDate: new Date('2024-07-01'),
          endDate: new Date('2024-08-15'),
          duration: 45,
          status: 'current',
          progress: 65,
          activities: [
            isPunjabi ? 'ਪੌਦੇ ਦਾ ਵਿਕਾਸ' : isHindi ? 'पौधे का विकास' : 'Plant growth',
            isPunjabi ? 'ਪੱਤਿਆਂ ਦਾ ਵਿਕਾਸ' : isHindi ? 'पत्तियों का विकास' : 'Leaf development',
            isPunjabi ? 'ਜੜ੍ਹਾਂ ਦਾ ਵਿਕਾਸ' : isHindi ? 'जड़ों का विकास' : 'Root development'
          ],
          weatherRequirements: {
            temperature: { min: 25, max: 35, optimal: 30 },
            humidity: { min: 70, max: 85, optimal: 75 },
            rainfall: { min: 100, max: 200, optimal: 150 }
          },
          risks: [
            isPunjabi ? 'ਕੀਟ ਹਮਲੇ' : isHindi ? 'कीट हमले' : 'Pest attacks',
            isPunjabi ? 'ਰੋਗ ਦਾ ਫੈਲਣਾ' : isHindi ? 'रोग का फैलना' : 'Disease spread'
          ],
          recommendations: [
            isPunjabi ? 'ਨਿਯਮਿਤ ਕੀਟਨਾਸ਼ਕ ਛਿੜਕਾਅ' : isHindi ? 'नियमित कीटनाशक छिड़काव' : 'Regular pesticide spraying',
            isPunjabi ? 'ਪੋਸ਼ਣ ਪ੍ਰਬੰਧਨ' : isHindi ? 'पोषण प्रबंधन' : 'Nutrition management'
          ]
        },
        {
          id: 'flowering',
          name: isPunjabi ? 'ਫੁੱਲ ਆਉਣਾ' : isHindi ? 'फूल आना' : 'Flowering',
          description: isPunjabi ? 'ਫੁੱਲ ਆਉਣਾ ਅਤੇ ਪਰਾਗਣ' : isHindi ? 'फूल आना और परागण' : 'Flowering and pollination',
          startDate: new Date('2024-08-16'),
          endDate: new Date('2024-09-15'),
          duration: 30,
          status: 'upcoming',
          progress: 0,
          activities: [
            isPunjabi ? 'ਫੁੱਲ ਆਉਣਾ' : isHindi ? 'ਫੁੱਲ ਆਉਣਾ' : 'Flowering',
            isPunjabi ? 'ਪਰਾਗਣ' : isHindi ? 'परागण' : 'Pollination',
            isPunjabi ? 'ਫਲ ਲੱਗਣਾ' : isHindi ? 'फल लगना' : 'Fruit setting'
          ],
          weatherRequirements: {
            temperature: { min: 20, max: 30, optimal: 25 },
            humidity: { min: 60, max: 75, optimal: 65 },
            rainfall: { min: 50, max: 100, optimal: 75 }
          },
          risks: [
            isPunjabi ? 'ਗਰਮੀ ਦਾ ਤਣਾਅ' : isHindi ? 'गर्मी का तनाव' : 'Heat stress',
            isPunjabi ? 'ਪਰਾਗਣ ਵਿੱਚ ਦੇਰੀ' : isHindi ? 'परागण में देरी' : 'Delayed pollination'
          ],
          recommendations: [
            isPunjabi ? 'ਉੱਚਿਤ ਤਾਪਮਾਨ ਬਣਾਈ ਰੱਖੋ' : isHindi ? 'उचित तापमान बनाए रखें' : 'Maintain optimal temperature',
            isPunjabi ? 'ਪਾਣੀ ਦਾ ਪ੍ਰਬੰਧਨ' : isHindi ? 'पानी का प्रबंधन' : 'Water management'
          ]
        },
        {
          id: 'maturity',
          name: isPunjabi ? 'ਪਰਿਪੱਕਤਾ' : isHindi ? 'परिपक्वता' : 'Maturity',
          description: isPunjabi ? 'ਫਸਲ ਦੀ ਪਰਿਪੱਕਤਾ ਅਤੇ ਕਟਾਈ' : isHindi ? 'फसल की परिपक्वता और कटाई' : 'Crop maturity and harvesting',
          startDate: new Date('2024-09-16'),
          endDate: new Date('2024-10-15'),
          duration: 30,
          status: 'upcoming',
          progress: 0,
          activities: [
            isPunjabi ? 'ਫਸਲ ਦੀ ਪਰਿਪੱਕਤਾ' : isHindi ? 'फसल की परिपक्वता' : 'Crop maturity',
            isPunjabi ? 'ਕਟਾਈ' : isHindi ? 'कटाई' : 'Harvesting',
            isPunjabi ? 'ਥ੍ਰੈਸ਼ਿੰਗ' : isHindi ? 'थ्रेशिंग' : 'Threshing'
          ],
          weatherRequirements: {
            temperature: { min: 15, max: 25, optimal: 20 },
            humidity: { min: 50, max: 70, optimal: 60 },
            rainfall: { min: 0, max: 50, optimal: 25 }
          },
          risks: [
            isPunjabi ? 'ਬਾਰਸ਼ ਦਾ ਨੁਕਸਾਨ' : isHindi ? 'बारिश का नुकसान' : 'Rain damage',
            isPunjabi ? 'ਕਟਾਈ ਵਿੱਚ ਦੇਰੀ' : isHindi ? 'कटाई में देरी' : 'Delayed harvesting'
          ],
          recommendations: [
            isPunjabi ? 'ਸਮੇਂ ਤੇ ਕਟਾਈ ਕਰੋ' : isHindi ? 'समय पर कटाई करें' : 'Harvest on time',
            isPunjabi ? 'ਮੌਸਮ ਦਾ ਧਿਆਨ ਰੱਖੋ' : isHindi ? 'मौसम का ध्यान रखें' : 'Monitor weather'
          ]
        }
      ]
    };

    setSelectedCrop(punjabBasmati);

    // Initialize weather alerts
    setWeatherAlerts([
      {
        id: 'heatwave-1',
        type: 'heatwave',
        severity: 'high',
        message: isPunjabi 
          ? 'ਅਗਲੇ 3 ਦਿਨਾਂ ਵਿੱਚ ਗਰਮੀ ਦੀ ਲਹਿਰ ਦਾ ਅਨੁਮਾਨ ਹੈ। ਤਾਪਮਾਨ 40°C ਤੋਂ ਵੱਧ ਹੋ ਸਕਦਾ ਹੈ।'
          : isHindi 
          ? 'अगले 3 दिनों में गर्मी की लहर का अनुमान है। तापमान 40°C से अधिक हो सकता है।'
          : 'Heatwave expected in next 3 days. Temperature may exceed 40°C.',
        startDate: new Date(),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        affectedStages: ['vegetative', 'flowering'],
        recommendations: [
          isPunjabi ? 'ਪਾਣੀ ਦੀ ਵਧੇਰੇ ਮਾਤਰਾ ਦੇਓ' : isHindi ? 'पानी की अधिक मात्रा दें' : 'Provide extra water',
          isPunjabi ? 'ਛਾਵੇ ਦਾ ਪ੍ਰਬੰਧ ਕਰੋ' : isHindi ? 'छाया का प्रबंध करें' : 'Arrange shade'
        ],
        impact: 'negative'
      },
      {
        id: 'rainfall-1',
        type: 'rainfall',
        severity: 'medium',
        message: isPunjabi 
          ? 'ਅਗਲੇ ਹਫਤੇ ਮੱਧਮ ਬਾਰਸ਼ ਦਾ ਅਨੁਮਾਨ ਹੈ।'
          : isHindi 
          ? 'अगले सप्ताह मध्यम बारिश का अनुमान है।'
          : 'Moderate rainfall expected next week.',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        affectedStages: ['vegetative'],
        recommendations: [
          isPunjabi ? 'ਪਾਣੀ ਦੀ ਬੱਚਤ ਕਰੋ' : isHindi ? 'पानी की बचत करें' : 'Save water',
          isPunjabi ? 'ਡਰੇਨੇਜ ਦਾ ਪ੍ਰਬੰਧ ਕਰੋ' : isHindi ? 'ड्रेनेज का प्रबंध करें' : 'Arrange drainage'
        ],
        impact: 'positive'
      }
    ]);

    // Initialize market alerts
    setMarketAlerts([
      {
        id: 'price-1',
        type: 'price',
        severity: 'medium',
        message: isPunjabi 
          ? 'ਬਾਸਮਤੀ ਚੌਲਾਂ ਦੀ ਕੀਮਤ ਵਿੱਚ ਵਾਧਾ ਹੋਇਆ ਹੈ।'
          : isHindi 
          ? 'बासमती चावल की कीमत में वृद्धि हुई है।'
          : 'Basmati rice price has increased.',
        currentPrice: 2800,
        previousPrice: 2600,
        change: 7.7,
        trend: 'up',
        recommendations: [
          isPunjabi ? 'ਕੀਮਤ ਵਿੱਚ ਵਾਧੇ ਦਾ ਲਾਭ ਲਓ' : isHindi ? 'कीमत में वृद्धि का लाभ लें' : 'Take advantage of price increase',
          isPunjabi ? 'ਗੁਣਵੱਤਾ ਬਣਾਈ ਰੱਖੋ' : isHindi ? 'गुणवत्ता बनाए रखें' : 'Maintain quality'
        ]
      }
    ]);
  }, [isPunjabi, isHindi]);

  const getStageStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'current': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upcoming': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'temperature': return <Thermometer className="h-4 w-4" />;
      case 'rainfall': return <Droplets className="h-4 w-4" />;
      case 'wind': return <Wind className="h-4 w-4" />;
      case 'humidity': return <Droplet className="h-4 w-4" />;
      case 'frost': return <CloudSnow className="h-4 w-4" />;
      case 'heatwave': return <Sun className="h-4 w-4" />;
      case 'price': return <TrendingUp className="h-4 w-4" />;
      case 'demand': return <Users className="h-4 w-4" />;
      case 'supply': return <Package className="h-4 w-4" />;
      case 'export': return <Globe className="h-4 w-4" />;
      case 'import': return <Download className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'neutral': return <Minus className="h-4 w-4 text-gray-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="h-6 w-6 text-green-600" />
            {isPunjabi ? 'ਪੰਜਾਬ ਫੀਨੋਲੋਜੀ ਸਿਸਟਮ' : isHindi ? 'पंजाब फीनोलॉजी सिस्टम' : 'Punjab Phenology System'}
          </CardTitle>
          <CardDescription>
            {isPunjabi 
              ? 'ਪੰਜਾਬ ਦੇ ਕਿਸਾਨਾਂ ਲਈ ਖੇਤੀ ਚੱਕਰ ਅਤੇ ਸਮੇਂ ਦਾ ਪ੍ਰਬੰਧਨ'
              : isHindi 
              ? 'पंजाब के किसानों के लिए कृषि चक्र और समय का प्रबंधन'
              : 'Agricultural cycle and timing management for Punjab farmers'
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Crop Selection */}
      {selectedCrop && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              {selectedCrop.name}
            </CardTitle>
            <CardDescription>
              {isPunjabi ? 'ਚੁਣੀ ਗਈ ਫਸਲ ਦਾ ਵਿਸਥਾਰ' : isHindi ? 'चुनी गई फसल का विस्तार' : 'Selected crop details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {selectedCrop.yield.average} q/ha
                </div>
                <div className="text-sm text-muted-foreground">
                  {isPunjabi ? 'ਔਸਤ ਪੈਦਾਵਾਰ' : isHindi ? 'औसत पैदावार' : 'Average Yield'}
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Droplets className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {selectedCrop.waterRequirement} mm
                </div>
                <div className="text-sm text-muted-foreground">
                  {isPunjabi ? 'ਪਾਣੀ ਦੀ ਲੋੜ' : isHindi ? 'पानी की जरूरत' : 'Water Requirement'}
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {selectedCrop.diseaseResistance.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isPunjabi ? 'ਰੋਗ ਪ੍ਰਤੀਰੋਧਕਤਾ' : isHindi ? 'रोग प्रतिरोधकता' : 'Disease Resistance'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="phenology" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {isPunjabi ? 'ਫੀਨੋਲੋਜੀ' : isHindi ? 'फीनोलॉजी' : 'Phenology'}
          </TabsTrigger>
          <TabsTrigger value="weather" className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            {isPunjabi ? 'ਮੌਸਮ' : isHindi ? 'मौसम' : 'Weather'}
          </TabsTrigger>
          <TabsTrigger value="market" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {isPunjabi ? 'ਬਾਜ਼ਾਰ' : isHindi ? 'बाजार' : 'Market'}
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {isPunjabi ? 'ਚੇਤਾਵਨੀਆਂ' : isHindi ? 'चेतावनियां' : 'Alerts'}
          </TabsTrigger>
        </TabsList>

        {/* Phenology Tab */}
        <TabsContent value="phenology" className="space-y-4">
          {selectedCrop && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {isPunjabi ? 'ਫਸਲ ਚੱਕਰ' : isHindi ? 'फसल चक्र' : 'Crop Cycle'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedCrop.phenologyStages.map((stage) => (
                    <Card key={stage.id} className={`border-l-4 ${
                      stage.status === 'completed' ? 'border-l-green-500' :
                      stage.status === 'current' ? 'border-l-blue-500' : 'border-l-gray-300'
                    }`}>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{stage.name}</h4>
                            <Badge variant="outline" className={getStageStatusColor(stage.status)}>
                              {stage.status.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">{stage.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                {isPunjabi ? 'ਸ਼ੁਰੂਆਤ:' : isHindi ? 'शुरुआत:' : 'Start:'}
                              </span>
                              <div className="font-semibold">
                                {stage.startDate.toLocaleDateString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                {isPunjabi ? 'ਅੰਤ:' : isHindi ? 'अंत:' : 'End:'}
                              </span>
                              <div className="font-semibold">
                                {stage.endDate.toLocaleDateString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                {isPunjabi ? 'ਅਵਧੀ:' : isHindi ? 'अवधि:' : 'Duration:'}
                              </span>
                              <div className="font-semibold">{stage.duration} ਦਿਨ</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                {isPunjabi ? 'ਤਰੱਕੀ:' : isHindi ? 'तरक्की:' : 'Progress:'}
                              </span>
                              <div className="font-semibold">{stage.progress}%</div>
                            </div>
                          </div>
                          
                          <Progress value={stage.progress} className="h-2" />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium mb-2">
                                {isPunjabi ? 'ਗਤੀਵਿਧੀਆਂ:' : isHindi ? 'गतिविधियां:' : 'Activities:'}
                              </h5>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                {stage.activities.map((activity, index) => (
                                  <li key={index}>{activity}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h5 className="font-medium mb-2">
                                {isPunjabi ? 'ਸਿਫਾਰਸ਼ਾਂ:' : isHindi ? 'सिफारिशें:' : 'Recommendations:'}
                              </h5>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                {stage.recommendations.map((recommendation, index) => (
                                  <li key={index}>{recommendation}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Weather Tab */}
        <TabsContent value="weather" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                {isPunjabi ? 'ਮੌਸਮ ਸੂਚਨਾ' : isHindi ? 'मौसम सूचना' : 'Weather Information'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <Thermometer className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">32°C</div>
                  <div className="text-sm text-muted-foreground">
                    {isPunjabi ? 'ਤਾਪਮਾਨ' : isHindi ? 'तापमान' : 'Temperature'}
                  </div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Droplets className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">65%</div>
                  <div className="text-sm text-muted-foreground">
                    {isPunjabi ? 'ਨਮੀ' : isHindi ? 'नमी' : 'Humidity'}
                  </div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Wind className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-600">12 km/h</div>
                  <div className="text-sm text-muted-foreground">
                    {isPunjabi ? 'ਹਵਾ' : isHindi ? 'हवा' : 'Wind Speed'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">
                  {isPunjabi ? 'ਮੌਸਮ ਚੇਤਾਵਨੀਆਂ' : isHindi ? 'मौसम चेतावनियां' : 'Weather Alerts'}
                </h3>
                {weatherAlerts.map((alert) => (
                  <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
                    <div className="flex items-center gap-2">
                      {getAlertIcon(alert.type)}
                      {getImpactIcon(alert.impact)}
                    </div>
                    <AlertTitle>{alert.message}</AlertTitle>
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="text-sm">
                          {isPunjabi ? 'ਪ੍ਰਭਾਵਿਤ ਅਵਸਥਾਵਾਂ:' : isHindi ? 'प्रभावित अवस्थाएं:' : 'Affected Stages:'} {alert.affectedStages.join(', ')}
                        </p>
                        <div>
                          <strong>{isPunjabi ? 'ਸਿਫਾਰਸ਼ਾਂ:' : isHindi ? 'सिफारिशें:' : 'Recommendations:'}</strong>
                          <ul className="list-disc list-inside ml-2 mt-1">
                            {alert.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Tab */}
        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {isPunjabi ? 'ਬਾਜ਼ਾਰ ਸੂਚਨਾ' : isHindi ? 'बाजार सूचना' : 'Market Information'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketAlerts.map((alert) => (
                  <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
                    <div className="flex items-center gap-2">
                      {getAlertIcon(alert.type)}
                      <TrendingUp className={`h-4 w-4 ${alert.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                    </div>
                    <AlertTitle>{alert.message}</AlertTitle>
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              {isPunjabi ? 'ਮੌਜੂਦਾ ਕੀਮਤ:' : isHindi ? 'मौजूदा कीमत:' : 'Current Price:'}
                            </span>
                            <div className="font-semibold">₹{alert.currentPrice}/q</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              {isPunjabi ? 'ਪਿਛਲੀ ਕੀਮਤ:' : isHindi ? 'पिछली कीमत:' : 'Previous Price:'}
                            </span>
                            <div className="font-semibold">₹{alert.previousPrice}/q</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              {isPunjabi ? 'ਬਦਲਾਅ:' : isHindi ? 'बदलाव:' : 'Change:'}
                            </span>
                            <div className={`font-semibold ${alert.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {alert.change > 0 ? '+' : ''}{alert.change}%
                            </div>
                          </div>
                        </div>
                        <div>
                          <strong>{isPunjabi ? 'ਸਿਫਾਰਸ਼ਾਂ:' : isHindi ? 'सिफारिशें:' : 'Recommendations:'}</strong>
                          <ul className="list-disc list-inside ml-2 mt-1">
                            {alert.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {isPunjabi ? 'ਸਾਰੀਆਂ ਚੇਤਾਵਨੀਆਂ' : isHindi ? 'सभी चेतावनियां' : 'All Alerts'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">
                    {isPunjabi ? 'ਮੌਸਮ ਚੇਤਾਵਨੀਆਂ' : isHindi ? 'मौसम चेतावनियां' : 'Weather Alerts'}
                  </h3>
                  <div className="space-y-2">
                    {weatherAlerts.map((alert) => (
                      <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
                        <div className="flex items-center gap-2">
                          {getAlertIcon(alert.type)}
                          {getImpactIcon(alert.impact)}
                        </div>
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{alert.message}</span>
                            <Badge variant="outline">{alert.severity.toUpperCase()}</Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">
                    {isPunjabi ? 'ਬਾਜ਼ਾਰ ਚੇਤਾਵਨੀਆਂ' : isHindi ? 'बाजार चेतावनियां' : 'Market Alerts'}
                  </h3>
                  <div className="space-y-2">
                    {marketAlerts.map((alert) => (
                      <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
                        <div className="flex items-center gap-2">
                          {getAlertIcon(alert.type)}
                          <TrendingUp className={`h-4 w-4 ${alert.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                        </div>
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{alert.message}</span>
                            <Badge variant="outline">{alert.severity.toUpperCase()}</Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnandSaathiPunjabPhenology;

