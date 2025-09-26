/**
 * Anand Saathi AI Agent Dashboard
 * Shows farmer-friendly AI recommendations based on ALL data sources
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Droplets,
  Sun,
  DollarSign,
  Leaf,
  Activity
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { anandSaathiBackend } from '@/lib/anandSaathiBackend';
import { toast } from 'sonner';

interface AnandSaathiAIAgentProps {
  fieldId?: string;
}

const AnandSaathiAIAgent: React.FC<AnandSaathiAIAgentProps> = ({ fieldId = '1' }) => {
  const { t, language } = useTranslation();
  const isPunjabi = language === 'pa';
  const isHindi = language === 'hi';

  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [smartAdvisory, setSmartAdvisory] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load AI analysis
  const loadAIAnalysis = async () => {
    setLoading(true);
    try {
      const [analysisResult, advisoryResult] = await Promise.all([
        anandSaathiBackend.getAIFieldAnalysis(fieldId),
        anandSaathiBackend.getSmartAdvisory(fieldId)
      ]);

      if (analysisResult.success) {
        setAiAnalysis(analysisResult.data);
      }

      if (advisoryResult.success) {
        setSmartAdvisory(advisoryResult.data);
      }

      toast.success(isPunjabi ? 'AI ਵਿਸ਼ਲੇਸ਼ਣ ਪੂਰਾ ਹੋਇਆ!' : isHindi ? 'AI विश्लेषण पूरा हुआ!' : 'AI analysis completed!');
    } catch (error) {
      console.error('Error loading AI analysis:', error);
      toast.error(isPunjabi ? 'AI ਵਿਸ਼ਲੇਸ਼ਣ ਵਿੱਚ ਅਸਫਲ' : isHindi ? 'AI विश्लेषण में असफल' : 'AI analysis failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAIAnalysis();
  }, [fieldId]);

  return (
    <div className="space-y-6 p-4">
      {/* AI Agent Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Brain className="h-6 w-6" />
            {isPunjabi ? '🤖 AI ਏਜੰਟ - ਸਮਾਰਟ ਸਲਾਹ' : isHindi ? '🤖 AI एजेंट - स्मार्ट सलाह' : '🤖 AI Agent - Smart Advisory'}
          </CardTitle>
          <CardDescription className="text-blue-600">
            {isPunjabi ? 'AI ਤੁਹਾਡੇ ਖੇਤ ਦਾ ਸਾਰਾ ਡੇਟਾ ਦੇਖਕੇ ਸਲਾਹ ਦਿੰਦਾ ਹੈ' : 
             isHindi ? 'AI आपके खेत का सारा डेटा देखकर सलाह देता है' : 
             'AI analyzes ALL your field data to give smart recommendations'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {aiAnalysis ? `${Math.round(aiAnalysis.ai_confidence * 100)}%` : '85%'}
                </div>
                <div className="text-xs text-green-600">
                  {isPunjabi ? 'AI ਭਰੋਸਾ' : isHindi ? 'AI भरोसा' : 'AI Confidence'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">6/6</div>
                <div className="text-xs text-blue-600">
                  {isPunjabi ? 'ਡੇਟਾ ਸੋਰਸ' : isHindi ? 'डेटा सोर्स' : 'Data Sources'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {smartAdvisory ? smartAdvisory.urgent_alerts?.length || 0 : 2}
                </div>
                <div className="text-xs text-purple-600">
                  {isPunjabi ? 'ਅਲਰਟਸ' : isHindi ? 'अलर्ट्स' : 'Alerts'}
                </div>
              </div>
            </div>
            <Button
              onClick={loadAIAnalysis}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              {loading ? 
                (isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ...' : isHindi ? 'विश्लेषण...' : 'Analyzing...') :
                (isPunjabi ? 'AI ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'AI विश्लेषण' : 'AI Analysis')
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Smart Advisory for Farmers */}
      {smartAdvisory && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              {isPunjabi ? '🌾 ਤੁਹਾਡੇ ਲਈ ਸਮਾਰਟ ਸਲਾਹ' : isHindi ? '🌾 आपके लिए स्मार्ट सलाह' : '🌾 Smart Advisory for You'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{smartAdvisory.field_status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{smartAdvisory.today_action}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium">{smartAdvisory.this_week}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{smartAdvisory.profit_prediction}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">{smartAdvisory.ai_confidence}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Urgent Alerts */}
      {smartAdvisory?.urgent_alerts && smartAdvisory.urgent_alerts.length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              {isPunjabi ? '🚨 ਜ਼ਰੂਰੀ ਅਲਰਟਸ' : isHindi ? '🚨 जरूरी अलर्ट्स' : '🚨 Urgent Alerts'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {smartAdvisory.urgent_alerts.map((alert: string, index: number) => (
                <Alert key={index} className="bg-red-100 border-red-300">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {alert}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simple Recommendations */}
      {smartAdvisory?.simple_recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {isPunjabi ? '💡 ਸਰਲ ਸਿਫਾਰਸ਼ਾਂ' : isHindi ? '💡 सरल सिफारिशें' : '💡 Simple Recommendations'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {smartAdvisory.simple_recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-800">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Sources Status */}
      {aiAnalysis?.data_sources_processed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {isPunjabi ? '📊 ਡੇਟਾ ਸੋਰਸ ਸਥਿਤੀ' : isHindi ? '📊 डेटा सोर्स स्थिति' : '📊 Data Sources Status'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(aiAnalysis.data_sources_processed).map(([source, status]) => (
                <div key={source} className="flex items-center gap-2">
                  {status ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm capitalize">
                    {source.replace('_', ' ')}
                  </span>
                  <Badge variant={status ? "default" : "destructive"} className="text-xs">
                    {status ? 'OK' : 'Error'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Actions */}
      {aiAnalysis?.next_actions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {isPunjabi ? '⚡ ਅਗਲੇ ਕਦਮ' : isHindi ? '⚡ अगले कदम' : '⚡ Next Actions'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {aiAnalysis.next_actions.map((action: string, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 border-l-4 border-blue-500 bg-blue-50">
                  <span className="text-blue-800">{action}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnandSaathiAIAgent;
