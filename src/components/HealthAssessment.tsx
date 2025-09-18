import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, AlertTriangle, CheckCircle, Droplets, Volume2, FileText, ShoppingCart, MapPin, Clock, TrendingUp, RefreshCw, Brain } from "lucide-react";
import { api, type FieldData, type FieldInsights } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { generateEnhancedDiagnosis, type MultiLanguageDiagnosis } from "@/lib/enhancedDiagnosis";
import { audioService, generateAudioForDiagnosis } from "@/lib/audioService";
import AudioPlayer from "@/components/AudioPlayer";
import { getMostRecentField, getStoredFields, type RealFieldData } from "@/lib/realFieldData";

const HealthAssessment = () => {
  const [aiInsights, setAiInsights] = useState<FieldInsights | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [enhancedDiagnosis, setEnhancedDiagnosis] = useState<MultiLanguageDiagnosis | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'hindi' | 'punjabi'>('english');
  const [audioData, setAudioData] = useState<{
    [key: string]: {
      titleAudio?: string;
      summaryAudio?: string;
      analysisAudio?: string;
      recommendationsAudio?: string;
      actionsAudio?: string;
      timelineAudio?: string;
      economicAudio?: string;
      riskAudio?: string;
      fullAudio?: string;
    }
  }>({});
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [realFieldData, setRealFieldData] = useState<RealFieldData | null>(null);
  const [hasRealData, setHasRealData] = useState(false);
  const { toast } = useToast();

  // Check for real field data on component mount
  useEffect(() => {
    const checkForRealData = () => {
      const storedFields = getStoredFields();
      const mostRecentField = getMostRecentField();
      
      if (mostRecentField) {
        setRealFieldData(mostRecentField);
        setHasRealData(true);
        console.log('🌾 Found real field data:', mostRecentField);
        
        // Auto-generate insights with real data
        generateAIInsightsWithRealData(mostRecentField);
      } else {
        setHasRealData(false);
        console.log('📊 No real field data found, using demo data');
      }
    };

    checkForRealData();
  }, []);

  // Generate health metrics based on real data or demo data
  const healthMetrics = realFieldData ? [
    { 
      name: "NDVI Health", 
      value: Math.round(realFieldData.analysis.ndvi * 100), 
      status: realFieldData.analysis.ndvi > 0.6 ? "excellent" : realFieldData.analysis.ndvi > 0.4 ? "good" : "moderate", 
      color: realFieldData.analysis.ndvi > 0.6 ? "success" : realFieldData.analysis.ndvi > 0.4 ? "success" : "warning",
      description: "Crop greenness and vigor",
      trend: realFieldData.analysis.ndvi > 0.6 ? "+5% from last analysis" : "-2% from last analysis",
      action: realFieldData.analysis.ndvi > 0.6 ? "Continue current fertilization" : "Consider additional fertilization"
    },
    { 
      name: "Soil Moisture", 
      value: Math.round(realFieldData.analysis.ndmi * 100), 
      status: realFieldData.analysis.ndmi > 0.3 ? "good" : "moderate", 
      color: realFieldData.analysis.ndmi > 0.3 ? "success" : "warning",
      description: "Water content in soil",
      trend: realFieldData.analysis.waterStressLevel === 'low' ? "Stable" : "Decreasing", 
      action: realFieldData.analysis.waterStressLevel === 'low' ? "Maintain irrigation" : "Increase irrigation frequency"
    },
    { 
      name: "Plant Health", 
      value: Math.round(realFieldData.analysis.qualityScore * 100), 
      status: realFieldData.analysis.healthStatus, 
      color: realFieldData.analysis.healthStatus === 'excellent' ? "success" : realFieldData.analysis.healthStatus === 'good' ? "success" : "warning",
      description: "Overall plant condition",
      trend: realFieldData.analysis.qualityScore > 0.8 ? "+3% improvement" : "Needs attention",
      action: realFieldData.analysis.healthStatus === 'excellent' ? "Maintain current care routine" : "Review field management"
    },
    { 
      name: "Disease Risk", 
      value: realFieldData.analysis.qualityScore > 0.8 ? 15 : 35, 
      status: realFieldData.analysis.qualityScore > 0.8 ? "low" : "moderate", 
      color: realFieldData.analysis.qualityScore > 0.8 ? "success" : "warning",
      description: "Probability of disease",
      trend: realFieldData.analysis.qualityScore > 0.8 ? "Stable" : "Increasing",
      action: realFieldData.analysis.qualityScore > 0.8 ? "Continue monitoring" : "Increase monitoring frequency"
    }
  ] : [
    { 
      name: "NDVI Health", 
      value: 85, 
      status: "good", 
      color: "success",
      description: "Crop greenness and vigor",
      trend: "+3% from last week",
      action: "Continue current fertilization"
    },
    { 
      name: "Soil Moisture", 
      value: 65, 
      status: "moderate", 
      color: "warning",
      description: "Water content in soil",
      trend: "-8% from last week", 
      action: "Increase irrigation frequency"
    },
    { 
      name: "Plant Health", 
      value: 92, 
      status: "excellent", 
      color: "success",
      description: "Overall plant condition",
      trend: "+5% improvement",
      action: "Maintain current care routine"
    },
    { 
      name: "Disease Risk", 
      value: 25, 
      status: "low", 
      color: "success",
      description: "Probability of disease",
      trend: "Stable",
      action: "Continue monitoring"
    }
  ];

  const detailedAnalysis = [
    {
      zone: "North Field",
      area: "0.8 hectares", 
      health: 92,
      issues: [],
      recommendations: ["Continue current irrigation", "Monitor for optimal harvest timing"],
      lastUpdated: "2 hours ago"
    },
    {
      zone: "Central Field", 
      area: "1.2 hectares",
      health: 75,
      issues: ["Low nitrogen detected", "Slight water stress"],
      recommendations: ["Apply 50kg/ha urea fertilizer", "Increase irrigation by 20%"],
      lastUpdated: "2 hours ago"
    },
    {
      zone: "South Field",
      area: "0.5 hectares", 
      health: 88,
      issues: ["Minor pest activity"],
      recommendations: ["Monitor pest levels", "Consider organic neem application"],
      lastUpdated: "2 hours ago"
    }
  ];

  const audioExplanations = [
    { id: 1, title: "Field Health Overview (Hindi)", duration: "2:30", language: "hi" },
    { id: 2, title: "Irrigation Recommendations (Hindi)", duration: "1:45", language: "hi" },
    { id: 3, title: "Fertilizer Application Guide (English)", duration: "3:15", language: "en" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
      case "good":
        return <CheckCircle className="h-4 w-4" />;
      case "moderate":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const playAudio = (audioId: number) => {
    // Audio playback simulation
    console.log(`Playing audio ${audioId}`);
  };

  const generateAIInsightsWithRealData = async (fieldData: RealFieldData) => {
    setIsLoadingInsights(true);
    try {
      console.log('🌾 Generating AI insights with real field data:', fieldData);
      
      // Convert real field data to API format with ALL vegetation indices
      const apiFieldData: FieldData = {
        field_id: fieldData.field_id,
        location: `${fieldData.location.lat.toFixed(4)}, ${fieldData.location.lng.toFixed(4)}`,
        crop: fieldData.crop,
        crop_stage: fieldData.analysis.cropStage,
        last_analysis_date: fieldData.analysis.analysisDate instanceof Date 
          ? fieldData.analysis.analysisDate.toISOString() 
          : new Date(fieldData.analysis.analysisDate).toISOString(),
        health_zones: {
          overall_ndvi: fieldData.analysis.ndvi,
          problem_areas: fieldData.analysis.ndvi < 0.5 ? ["Low NDVI areas detected"] : [],
          ndvi_trend: fieldData.analysis.ndvi > 0.6 ? "increasing" : "decreasing"
        },
        // Include ALL vegetation indices for comprehensive analysis
        vegetation_indices: {
          ndvi: fieldData.analysis.ndvi,
          msavi2: fieldData.analysis.msavi2,
          ndre: fieldData.analysis.ndre,
          ndmi: fieldData.analysis.ndmi,
          rvi: fieldData.analysis.rvi,
          soc_vis: fieldData.analysis.socVis
        },
        field_conditions: {
          health_status: fieldData.analysis.healthStatus,
          water_stress_level: fieldData.analysis.waterStressLevel,
          quality_score: fieldData.analysis.qualityScore,
          cloud_cover: fieldData.analysis.cloudCover,
          field_area_hectares: fieldData.area
        },
        weather: fieldData.weather ? {
          recent_rainfall_mm: fieldData.weather.rainfall,
          temperature_celsius: fieldData.weather.temperature,
          humidity_percent: fieldData.weather.humidity
        } : {
          recent_rainfall_mm: 0,
          temperature_celsius: 25,
          humidity_percent: 60
        },
        farmer_actions: {
          last_irrigation: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          last_fertilizer: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      };

      const insights = await api.summarizeField(apiFieldData, 'hi');
      setAiInsights(insights);
      
      // Generate enhanced diagnosis with real data
      const diagnosisData = {
        ndvi: fieldData.analysis.ndvi,
        ndmi: fieldData.analysis.ndmi,
        msavi2: fieldData.analysis.msavi2,
        ndre: fieldData.analysis.ndre,
        rvi: fieldData.analysis.rvi,
        cropType: fieldData.crop.toLowerCase(),
        cropStage: fieldData.analysis.cropStage,
        waterStressLevel: fieldData.analysis.waterStressLevel,
        healthStatus: fieldData.analysis.healthStatus,
        qualityScore: fieldData.analysis.qualityScore,
        fieldArea: fieldData.area,
        season: 'kharif' // Can be determined from date
      };
      
      const enhanced = generateEnhancedDiagnosis(diagnosisData);
      setEnhancedDiagnosis(enhanced);
      
      toast({
        title: "Real Field Analysis Complete",
        description: `Analysis generated for ${fieldData.crop} field using real satellite data`,
      });
    } catch (error) {
      console.error('Failed to generate AI insights with real data:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to generate AI insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const generateAIInsights = async () => {
    if (realFieldData) {
      await generateAIInsightsWithRealData(realFieldData);
    } else {
      setIsLoadingInsights(true);
      try {
        // Fallback to demo data if no real data available
      const fieldData: FieldData = {
          field_id: "demo_field_001",
          location: "Demo Location",
          crop: "Demo Crop",
        crop_stage: "Mid-season",
        last_analysis_date: new Date().toISOString(),
        health_zones: {
          overall_ndvi: 0.45,
          problem_areas: ["North-East corner"],
          ndvi_trend: "decreasing"
        },
        weather: {
          recent_rainfall_mm: 5,
          temperature_celsius: 32
        },
        farmer_actions: {
          last_irrigation: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          last_fertilizer: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      };

      const insights = await api.summarizeField(fieldData, 'hi');
      setAiInsights(insights);
        
        // Generate enhanced diagnosis with demo data
        const diagnosisData = {
          ndvi: 0.68,
          ndmi: 0.35,
          msavi2: 0.64,
          ndre: 0.61,
          rvi: 2.9,
          cropType: 'rice',
          cropStage: 'vegetative',
          waterStressLevel: 'mild',
          healthStatus: 'good',
          qualityScore: 0.89,
          fieldArea: 1.0,
          season: 'kharif'
        };
        
        const enhanced = generateEnhancedDiagnosis(diagnosisData);
        setEnhancedDiagnosis(enhanced);
        
      toast({
          title: "Demo Analysis Complete",
          description: "Using demo data - map a real field for actual analysis",
          variant: "default",
      });
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to generate AI insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingInsights(false);
      }
    }
  };

  const generateAudioForLanguage = async (language: 'english' | 'hindi' | 'punjabi') => {
    if (!enhancedDiagnosis) {
      toast({
        title: "No Diagnosis Available",
        description: "Please generate AI insights first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingAudio(true);
    try {
      const diagnosis = enhancedDiagnosis[language];
      const audio = await generateAudioForDiagnosis(diagnosis, language);
      
      setAudioData(prev => ({
        ...prev,
        [language]: audio
      }));

      toast({
        title: "Audio Generated Successfully",
        description: `Audio for ${language} diagnosis is ready`,
      });
    } catch (error) {
      console.error('Failed to generate audio:', error);
      toast({
        title: "Audio Generation Failed",
        description: "Unable to generate audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const generateAllAudio = async () => {
    if (!enhancedDiagnosis) {
      toast({
        title: "No Diagnosis Available",
        description: "Please generate AI insights first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingAudio(true);
    try {
      const languages: ('english' | 'hindi' | 'punjabi')[] = ['english', 'hindi', 'punjabi'];
      const audioPromises = languages.map(async (language) => {
        const diagnosis = enhancedDiagnosis[language];
        const audio = await generateAudioForDiagnosis(diagnosis, language);
        return { language, audio };
      });

      const results = await Promise.all(audioPromises);
      const newAudioData: typeof audioData = {};
      
      results.forEach(({ language, audio }) => {
        newAudioData[language] = audio;
      });

      setAudioData(newAudioData);

      toast({
        title: "All Audio Generated Successfully",
        description: "Audio for all languages is ready",
      });
    } catch (error) {
      console.error('Failed to generate all audio:', error);
      toast({
        title: "Audio Generation Failed",
        description: "Unable to generate audio for some languages",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  useEffect(() => {
    // Auto-generate insights on component mount
    generateAIInsights();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Field Health Assessment
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary">NISAR-Ready</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="diagnosis" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="diagnosis">AI Field Analysis</TabsTrigger>
            <TabsTrigger value="audio">Audio Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="diagnosis" className="space-y-6">
            {/* AI Insights Section */}
            {aiInsights && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">AI Field Analysis</h3>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Gemini Powered
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <h4 className="font-semibold mb-2 text-blue-900 flex items-center gap-2">
                      📊 Summary:
                    </h4>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {aiInsights.summary}
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <h4 className="font-semibold mb-3 text-blue-900 flex items-center gap-2">
                      🔍 Diagnosis:
                    </h4>
                    <div className="text-sm text-gray-700">
                      {typeof aiInsights.diagnosis === 'string' ? 
                        aiInsights.diagnosis.split('.').filter(d => d.trim()).map((point, index) => (
                          <div key={index} className="flex items-start gap-2 mb-2">
                            <span className="font-medium text-blue-600 mt-0.5">•</span>
                            <span>{point.trim()}.</span>
                          </div>
                        )) :
                        <div>{aiInsights.diagnosis}</div>
                      }
                    </div>
                  </div>
                  
                  {Array.isArray(aiInsights.recommendations) && aiInsights.recommendations.length > 0 && (
                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                      <h4 className="font-semibold mb-3 text-blue-900 flex items-center gap-2">
                        💡 Action Plan:
                      </h4>
                      <div className="space-y-3">
                        {aiInsights.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                            <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mt-0.5">
                              {index + 1}
                            </span>
                            <span className="text-gray-700 flex-1">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isLoadingInsights && (
              <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-blue-600" />
                <p className="text-gray-600">Generating AI insights from satellite data...</p>
              </div>
            )}

            {/* Enhanced Overall Health Score */}
            <div className="text-center p-6 bg-gradient-to-r from-success/10 to-success/5 rounded-lg border border-success/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-6 w-6 text-success" />
                <h3 className="text-4xl font-bold text-success">87%</h3>
              </div>
              <p className="text-success font-medium mb-1">Overall Health Score</p>
              <p className="text-sm text-muted-foreground mb-3">+3% improvement from last week</p>
              <Badge variant="secondary" className="bg-success/20 text-success">
                <CheckCircle className="h-3 w-3 mr-1" />
                Good Condition
              </Badge>
            </div>

            {/* Enhanced Health Metrics */}
            <div className="space-y-4">
              {healthMetrics.map((metric) => (
                <div key={metric.name} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(metric.status)}
                        <span className="font-medium">{metric.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{metric.description}</p>
                      <p className="text-xs text-accent">{metric.trend}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold">{metric.value}%</span>
                    </div>
                  </div>
                  <Progress value={metric.value} className="h-3" />
                  <div className="bg-muted/50 p-2 rounded text-sm">
                    <strong>Action:</strong> {metric.action}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-16 flex flex-col gap-1">
                <ShoppingCart className="h-5 w-5" />
                <span className="text-xs">Buy Fertilizer</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1">
                <MapPin className="h-5 w-5" />
                <span className="text-xs">Field Navigation</span>
              </Button>
            </div>
          </TabsContent>


          <TabsContent value="audio" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                  Audio Field Guide
              </h4>
                {hasRealData && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Real Field Data
                  </Badge>
                )}
              </div>
              
              {enhancedDiagnosis ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-bold text-lg text-green-900">Multi-Language Audio Diagnosis</h5>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => setSelectedLanguage('english')} 
                          variant={selectedLanguage === 'english' ? 'default' : 'outline'}
                          size="sm"
                        >
                          English
                        </Button>
                        <Button 
                          onClick={() => setSelectedLanguage('hindi')} 
                          variant={selectedLanguage === 'hindi' ? 'default' : 'outline'}
                          size="sm"
                        >
                          हिंदी
                        </Button>
                        <Button 
                          onClick={() => setSelectedLanguage('punjabi')} 
                          variant={selectedLanguage === 'punjabi' ? 'default' : 'outline'}
                          size="sm"
                        >
                          ਪੰਜਾਬੀ
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded-lg border border-green-100">
                        <div className="flex items-center justify-between mb-2">
                          <h6 className="font-semibold text-green-900">Field Summary</h6>
                          {audioData[selectedLanguage]?.summaryAudio && (
                            <AudioPlayer 
                              audioUrl={audioData[selectedLanguage].summaryAudio} 
                              title="Summary" 
                              language={selectedLanguage} 
                              size="sm" 
                              showProgress={false} 
                              showDownload={false} 
                            />
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{enhancedDiagnosis[selectedLanguage].summary}</p>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg border border-green-100">
                        <div className="flex items-center justify-between mb-2">
                          <h6 className="font-semibold text-green-900">Recommendations</h6>
                          {audioData[selectedLanguage]?.recommendationsAudio && (
                            <AudioPlayer 
                              audioUrl={audioData[selectedLanguage].recommendationsAudio} 
                              title="Recommendations" 
                              language={selectedLanguage} 
                              size="sm" 
                              showProgress={false} 
                              showDownload={false} 
                            />
                          )}
                        </div>
                        <div className="space-y-2">
                          {enhancedDiagnosis[selectedLanguage].specificRecommendations.slice(0, 3).map((rec, index) => (
                            <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                              <span className="bg-green-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center mt-0.5">
                                {index + 1}
                              </span>
                              <span className="text-sm text-gray-700">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button 
                        onClick={() => generateAudioForLanguage(selectedLanguage)} 
                        disabled={isGeneratingAudio} 
                        size="sm" 
                        variant="outline"
                      >
                        {isGeneratingAudio ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3 w-3 mr-1" />
                            Generate Audio
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={generateAllAudio} 
                        disabled={isGeneratingAudio} 
                        size="sm" 
                        variant="outline"
                      >
                        {isGeneratingAudio ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Generating All...
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3 w-3 mr-1" />
                            Generate All Audio
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Volume2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    {hasRealData ? 'Generate field analysis to create audio guide' : 'Map a field first to generate audio guide'}
                  </p>
                  {!hasRealData && (
                    <p className="text-sm text-gray-400">
                      Go to "Farm Map" tab to map your field, then return here for audio analysis
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="bg-accent/10 p-4 rounded-lg">
              <h5 className="font-medium mb-2">🎯 Voice Navigation</h5>
              <p className="text-sm text-muted-foreground mb-3">
                Tap and hold the microphone button to ask questions about your farm
              </p>
              <Button className="w-full" size="lg">
                <Volume2 className="h-5 w-5 mr-2" />
                Start Voice Assistant
              </Button>
            </div>
          </TabsContent>


          {/* Enhanced Multi-Language Diagnosis Tab */}
          <TabsContent value="diagnosis" className="space-y-4">
            {enhancedDiagnosis ? (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Brain className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-900">Enhanced AI Diagnosis</h3>
                      <p className="text-sm text-green-700">Detailed analysis in multiple languages</p>
                    </div>
                  </div>
                  
                  {/* Language Selector and Audio Controls */}
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <Button
                        variant={selectedLanguage === 'english' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedLanguage('english')}
                        className="text-xs"
                      >
                        English
                      </Button>
                      <Button
                        variant={selectedLanguage === 'hindi' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedLanguage('hindi')}
                        className="text-xs"
                      >
                        हिंदी
                      </Button>
                      <Button
                        variant={selectedLanguage === 'punjabi' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedLanguage('punjabi')}
                        className="text-xs"
                      >
                        ਪੰਜਾਬੀ
                      </Button>
                    </div>
                    
                    {/* Audio Generation Controls */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => generateAudioForLanguage(selectedLanguage)}
                        disabled={isGeneratingAudio}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        {isGeneratingAudio ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3 w-3 mr-1" />
                            Generate Audio
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={generateAllAudio}
                        disabled={isGeneratingAudio}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        {isGeneratingAudio ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Generating All...
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3 w-3 mr-1" />
                            Generate All Audio
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Title */}
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-lg text-green-900">
                        {enhancedDiagnosis[selectedLanguage].title}
                      </h4>
                      {audioData[selectedLanguage]?.titleAudio && (
                        <AudioPlayer
                          audioUrl={audioData[selectedLanguage].titleAudio}
                          title="Title"
                          language={selectedLanguage}
                          size="sm"
                          showProgress={false}
                          showDownload={false}
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Summary */}
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-green-900 flex items-center gap-2">
                        📊 Summary:
                      </h4>
                      {audioData[selectedLanguage]?.summaryAudio && (
                        <AudioPlayer
                          audioUrl={audioData[selectedLanguage].summaryAudio}
                          title="Summary"
                          language={selectedLanguage}
                          size="sm"
                          showProgress={false}
                          showDownload={false}
                        />
                      )}
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {enhancedDiagnosis[selectedLanguage].summary}
                    </div>
                  </div>
                  
                  {/* Detailed Analysis */}
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-green-900 flex items-center gap-2">
                        🔍 Detailed Analysis:
                      </h4>
                      {audioData[selectedLanguage]?.analysisAudio && (
                        <AudioPlayer
                          audioUrl={audioData[selectedLanguage].analysisAudio}
                          title="Analysis"
                          language={selectedLanguage}
                          size="sm"
                          showProgress={false}
                          showDownload={false}
                        />
                      )}
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-line">
                      {enhancedDiagnosis[selectedLanguage].detailedAnalysis}
                    </div>
                  </div>
                  
                  {/* Specific Recommendations */}
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-green-900 flex items-center gap-2">
                        💡 Specific Recommendations:
                      </h4>
                      {audioData[selectedLanguage]?.recommendationsAudio && (
                        <AudioPlayer
                          audioUrl={audioData[selectedLanguage].recommendationsAudio}
                          title="Recommendations"
                          language={selectedLanguage}
                          size="sm"
                          showProgress={false}
                          showDownload={false}
                        />
                      )}
                    </div>
                    <div className="space-y-3">
                      {enhancedDiagnosis[selectedLanguage].specificRecommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                          <span className="bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 flex-1">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Immediate Actions */}
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <h4 className="font-semibold mb-3 text-green-900 flex items-center gap-2">
                      ⚡ Immediate Actions:
                    </h4>
                    <div className="space-y-2">
                      {enhancedDiagnosis[selectedLanguage].immediateActions.map((action, index) => (
                        <div key={index} className="flex items-start gap-3 p-2 bg-yellow-50 rounded-lg">
                          <span className="bg-yellow-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center mt-0.5">
                            !
                          </span>
                          <span className="text-gray-700 text-sm">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Timeline */}
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <h4 className="font-semibold mb-2 text-green-900 flex items-center gap-2">
                      📅 Timeline:
                    </h4>
                    <div className="text-sm text-gray-700">
                      {enhancedDiagnosis[selectedLanguage].timeline}
                    </div>
                  </div>
                  
                  {/* Economic Impact */}
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <h4 className="font-semibold mb-2 text-green-900 flex items-center gap-2">
                      💰 Economic Impact:
                    </h4>
                    <div className="text-sm text-gray-700">
                      {enhancedDiagnosis[selectedLanguage].economicImpact}
                    </div>
                  </div>
                  
                  {/* Risk Assessment */}
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-green-900 flex items-center gap-2">
                        ⚠️ Risk Assessment:
                      </h4>
                      {audioData[selectedLanguage]?.riskAudio && (
                        <AudioPlayer
                          audioUrl={audioData[selectedLanguage].riskAudio}
                          title="Risk Assessment"
                          language={selectedLanguage}
                          size="sm"
                          showProgress={false}
                          showDownload={false}
                        />
                      )}
                    </div>
                    <div className="text-sm text-gray-700">
                      {enhancedDiagnosis[selectedLanguage].riskAssessment}
                    </div>
                  </div>

                  {/* Full Audio Player */}
                  {audioData[selectedLanguage]?.fullAudio && (
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold mb-3 text-blue-900 flex items-center gap-2">
                        🎵 Complete Audio Diagnosis:
                      </h4>
                      <AudioPlayer
                        audioUrl={audioData[selectedLanguage].fullAudio}
                        title="Complete Diagnosis"
                        language={selectedLanguage}
                        size="md"
                        showProgress={true}
                        showDownload={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Generate AI insights to see enhanced diagnosis</p>
                <Button 
                  onClick={generateAIInsights} 
                  disabled={isLoadingInsights}
                  className="mt-4"
                >
                  {isLoadingInsights ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Enhanced Diagnosis
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HealthAssessment;