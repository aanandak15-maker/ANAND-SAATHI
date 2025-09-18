
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sprout, 
  MapPin, 
  Activity, 
  ShoppingCart, 
  BarChart3, 
  Bell,
  Menu,
  Sun,
  Droplets,
  TrendingUp,
  Satellite,
  Plus,
  Headphones,
  Settings,
  Eye,
  Presentation,
  Target,
  Play,
  MessageCircle,
  LogOut
} from "lucide-react";
import FarmMap from "@/components/FarmMap";
import HealthAssessment from "@/components/HealthAssessment";
import VegetationIndices from "@/components/VegetationIndices";
import Marketplace from "@/components/Marketplace";
import OnboardingWizard from "@/components/OnboardingWizard";
import FieldMapper from "@/components/FieldMapper";
import VoiceAssistant from "@/components/VoiceAssistant";
import AccessibilityFeatures from "@/components/AccessibilityFeatures";
import SimpleFarmerInterface from "@/components/SimpleFarmerInterface";
import WhatsAppIntegration from "@/components/WhatsAppIntegration";
import DemoModeToggle from "@/components/DemoModeToggle";
import InvestorDashboard from "@/components/InvestorDashboard";
import RealTimeMetrics from '@/components/RealTimeMetrics';
import FinancialImpactTracker from '@/components/FinancialImpactTracker';
import EnhancedMarketplace from '@/components/EnhancedMarketplace';
import DoseCalculator from '@/components/DoseCalculator';
import { type DemoScenario } from "@/data/demoData";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getDemoFieldData, api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out successfully');
      navigate('/auth');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Sprout className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Soil Saathi...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFieldMapper, setShowFieldMapper] = useState(false);
  const [userSetup, setUserSetup] = useState(false);
  const [currentDemoScenario, setCurrentDemoScenario] = useState<DemoScenario | null>(null);
  const [fieldData, setFieldData] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [isSimpleMode, setIsSimpleMode] = useState(false);

  // Auto-activate userSetup when demo mode is selected
  useEffect(() => {
    if (currentDemoScenario) {
      setUserSetup(true);
      // Load demo field data
      const demoData = getDemoFieldData(
        currentDemoScenario.farmer.location, 
        currentDemoScenario.farmer.primaryCrop
      );
      setFieldData(demoData);
      
      // Get AI insights
      api.summarizeField(demoData, 'hi').then(setInsights);
    }
  }, [currentDemoScenario]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setShowFieldMapper(true);
  };

  const handleFieldMappingComplete = (fieldData: any) => {
    console.log("Field mapping completed:", fieldData);
    setShowFieldMapper(false);
    setUserSetup(true);
  };

  const startNewFieldMapping = () => {
    setShowFieldMapper(true);
  };

  // Show onboarding wizard if not set up
  if (showOnboarding) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  // Show field mapper
  if (showFieldMapper) {
    return <FieldMapper onComplete={handleFieldMappingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header with authentication info */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                <Sprout className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Soil Saathi</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Field Diagnostics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Welcome, {user?.email?.split('@')[0] || 'Farmer'}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
      
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
            todayActions: [
              {
                action: "कॉपर सल्फेट का छिड़काव करें",
                cost: 250,
                expectedROI: "+₹2,000 प्रति एकड़"
              },
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
              <Droplets className="h-4 w-4 text-primary" />
              <span>65% Humidity</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-success" />
              <span>Good for irrigation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Banner for New Users */}
      {!userSetup && (
        <div className="bg-primary/10 border-b border-primary/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-primary">Welcome to Soil Saathi!</h3>
              <p className="text-sm text-muted-foreground">Complete setup to start analyzing your fields</p>
            </div>
            <Button onClick={() => setShowOnboarding(true)} size="sm">
              Get Started
            </Button>
          </div>
        </div>
      )}

      {/* Demo Mode Toggle */}
      <div className="p-4 border-b">
        <DemoModeToggle 
          currentScenario={currentDemoScenario}
          onScenarioChange={setCurrentDemoScenario}
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
            <TabsTrigger value="investor" className="flex flex-col gap-1 h-16">
              <Presentation className="h-4 w-4" />
              <span className="text-xs">Investor</span>
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
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            {/* Weather Alert */}
            {userSetup && (
              <Alert className="border-warning bg-warning/5">
                <Bell className="h-4 w-4" />
                <AlertDescription>
                  <strong>Weather Alert:</strong> Light rain expected in 2 days. Good time for fertilizer application.
                </AlertDescription>
              </Alert>
            )}

            {/* Dynamic Stats based on demo data */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-success/10 p-2 rounded-lg">
                      <Sprout className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Farm Health</p>
                      <p className="text-xl font-bold">
                        {userSetup ? `${Math.round((fieldData?.health_zones?.overall_ndvi || 0.87) * 100)}%` : '--'}
                      </p>
                      {userSetup && (
                        <Progress 
                          value={(fieldData?.health_zones?.overall_ndvi || 0.87) * 100} 
                          className="h-2 mt-1"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent/10 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Area</p>
                       <p className="text-xl font-bold">
                        {userSetup ? `${currentDemoScenario?.farmer.farmSize || 2.5} ha` : '--'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Droplets className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Soil Moisture</p>
                      <p className="text-xl font-bold">
                        {userSetup ? `${fieldData?.weather?.recent_rainfall_mm || 25}mm` : '--'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-destructive/10 p-2 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Yield Boost</p>
                      <p className="text-xl font-bold">
                        {userSetup ? `+${currentDemoScenario?.beforeAfter?.after?.yield ? Math.round(((currentDemoScenario.beforeAfter.after.yield - currentDemoScenario.beforeAfter.before.yield) / currentDemoScenario.beforeAfter.before.yield) * 100) : 25}%` : '--'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights and Analysis */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Satellite className="h-5 w-5 text-primary" />
                    Satellite Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userSetup ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                        <div>
                          <p className="font-medium">NDVI Health Index</p>
                          <p className="text-sm text-muted-foreground">
                            {fieldData?.health_zones?.overall_ndvi?.toFixed(2) || '0.75'} (Healthy Growth)
                          </p>
                        </div>
                        <Badge className="bg-success/20 text-success">
                          Excellent
                        </Badge>
                      </div>
                      
                      {fieldData?.health_zones?.problem_areas?.map((issue: string, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                          <div>
                            <p className="font-medium">Issue Detected</p>
                            <p className="text-sm text-muted-foreground">{issue}</p>
                          </div>
                          <Badge className="bg-warning/20 text-warning">
                            Monitor
                          </Badge>
                        </div>
                      ))}
                      
                      <div className="text-center pt-2">
                        <Button size="sm" onClick={() => setActiveTab("health")}>
                          View Full Report
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Satellite className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Complete setup to view satellite analysis
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userSetup && insights ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <p className="font-medium text-sm">{insights.diagnosis}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Recommended Actions:</p>
                        {insights.recommendations?.slice(0, 3).map((rec: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-accent/10 rounded">
                            <div className="bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <p className="text-sm">{rec}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-center pt-2">
                        <Button size="sm" variant="outline" onClick={() => setActiveTab("marketplace")}>
                          Shop Solutions
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        {userSetup ? 'Loading AI recommendations...' : 'Complete setup to get personalized recommendations'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Current Tasks & Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Today's Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userSetup ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border-l-4 border-primary">
                      <div>
                        <p className="font-medium">Check irrigation system</p>
                        <p className="text-sm text-muted-foreground">South field - due today</p>
                      </div>
                      <Button size="sm" variant="outline">Mark Done</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-warning/5 rounded-lg border-l-4 border-warning">
                      <div>
                        <p className="font-medium">Apply fertilizer</p>
                        <p className="text-sm text-muted-foreground">Based on soil analysis - high priority</p>
                      </div>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg border-l-4 border-success">
                      <div>
                        <p className="font-medium">Weather monitoring</p>
                        <p className="text-sm text-muted-foreground">Rain forecast - prepare drainage</p>
                      </div>
                      <Button size="sm" variant="outline">Set Reminder</Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Welcome to Soil Saathi</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Complete the setup process to start monitoring your field health with satellite data
                    </p>
                    <Button onClick={() => setShowOnboarding(true)}>
                      Complete Setup
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col gap-1"
                    onClick={() => userSetup ? setActiveTab("health") : setShowOnboarding(true)}
                  >
                    <Satellite className="h-5 w-5" />
                    <span className="text-xs">{userSetup ? 'New Analysis' : 'Setup First'}</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col gap-1"
                    onClick={() => setActiveTab("marketplace")}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="text-xs">Buy Supplies</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col gap-1"
                    onClick={userSetup ? () => setActiveTab("map") : startNewFieldMapping}
                  >
                    <MapPin className="h-5 w-5" />
                    <span className="text-xs">{userSetup ? 'View Fields' : 'Map Field'}</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col gap-1"
                    onClick={() => userSetup ? setActiveTab("indices") : setShowOnboarding(true)}
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-xs">{userSetup ? 'View Reports' : 'Get Started'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investor">
            <InvestorDashboard />
          </TabsContent>

          <TabsContent value="map">
            <FarmMap />
          </TabsContent>

          <TabsContent value="health">
            <HealthAssessment />
          </TabsContent>

          <TabsContent value="indices">
            <VegetationIndices />
          </TabsContent>

          <TabsContent value="calculator">
            <DoseCalculator />
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
            <VoiceAssistant context={activeTab as any} />
          </TabsContent>

          <TabsContent value="whatsapp">
            <WhatsAppIntegration />
          </TabsContent>

          <TabsContent value="accessibility">
            <AccessibilityFeatures />
          </TabsContent>
        </Tabs>
        </div>
      </div>
      )}
    </div>
  );
};

export default Index;
