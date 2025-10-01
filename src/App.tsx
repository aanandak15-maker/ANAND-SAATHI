import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./components/AuthProvider";
import SignInPage from "./components/SignInPage";
import { AppStateProvider } from "./contexts/AppStateContext";

// Lazy load components for code splitting
const PunjabPhenologyDashboard = lazy(() => import("./components/PunjabPhenologyDashboard"));
const PunjabAlerts = lazy(() => import("./components/PunjabAlerts"));
const PunjabGovernmentIntegration = lazy(() => import("./components/PunjabGovernmentIntegration"));

// Anand Saathi Components - Lazy loaded for performance
const AnandSaathiEnhancedFieldMapper = lazy(() => import("./components/AnandSaathiEnhancedFieldMapper"));
const AnandSaathiGovernmentIntegration = lazy(() => import("./components/AnandSaathiGovernmentIntegration"));
const AnandSaathiAIForecasting = lazy(() => import("./components/AnandSaathiAIForecasting"));
const AnandSaathiDashboard = lazy(() => import("./components/AnandSaathiDashboard"));
const AnandSaathiAlerts = lazy(() => import("./components/AnandSaathiAlerts"));
const AnandSaathiUnifiedDataHub = lazy(() => import("./components/AnandSaathiUnifiedDataHub"));
const AnandSaathiUnifiedVoiceAssistant = lazy(() => import("./components/AnandSaathiUnifiedVoiceAssistant"));
const AnandSaathiUnifiedMarketplace = lazy(() => import("./components/AnandSaathiUnifiedMarketplace"));
const AnandSaathiWhatsAppIntegration = lazy(() => import("./components/AnandSaathiWhatsAppIntegration"));
const AnandSaathiAccessibilityFeatures = lazy(() => import("./components/AnandSaathiAccessibilityFeatures"));
const AnandSaathiHealthAssessment = lazy(() => import("./components/AnandSaathiHealthAssessment"));
const AnandSaathiRealTimeMetrics = lazy(() => import("./components/AnandSaathiRealTimeMetrics"));
const AnandSaathiCropManagement = lazy(() => import("./components/AnandSaathiCropManagement"));
const AnandSaathiIrrigationManagement = lazy(() => import("./components/AnandSaathiIrrigationManagement"));
const AnandSaathiPestDiseaseManagement = lazy(() => import("./components/AnandSaathiPestDiseaseManagement"));
const AnandSaathiFinancialManagement = lazy(() => import("./components/AnandSaathiFinancialManagement"));
const AnandSaathiSoilAnalysis = lazy(() => import("./components/AnandSaathiSoilAnalysis"));
const AnandSaathiWeatherMonitoring = lazy(() => import("./components/AnandSaathiWeatherMonitoring"));
const AnandSaathiFertilizerCalculator = lazy(() => import("./components/AnandSaathiFertilizerCalculator"));
const AnandSaathiCropRotation = lazy(() => import("./components/AnandSaathiCropRotation"));
const AnandSaathiPestControl = lazy(() => import("./components/AnandSaathiPestControl"));
const AnandSaathiHarvestPlanning = lazy(() => import("./components/AnandSaathiHarvestPlanning"));
const AnandSaathiMarketAnalysis = lazy(() => import("./components/AnandSaathiMarketAnalysis"));
const AnandSaathiSustainability = lazy(() => import("./components/AnandSaathiSustainability"));
const AnandSaathiReports = lazy(() => import("./components/AnandSaathiReports"));
const AnandSaathiSettings = lazy(() => import("./components/AnandSaathiSettings"));

// UI/UX Components - Lazy loaded
const OnboardingWizard = lazy(() => import("./components/OnboardingWizard"));
const SimpleFarmerInterface = lazy(() => import("./components/SimpleFarmerInterface"));
const DemoModeToggle = lazy(() => import("./components/DemoModeToggle"));

// Phase 2-4 Components - New Implementation
const EnhancedFieldMapperWithState = lazy(() => import("./components/EnhancedFieldMapperWithState"));
const AIForecastingDashboard = lazy(() => import("./components/AIForecastingDashboard"));
const IoTDashboard = lazy(() => import("./components/IoTDashboard"));
const GovernmentIntegrationDashboard = lazy(() => import("./components/GovernmentIntegrationDashboard"));
const VegetationAnalysisDashboard = lazy(() => import("./components/VegetationAnalysisDashboard"));
const UnifiedIntelligenceDashboard = lazy(() => import("./components/UnifiedIntelligenceDashboard"));
const InvestorDashboard = lazy(() => import("./components/InvestorDashboard"));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppStateProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Index />} />
                {/* Authentication Routes */}
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/anand-saathi/signin" element={<SignInPage />} />
                {/* Punjab Rice Phenology System Routes */}
                <Route path="/punjab" element={<PunjabPhenologyDashboard />} />
                <Route path="/punjab/alerts" element={<PunjabAlerts />} />
                <Route path="/punjab/government" element={<PunjabGovernmentIntegration />} />
                {/* Anand Saathi Unified Platform Routes */}
                <Route path="/anand-saathi" element={<Index />} />
                <Route path="/anand-saathi/dashboard" element={<AnandSaathiDashboard />} />
              <Route path="/anand-saathi/field-mapping" element={<AnandSaathiEnhancedFieldMapper farmId="demo-farm" />} />
              <Route path="/anand-saathi/government" element={<AnandSaathiGovernmentIntegration />} />
              <Route path="/anand-saathi/ai-forecasting" element={<AnandSaathiAIForecasting fieldData={{
                id: 1,
                name: 'Demo Field',
                farm_id: 1,
                area_acres: 2.5,
                crop_type: 'rice',
                latitude: 30.9010,
                longitude: 75.8573,
                created_at: '2024-01-01'
              }} />} />
              <Route path="/anand-saathi/alerts" element={<AnandSaathiAlerts />} />
              <Route path="/anand-saathi/data-hub" element={<AnandSaathiUnifiedDataHub />} />
              <Route path="/anand-saathi/voice-assistant" element={<AnandSaathiUnifiedVoiceAssistant />} />
              <Route path="/anand-saathi/marketplace" element={<AnandSaathiUnifiedMarketplace />} />
              <Route path="/anand-saathi/whatsapp" element={<AnandSaathiWhatsAppIntegration />} />
              <Route path="/anand-saathi/accessibility" element={<AnandSaathiAccessibilityFeatures />} />
              <Route path="/anand-saathi/health-assessment" element={<AnandSaathiHealthAssessment />} />
              <Route path="/anand-saathi/real-time-metrics" element={<AnandSaathiRealTimeMetrics />} />
              <Route path="/anand-saathi/crop-management" element={<AnandSaathiCropManagement />} />
              <Route path="/anand-saathi/irrigation" element={<AnandSaathiIrrigationManagement />} />
              <Route path="/anand-saathi/pest-disease" element={<AnandSaathiPestDiseaseManagement />} />
              <Route path="/anand-saathi/financial" element={<AnandSaathiFinancialManagement />} />
              <Route path="/anand-saathi/soil-analysis" element={<AnandSaathiSoilAnalysis fieldData={{
                id: 1,
                name: 'Demo Field',
                farm_id: 1,
                area_acres: 2.5,
                crop_type: 'rice',
                latitude: 30.9010,
                longitude: 75.8573,
                created_at: '2024-01-01'
              }} />} />
              <Route path="/anand-saathi/weather-monitoring" element={<AnandSaathiWeatherMonitoring fieldData={{
                id: 1,
                name: 'Demo Field',
                farm_id: 1,
                area_acres: 2.5,
                crop_type: 'rice',
                latitude: 30.9010,
                longitude: 75.8573,
                created_at: '2024-01-01'
              }} />} />
              <Route path="/anand-saathi/fertilizer-calculator" element={<AnandSaathiFertilizerCalculator fieldData={{
                id: 1,
                name: 'Demo Field',
                farm_id: 1,
                area_acres: 2.5,
                crop_type: 'rice',
                latitude: 30.9010,
                longitude: 75.8573,
                created_at: '2024-01-01'
              }} />} />
              <Route path="/anand-saathi/crop-rotation" element={<AnandSaathiCropRotation fieldData={{
                id: 1,
                name: 'Demo Field',
                farm_id: 1,
                area_acres: 2.5,
                crop_type: 'rice',
                latitude: 30.9010,
                longitude: 75.8573,
                created_at: '2024-01-01'
              }} />} />
              <Route path="/anand-saathi/pest-control" element={<AnandSaathiPestControl fieldData={{
                id: 1,
                name: 'Demo Field',
                farm_id: 1,
                area_acres: 2.5,
                crop_type: 'rice',
                latitude: 30.9010,
                longitude: 75.8573,
                created_at: '2024-01-01'
              }} />} />
              <Route path="/anand-saathi/harvest-planning" element={<AnandSaathiHarvestPlanning fieldData={{
                id: 1,
                name: 'Demo Field',
                farm_id: 1,
                area_acres: 2.5,
                crop_type: 'rice',
                latitude: 30.9010,
                longitude: 75.8573,
                created_at: '2024-01-01'
              }} />} />
              <Route path="/anand-saathi/market-analysis" element={<AnandSaathiMarketAnalysis fieldData={{
                id: 1,
                name: 'Demo Field',
                farm_id: 1,
                area_acres: 2.5,
                crop_type: 'rice',
                latitude: 30.9010,
                longitude: 75.8573,
                created_at: '2024-01-01'
              }} />} />
              <Route path="/anand-saathi/sustainability" element={<AnandSaathiSustainability fieldData={{
                id: 1,
                name: 'Demo Field',
                farm_id: 1,
                area_acres: 2.5,
                crop_type: 'rice',
                latitude: 30.9010,
                longitude: 75.8573,
                created_at: '2024-01-01'
              }} />} />
              <Route path="/anand-saathi/reports" element={<AnandSaathiReports fieldData={{
                id: 1,
                name: 'Demo Field',
                farm_id: 1,
                area_acres: 2.5,
                crop_type: 'rice',
                latitude: 30.9010,
                longitude: 75.8573,
                created_at: '2024-01-01'
              }} />} />
              <Route path="/anand-saathi/settings" element={<AnandSaathiSettings />} />
              {/* UI/UX Routes */}
              <Route path="/anand-saathi/onboarding" element={<OnboardingWizard onComplete={() => window.location.href = '/anand-saathi/dashboard'} />} />
              <Route path="/anand-saathi/simple-interface" element={<SimpleFarmerInterface farmerData={{
                name: 'Ram Singh',
                location: 'Punjab, India',
                cropHealth: 'good',
                alerts: [
                  { type: 'weather', message: 'Rain expected in 2 days', urgency: 'medium' },
                  { type: 'nutrition', message: 'Nitrogen levels optimal', urgency: 'low' }
                ],
                todayActions: [
                  { action: 'Apply fertilizer', cost: 500, expectedROI: '+15% yield' },
                  { action: 'Check irrigation', cost: 200, expectedROI: '+8% efficiency' }
                ],
                monthlyROI: '+12%'
              }} />} />
              <Route path="/anand-saathi/demo-mode" element={<DemoModeToggle onScenarioChange={() => {}} currentScenario={null} />} />
              <Route path="/anand-saathi/investor-dashboard" element={<InvestorDashboard />} />
              
              {/* Phase 2-4 New Routes - Enhanced Components */}
              <Route path="/field-mapper-v2" element={<EnhancedFieldMapperWithState />} />
              <Route path="/ai-forecasting-v2" element={<AIForecastingDashboard />} />
              <Route path="/iot-dashboard" element={<IoTDashboard />} />
              <Route path="/government-integration" element={<GovernmentIntegrationDashboard />} />
              <Route path="/vegetation-analysis" element={<VegetationAnalysisDashboard />} />
              <Route path="/unified-intelligence" element={<UnifiedIntelligenceDashboard />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
        </AppStateProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;