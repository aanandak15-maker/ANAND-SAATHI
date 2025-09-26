/**
 * Punjab Rice System Demo Component
 * Showcases the complete Punjab-specific rice phenology system
 * Interactive demonstration of all features
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
import { PunjabRiceSystem, FieldMonitoringData, SystemStatus } from '@/lib/punjabRiceSystem';
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
  Bell
} from 'lucide-react';

interface DemoState {
  selectedVariety: string;
  selectedDistrict: string;
  plantingDate: string;
  systemStatus: SystemStatus | null;
  fieldData: FieldMonitoringData | null;
  isSystemRunning: boolean;
  alerts: any[];
  recommendations: any[];
}

export default function PunjabRiceSystemDemo() {
  const [demoState, setDemoState] = useState<DemoState>({
    selectedVariety: 'pr-126',
    selectedDistrict: 'ludhiana',
    plantingDate: new Date().toISOString().split('T')[0],
    systemStatus: null,
    fieldData: null,
    isSystemRunning: false,
    alerts: [],
    recommendations: []
  });

  const [system, setSystem] = useState<PunjabRiceSystem | null>(null);

  useEffect(() => {
    initializeSystem();
  }, []);

  const initializeSystem = async () => {
    try {
      const punjabSystem = new PunjabRiceSystem({
        phenologyEngine: {
          enabled: true,
          analysisInterval: 5, // 5 minutes for demo
          alertThresholds: {
            waterStress: 50,
            pestPressure: 70,
            diseaseIncidence: 60
          }
        },
        governmentAPI: {
          enabled: true,
          syncInterval: 1, // 1 hour for demo
          districts: ['amritsar', 'ludhiana', 'patiala', 'sangrur', 'bathinda']
        },
        alertSystem: {
          enabled: true,
          channels: ['sms', 'whatsapp', 'push'],
          quietHours: true
        }
      });

      await punjabSystem.initialize();
      setSystem(punjabSystem);
      setDemoState(prev => ({
        ...prev,
        systemStatus: punjabSystem.getSystemStatus()
      }));
    } catch (error) {
      console.error('Failed to initialize system:', error);
    }
  };

  const startFieldMonitoring = async () => {
    if (!system) return;

    try {
      const fieldId = `demo_field_${Date.now()}`;
      const plantingDate = new Date(demoState.plantingDate);

      await system.addField(
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

      // Get field data
      const fieldData = system.getFieldMonitoringData(fieldId);
      setDemoState(prev => ({
        ...prev,
        fieldData,
        isSystemRunning: true
      }));

      // Simulate alerts and recommendations
      simulateAlertsAndRecommendations();
    } catch (error) {
      console.error('Failed to start monitoring:', error);
    }
  };

  const simulateAlertsAndRecommendations = () => {
    const variety = getVarietyById(demoState.selectedVariety);
    const district = getDistrictById(demoState.selectedDistrict);

    if (!variety || !district) return;

    // Simulate alerts
    const alerts = [
      {
        id: 'alert_1',
        type: 'weather',
        severity: 'warning',
        title: 'High Temperature Alert',
        message: `Temperature expected to reach 38°C in ${district.name}. Take precautions for ${variety.name} rice.`,
        localMessage: `${district.name} ਵਿੱਚ ਤਾਪਮਾਨ 38°C ਤੱਕ ਪਹੁੰਚਣ ਦੀ ਸੰਭਾਵਨਾ। ${variety.name} ਚੌਲ ਲਈ ਸਾਵਧਾਨੀ ਬਰਤੋ।`,
        timestamp: new Date()
      },
      {
        id: 'alert_2',
        type: 'irrigation',
        severity: 'critical',
        title: 'Critical Irrigation Required',
        message: `Water stress detected in ${variety.name} field. Immediate irrigation needed.`,
        localMessage: `${variety.name} ਖੇਤ ਵਿੱਚ ਪਾਣੀ ਦਾ ਤਣਾਅ। ਤੁਰੰਤ ਸਿੰਚਾਈ ਜ਼ਰੂਰੀ।`,
        timestamp: new Date()
      }
    ];

    // Simulate recommendations
    const recommendations = [
      {
        id: 'rec_1',
        type: 'fertilizer',
        priority: 'high',
        title: 'Apply Nitrogen Fertilizer',
        description: `Apply ${variety.recommendations.fertilizer.nitrogen} kg/acre nitrogen for optimal tillering.`,
        localDescription: `ਬਿਹਤਰ ਕਲੋਮ ਲਈ ${variety.recommendations.fertilizer.nitrogen} kg/acre ਨਾਈਟ੍ਰੋਜਨ ਪਾਓ।`,
        estimatedCost: 2000,
        implementationWindow: 'Next 3 days'
      },
      {
        id: 'rec_2',
        type: 'pest_control',
        priority: 'medium',
        title: 'Monitor for Brown Plant Hopper',
        description: 'Monitor field for brown plant hopper activity. Apply control measures if needed.',
        localDescription: 'ਬ੍ਰਾਊਨ ਪਲਾਂਟ ਹੌਪਰ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ। ਜ਼ਰੂਰਤ ਪਵੇ ਤਾਂ ਨਿਯੰਤਰਣ ਉਪਾਅ ਕਰੋ।',
        estimatedCost: 1500,
        implementationWindow: 'Next 7 days'
      }
    ];

    setDemoState(prev => ({
      ...prev,
      alerts,
      recommendations
    }));
  };

  const selectedVariety = getVarietyById(demoState.selectedVariety);
  const selectedDistrict = getDistrictById(demoState.selectedDistrict);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-green-800">
          ਪੰਜਾਬ ਰਾਈਸ ਸਿਸਟਮ (Punjab Rice System)
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Advanced rice phenology monitoring system specifically designed for Punjab's agricultural conditions. 
          Features PR-126, HKR-47 varieties, district-specific recommendations, and multi-channel alerts.
        </p>
      </div>

      {/* System Status */}
      {demoState.systemStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {demoState.systemStatus.overall.toUpperCase()}
                </div>
                <div className="text-sm text-gray-600">Overall Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {demoState.systemStatus.activeFields}
                </div>
                <div className="text-sm text-gray-600">Active Fields</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {demoState.systemStatus.totalAlerts}
                </div>
                <div className="text-sm text-gray-600">Total Alerts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {demoState.systemStatus.systemLoad}%
                </div>
                <div className="text-sm text-gray-600">System Load</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Field Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Field Configuration</CardTitle>
            <CardDescription>
              Configure your rice field for monitoring
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
              onClick={startFieldMonitoring}
              disabled={demoState.isSystemRunning}
              className="w-full"
            >
              {demoState.isSystemRunning ? 'Monitoring Active' : 'Start Field Monitoring'}
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

              <div>
                <div className="text-sm text-gray-600 mb-2">Suitable Districts</div>
                <div className="flex flex-wrap gap-1">
                  {selectedVariety.suitableDistricts.map(district => (
                    <Badge key={district} variant="outline" className="text-xs">
                      {district}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Field Monitoring Data */}
      {demoState.fieldData && (
        <Card>
          <CardHeader>
            <CardTitle>Field Monitoring Dashboard</CardTitle>
            <CardDescription>
              Real-time monitoring data for {selectedVariety?.name} in {selectedDistrict?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="phenology" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="phenology">Phenology</TabsTrigger>
                <TabsTrigger value="conditions">Conditions</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="phenology" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">Tillering</div>
                    <div className="text-sm text-gray-600">Current Stage</div>
                    <Progress value={65} className="mt-2" />
                    <div className="text-xs text-gray-500 mt-1">65% Complete</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">25</div>
                    <div className="text-sm text-gray-600">Days in Stage</div>
                    <div className="text-xs text-gray-500 mt-1">Expected: 28 days</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">3</div>
                    <div className="text-sm text-gray-600">Days Remaining</div>
                    <div className="text-xs text-gray-500 mt-1">Next: Panicle Initiation</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="conditions" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Droplets className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-lg font-semibold">70%</div>
                    <div className="text-sm text-gray-600">Soil Moisture</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Thermometer className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-lg font-semibold">32°C</div>
                    <div className="text-sm text-gray-600">Temperature</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Sun className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-lg font-semibold">0.75</div>
                    <div className="text-sm text-gray-600">NDVI</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-lg font-semibold">Good</div>
                    <div className="text-sm text-gray-600">Health Status</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="alerts" className="space-y-4">
                {demoState.alerts.map(alert => (
                  <Alert key={alert.id} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{alert.title}</AlertTitle>
                    <AlertDescription>
                      <div className="space-y-2">
                        <p>{alert.message}</p>
                        <p className="text-sm text-gray-600">{alert.localMessage}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {alert.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                {demoState.recommendations.map(rec => (
                  <Card key={rec.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{rec.title}</h4>
                            <Badge variant={rec.priority === 'high' ? 'destructive' : 'default'}>
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{rec.description}</p>
                          <p className="text-sm text-gray-500">{rec.localDescription}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Cost: ₹{rec.estimatedCost}</span>
                            <span>Window: {rec.implementationWindow}</span>
                          </div>
                        </div>
                        <Button size="sm">Implement</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Multi-Channel Alert System */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Channel Alert System</CardTitle>
          <CardDescription>
            Punjab farmers receive alerts through multiple channels in their preferred language
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Smartphone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold">SMS</div>
              <div className="text-sm text-gray-600">Instant notifications</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold">WhatsApp</div>
              <div className="text-sm text-gray-600">Rich media alerts</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Bell className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="font-semibold">Push</div>
              <div className="text-sm text-gray-600">App notifications</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="font-semibold">Voice</div>
              <div className="text-sm text-gray-600">Critical alerts only</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Government Integration */}
      <Card>
        <CardHeader>
          <CardTitle>Government Integration</CardTitle>
          <CardDescription>
            Connected with Punjab government agricultural services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Connected Services</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  agri.punjab.gov.in - Crop Advisories
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  crs-agripunjab.punjab.gov.pk - Yield Data
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  pestwarning-agripunjab.punjab.gov.pk - Pest Alerts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  edistrictpb.gov.in - Government Schemes
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Available Schemes</h4>
              <ul className="space-y-1 text-sm">
                <li>• PM Kisan - ₹6,000/year</li>
                <li>• Crop Insurance - Up to 90% coverage</li>
                <li>• Direct Seeding - ₹1,500/acre</li>
                <li>• Drip Irrigation - 50% subsidy</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
