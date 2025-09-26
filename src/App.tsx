import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import PunjabPhenologyDashboard from "./components/PunjabPhenologyDashboard";
import PunjabAlerts from "./components/PunjabAlerts";
import PunjabGovernmentIntegration from "./components/PunjabGovernmentIntegration";
// Anand Saathi Components
import AnandSaathiEnhancedFieldMapper from "./components/AnandSaathiEnhancedFieldMapper";
import AnandSaathiGovernmentIntegration from "./components/AnandSaathiGovernmentIntegration";
import AnandSaathiAIForecasting from "./components/AnandSaathiAIForecasting";
import AnandSaathiDashboard from "./components/AnandSaathiDashboard";
import AnandSaathiAlerts from "./components/AnandSaathiAlerts";
import AnandSaathiUnifiedDataHub from "./components/AnandSaathiUnifiedDataHub";
import AnandSaathiUnifiedVoiceAssistant from "./components/AnandSaathiUnifiedVoiceAssistant";
import AnandSaathiUnifiedMarketplace from "./components/AnandSaathiUnifiedMarketplace";
import AnandSaathiWhatsAppIntegration from "./components/AnandSaathiWhatsAppIntegration";
import AnandSaathiAccessibilityFeatures from "./components/AnandSaathiAccessibilityFeatures";
import AnandSaathiHealthAssessment from "./components/AnandSaathiHealthAssessment";
import AnandSaathiRealTimeMetrics from "./components/AnandSaathiRealTimeMetrics";
import AnandSaathiCropManagement from "./components/AnandSaathiCropManagement";
import AnandSaathiIrrigationManagement from "./components/AnandSaathiIrrigationManagement";
import AnandSaathiPestDiseaseManagement from "./components/AnandSaathiPestDiseaseManagement";
import AnandSaathiFinancialManagement from "./components/AnandSaathiFinancialManagement";
import AnandSaathiSoilAnalysis from "./components/AnandSaathiSoilAnalysis";
import AnandSaathiWeatherMonitoring from "./components/AnandSaathiWeatherMonitoring";
import AnandSaathiFertilizerCalculator from "./components/AnandSaathiFertilizerCalculator";
import AnandSaathiCropRotation from "./components/AnandSaathiCropRotation";
import AnandSaathiPestControl from "./components/AnandSaathiPestControl";
import AnandSaathiHarvestPlanning from "./components/AnandSaathiHarvestPlanning";
import AnandSaathiMarketAnalysis from "./components/AnandSaathiMarketAnalysis";
import AnandSaathiSustainability from "./components/AnandSaathiSustainability";
import AnandSaathiReports from "./components/AnandSaathiReports";
import AnandSaathiSettings from "./components/AnandSaathiSettings";
// UI/UX Components
import OnboardingWizard from "./components/OnboardingWizard";
import SimpleFarmerInterface from "./components/SimpleFarmerInterface";
import DemoModeToggle from "./components/DemoModeToggle";
import InvestorDashboard from "./components/InvestorDashboard";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
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
              id: 'demo-field',
              name: 'Demo Field',
              farm_id: 'demo-farm',
              area_acres: 2.5,
              crop_type: 'Rice',
              latitude: 30.9010,
              longitude: 75.8573
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
              crop_type: 'Rice',
              latitude: 30.9010,
              longitude: 75.8573,
              created_at: '2024-01-01'
            }} />} />
            <Route path="/anand-saathi/weather-monitoring" element={<AnandSaathiWeatherMonitoring fieldData={{
              id: 1,
              name: 'Demo Field',
              farm_id: 1,
              area_acres: 2.5,
              crop_type: 'Rice',
              latitude: 30.9010,
              longitude: 75.8573,
              created_at: '2024-01-01'
            }} />} />
            <Route path="/anand-saathi/fertilizer-calculator" element={<AnandSaathiFertilizerCalculator fieldData={{
              id: 1,
              name: 'Demo Field',
              farm_id: 1,
              area_acres: 2.5,
              crop_type: 'Rice',
              latitude: 30.9010,
              longitude: 75.8573,
              created_at: '2024-01-01'
            }} />} />
            <Route path="/anand-saathi/crop-rotation" element={<AnandSaathiCropRotation fieldData={{
              id: 1,
              name: 'Demo Field',
              farm_id: 1,
              area_acres: 2.5,
              crop_type: 'Rice',
              latitude: 30.9010,
              longitude: 75.8573,
              created_at: '2024-01-01'
            }} />} />
            <Route path="/anand-saathi/pest-control" element={<AnandSaathiPestControl fieldData={{
              id: 1,
              name: 'Demo Field',
              farm_id: 1,
              area_acres: 2.5,
              crop_type: 'Rice',
              latitude: 30.9010,
              longitude: 75.8573,
              created_at: '2024-01-01'
            }} />} />
            <Route path="/anand-saathi/harvest-planning" element={<AnandSaathiHarvestPlanning fieldData={{
              id: 1,
              name: 'Demo Field',
              farm_id: 1,
              area_acres: 2.5,
              crop_type: 'Rice',
              latitude: 30.9010,
              longitude: 75.8573,
              created_at: '2024-01-01'
            }} />} />
            <Route path="/anand-saathi/market-analysis" element={<AnandSaathiMarketAnalysis fieldData={{
              id: 1,
              name: 'Demo Field',
              farm_id: 1,
              area_acres: 2.5,
              crop_type: 'Rice',
              latitude: 30.9010,
              longitude: 75.8573,
              created_at: '2024-01-01'
            }} />} />
            <Route path="/anand-saathi/sustainability" element={<AnandSaathiSustainability fieldData={{
              id: 1,
              name: 'Demo Field',
              farm_id: 1,
              area_acres: 2.5,
              crop_type: 'Rice',
              latitude: 30.9010,
              longitude: 75.8573,
              created_at: '2024-01-01'
            }} />} />
            <Route path="/anand-saathi/reports" element={<AnandSaathiReports fieldData={{
              id: 1,
              name: 'Demo Field',
              farm_id: 1,
              area_acres: 2.5,
              crop_type: 'Rice',
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;