/**
 * Anand Saathi Market Analysis Component
 * Advanced market intelligence and trading insights
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
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target, 
  CheckCircle,
  AlertTriangle,
  Info,
  MapPin,
  DollarSign,
  Calendar,
  Zap,
  Activity,
  FileText,
  Globe,
  ShoppingCart,
  PieChart,
  LineChart
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { anandSaathiBackend, FieldData } from '@/lib/anandSaathiBackend';
import { toast } from 'sonner';

interface MarketPrice {
  id: string;
  commodity: string;
  currentPrice: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  unit: string;
  market: string;
  timestamp: string;
  trend: 'up' | 'down' | 'stable';
}

interface MarketAnalysis {
  id: string;
  commodity: string;
  analysis: {
    trend: 'bullish' | 'bearish' | 'neutral';
    support: number;
    resistance: number;
    volatility: number;
    recommendation: 'buy' | 'sell' | 'hold';
    confidence: number;
  };
  forecast: {
    shortTerm: number;
    mediumTerm: number;
    longTerm: number;
  };
  factors: {
    weather: number;
    demand: number;
    supply: number;
    policy: number;
  };
  createdAt: string;
}

interface TradingInsight {
  id: string;
  commodity: string;
  insight: string;
  impact: 'high' | 'medium' | 'low';
  timeframe: 'immediate' | 'short' | 'medium' | 'long';
  source: string;
  confidence: number;
  createdAt: string;
}

interface MarketAnalysisProps {
  fieldData?: FieldData;
  onAnalysisGenerated?: (analysis: MarketAnalysis) => void;
}

export const AnandSaathiMarketAnalysis: React.FC<MarketAnalysisProps> = ({
  fieldData,
  onAnalysisGenerated
}) => {
  const { t, language, isPunjabi, isHindi } = useTranslation();
  const [activeTab, setActiveTab] = useState('prices');
  const [isLoading, setIsLoading] = useState(false);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [marketAnalyses, setMarketAnalyses] = useState<MarketAnalysis[]>([]);
  const [tradingInsights, setTradingInsights] = useState<TradingInsight[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');

  // Form state
  const [analysisForm, setAnalysisForm] = useState({
    commodity: '',
    timeframe: '30',
    analysisType: 'comprehensive'
  });

  // Commodity database
  const commodityDatabase = {
    'Rice': { unit: 'quintal', markets: ['Mandi', 'APMC', 'Private'], basePrice: 2500 },
    'Wheat': { unit: 'quintal', markets: ['Mandi', 'APMC', 'Private'], basePrice: 2200 },
    'Maize': { unit: 'quintal', markets: ['Mandi', 'APMC', 'Private'], basePrice: 1800 },
    'Cotton': { unit: 'quintal', markets: ['Mandi', 'APMC', 'Private'], basePrice: 6000 },
    'Sugarcane': { unit: 'quintal', markets: ['Mandi', 'APMC', 'Private'], basePrice: 350 },
    'Potato': { unit: 'quintal', markets: ['Mandi', 'APMC', 'Private'], basePrice: 1200 },
    'Tomato': { unit: 'quintal', markets: ['Mandi', 'APMC', 'Private'], basePrice: 2000 },
    'Onion': { unit: 'quintal', markets: ['Mandi', 'APMC', 'Private'], basePrice: 1500 }
  };

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    setIsLoading(true);
    try {
      // Mock market prices
      const mockPrices: MarketPrice[] = [
        {
          id: '1',
          commodity: 'Rice',
          currentPrice: 2650,
          previousPrice: 2500,
          change: 150,
          changePercent: 6.0,
          unit: 'quintal',
          market: 'Mandi',
          timestamp: new Date().toISOString(),
          trend: 'up'
        },
        {
          id: '2',
          commodity: 'Wheat',
          currentPrice: 2100,
          previousPrice: 2200,
          change: -100,
          changePercent: -4.5,
          unit: 'quintal',
          market: 'APMC',
          timestamp: new Date().toISOString(),
          trend: 'down'
        },
        {
          id: '3',
          commodity: 'Maize',
          currentPrice: 1850,
          previousPrice: 1800,
          change: 50,
          changePercent: 2.8,
          unit: 'quintal',
          market: 'Private',
          timestamp: new Date().toISOString(),
          trend: 'up'
        }
      ];

      // Mock market analyses
      const mockAnalyses: MarketAnalysis[] = [
        {
          id: '1',
          commodity: 'Rice',
          analysis: {
            trend: 'bullish',
            support: 2400,
            resistance: 2800,
            volatility: 15.5,
            recommendation: 'buy',
            confidence: 85
          },
          forecast: {
            shortTerm: 2700,
            mediumTerm: 2900,
            longTerm: 3200
          },
          factors: {
            weather: 80,
            demand: 75,
            supply: 60,
            policy: 70
          },
          createdAt: '2024-09-24'
        }
      ];

      // Mock trading insights
      const mockInsights: TradingInsight[] = [
        {
          id: '1',
          commodity: 'Rice',
          insight: 'Monsoon delay expected to impact rice production in key states',
          impact: 'high',
          timeframe: 'medium',
          source: 'Weather Department',
          confidence: 90,
          createdAt: '2024-09-24'
        },
        {
          id: '2',
          commodity: 'Wheat',
          insight: 'Government procurement targets increased for current season',
          impact: 'medium',
          timeframe: 'short',
          source: 'Government Policy',
          confidence: 85,
          createdAt: '2024-09-24'
        }
      ];

      setMarketPrices(mockPrices);
      setMarketAnalyses(mockAnalyses);
      setTradingInsights(mockInsights);
    } catch (error) {
      console.error('Error loading market data:', error);
      toast.error(isPunjabi ? 'ਮਾਰਕੀਟ ਡੇਟਾ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ' : isHindi ? 'मार्केट डेटा लोड करने में त्रुटि' : 'Error loading market data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMarketAnalysis = async () => {
    if (!analysisForm.commodity) {
      toast.error(isPunjabi ? 'ਕਿਰਪਾ ਕਰਕੇ ਕਮੋਡਿਟੀ ਚੁਣੋ' : isHindi ? 'कृपया कमोडिटी चुनें' : 'Please select a commodity');
      return;
    }

    setIsLoading(true);
    try {
      const commodity = analysisForm.commodity;
      const basePrice = commodityDatabase[commodity as keyof typeof commodityDatabase]?.basePrice || 2000;
      
      // Generate market analysis
      const newAnalysis: MarketAnalysis = {
        id: Date.now().toString(),
        commodity: commodity,
        analysis: {
          trend: Math.random() > 0.5 ? 'bullish' : 'bearish',
          support: basePrice * 0.9,
          resistance: basePrice * 1.2,
          volatility: 10 + Math.random() * 20,
          recommendation: Math.random() > 0.5 ? 'buy' : 'sell',
          confidence: 70 + Math.random() * 25
        },
        forecast: {
          shortTerm: basePrice * (0.95 + Math.random() * 0.1),
          mediumTerm: basePrice * (1.0 + Math.random() * 0.2),
          longTerm: basePrice * (1.1 + Math.random() * 0.3)
        },
        factors: {
          weather: 60 + Math.random() * 30,
          demand: 50 + Math.random() * 40,
          supply: 40 + Math.random() * 50,
          policy: 70 + Math.random() * 20
        },
        createdAt: new Date().toISOString()
      };

      setMarketAnalyses(prev => [newAnalysis, ...prev]);
      
      if (onAnalysisGenerated) {
        onAnalysisGenerated(newAnalysis);
      }

      toast.success(isPunjabi ? 'ਮਾਰਕੀਟ ਵਿਸ਼ਲੇਸ਼ਣ ਤਿਆਰ ਹੋਇਆ' : isHindi ? 'मार्केट विश्लेषण तैयार हुआ' : 'Market analysis generated');
    } catch (error) {
      console.error('Error generating market analysis:', error);
      toast.error(isPunjabi ? 'ਮਾਰਕੀਟ ਵਿਸ਼ਲੇਸ਼ਣ ਵਿੱਚ ਗਲਤੀ' : isHindi ? 'मार्केट विश्लेषण में त्रुटि' : 'Error in market analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setAnalysisForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingDown className="h-4 w-4" />;
      case 'stable': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'buy': return 'bg-green-100 text-green-800';
      case 'sell': return 'bg-red-100 text-red-800';
      case 'hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isPunjabi ? 'ਮਾਰਕੀਟ ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'मार्केट विश्लेषण' : 'Market Analysis'}
              </h1>
              <p className="text-gray-600">
                {isPunjabi ? 'ਉੱਨਤ ਮਾਰਕੀਟ ਇੰਟੈਲੀਜੈਂਸ ਅਤੇ ਟ੍ਰੇਡਿੰਗ ਇਨਸਾਈਟਸ' : isHindi ? 'उन्नत मार्केट इंटेलिजेंस और ट्रेडिंग इनसाइट्स' : 'Advanced market intelligence and trading insights'}
              </p>
            </div>
          </div>

          {/* Field Info */}
          {fieldData && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <MapPin className="h-5 w-5 text-purple-600" />
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
            <TabsTrigger value="prices">
              {isPunjabi ? 'ਕੀਮਤਾਂ' : isHindi ? 'कीमतें' : 'Prices'}
            </TabsTrigger>
            <TabsTrigger value="analysis">
              {isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'विश्लेषण' : 'Analysis'}
            </TabsTrigger>
            <TabsTrigger value="insights">
              {isPunjabi ? 'ਇਨਸਾਈਟਸ' : isHindi ? 'इनसाइट्स' : 'Insights'}
            </TabsTrigger>
            <TabsTrigger value="forecast">
              {isPunjabi ? 'ਪੂਰਵਾਨੁਮਾਨ' : isHindi ? 'पूर्वानुमान' : 'Forecast'}
            </TabsTrigger>
            <TabsTrigger value="trading">
              {isPunjabi ? 'ਟ੍ਰੇਡਿੰਗ' : isHindi ? 'ट्रेडिंग' : 'Trading'}
            </TabsTrigger>
          </TabsList>

          {/* Prices Tab */}
          <TabsContent value="prices" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Market Prices */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    {isPunjabi ? 'ਮਾਰਕੀਟ ਕੀਮਤਾਂ' : isHindi ? 'मार्केट कीमतें' : 'Market Prices'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketPrices.map((price) => (
                      <div key={price.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{price.commodity}</h4>
                            <p className="text-sm text-gray-600">{price.market} • {price.unit}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">₹{price.currentPrice}</div>
                            <div className={`flex items-center gap-1 text-sm ${getTrendColor(price.trend)}`}>
                              {getTrendIcon(price.trend)}
                              <span>{price.change > 0 ? '+' : ''}{price.changePercent.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(price.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Price Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-blue-600" />
                    {isPunjabi ? 'ਕੀਮਤ ਰੁਝਾਨ' : isHindi ? 'कीमत रुझान' : 'Price Trends'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketPrices.map((price) => (
                      <div key={price.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{price.commodity}</span>
                          <Badge variant="outline">₹{price.currentPrice}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-1 ${getTrendColor(price.trend)}`}>
                            {getTrendIcon(price.trend)}
                            <span className="text-sm">
                              {price.change > 0 ? '+' : ''}₹{price.change}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            ({price.change > 0 ? '+' : ''}{price.changePercent.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Generate Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    {isPunjabi ? 'ਮਾਰਕੀਟ ਵਿਸ਼ਲੇਸ਼ਣ ਤਿਆਰ ਕਰੋ' : isHindi ? 'मार्केट विश्लेषण तैयार करें' : 'Generate Market Analysis'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="commodity">{isPunjabi ? 'ਕਮੋਡਿਟੀ' : isHindi ? 'कमोडिटी' : 'Commodity'}</Label>
                    <Select value={analysisForm.commodity} onValueChange={(value) => handleInputChange('commodity', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={isPunjabi ? 'ਕਮੋਡਿਟੀ ਚੁਣੋ' : isHindi ? 'कमोडिटी चुनें' : 'Select Commodity'} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(commodityDatabase).map((commodity) => (
                          <SelectItem key={commodity} value={commodity}>{commodity}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="timeframe">{isPunjabi ? 'ਸਮਾਂ ਸੀਮਾ (ਦਿਨ)' : isHindi ? 'समय सीमा (दिन)' : 'Timeframe (Days)'}</Label>
                    <Select value={analysisForm.timeframe} onValueChange={(value) => handleInputChange('timeframe', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 {isPunjabi ? 'ਦਿਨ' : isHindi ? 'दिन' : 'days'}</SelectItem>
                        <SelectItem value="30">30 {isPunjabi ? 'ਦਿਨ' : isHindi ? 'दिन' : 'days'}</SelectItem>
                        <SelectItem value="90">90 {isPunjabi ? 'ਦਿਨ' : isHindi ? 'दिन' : 'days'}</SelectItem>
                        <SelectItem value="365">365 {isPunjabi ? 'ਦਿਨ' : isHindi ? 'दिन' : 'days'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={generateMarketAnalysis}
                    disabled={isLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {isLoading 
                      ? (isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਿਹਾ ਹੈ...' : isHindi ? 'विश्लेषण कर रहा है...' : 'Analyzing...')
                      : (isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ ਤਿਆਰ ਕਰੋ' : isHindi ? 'विश्लेषण तैयार करें' : 'Generate Analysis')
                    }
                  </Button>
                </CardContent>
              </Card>

              {/* Analysis Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    {isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ ਨਤੀਜੇ' : isHindi ? 'विश्लेषण नतीजे' : 'Analysis Results'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {marketAnalyses.length > 0 ? (
                    <div className="space-y-4">
                      {marketAnalyses.map((analysis) => (
                        <div key={analysis.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium">{analysis.commodity}</h4>
                            <Badge className={getRecommendationColor(analysis.analysis.recommendation)}>
                              {analysis.analysis.recommendation.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">{isPunjabi ? 'ਰੁਝਾਨ:' : isHindi ? 'रुझान:' : 'Trend:'}</span>
                              <span className="ml-1 font-medium">{analysis.analysis.trend}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">{isPunjabi ? 'ਵੋਲੈਟਿਲਿਟੀ:' : isHindi ? 'वोलैटिलिटी:' : 'Volatility:'}</span>
                              <span className="ml-1 font-medium">{analysis.analysis.volatility.toFixed(1)}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600">{isPunjabi ? 'ਸਹਾਇਤਾ:' : isHindi ? 'सहायता:' : 'Support:'}</span>
                              <span className="ml-1 font-medium">₹{analysis.analysis.support}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">{isPunjabi ? 'ਪ੍ਰਤੀਰੋਧ:' : isHindi ? 'प्रतिरोध:' : 'Resistance:'}</span>
                              <span className="ml-1 font-medium">₹{analysis.analysis.resistance}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {isPunjabi ? 'ਕੋਈ ਵਿਸ਼ਲੇਸ਼ਣ ਨਹੀਂ ਮਿਲਿਆ' : isHindi ? 'कोई विश्लेषण नहीं मिला' : 'No Analysis Found'}
                      </h3>
                      <p className="text-gray-600">
                        {isPunjabi ? 'ਪਹਿਲਾਂ ਮਾਰਕੀਟ ਵਿਸ਼ਲੇਸ਼ਣ ਤਿਆਰ ਕਰੋ' : isHindi ? 'पहले मार्केट विश्लेषण तैयार करें' : 'Generate market analysis first'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  {isPunjabi ? 'ਟ੍ਰੇਡਿੰਗ ਇਨਸਾਈਟਸ' : isHindi ? 'ट्रेडिंग इनसाइट्स' : 'Trading Insights'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tradingInsights.map((insight) => (
                    <div key={insight.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{insight.commodity}</h4>
                          <p className="text-sm text-gray-600">{insight.source}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getImpactColor(insight.impact)}>
                            {insight.impact.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {insight.timeframe.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{insight.insight}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {new Date(insight.createdAt).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {insight.confidence}% {isPunjabi ? 'ਵਿਸ਼ਵਾਸ' : isHindi ? 'विश्वास' : 'confidence'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast" className="space-y-6">
            {marketAnalyses.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {marketAnalyses.map((analysis) => (
                  <Card key={analysis.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        {analysis.commodity} {isPunjabi ? 'ਪੂਰਵਾਨੁਮਾਨ' : isHindi ? 'पूर्वानुमान' : 'Forecast'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">{isPunjabi ? 'ਛੋਟੀ ਮਿਆਦ' : isHindi ? 'छोटी मियाद' : 'Short Term'}</div>
                          <div className="text-xl font-bold text-blue-600">₹{analysis.forecast.shortTerm.toFixed(0)}</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">{isPunjabi ? 'ਮੱਧਮ ਮਿਆਦ' : isHindi ? 'मध्यम मियाद' : 'Medium Term'}</div>
                          <div className="text-xl font-bold text-green-600">₹{analysis.forecast.mediumTerm.toFixed(0)}</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-sm text-gray-600 mb-1">{isPunjabi ? 'ਲੰਬੀ ਮਿਆਦ' : isHindi ? 'लंबी मियाद' : 'Long Term'}</div>
                          <div className="text-xl font-bold text-purple-600">₹{analysis.forecast.longTerm.toFixed(0)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isPunjabi ? 'ਕੋਈ ਪੂਰਵਾਨੁਮਾਨ ਨਹੀਂ ਮਿਲਿਆ' : isHindi ? 'कोई पूर्वानुमान नहीं मिला' : 'No Forecast Found'}
                  </h3>
                  <p className="text-gray-600">
                    {isPunjabi ? 'ਪਹਿਲਾਂ ਮਾਰਕੀਟ ਵਿਸ਼ਲੇਸ਼ਣ ਤਿਆਰ ਕਰੋ' : isHindi ? 'पहले मार्केट विश्लेषण तैयार करें' : 'Generate market analysis first'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Trading Tab */}
          <TabsContent value="trading" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                    {isPunjabi ? 'ਖਰੀਦਦਾਰੀ ਸਿਫਾਰਸ਼ਾਂ' : isHindi ? 'खरीदारी सिफारिशें' : 'Buying Recommendations'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {marketAnalyses.filter(a => a.analysis.recommendation === 'buy').map((analysis) => (
                      <div key={analysis.id} className="p-3 bg-green-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{analysis.commodity}</span>
                          <Badge className="bg-green-100 text-green-800">BUY</Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {isPunjabi ? 'ਵਿਸ਼ਵਾਸ:' : isHindi ? 'विश्वास:' : 'Confidence:'} {analysis.analysis.confidence.toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    {isPunjabi ? 'ਵਿਕਰੀ ਸਿਫਾਰਸ਼ਾਂ' : isHindi ? 'विक्री सिफारिशें' : 'Selling Recommendations'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {marketAnalyses.filter(a => a.analysis.recommendation === 'sell').map((analysis) => (
                      <div key={analysis.id} className="p-3 bg-red-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{analysis.commodity}</span>
                          <Badge className="bg-red-100 text-red-800">SELL</Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {isPunjabi ? 'ਵਿਸ਼ਵਾਸ:' : isHindi ? 'विश्वास:' : 'Confidence:'} {analysis.analysis.confidence.toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnandSaathiMarketAnalysis;
