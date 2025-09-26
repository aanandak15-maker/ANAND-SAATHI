/**
 * Anand Saathi Complete User Journey
 * Orchestrates the entire user experience from language selection to final AI analysis
 * Your Vision: User → Language → Info → Location → Field → Soil → Storage → Yield → Market → IoT → Schemes → Final AI
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  User, 
  MapPin, 
  Map, 
  Leaf, 
  Database, 
  Brain, 
  TrendingUp, 
  Smartphone, 
  Building2, 
  Sparkles,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Home
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { UserDataService } from '@/lib/UserDataService';
import { toast } from 'sonner';

// Import step components
import LanguageSelection from './steps/LanguageSelection';
import BasicInfo from './steps/BasicInfo';
import LocationFetch from './steps/LocationFetch';
import FieldMapping from './steps/FieldMapping';
import SoilAnalysis from './steps/SoilAnalysis';
import DataStorage from './steps/DataStorage';
import YieldPrediction from './steps/YieldPrediction';
import MarketAnalysis from './steps/MarketAnalysis';
import IoTIntegration from './steps/IoTIntegration';
import GovernmentSchemes from './steps/GovernmentSchemes';
import FinalAIAnalysis from './steps/FinalAIAnalysis';

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  data?: any;
}

interface UserJourneyData {
  language?: string;
  basicInfo?: any;
  location?: any;
  fieldData?: any;
  soilAnalysis?: any;
  yieldPrediction?: any;
  marketAnalysis?: any;
  iotData?: any;
  governmentData?: any;
  finalAnalysis?: any;
}

const AnandSaathiCompleteJourney: React.FC = () => {
  const { t, language } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState<UserJourneyData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Define all journey steps
  const journeySteps: JourneyStep[] = [
    {
      id: 'language-selection',
      title: language === 'punjabi' ? 'ਭਾਸ਼ਾ ਚੁਣੋ' : language === 'hindi' ? 'भाषा चुनें' : 'Select Language',
      description: language === 'punjabi' ? 'ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ' : language === 'hindi' ? 'अपनी पसंदीदा भाषा चुनें' : 'Choose your preferred language',
      icon: <Globe className="h-5 w-5" />,
      completed: !!userData.language
    },
    {
      id: 'basic-info',
      title: language === 'punjabi' ? 'ਮੂਲ ਜਾਣਕਾਰੀ' : language === 'hindi' ? 'मूल जानकारी' : 'Basic Information',
      description: language === 'punjabi' ? 'ਆਪਣੀ ਜਾਣਕਾਰੀ ਦਰਜ ਕਰੋ' : language === 'hindi' ? 'अपनी जानकारी दर्ज करें' : 'Enter your information',
      icon: <User className="h-5 w-5" />,
      completed: !!userData.basicInfo
    },
    {
      id: 'location-fetch',
      title: language === 'punjabi' ? 'ਸਥਾਨ ਲੱਭੋ' : language === 'hindi' ? 'स्थान खोजें' : 'Get Location',
      description: language === 'punjabi' ? 'ਆਪਣਾ ਸਥਾਨ ਆਟੋਮੈਟਿਕ ਲੱਭੋ' : language === 'hindi' ? 'अपना स्थान स्वचालित खोजें' : 'Automatically find your location',
      icon: <MapPin className="h-5 w-5" />,
      completed: !!userData.location
    },
    {
      id: 'field-mapping',
      title: language === 'punjabi' ? 'ਖੇਤ ਮੈਪਿੰਗ' : language === 'hindi' ? 'खेत मैपिंग' : 'Field Mapping',
      description: language === 'punjabi' ? 'ਆਪਣੇ ਖੇਤ ਨੂੰ ਮੈਪ ਕਰੋ' : language === 'hindi' ? 'अपने खेत को मैप करें' : 'Map your field',
      icon: <Map className="h-5 w-5" />,
      completed: !!userData.fieldData
    },
    {
      id: 'soil-analysis',
      title: language === 'punjabi' ? 'ਮਿੱਟੀ ਵਿਸ਼ਲੇਸ਼ਣ' : language === 'hindi' ? 'मिट्टी विश्लेषण' : 'Soil Analysis',
      description: language === 'punjabi' ? 'ਮਿੱਟੀ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ' : language === 'hindi' ? 'मिट्टी का विश्लेषण करें' : 'Analyze your soil',
      icon: <Leaf className="h-5 w-5" />,
      completed: !!userData.soilAnalysis
    },
    {
      id: 'data-storage',
      title: language === 'punjabi' ? 'ਡੇਟਾ ਸਟੋਰੇਜ' : language === 'hindi' ? 'डेटा स्टोरेज' : 'Data Storage',
      description: language === 'punjabi' ? 'ਆਪਣੇ ਖਾਤੇ ਵਿੱਚ ਸੇਵ ਕਰੋ' : language === 'hindi' ? 'अपने खाते में सेव करें' : 'Save to your account',
      icon: <Database className="h-5 w-5" />,
      completed: !!userData.fieldData // Data is stored when field is mapped
    },
    {
      id: 'yield-prediction',
      title: language === 'punjabi' ? 'ਪੈਦਾਵਾਰ ਪੂਰਵਾਨੁਮਾਨ' : language === 'hindi' ? 'उपज पूर्वानुमान' : 'Yield Prediction',
      description: language === 'punjabi' ? 'AI ਨਾਲ ਪੈਦਾਵਾਰ ਦਾ ਅਨੁਮਾਨ' : language === 'hindi' ? 'AI के साथ उपज का अनुमान' : 'AI-powered yield prediction',
      icon: <Brain className="h-5 w-5" />,
      completed: !!userData.yieldPrediction
    },
    {
      id: 'market-analysis',
      title: language === 'punjabi' ? 'ਬਾਜ਼ਾਰ ਵਿਸ਼ਲੇਸ਼ਣ' : language === 'hindi' ? 'बाजार विश्लेषण' : 'Market Analysis',
      description: language === 'punjabi' ? 'ਕੀਮਤਾਂ ਅਤੇ ਟ੍ਰੈਂਡ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ' : language === 'hindi' ? 'कीमतों और ट्रेंड का विश्लेषण' : 'Price and trend analysis',
      icon: <TrendingUp className="h-5 w-5" />,
      completed: !!userData.marketAnalysis
    },
    {
      id: 'iot-integration',
      title: language === 'punjabi' ? 'IoT ਇੰਟੀਗ੍ਰੇਸ਼ਨ' : language === 'hindi' ? 'IoT एकीकरण' : 'IoT Integration',
      description: language === 'punjabi' ? 'ਡਿਵਾਈਸਾਂ ਅਤੇ ਸੈਂਸਰ ਡੇਟਾ' : language === 'hindi' ? 'डिवाइस और सेंसर डेटा' : 'Devices and sensor data',
      icon: <Smartphone className="h-5 w-5" />,
      completed: !!userData.iotData
    },
    {
      id: 'government-schemes',
      title: language === 'punjabi' ? 'ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ' : language === 'hindi' ? 'सरकारी योजनाएं' : 'Government Schemes',
      description: language === 'punjabi' ? 'PM ਕਿਸਾਨ ਅਤੇ ਪੰਜਾਬ ਯੋਜਨਾਵਾਂ' : language === 'hindi' ? 'PM किसान और पंजाब योजनाएं' : 'PM Kisan and Punjab schemes',
      icon: <Building2 className="h-5 w-5" />,
      completed: !!userData.governmentData
    },
    {
      id: 'final-ai-analysis',
      title: language === 'punjabi' ? 'ਅੰਤਿਮ AI ਵਿਸ਼ਲੇਸ਼ਣ' : language === 'hindi' ? 'अंतिम AI विश्लेषण' : 'Final AI Analysis',
      description: language === 'punjabi' ? 'ਸੰਪੂਰਨ AI ਸਿਫਾਰਸ਼ਾਂ' : language === 'hindi' ? 'संपूर्ण AI सिफारिशें' : 'Comprehensive AI recommendations',
      icon: <Sparkles className="h-5 w-5" />,
      completed: !!userData.finalAnalysis
    }
  ];

  // Initialize user ID
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const storedUserId = localStorage.getItem('anand-saathi-user-id');
        if (storedUserId) {
          setUserId(storedUserId);
          // Load existing user data
          const existingData = await UserDataService.loadUserProgress(storedUserId);
          if (existingData) {
            setUserData(existingData);
            // Find the last completed step
            const lastCompletedStep = journeySteps.findIndex(step => !step.completed);
            if (lastCompletedStep > 0) {
              setCurrentStep(lastCompletedStep);
            }
          }
        } else {
          // Create new user ID
          const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('anand-saathi-user-id', newUserId);
          setUserId(newUserId);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        toast.error('Failed to initialize user session');
      }
    };

    initializeUser();
  }, []);

  // Handle step completion
  const handleStepComplete = async (stepId: string, stepData: any) => {
    try {
      setIsLoading(true);
      
      // Update user data
      const updatedUserData = { ...userData, [stepId]: stepData };
      setUserData(updatedUserData);
      
      // Save to database
      if (userId) {
        await UserDataService.saveUserData(userId, {
          step: stepId,
          data: stepData,
          completed_at: new Date().toISOString()
        });
      }
      
      // Move to next step
      if (currentStep < journeySteps.length) {
        setCurrentStep(currentStep + 1);
      }
      
      toast.success(
        language === 'punjabi' 
          ? 'ਕਦਮ ਪੂਰਾ ਹੋਇਆ!' 
          : language === 'hindi' 
          ? 'चरण पूरा हुआ!' 
          : 'Step completed!'
      );
      
    } catch (error) {
      console.error('Error completing step:', error);
      toast.error('Failed to save step data');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Navigate to specific step
  const goToStep = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= journeySteps.length) {
      setCurrentStep(stepNumber);
    }
  };

  // Render current step component
  const renderCurrentStep = () => {
    const currentStepData = journeySteps[currentStep - 1];
    
    switch (currentStepData.id) {
      case 'language-selection':
        return <LanguageSelection onComplete={(data) => handleStepComplete('language', data)} />;
      case 'basic-info':
        return <BasicInfo onComplete={(data) => handleStepComplete('basicInfo', data)} />;
      case 'location-fetch':
        return <LocationFetch onComplete={(data) => handleStepComplete('location', data)} />;
      case 'field-mapping':
        return <FieldMapping onComplete={(data) => handleStepComplete('fieldData', data)} />;
      case 'soil-analysis':
        return <SoilAnalysis onComplete={(data) => handleStepComplete('soilAnalysis', data)} />;
      case 'data-storage':
        return <DataStorage onComplete={(data) => handleStepComplete('dataStorage', data)} />;
      case 'yield-prediction':
        return <YieldPrediction onComplete={(data) => handleStepComplete('yieldPrediction', data)} />;
      case 'market-analysis':
        return <MarketAnalysis onComplete={(data) => handleStepComplete('marketAnalysis', data)} />;
      case 'iot-integration':
        return <IoTIntegration onComplete={(data) => handleStepComplete('iotData', data)} />;
      case 'government-schemes':
        return <GovernmentSchemes onComplete={(data) => handleStepComplete('governmentData', data)} />;
      case 'final-ai-analysis':
        return <FinalAIAnalysis onComplete={(data) => handleStepComplete('finalAnalysis', data)} />;
      default:
        return <div>Step not found</div>;
    }
  };

  // Calculate progress percentage
  const progressPercentage = (currentStep / journeySteps.length) * 100;
  const completedSteps = journeySteps.filter(step => step.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-green-800 flex items-center justify-center gap-3">
              <Home className="h-8 w-8" />
              {language === 'punjabi' 
                ? 'ਅਨੰਦ ਸਾਥੀ - ਪੂਰਾ ਯਾਤਰਾ' 
                : language === 'hindi' 
                ? 'आनंद साथी - पूरी यात्रा' 
                : 'Anand Saathi - Complete Journey'
              }
            </CardTitle>
            <CardDescription className="text-lg">
              {language === 'punjabi' 
                ? 'ਆਪਣੇ ਖੇਤ ਦੀ ਪੂਰੀ ਜਾਣਕਾਰੀ ਪ੍ਰਾਪਤ ਕਰੋ' 
                : language === 'hindi' 
                ? 'अपने खेत की पूरी जानकारी प्राप्त करें' 
                : 'Get complete information about your field'
              }
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Progress Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">
                  {language === 'punjabi' 
                    ? 'ਤਰੱਕੀ' 
                    : language === 'hindi' 
                    ? 'प्रगति' 
                    : 'Progress'
                  }
                </CardTitle>
                <CardDescription>
                  {language === 'punjabi' 
                    ? `${completedSteps}/${journeySteps.length} ਕਦਮ ਪੂਰੇ` 
                    : language === 'hindi' 
                    ? `${completedSteps}/${journeySteps.length} चरण पूरे` 
                    : `${completedSteps}/${journeySteps.length} steps completed`
                  }
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {Math.round(progressPercentage)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="h-3 mb-4" />
            
            {/* Step Navigation */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {journeySteps.map((step, index) => (
                <Button
                  key={step.id}
                  variant={currentStep === index + 1 ? "default" : step.completed ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => goToStep(index + 1)}
                  className="h-auto p-2 flex flex-col items-center gap-1"
                  disabled={index + 1 > currentStep && !step.completed}
                >
                  <div className="flex items-center gap-1">
                    {step.completed ? <CheckCircle className="h-3 w-3" /> : step.icon}
                  </div>
                  <span className="text-xs text-center">{index + 1}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Step */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {journeySteps[currentStep - 1].icon}
                <div>
                  <CardTitle className="text-2xl">
                    {journeySteps[currentStep - 1].title}
                  </CardTitle>
                  <CardDescription>
                    {journeySteps[currentStep - 1].description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {language === 'punjabi' ? 'ਪਿਛਲਾ' : language === 'hindi' ? 'पिछला' : 'Previous'}
                </Button>
                <Badge variant="outline">
                  {currentStep} / {journeySteps.length}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-2">
                  {language === 'punjabi' 
                    ? 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...' 
                    : language === 'hindi' 
                    ? 'लोड हो रहा है...' 
                    : 'Loading...'
                  }
                </span>
              </div>
            ) : (
              renderCurrentStep()
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {completedSteps > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {language === 'punjabi' 
                  ? 'ਪੂਰਾ ਕੀਤੇ ਗਏ ਕਦਮ' 
                  : language === 'hindi' 
                  ? 'पूरे किए गए चरण' 
                  : 'Completed Steps'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {journeySteps.filter(step => step.completed).map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">{step.title}</div>
                      <div className="text-sm text-gray-600">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnandSaathiCompleteJourney;
