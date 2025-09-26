/**
 * Punjab Phenology Dashboard Component
 * Main interface for farmers to interact with Punjab rice system features
 * Integrates phenology monitoring, boundary analysis, government data, and alerts
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
import { PunjabTimesFMIntegration } from '@/lib/punjabTimesFMIntegration';
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
  Lightbulb,
  Settings,
  RefreshCw,
  Download,
  Share2,
  HelpCircle,
  Phone,
  Mail,
  Globe,
  FileText,
  Award,
  DollarSign,
  Activity,
  Eye,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import PunjabNavigation from './PunjabNavigation';

interface DashboardState {
  selectedVariety: string;
  selectedDistrict: string;
  plantingDate: string;
  systemStatus: any;
  enhancedAnalysis: EnhancedFieldAnalysis | null;
  isSystemRunning: boolean;
  isLoading: boolean;
  farmerProfile: {
    name: string;
    phone: string;
    language: 'punjabi' | 'hindi' | 'english';
    district: string;
    farmSize: number;
    experience: number;
  };
  activeFields: Array<{
    id: string;
    name: string;
    variety: string;
    district: string;
    area: number;
    plantingDate: string;
    status: string;
  }>;
}

export default function PunjabPhenologyDashboard() {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    selectedVariety: 'pr-126',
    selectedDistrict: 'ludhiana',
    plantingDate: new Date().toISOString().split('T')[0],
    systemStatus: null,
    enhancedAnalysis: null,
    isSystemRunning: false,
    isLoading: false,
    farmerProfile: {
      name: 'ਗੁਰਦੀਪ ਸਿੰਘ (Gurdeep Singh)',
      phone: '+91 9876543210',
      language: 'punjabi',
      district: 'ludhiana',
      farmSize: 3.8,
      experience: 22
    },
    activeFields: []
  });

  const [punjabSystem, setPunjabSystem] = useState<PunjabRiceSystem | null>(null);
  const [boundaryIntegration, setBoundaryIntegration] = useState<PunjabBoundaryIntegration | null>(null);
  const [timesFMIntegration, setTimesFMIntegration] = useState<PunjabTimesFMIntegration | null>(null);

  useEffect(() => {
    initializeSystems();
    loadFarmerData();
  }, []);

  const initializeSystems = async () => {
    try {
      // Initialize Punjab system
      const punjabSystem = new PunjabRiceSystem({
        phenologyEngine: {
          enabled: true,
          analysisInterval: 30,
          alertThresholds: {
            waterStress: 50,
            pestPressure: 70,
            diseaseIncidence: 60
          }
        },
        governmentAPI: {
          enabled: true,
          syncInterval: 6,
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
      const boundaryIntegration = new PunjabBoundaryIntegration(punjabSystem, {
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

      setBoundaryIntegration(boundaryIntegration);

      // Initialize TimesFM integration
      const timesFMIntegration = new PunjabTimesFMIntegration(punjabSystem, {
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

      setTimesFMIntegration(timesFMIntegration);

      setDashboardState(prev => ({
        ...prev,
        systemStatus: punjabSystem.getSystemStatus()
      }));

    } catch (error) {
      console.error('Failed to initialize systems:', error);
    }
  };

  const loadFarmerData = () => {
    // Load farmer's active fields (in real implementation, this would come from database)
    const mockFields = [
      {
        id: 'field_001',
        name: 'ਮੁੱਖ ਖੇਤ (Main Field)',
        variety: 'pr-126',
        district: 'ludhiana',
        area: 2.5,
        plantingDate: '2024-06-15',
        status: 'active'
      },
      {
        id: 'field_002',
        name: 'ਦੂਜਾ ਖੇਤ (Second Field)',
        variety: 'hkr-47',
        district: 'ludhiana',
        area: 1.3,
        plantingDate: '2024-06-20',
        status: 'active'
      }
    ];

    setDashboardState(prev => ({
      ...prev,
      activeFields: mockFields
    }));
  };

  const addNewField = async () => {
    if (!punjabSystem || !boundaryIntegration) return;

    setDashboardState(prev => ({ ...prev, isLoading: true }));

    try {
      const fieldId = `field_${Date.now()}`;
      const plantingDate = new Date(dashboardState.plantingDate);

      // Add field to Punjab system
      await punjabSystem.addField(
        fieldId,
        dashboardState.selectedVariety,
        dashboardState.selectedDistrict,
        plantingDate,
        {
          id: 'farmer_001',
          name: dashboardState.farmerProfile.name,
          phone: dashboardState.farmerProfile.phone,
          language: dashboardState.farmerProfile.language,
          district: dashboardState.farmerProfile.district,
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
      const enhancedAnalysis = await boundaryIntegration.getEnhancedFieldAnalysis(fieldId);
      
      // Add to active fields
      const newField = {
        id: fieldId,
        name: `ਨਵਾਂ ਖੇਤ (New Field)`,
        variety: dashboardState.selectedVariety,
        district: dashboardState.selectedDistrict,
        area: 1.0,
        plantingDate: dashboardState.plantingDate,
        status: 'active'
      };

      setDashboardState(prev => ({
        ...prev,
        activeFields: [...prev.activeFields, newField],
        enhancedAnalysis,
        isSystemRunning: true,
        isLoading: false
      }));

    } catch (error) {
      console.error('Failed to add new field:', error);
      setDashboardState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const selectedVariety = getVarietyById(dashboardState.selectedVariety);
  const selectedDistrict = getDistrictById(dashboardState.selectedDistrict);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <PunjabNavigation 
        currentPage="Dashboard - Field monitoring & analysis"
        showBackButton={true}
        showSupportButtons={true}
      />

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {dashboardState.systemStatus?.overall?.toUpperCase() || 'INITIALIZING'}
              </div>
              <div className="text-xs text-gray-600">Overall Health</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-blue-600" />
                Active Fields
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {dashboardState.activeFields.length}
              </div>
              <div className="text-xs text-gray-600">Fields Monitored</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bell className="h-4 w-4 text-orange-600" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {dashboardState.enhancedAnalysis?.alerts.filter(alert => alert.actionRequired).length || 0}
              </div>
              <div className="text-xs text-gray-600">Require Action</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                Yield Potential
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {dashboardState.enhancedAnalysis?.performanceMetrics.yieldPotential || 0}%
              </div>
              <div className="text-xs text-gray-600">Expected Improvement</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Fields */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Active Fields</CardTitle>
                    <CardDescription>Your rice fields under monitoring</CardDescription>
                  </div>
                  <Button onClick={addNewField} disabled={dashboardState.isLoading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardState.activeFields.map((field) => {
                    const variety = getVarietyById(field.variety);
                    const district = getDistrictById(field.district);
                    
                    return (
                      <Card key={field.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{field.name}</h4>
                                <Badge variant="default">{field.status}</Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Variety:</span> {variety?.name}
                                </div>
                                <div>
                                  <span className="font-medium">District:</span> {district?.name}
                                </div>
                                <div>
                                  <span className="font-medium">Area:</span> {field.area} acres
                                </div>
                                <div>
                                  <span className="font-medium">Planted:</span> {new Date(field.plantingDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Field
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Analysis
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Data
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            {/* Government Schemes */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  Government Schemes
                </CardTitle>
                <CardDescription>Available schemes for your district</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="font-semibold text-sm">PM Kisan</div>
                  <div className="text-xs text-gray-600">₹6,000/year support</div>
                  <Badge variant="default" className="mt-1">Active</Badge>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="font-semibold text-sm">Crop Insurance</div>
                  <div className="text-xs text-gray-600">Up to 90% coverage</div>
                  <Badge variant="secondary" className="mt-1">Available</Badge>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="font-semibold text-sm">Direct Seeding</div>
                  <div className="text-xs text-gray-600">₹1,500/acre subsidy</div>
                  <Badge variant="secondary" className="mt-1">Available</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced Analysis Dashboard */}
        {dashboardState.enhancedAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle>Field Analysis Dashboard</CardTitle>
              <CardDescription>
                Comprehensive analysis for {selectedVariety?.name} in {selectedDistrict?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="phenology">Phenology</TabsTrigger>
                  <TabsTrigger value="boundary">Boundary</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                  <TabsTrigger value="alerts">Alerts</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">
                        {dashboardState.enhancedAnalysis.performanceMetrics.overallHealth}%
                      </div>
                      <div className="text-sm text-gray-600">Overall Health</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">
                        {dashboardState.enhancedAnalysis.performanceMetrics.boundaryHealth}%
                      </div>
                      <div className="text-sm text-gray-600">Boundary Health</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">
                        {dashboardState.enhancedAnalysis.performanceMetrics.yieldPotential}%
                      </div>
                      <div className="text-sm text-gray-600">Yield Potential</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-orange-600">
                        ₹{dashboardState.enhancedAnalysis.performanceMetrics.costSavings.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Cost Savings</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="phenology" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {dashboardState.enhancedAnalysis.phenologyData.currentStage}
                      </div>
                      <div className="text-sm text-gray-600">Current Stage</div>
                      <Progress value={dashboardState.enhancedAnalysis.phenologyData.stageProgress} className="mt-2" />
                      <div className="text-xs text-gray-500 mt-1">
                        {dashboardState.enhancedAnalysis.phenologyData.stageProgress}% Complete
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {dashboardState.enhancedAnalysis.phenologyData.daysInStage}
                      </div>
                      <div className="text-sm text-gray-600">Days in Stage</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Health: {dashboardState.enhancedAnalysis.phenologyData.healthStatus}
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {dashboardState.enhancedAnalysis.phenologyData.expectedDaysRemaining}
                      </div>
                      <div className="text-sm text-gray-600">Days Remaining</div>
                      <div className="text-xs text-gray-500 mt-1">Next stage transition</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="boundary" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {dashboardState.enhancedAnalysis.boundaryAnalysis.pestPressure}%
                      </div>
                      <div className="text-sm text-gray-600">Pest Pressure</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {dashboardState.enhancedAnalysis.boundaryAnalysis.erosionRisk}%
                      </div>
                      <div className="text-sm text-gray-600">Erosion Risk</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {dashboardState.enhancedAnalysis.boundaryAnalysis.nutrientCompetition}%
                      </div>
                      <div className="text-sm text-gray-600">Nutrient Competition</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {dashboardState.enhancedAnalysis.boundaryAnalysis.shadingImpact}%
                      </div>
                      <div className="text-sm text-gray-600">Shading Impact</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  <div className="space-y-4">
                    {dashboardState.enhancedAnalysis.integratedRecommendations.slice(0, 5).map((rec, index) => (
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
                    {dashboardState.enhancedAnalysis.alerts.slice(0, 5).map((alert, index) => (
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
                        {dashboardState.enhancedAnalysis.performanceMetrics.overallHealth}%
                      </div>
                      <div className="text-sm text-gray-600">Overall Health</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">
                        {dashboardState.enhancedAnalysis.performanceMetrics.boundaryHealth}%
                      </div>
                      <div className="text-sm text-gray-600">Boundary Health</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Droplet className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-cyan-600">
                        {dashboardState.enhancedAnalysis.performanceMetrics.waterEfficiency}%
                      </div>
                      <div className="text-sm text-gray-600">Water Efficiency</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">
                        ₹{dashboardState.enhancedAnalysis.performanceMetrics.costSavings.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Cost Savings</div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Support Section */}
        <Card>
          <CardHeader>
            <CardTitle>Support & Resources</CardTitle>
            <CardDescription>Get help and access resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Phone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="font-semibold">Phone Support</div>
                <div className="text-sm text-gray-600">+91 8000-123-456</div>
                <div className="text-xs text-gray-500">24/7 Support</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold">WhatsApp</div>
                <div className="text-sm text-gray-600">+91 9000-123-456</div>
                <div className="text-xs text-gray-500">Instant Support</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="font-semibold">User Guide</div>
                <div className="text-sm text-gray-600">Download PDF</div>
                <div className="text-xs text-gray-500">Punjabi & Hindi</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
