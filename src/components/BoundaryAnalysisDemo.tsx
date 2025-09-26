/**
 * Boundary Analysis Demo Component
 * Showcases the Punjab rice system with enhanced boundary analysis capabilities
 * Demonstrates field edge effects, stress indicators, and boundary-specific recommendations
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
import { PunjabBoundaryIntegration, EnhancedFieldAnalysis } from '@/lib/punjabBoundaryIntegration';
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
  Zap,
  Shield,
  TreePine,
  Waves,
  Bug,
  Mountain,
  Droplet,
  Lightbulb
} from 'lucide-react';

interface DemoState {
  selectedVariety: string;
  selectedDistrict: string;
  plantingDate: string;
  systemStatus: any;
  enhancedAnalysis: EnhancedFieldAnalysis | null;
  isSystemRunning: boolean;
  isLoading: boolean;
  boundaryAnalysisActive: boolean;
}

export default function BoundaryAnalysisDemo() {
  const [demoState, setDemoState] = useState<DemoState>({
    selectedVariety: 'pr-126',
    selectedDistrict: 'ludhiana',
    plantingDate: new Date().toISOString().split('T')[0],
    systemStatus: null,
    enhancedAnalysis: null,
    isSystemRunning: false,
    isLoading: false,
    boundaryAnalysisActive: false
  });

  const [punjabSystem, setPunjabSystem] = useState<PunjabRiceSystem | null>(null);
  const [boundaryIntegration, setBoundaryIntegration] = useState<PunjabBoundaryIntegration | null>(null);

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

      // Initialize boundary integration
      const integration = new PunjabBoundaryIntegration(punjabSystem, {
        analysisInterval: 30,
        alertThresholds: {
          boundaryHealth: 60,
          pestPressure: 70,
          erosionRisk: 70,
          waterManagement: 'needs_attention'
        },
        enableBoundaryAlerts: true,
        enableBoundaryRecommendations: true
      });

      setBoundaryIntegration(integration);
      setDemoState(prev => ({
        ...prev,
        systemStatus: punjabSystem.getSystemStatus(),
        boundaryAnalysisActive: true
      }));

    } catch (error) {
      console.error('Failed to initialize systems:', error);
    }
  };

  const startBoundaryAnalysis = async () => {
    if (!punjabSystem || !boundaryIntegration) return;

    setDemoState(prev => ({ ...prev, isLoading: true }));

    try {
      const fieldId = `boundary_field_${Date.now()}`;
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

      // Get enhanced analysis with boundary intelligence
      const enhancedAnalysis = await boundaryIntegration.getEnhancedFieldAnalysis(fieldId);
      
      setDemoState(prev => ({
        ...prev,
        enhancedAnalysis,
        isSystemRunning: true,
        isLoading: false
      }));

    } catch (error) {
      console.error('Failed to start boundary analysis:', error);
      setDemoState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const selectedVariety = getVarietyById(demoState.selectedVariety);
  const selectedDistrict = getDistrictById(demoState.selectedDistrict);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-green-800">
          ਪੰਜਾਬ ਰਾਈਸ ਸਿਸਟਮ + ਬਾਉਂਡਰੀ ਐਨਾਲਿਸਿਸ (Punjab Rice System + Boundary Analysis)
        </h1>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto">
          Advanced rice phenology monitoring system with comprehensive field boundary analysis. 
          Addresses critical edge effects, stress indicators, and provides boundary-specific recommendations 
          for optimal rice cultivation in Punjab.
        </p>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Shield className="h-4 w-4 text-blue-600" />
              Boundary Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {demoState.boundaryAnalysisActive ? 'ACTIVE' : 'INACTIVE'}
            </div>
            <div className="text-xs text-gray-600">Edge Monitoring</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-purple-600" />
              Field Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {demoState.enhancedAnalysis ? 
                `${demoState.enhancedAnalysis.performanceMetrics.overallHealth}%` : 
                'N/A'
              }
            </div>
            <div className="text-xs text-gray-600">Overall Health</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-orange-600" />
              Risk Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {demoState.enhancedAnalysis?.performanceMetrics.riskLevel?.toUpperCase() || 'N/A'}
            </div>
            <div className="text-xs text-gray-600">Current Risk</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Field Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Field Configuration</CardTitle>
            <CardDescription>
              Configure your rice field for boundary analysis
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
              onClick={startBoundaryAnalysis}
              disabled={demoState.isSystemRunning || demoState.isLoading}
              className="w-full"
            >
              {demoState.isLoading ? 'Analyzing Boundaries...' : 
               demoState.isSystemRunning ? 'Boundary Analysis Active' : 
               'Start Boundary Analysis'}
            </Button>
          </CardContent>
        </Card>

        {/* Boundary Health Overview */}
        {demoState.enhancedAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle>Boundary Health Overview</CardTitle>
              <CardDescription>Field edge analysis and health indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {demoState.enhancedAnalysis.performanceMetrics.boundaryHealth}%
                  </div>
                  <div className="text-sm text-gray-600">Boundary Health</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {demoState.enhancedAnalysis.boundaryAnalysis.edgeStressLevel.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600">Edge Stress</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {demoState.enhancedAnalysis.boundaryAnalysis.pestPressure}%
                  </div>
                  <div className="text-sm text-gray-600">Pest Pressure</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {demoState.enhancedAnalysis.boundaryAnalysis.erosionRisk}%
                  </div>
                  <div className="text-sm text-gray-600">Erosion Risk</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Water Management</span>
                  <Badge variant={
                    demoState.enhancedAnalysis.boundaryAnalysis.waterManagement === 'optimal' ? 'default' :
                    demoState.enhancedAnalysis.boundaryAnalysis.waterManagement === 'needs_attention' ? 'secondary' : 'destructive'
                  }>
                    {demoState.enhancedAnalysis.boundaryAnalysis.waterManagement}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Nutrient Competition</span>
                  <span>{demoState.enhancedAnalysis.boundaryAnalysis.nutrientCompetition}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shading Impact</span>
                  <span>{demoState.enhancedAnalysis.boundaryAnalysis.shadingImpact}%</span>
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
            <CardTitle>Enhanced Field Analysis with Boundary Intelligence</CardTitle>
            <CardDescription>
              Comprehensive analysis combining phenology monitoring with boundary edge effects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="boundary">Boundary</TabsTrigger>
                <TabsTrigger value="phenology">Phenology</TabsTrigger>
                <TabsTrigger value="risks">Risks</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {demoState.enhancedAnalysis.performanceMetrics.overallHealth}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Health</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {demoState.enhancedAnalysis.performanceMetrics.boundaryHealth}%
                    </div>
                    <div className="text-sm text-gray-600">Boundary Health</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">
                      {demoState.enhancedAnalysis.performanceMetrics.yieldPotential}%
                    </div>
                    <div className="text-sm text-gray-600">Yield Potential</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-600">
                      ₹{demoState.enhancedAnalysis.performanceMetrics.costSavings.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Cost Savings</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="boundary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TreePine className="h-5 w-5" />
                        Vegetation Indices
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Edge NDVI</span>
                        <span className="font-semibold">{demoState.enhancedAnalysis.boundaryAnalysis.vegetationIndices.edgeNDVI.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Center NDVI</span>
                        <span className="font-semibold">{demoState.enhancedAnalysis.boundaryAnalysis.vegetationIndices.centerNDVI.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>NDVI Gradient</span>
                        <span className="font-semibold">{demoState.enhancedAnalysis.boundaryAnalysis.vegetationIndices.ndviGradient.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vegetation Density</span>
                        <span className="font-semibold">{demoState.enhancedAnalysis.boundaryAnalysis.vegetationIndices.vegetationDensity.toFixed(1)}%</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Waves className="h-5 w-5" />
                        Boundary Conditions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Edge Stress Level</span>
                        <Badge variant={
                          demoState.enhancedAnalysis.boundaryAnalysis.edgeStressLevel === 'low' ? 'default' :
                          demoState.enhancedAnalysis.boundaryAnalysis.edgeStressLevel === 'medium' ? 'secondary' :
                          demoState.enhancedAnalysis.boundaryAnalysis.edgeStressLevel === 'high' ? 'destructive' : 'destructive'
                        }>
                          {demoState.enhancedAnalysis.boundaryAnalysis.edgeStressLevel}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Pest Pressure</span>
                        <span className="font-semibold">{demoState.enhancedAnalysis.boundaryAnalysis.pestPressure}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Erosion Risk</span>
                        <span className="font-semibold">{demoState.enhancedAnalysis.boundaryAnalysis.erosionRisk}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Water Management</span>
                        <Badge variant={
                          demoState.enhancedAnalysis.boundaryAnalysis.waterManagement === 'optimal' ? 'default' :
                          demoState.enhancedAnalysis.boundaryAnalysis.waterManagement === 'needs_attention' ? 'secondary' : 'destructive'
                        }>
                          {demoState.enhancedAnalysis.boundaryAnalysis.waterManagement}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
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

              <TabsContent value="risks" className="space-y-4">
                <div className="space-y-4">
                  {demoState.enhancedAnalysis.boundaryAnalysis.riskFactors.slice(0, 5).map((risk, index) => (
                    <Alert key={index} variant={risk.severity === 'critical' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>{risk.factor}</AlertTitle>
                      <AlertDescription>
                        <div className="space-y-2">
                          <p>{risk.impact}</p>
                          <p className="text-sm text-gray-600">{risk.localImpact}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Affected Area: {risk.affectedArea}%</span>
                            <span>Urgency: {risk.urgency}</span>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div className="space-y-4">
                  {demoState.enhancedAnalysis.integratedRecommendations.slice(0, 6).map((rec, index) => (
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
                              <Badge variant="outline">{rec.source}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{rec.description}</p>
                            <p className="text-sm text-gray-500">{rec.localDescription}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Cost: ₹{rec.estimatedCost.toLocaleString()}</span>
                              <span>Window: {rec.implementationWindow}</span>
                              <span>Category: {rec.category}</span>
                            </div>
                          </div>
                          <Button size="sm">Implement</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="alerts" className="space-y-4">
                <div className="space-y-4">
                  {demoState.enhancedAnalysis.alerts.slice(0, 5).map((alert, index) => (
                    <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>{alert.title}</AlertTitle>
                      <AlertDescription>
                        <div className="space-y-2">
                          <p>{alert.message}</p>
                          <p className="text-sm text-gray-600">{alert.localMessage}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Type: {alert.type}</span>
                            <span>Action Required: {alert.actionRequired ? 'Yes' : 'No'}</span>
                            {alert.deadline && <span>Deadline: {alert.deadline.toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {demoState.enhancedAnalysis.performanceMetrics.overallHealth}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Health</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {demoState.enhancedAnalysis.performanceMetrics.boundaryHealth}%
                    </div>
                    <div className="text-sm text-gray-600">Boundary Health</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Droplet className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
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
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Boundary Analysis Features */}
      <Card>
        <CardHeader>
          <CardTitle>Boundary Analysis Features</CardTitle>
          <CardDescription>
            Comprehensive field edge monitoring and management capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Bug className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="font-semibold">Pest Management</div>
              <div className="text-sm text-gray-600">Perimeter trap cropping</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Mountain className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="font-semibold">Soil Conservation</div>
              <div className="text-sm text-gray-600">Erosion control measures</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Droplet className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold">Water Management</div>
              <div className="text-sm text-gray-600">Boundary drainage systems</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Lightbulb className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="font-semibold">Nutrient Optimization</div>
              <div className="text-sm text-gray-600">Precision application</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
