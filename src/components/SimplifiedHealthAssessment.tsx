import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Volume2, Brain, RefreshCw } from "lucide-react";
import { api, type FieldData, type FieldInsights } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { generateEnhancedDiagnosis, type MultiLanguageDiagnosis } from "@/lib/enhancedDiagnosis";
import { audioService, generateAudioForDiagnosis } from "@/lib/audioService";
import RobustAudioPlayer from "@/components/RobustAudioPlayer";
import { getMostRecentField, getStoredFields, type RealFieldData } from "@/lib/realFieldData";

const SimplifiedHealthAssessment = () => {
  const [aiInsights, setAiInsights] = useState<FieldInsights | null>(null);
  const [enhancedDiagnosis, setEnhancedDiagnosis] = useState<MultiLanguageDiagnosis | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'hindi' | 'punjabi'>('hindi');
  const [audioData, setAudioData] = useState<Record<string, Record<string, string>>>({});
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [realFieldData, setRealFieldData] = useState<RealFieldData | null>(null);
  const [hasRealData, setHasRealData] = useState(false);
  const { toast } = useToast();

  // Check for real field data on component mount
  useEffect(() => {
    const checkForRealData = async () => {
      const mostRecentField = getMostRecentField();
      if (mostRecentField) {
        setRealFieldData(mostRecentField);
        setHasRealData(true);
        console.log('🌾 Found real field data:', mostRecentField);
        await generateAIInsightsWithRealData(mostRecentField);
      } else {
        setHasRealData(false);
        console.log('📊 No real field data found, using demo data');
      }
    };

    checkForRealData();
  }, []);

  // Generate AI insights with real field data
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
        cropType: fieldData.crop,
        cropStage: fieldData.analysis.cropStage,
        waterStressLevel: fieldData.analysis.waterStressLevel,
        healthStatus: fieldData.analysis.healthStatus,
        qualityScore: fieldData.analysis.qualityScore,
        fieldArea: fieldData.area,
        season: "Kharif",
        location: `${fieldData.location.lat.toFixed(4)}, ${fieldData.location.lng.toFixed(4)}`
      };
      
      const diagnosis = generateEnhancedDiagnosis(diagnosisData);
      setEnhancedDiagnosis(diagnosis);
      
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

  // Generate audio for a specific language
  const generateAudioForLanguage = async (language: 'english' | 'hindi' | 'punjabi') => {
    if (!enhancedDiagnosis) return;
    
    setIsGeneratingAudio(true);
    try {
      const diagnosis = enhancedDiagnosis[language];
      const audioPromises = [
        audioService.textToSpeech(diagnosis.title, language),
        audioService.textToSpeech(diagnosis.summary, language),
        audioService.textToSpeech(diagnosis.detailedAnalysis, language),
        audioService.textToSpeech(diagnosis.specificRecommendations.join(' '), language),
        audioService.textToSpeech(diagnosis.immediateActions.join(' '), language),
        audioService.textToSpeech(diagnosis.timeline, language),
        audioService.textToSpeech(diagnosis.economicImpact, language),
        audioService.textToSpeech(diagnosis.riskAssessment, language)
      ];

      const audioResults = await Promise.all(audioPromises);
      
      // Extract audio URLs from the results
      const audioUrls = audioResults.map(result => result.success ? result.audioUrl : null);
      
      setAudioData(prev => ({
        ...prev,
        [language]: {
          title: audioUrls[0] || '',
          summary: audioUrls[1] || '',
          detailedAnalysis: audioUrls[2] || '',
          recommendations: audioUrls[3] || '',
          immediateActions: audioUrls[4] || '',
          timeline: audioUrls[5] || '',
          economicImpact: audioUrls[6] || '',
          riskAssessment: audioUrls[7] || ''
        }
      }));

      toast({
        title: "Audio Generated",
        description: `Audio guide ready for ${language} language`,
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

  // Generate audio for all languages
  const generateAllAudio = async () => {
    const languages: ('english' | 'hindi' | 'punjabi')[] = ['english', 'hindi', 'punjabi'];
    for (const language of languages) {
      await generateAudioForLanguage(language);
    }
  };

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
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analysis">AI Field Analysis</TabsTrigger>
            <TabsTrigger value="audio">Audio Guide</TabsTrigger>
          </TabsList>

          {/* Main AI Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            {enhancedDiagnosis ? (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Brain className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-900">Enhanced AI Diagnosis</h3>
                      <p className="text-sm text-green-700">
                        {hasRealData ? 'Real field data analysis' : 'Demo analysis'} • All vegetation indices included
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline" 
                    size="sm"
                    disabled={isLoadingInsights}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingInsights ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>

                {/* Language Selector */}
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={selectedLanguage === 'english' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLanguage('english')}
                  >
                    English
                  </Button>
                  <Button
                    variant={selectedLanguage === 'hindi' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLanguage('hindi')}
                  >
                    हिंदी
                  </Button>
                  <Button
                    variant={selectedLanguage === 'punjabi' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLanguage('punjabi')}
                  >
                    ਪੰਜਾਬੀ
                  </Button>
                </div>

                {/* Diagnosis Content */}
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <h4 className="font-bold text-green-900 mb-2">📊 Summary</h4>
                    <p className="text-gray-700">{enhancedDiagnosis[selectedLanguage].summary}</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <h4 className="font-bold text-green-900 mb-2">🔍 Detailed Analysis</h4>
                    <p className="text-gray-700">{enhancedDiagnosis[selectedLanguage].detailedAnalysis}</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <h4 className="font-bold text-green-900 mb-2">💡 Specific Recommendations</h4>
                    <ul className="space-y-2">
                      {enhancedDiagnosis[selectedLanguage].specificRecommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-green-600 font-bold">{index + 1}.</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <h4 className="font-bold text-green-900 mb-2">⚡ Immediate Actions</h4>
                    <ul className="space-y-2">
                      {enhancedDiagnosis[selectedLanguage].immediateActions.map((action, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-orange-600 font-bold">{index + 1}.</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <h4 className="font-bold text-green-900 mb-2">📅 Timeline</h4>
                    <p className="text-gray-700">{enhancedDiagnosis[selectedLanguage].timeline}</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <h4 className="font-bold text-green-900 mb-2">💰 Economic Impact</h4>
                    <p className="text-gray-700">{enhancedDiagnosis[selectedLanguage].economicImpact}</p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <h4 className="font-bold text-green-900 mb-2">⚠️ Risk Assessment</h4>
                    <p className="text-gray-700">{enhancedDiagnosis[selectedLanguage].riskAssessment}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No field analysis available. Please map a field first.</p>
              </div>
            )}
          </TabsContent>

          {/* Audio Guide Tab */}
          <TabsContent value="audio" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Audio Field Guide
                </h4>
                <div className="flex gap-2">
                  <Button
                    onClick={() => generateAudioForLanguage(selectedLanguage)}
                    disabled={isGeneratingAudio || !enhancedDiagnosis}
                    size="sm"
                  >
                    Generate Audio
                  </Button>
                  <Button
                    onClick={generateAllAudio}
                    disabled={isGeneratingAudio || !enhancedDiagnosis}
                    variant="outline"
                    size="sm"
                  >
                    Generate All
                  </Button>
                </div>
              </div>

              {enhancedDiagnosis && (
                <div className="space-y-4">
                  {/* Language Selector */}
                  <div className="flex gap-2">
                    <Button
                      variant={selectedLanguage === 'english' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedLanguage('english')}
                    >
                      English
                    </Button>
                    <Button
                      variant={selectedLanguage === 'hindi' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedLanguage('hindi')}
                    >
                      हिंदी
                    </Button>
                    <Button
                      variant={selectedLanguage === 'punjabi' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedLanguage('punjabi')}
                    >
                      ਪੰਜਾਬੀ
                    </Button>
                  </div>

                  {/* Audio Players */}
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-lg border">
                      <h5 className="font-medium mb-2">📊 Summary</h5>
                      {audioData[selectedLanguage]?.summary && (
                        <RobustAudioPlayer audioUrl={audioData[selectedLanguage].summary} title="Summary" />
                      )}
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <h5 className="font-medium mb-2">🔍 Detailed Analysis</h5>
                      {audioData[selectedLanguage]?.detailedAnalysis && (
                        <RobustAudioPlayer audioUrl={audioData[selectedLanguage].detailedAnalysis} title="Detailed Analysis" />
                      )}
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <h5 className="font-medium mb-2">💡 Recommendations</h5>
                      {audioData[selectedLanguage]?.recommendations && (
                        <RobustAudioPlayer audioUrl={audioData[selectedLanguage].recommendations} title="Recommendations" />
                      )}
                    </div>

                    <div className="bg-white p-4 rounded-lg border">
                      <h5 className="font-medium mb-2">⚡ Immediate Actions</h5>
                      {audioData[selectedLanguage]?.immediateActions && (
                        <RobustAudioPlayer audioUrl={audioData[selectedLanguage].immediateActions} title="Immediate Actions" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SimplifiedHealthAssessment;
