import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Presentation, 
  MapPin, 
  Satellite, 
  BarChart3, 
  ShoppingCart, 
  Headphones, 
  Eye, 
  Bell, 
  Menu, 
  Plus, 
  Sun, 
  Cloud, 
  Droplets, 
  Wind, 
  Sprout,
  Target,
  Play,
  MessageCircle,
  Volume2,
  Wheat,
  Award,
  Shield
} from "lucide-react";
import FarmMap from "@/components/FarmMap";
import SimplifiedHealthAssessment from "@/components/SimplifiedHealthAssessment";
import UpdatedVegetationIndices from "@/components/UpdatedVegetationIndices";
import Marketplace from "@/components/Marketplace";
import OnboardingWizard from "@/components/OnboardingWizard";
import SimpleFieldMapper from "@/components/SimpleFieldMapper";
import EnhancedVoiceAssistant from "@/components/EnhancedVoiceAssistant";
import SimplifiedAccessibility from "@/components/SimplifiedAccessibility";
import SimpleFarmerInterface from "@/components/SimpleFarmerInterface";
import EnhancedWhatsApp from "@/components/EnhancedWhatsApp";
import DemoModeToggle from "@/components/DemoModeToggle";
import RealTimeMetrics from '@/components/RealTimeMetrics';
import FinancialImpactTracker from '@/components/FinancialImpactTracker';
import EnhancedMarketplace from '@/components/EnhancedMarketplace';
import EnhancedDoseCalculator from '@/components/EnhancedDoseCalculator';
import AnandSaathiDashboard from '@/components/AnandSaathiDashboard';
import { type DemoScenario } from "@/data/demoData";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getDemoFieldData, api } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFieldMapper, setShowFieldMapper] = useState(false);
  const [userSetup, setUserSetup] = useState(false);
  const [currentDemoScenario, setCurrentDemoScenario] = useState<DemoScenario | null>(null);
  const [fieldData, setFieldData] = useState<{
    boundary: { coordinates: number[][][] };
    area: number;
    pointCount: number;
    createdAt: Date;
    center: { lat: number; lng: number };
    analysis: Record<string, unknown>;
    recommendations: string[];
    crop: string;
    realAnalysis: boolean;
    fieldBoundary: { corners: Array<{ lat: number; lng: number }>; area: number; description: string };
  } | null>(null);
  const [insights, setInsights] = useState<{
    summary: string;
    diagnosis: string;
    recommendations: string[];
  } | null>(null);
  const [isSimpleMode, setIsSimpleMode] = useState(false);

  // Auto-activate userSetup when demo mode is selected
  useEffect(() => {
    if (currentDemoScenario) {
      setUserSetup(true);
    }
  }, [currentDemoScenario]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setUserSetup(true);
    toast.success("Welcome to Soil Saathi! Your farm is ready for analysis.");
  };

  const startNewFieldMapping = () => {
    setShowFieldMapper(true);
  };

  const handleFieldMappingComplete = (fieldData: {
    boundary: { coordinates: number[][][] };
    area: number;
    pointCount: number;
    createdAt: Date;
    center: { lat: number; lng: number };
    analysis: Record<string, unknown>;
    recommendations: string[];
    crop: string;
    realAnalysis: boolean;
    fieldBoundary: { corners: Array<{ lat: number; lng: number }>; area: number; description: string };
  }) => {
    console.log("Field mapping completed:", fieldData);
    setShowFieldMapper(false);
    setUserSetup(true);
  };

  // Show onboarding wizard if not set up
  if (showOnboarding) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  // Show field mapper
  if (showFieldMapper) {
    return <SimpleFieldMapper onComplete={handleFieldMappingComplete} onBack={() => setShowFieldMapper(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      
      <div className="p-4">
        <div className="min-h-screen bg-background">
          {isSimpleMode ? (
            <SimpleFarmerInterface 
              farmerData={{
                name: "राम कुमार",
                location: "गाजीपुर, उत्तर प्रदेश",
                cropHealth: "warning",
                alerts: [
                  {
                    type: "pest",
                    message: "पत्ती में भूरे धब्बे दिख रहे हैं - तुरंत दवाई छिड़कें",
                    urgency: "high"
                  }
                ],
                recommendations: [
                  {
                    action: "यूरिया डालें (50 किलो प्रति एकड़)",
                    cost: 1200,
                    expectedROI: "+₹3,500 प्रति एकड़"
                  }
                ],
                monthlyROI: "+₹8,500"
              }}
            />
          ) : (
            <div className="rural-friendly large-buttons">
              {/* Header */}
              <header className="bg-primary text-primary-foreground p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sprout className="h-8 w-8" />
                    <div>
                      <h1 className="text-xl font-bold">Soil Saathi</h1>
                      <p className="text-sm opacity-90">Smart Farming Assistant</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsSimpleMode(true)}
                      className="flex items-center gap-1"
                    >
                      <Target className="h-4 w-4" />
                      Simple
                    </Button>
                    {!userSetup && (
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => setShowOnboarding(true)}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Setup
                      </Button>
                    )}
                    <Bell className="h-5 w-5" />
                    <Menu className="h-5 w-5" />
                  </div>
                </div>
              </header>

              {/* Weather Banner */}
              <div className="bg-accent/10 border-b border-accent/20 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sun className="h-5 w-5 text-accent" />
                    <div>
                      <span className="font-medium">28°C</span>
                      <span className="text-sm text-muted-foreground ml-2">Sunny, Clear Sky</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span>Humidity: 65%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wind className="h-4 w-4 text-gray-500" />
                      <span>Wind: 12 km/h</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demo Mode Toggle */}
              <div className="p-4">
                <DemoModeToggle 
                  onScenarioSelect={setCurrentDemoScenario}
                  currentScenario={currentDemoScenario}
                />
              </div>

              {/* Main Content */}
              <div className="p-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-10 mb-6">
                    <TabsTrigger value="dashboard" className="flex flex-col gap-1 h-16">
                      <Activity className="h-4 w-4" />
                      <span className="text-xs">Dashboard</span>
                    </TabsTrigger>
                    <TabsTrigger value="map" className="flex flex-col gap-1 h-16">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs">Farm Map</span>
                    </TabsTrigger>
                    <TabsTrigger value="health" className="flex flex-col gap-1 h-16">
                      <Satellite className="h-4 w-4" />
                      <span className="text-xs">Health</span>
                    </TabsTrigger>
                    <TabsTrigger value="indices" className="flex flex-col gap-1 h-16">
                      <BarChart3 className="h-4 w-4" />
                      <span className="text-xs">Indices</span>
                    </TabsTrigger>
                    <TabsTrigger value="calculator" className="flex flex-col gap-1 h-16">
                      <Target className="h-4 w-4" />
                      <span className="text-xs">Calculator</span>
                    </TabsTrigger>
                    <TabsTrigger value="marketplace" className="flex flex-col gap-1 h-16">
                      <ShoppingCart className="h-4 w-4" />
                      <span className="text-xs">Market</span>
                    </TabsTrigger>
                    <TabsTrigger value="voice" className="flex flex-col gap-1 h-16">
                      <Headphones className="h-4 w-4" />
                      <span className="text-xs">Voice</span>
                    </TabsTrigger>
                    <TabsTrigger value="whatsapp" className="flex flex-col gap-1 h-16">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-xs">WhatsApp</span>
                    </TabsTrigger>
                    <TabsTrigger value="accessibility" className="flex flex-col gap-1 h-16">
                      <Eye className="h-4 w-4" />
                      <span className="text-xs">Access</span>
                    </TabsTrigger>
                    <TabsTrigger value="anand-saathi" className="flex flex-col gap-1 h-16">
                      <Award className="h-4 w-4" />
                      <span className="text-xs">Anand Saathi</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="dashboard" className="space-y-4">
                    {/* Weather Alert */}
                    {userSetup && (
                      <Alert>
                        <Sun className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Weather Alert:</strong> Clear skies expected for the next 3 days. 
                          Perfect conditions for field work and crop monitoring.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Field Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Get real-time satellite analysis of your field
                          </p>
                          <Button onClick={startNewFieldMapping} className="w-full">
                            <Satellite className="h-4 w-4 mr-2" />
                            Analyze Field
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Health Report
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            View detailed crop health metrics
                          </p>
                          <Button 
                            onClick={() => setActiveTab("health")} 
                            variant="outline" 
                            className="w-full"
                          >
                            <Activity className="h-4 w-4 mr-2" />
                            View Report
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Marketplace
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Buy seeds, fertilizers, and equipment
                          </p>
                          <Button 
                            onClick={() => setActiveTab("marketplace")} 
                            variant="outline" 
                            className="w-full"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Browse Market
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Punjab Rice Phenology System */}
                    <Card className="border-l-4 border-l-green-500">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800">
                          <Wheat className="h-6 w-6" />
                          ਪੰਜਾਬ ਰਾਈਸ ਸਿਸਟਮ (Punjab Rice System)
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Advanced rice phenology monitoring and government integration for Punjab farmers
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Button 
                            onClick={() => navigate('/punjab')} 
                            className="h-auto p-4 flex flex-col items-center gap-2 bg-green-600 hover:bg-green-700"
                          >
                            <Wheat className="h-6 w-6" />
                            <div className="text-center">
                              <div className="font-semibold">Punjab Dashboard</div>
                              <div className="text-xs opacity-90">Field monitoring & analysis</div>
                            </div>
                          </Button>
                          
                          <Button 
                            onClick={() => navigate('/punjab/alerts')} 
                            variant="outline" 
                            className="h-auto p-4 flex flex-col items-center gap-2 border-green-200 hover:bg-green-50"
                          >
                            <Bell className="h-6 w-6 text-green-600" />
                            <div className="text-center">
                              <div className="font-semibold text-green-800">Alert Management</div>
                              <div className="text-xs text-green-600">SMS, WhatsApp, Push notifications</div>
                            </div>
                          </Button>
                          
                          <Button 
                            onClick={() => navigate('/punjab/government')} 
                            variant="outline" 
                            className="h-auto p-4 flex flex-col items-center gap-2 border-green-200 hover:bg-green-50"
                          >
                            <Award className="h-6 w-6 text-green-600" />
                            <div className="text-center">
                              <div className="font-semibold text-green-800">Government Services</div>
                              <div className="text-xs text-green-600">PM Kisan, schemes, advisories</div>
                            </div>
                          </Button>
                        </div>
                        
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-green-800">
                            <Shield className="h-4 w-4" />
                            <span className="font-medium">Features:</span>
                            <span>PR-126 & HKR-47 varieties • Boundary analysis • TimesFM AI • Multi-language support</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Field Status */}
                    {userSetup && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Field Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span>Overall Health</span>
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                Good
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>NDVI Score</span>
                                <span>0.72</span>
                              </div>
                              <Progress value={72} className="h-2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>


                  <TabsContent value="map">
                    <FarmMap />
                  </TabsContent>

                  <TabsContent value="health">
                    <SimplifiedHealthAssessment />
                  </TabsContent>

                  <TabsContent value="indices">
                    <UpdatedVegetationIndices />
                  </TabsContent>

                  <TabsContent value="calculator">
                    <EnhancedDoseCalculator />
                  </TabsContent>

                  <TabsContent value="marketplace">
                    {currentDemoScenario ? (
                      <EnhancedMarketplace 
                        location={currentDemoScenario.farmer.location}
                        currentCrop={currentDemoScenario.fieldData.primaryCrop}
                      />
                    ) : (
                      <Marketplace />
                    )}
                  </TabsContent>

                  <TabsContent value="voice">
                    <EnhancedVoiceAssistant context={activeTab as any} />
                  </TabsContent>

                  <TabsContent value="whatsapp">
                    <EnhancedWhatsApp />
                  </TabsContent>

                  <TabsContent value="accessibility">
                    <SimplifiedAccessibility />
                  </TabsContent>

                  <TabsContent value="anand-saathi">
                    <AnandSaathiDashboard />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
