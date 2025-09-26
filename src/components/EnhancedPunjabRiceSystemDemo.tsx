/**
 * Enhanced Punjab Rice System Demo with TimesFM Integration
 * Showcases the complete integration of Punjab-specific rice system with TimesFM AI capabilities
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  PunjabRiceVariety, 
  PunjabDistrict, 
  punjabRiceVarieties, 
  punjabDistricts,
  getVarietyById,
  getDistrictById
} from '@/data/punjabRiceVarieties';
import { PunjabRiceSystem } from '@/lib/punjabRiceSystem';
import { PunjabTimesFMIntegration, EnhancedFieldAnalysis } from '@/lib/punjabTimesFMIntegration';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Droplets, 
  Sun, 
  Thermometer, 
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  Smartphone,
  MessageSquare,
  Bell,
  Brain,
  Satellite,
  Leaf,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';

interface DemoState {
  selectedVariety: string;
  selectedDistrict: string;
  plantingDate: string;
  systemStatus: any;
  enhancedAnalysis: EnhancedFieldAnalysis | null;
  isSystemRunning: boolean;
  isLoading: boolean;
  timesFMConnected: boolean;
}

export default function EnhancedPunjabRiceSystemDemo() {
  const [demoState, setDemoState] = useState<DemoState>({
    selectedVariety: 'pr-126',
    selectedDistrict: 'ludhiana',
    plantingDate: new Date().toISOString().split('T')[0],
    systemStatus: null,
    enhancedAnalysis: null,
    isSystemRunning: false,
    isLoading: false,
    timesFMConnected: false
  });

  const [punjabSystem, setPunjabSystem] = useState<PunjabRiceSystem | null>(null);
  const [timesFMIntegration, setTimesFMIntegration] = useState<PunjabTimesFMIntegration | null>(null);

  useEffect(() => {
    initializeSystems();
  }, []);

  const initializeSystems = async () => {
    try {
      // Initialize Punjab system
      const punjabSystem = new PunjabRiceSystem({
        phenologyEngine: {
          enabled: true,
          analysisInterval: 5,
          alertThresholds: {
            waterStress: 50,
            pestPressure: 70,
            diseaseIncidence: 60
          }
        },
        governmentAPI: {
          enabled: true,
          syncInterval: 1,
          districts: ['amritsar', 'ludhiana', 'patiala', 'sangrur', 'bathinda']
        },
        alertSystem: {
          enabled: true,
          channels: ['sms', 'whatsapp', 'push'],
          quietHours: true
        }
      });

      await punjabSystem.initialize();
      setPunjabSystem(punjabSystem);

      // Initialize TimesFM integration
      const integration = new PunjabTimesFMIntegration(punjabSystem, {
        backendUrl: 'https://timesfm.onrender.com',
        apiKey: import.meta.env.VITE_TIMESFM_API_KEY || '',
        endpoints: {
          yieldPrediction: '/api/yield-prediction',
          satelliteData: '/api/satellite-data',
          soilAnalysis: '/api/soil-analysis',
          weatherData: '/api/weather-data',
          marketIntelligence: '/api/market-intelligence'
        }
      });

      setTimesFMIntegration(integration);
      setDemoState(prev => ({
        ...prev,
        systemStatus: punjabSystem.getSystemStatus(),
        timesFMConnected: true
      }));

    } catch (error) {
      console.error('Failed to initialize systems:', error);
    }
  };

  const startEnhancedAnalysis = async () => {
    if (!punjabSystem || !timesFMIntegration) return;

    setDemoState(prev => ({ ...prev, isLoading: true }));

    try {
      const fieldId = `enhanced_field_${Date.now()}`;
      const plantingDate = new Date(demoState.plantingDate);

      // Add field to Punjab system
      await punjabSystem.addField(
        fieldId,
        demoState.selectedVariety,
        demoState.selectedDistrict,
        plantingDate,
        {
          id: 'demo_farmer',
          name: 'ਗੁਰਦੀਪ ਸਿੰਘ (Gurdeep Singh)',
          phone: '+91 9876543210',
          language: 'punjabi',
          district: demoState.selectedDistrict,
          preferredChannels: ['sms', 'whatsapp'],
          alertPreferences: {
            phenology: true,
            pest: true,
            disease: true,
            weather: true,
            government: true,
            market: true
          },
          quietHours: {
            start: '22:00',
            end: '06:00',
            enabled: true
          },
          timezone: 'Asia/Kolkata'
        }
      );

      // Get enhanced analysis
      const enhancedAnalysis = await timesFMIntegration.getEnhancedFieldAnalysis(fieldId);
      
      setDemoState(prev => ({
        ...prev,
        enhancedAnalysis,
        isSystemRunning: true,
        isLoading: false
      }));

    } catch (error) {
      console.error('Failed to start enhanced analysis:', error);
      setDemoState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const selectedVariety = getVarietyById(demoState.selectedVariety);
  const selectedDistrict = getDistrictById(demoState.selectedDistrict);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-green-800">
          ਪੰਜਾਬ ਰਾਈਸ ਸਿਸਟਮ + TimesFM AI (Enhanced Punjab Rice System)
        </h1>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto">
          Advanced rice phenology monitoring system combining Punjab-specific agricultural intelligence 
          with TimesFM's cutting-edge AI capabilities. Features real-time yield prediction, satellite analysis, 
          soil health monitoring, and market intelligence.
        </p>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Punjab System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {demoState.systemStatus?.overall?.toUpperCase() || 'INITIALIZING'}
            </div>
            <div className="text-xs text-gray-600">Overall Status</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4 text-blue-600" />
              TimesFM AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {demoState.timesFMConnected ? 'CONNECTED' : 'CONNECTING...'}
            </div>
            <div className="text-xs text-gray-600">AI Engine Status</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-purple-600" />
              Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {demoState.enhancedAnalysis ? 'ACTIVE' : 'READY'}
            </div>
            <div className="text-xs text-gray-600">Enhanced Analysis</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Field Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Field Configuration</CardTitle>
            <CardDescription>
              Configure your rice field for enhanced AI monitoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rice Variety</label>
              <select
                value={demoState.selectedVariety}
                onChange={(e) => setDemoState(prev => ({ ...prev, selectedVariety: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                {punjabRiceVarieties.map(variety => (
                  <option key={variety.id} value={variety.id}>
                    {variety.name} ({variety.localName}) - {variety.maturityDays} days
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">District</label>
              <select
                value={demoState.selectedDistrict}
                onChange={(e) => setDemoState(prev => ({ ...prev, selectedDistrict: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                {punjabDistricts.map(district => (
                  <option key={district.id} value={district.id}>
                    {district.name} ({district.localName}) - {district.region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Planting Date</label>
              <input
                type="date"
                value={demoState.plantingDate}
                onChange={(e) => setDemoState(prev => ({ ...prev, plantingDate: e.target.value }))}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <Button 
              onClick={startEnhancedAnalysis}
              disabled={demoState.isSystemRunning || demoState.isLoading}
              className="w-full"
            >
              {demoState.isLoading ? 'Analyzing...' : 
               demoState.isSystemRunning ? 'Enhanced Analysis Active' : 
               'Start Enhanced AI Analysis'}
            </Button>
          </CardContent>
        </Card>

        {/* Variety Information */}
        {selectedVariety && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedVariety.name} ({selectedVariety.localName})</CardTitle>
              <CardDescription>Rice variety specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Maturity Days</div>
                  <div className="text-lg font-semibold">{selectedVariety.maturityDays}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Avg Yield</div>
                  <div className="text-lg font-semibold">{selectedVariety.avgYield} q/acre</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Water Requirement</div>
                  <Badge variant={selectedVariety.waterRequirement === 'low' ? 'default' : 'destructive'}>
                    {selectedVariety.waterRequirement}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <Badge variant={selectedVariety.banned ? 'destructive' : 'default'}>
                    {selectedVariety.banned ? 'Banned' : 'Approved'}
                  </Badge>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-2">Disease Resistance</div>
                <div className="flex flex-wrap gap-1">
                  {selectedVariety.diseaseResistance.map(disease => (
                    <Badge key={disease} variant="secondary" className="text-xs">
                      {disease}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced Analysis Dashboard */}
      {demoState.enhancedAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Enhanced AI Analysis Dashboard</CardTitle>
            <CardDescription>
              Comprehensive analysis combining Punjab phenology with TimesFM AI predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="phenology">Phenology</TabsTrigger>
                <TabsTrigger value="ai-predictions">AI Predictions</TabsTrigger>
                <TabsTrigger value="satellite">Satellite</TabsTrigger>
                <TabsTrigger value="soil">Soil</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {demoState.enhancedAnalysis.performanceMetrics.overallScore}
                    </div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {demoState.enhancedAnalysis.performanceMetrics.yieldImprovement}%
                    </div>
                    <div className="text-sm text-gray-600">Yield Improvement</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Droplets className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-cyan-600">
                      {demoState.enhancedAnalysis.performanceMetrics.waterEfficiency}%
                    </div>
                    <div className="text-sm text-gray-600">Water Efficiency</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">
                      ₹{demoState.enhancedAnalysis.performanceMetrics.costSavings.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Cost Savings</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="phenology" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {demoState.enhancedAnalysis.phenologyData.currentStage}
                    </div>
                    <div className="text-sm text-gray-600">Current Stage</div>
                    <Progress value={demoState.enhancedAnalysis.phenologyData.stageProgress} className="mt-2" />
                    <div className="text-xs text-gray-500 mt-1">
                      {demoState.enhancedAnalysis.phenologyData.stageProgress}% Complete
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {demoState.enhancedAnalysis.phenologyData.daysInStage}
                    </div>
                    <div className="text-sm text-gray-600">Days in Stage</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Health: {demoState.enhancedAnalysis.phenologyData.healthStatus}
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {demoState.enhancedAnalysis.phenologyData.expectedDaysRemaining}
                    </div>
                    <div className="text-sm text-gray-600">Days Remaining</div>
                    <div className="text-xs text-gray-500 mt-1">Next stage transition</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai-predictions" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {demoState.enhancedAnalysis.timesFMPredictions.yieldPrediction.tonsPerAcre}
                    </div>
                    <div className="text-sm text-gray-600">Tons/Acre</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Confidence: {Math.round(demoState.enhancedAnalysis.timesFMPredictions.yieldPrediction.confidence * 100)}%
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {demoState.enhancedAnalysis.timesFMPredictions.yieldPrediction.scenarios.optimal}
                    </div>
                    <div className="text-sm text-gray-600">Optimal Scenario</div>
                    <div className="text-xs text-gray-500 mt-1">Best case yield</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {demoState.enhancedAnalysis.timesFMPredictions.yieldPrediction.scenarios.drought}
                    </div>
                    <div className="text-sm text-gray-600">Drought Scenario</div>
                    <div className="text-xs text-gray-500 mt-1">Worst case yield</div>
                  </div>
                </div>

                {demoState.enhancedAnalysis.timesFMPredictions.riskFactors.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Risk Factors</h4>
                    <div className="space-y-2">
                      {demoState.enhancedAnalysis.timesFMPredictions.riskFactors.slice(0, 3).map((risk, index) => (
                        <Alert key={index} variant={risk.severity === 'critical' ? 'destructive' : 'default'}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>{risk.factor}</AlertTitle>
                          <AlertDescription>
                            {risk.impact} - {risk.recommendation}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="satellite" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Satellite className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {demoState.enhancedAnalysis.satelliteAnalysis.ndvi}
                    </div>
                    <div className="text-sm text-gray-600">NDVI</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Droplets className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {demoState.enhancedAnalysis.satelliteAnalysis.ndwi}
                    </div>
                    <div className="text-sm text-gray-600">NDWI</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Leaf className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {demoState.enhancedAnalysis.satelliteAnalysis.cropHealth}
                    </div>
                    <div className="text-sm text-gray-600">Crop Health</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Clock className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-600">
                      {demoState.enhancedAnalysis.satelliteAnalysis.lastUpdate.toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">Last Update</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="soil" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {demoState.enhancedAnalysis.soilAnalysis.ph}
                    </div>
                    <div className="text-sm text-gray-600">pH Level</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {demoState.enhancedAnalysis.soilAnalysis.organicMatter}%
                    </div>
                    <div className="text-sm text-gray-600">Organic Matter</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {demoState.enhancedAnalysis.soilAnalysis.nitrogen}
                    </div>
                    <div className="text-sm text-gray-600">Nitrogen (kg/ha)</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {demoState.enhancedAnalysis.soilAnalysis.healthScore}
                    </div>
                    <div className="text-sm text-gray-600">Health Score</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div className="space-y-4">
                  {demoState.enhancedAnalysis.integratedRecommendations.slice(0, 5).map((rec, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{rec.title}</h4>
                              <Badge variant={rec.priority === 'critical' ? 'destructive' : 
                                        rec.priority === 'high' ? 'default' : 'secondary'}>
                                {rec.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{rec.description}</p>
                            <p className="text-sm text-gray-500">{rec.localDescription}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Cost: ₹{rec.estimatedCost.toLocaleString()}</span>
                              <span>Window: {rec.implementationWindow}</span>
                            </div>
                          </div>
                          <Button size="sm">Implement</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Technology Stack Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Integrated Technology Stack</CardTitle>
          <CardDescription>
            Combining Punjab agricultural intelligence with cutting-edge AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold">TimesFM AI</div>
              <div className="text-sm text-gray-600">Google's forecasting model</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Satellite className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold">Satellite Data</div>
              <div className="text-sm text-gray-600">Real-time NDVI analysis</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Leaf className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold">Soil Analysis</div>
              <div className="text-sm text-gray-600">Comprehensive health monitoring</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="font-semibold">Market Intelligence</div>
              <div className="text-sm text-gray-600">Price optimization</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
