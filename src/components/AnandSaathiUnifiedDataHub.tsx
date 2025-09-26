/**
 * Anand Saathi Unified Data Hub
 * Simple data collection and AI analysis center
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Brain, 
  BarChart3, 
  Upload, 
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import RealTimeMetrics from './RealTimeMetrics';

interface AnandSaathiUnifiedDataHubProps {
  farmId?: string;
}

const AnandSaathiUnifiedDataHub: React.FC<AnandSaathiUnifiedDataHubProps> = ({ farmId }) => {
  const { t, isPunjabi, isHindi } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  // Sample data sources
  const dataSources = [
    {
      id: 'satellite',
      name: isPunjabi ? 'ਸੈਟੇਲਾਈਟ ਡੇਟਾ' : isHindi ? 'सैटेलाइट डेटा' : 'Satellite Data',
      status: 'connected',
      lastUpdate: '2 minutes ago',
      records: 1250
    },
    {
      id: 'weather',
      name: isPunjabi ? 'ਮੌਸਮ ਡੇਟਾ' : isHindi ? 'मौसम डेटा' : 'Weather Data',
      status: 'connected',
      lastUpdate: '5 minutes ago',
      records: 890
    },
    {
      id: 'soil',
      name: isPunjabi ? 'ਮਿੱਟੀ ਡੇਟਾ' : isHindi ? 'मिट्टी डेटा' : 'Soil Data',
      status: 'connected',
      lastUpdate: '1 hour ago',
      records: 340
    },
    {
      id: 'market',
      name: isPunjabi ? 'ਮਾਰਕੀਟ ਡੇਟਾ' : isHindi ? 'मार्केट डेटा' : 'Market Data',
      status: 'connected',
      lastUpdate: '10 minutes ago',
      records: 2100
    }
  ];

  const aiAnalysis = [
    {
      type: 'yield_prediction',
      name: isPunjabi ? 'ਉਤਪਾਦਨ ਪੂਰਵਾਨੁਮਾਨ' : isHindi ? 'उत्पादन पूर्वानुमान' : 'Yield Prediction',
      accuracy: 92,
      status: 'completed',
      lastRun: '30 minutes ago'
    },
    {
      type: 'disease_detection',
      name: isPunjabi ? 'ਰੋਗ ਖੋਜ' : isHindi ? 'रोग खोज' : 'Disease Detection',
      accuracy: 88,
      status: 'completed',
      lastRun: '1 hour ago'
    },
    {
      type: 'market_forecast',
      name: isPunjabi ? 'ਮਾਰਕੀਟ ਪੂਰਵਾਨੁਮਾਨ' : isHindi ? 'मार्केट पूर्वानुमान' : 'Market Forecast',
      accuracy: 85,
      status: 'running',
      lastRun: '15 minutes ago'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'running': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            {isPunjabi ? 'ਅਨੰਦ ਸਾਥੀ ਯੂਨੀਫਾਈਡ ਡੇਟਾ ਹੱਬ' : isHindi ? 'अनंद साथी यूनिफाइड डेटा हब' : 'Anand Saathi Unified Data Hub'}
          </CardTitle>
          <CardDescription>
            {isPunjabi 
              ? 'ਕੇਂਦਰੀ ਡੇਟਾ ਸੰਗ੍ਰਹਿ ਅਤੇ AI ਵਿਸ਼ਲੇਸ਼ਣ'
              : isHindi 
              ? 'केंद्रीय डेटा संग्रह और AI विश्लेषण'
              : 'Central data collection and AI analysis'
            }
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="data-sources" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="data-sources">
            {isPunjabi ? 'ਡੇਟਾ ਸਰੋਤ' : isHindi ? 'डेटा स्रोत' : 'Data Sources'}
          </TabsTrigger>
          <TabsTrigger value="ai-analysis">
            <Brain className="h-4 w-4 mr-1" />
            {isPunjabi ? 'AI ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'AI विश्लेषण' : 'AI Analysis'}
          </TabsTrigger>
          <TabsTrigger value="real-time">
            <BarChart3 className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਰੀਅਲ-ਟਾਈਮ' : isHindi ? 'रियल-टाइम' : 'Real-time'}
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਐਕਸਪੋਰਟ' : isHindi ? 'एक्सपोर्ट' : 'Export'}
          </TabsTrigger>
        </TabsList>

        {/* Data Sources Tab */}
        <TabsContent value="data-sources" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              {isPunjabi ? 'ਕਨੈਕਟਡ ਡੇਟਾ ਸਰੋਤ' : isHindi ? 'कनेक्टेड डेटा स्रोत' : 'Connected Data Sources'}
            </h3>
            <Button onClick={refreshData} disabled={isLoading} size="sm" variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isPunjabi ? 'ਰਿਫ੍ਰੈਸ਼' : isHindi ? 'रिफ्रेश' : 'Refresh'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataSources.map((source) => (
              <Card key={source.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{source.name}</h4>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(source.status)}`}></div>
                      {getStatusIcon(source.status)}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{isPunjabi ? 'ਰਿਕਾਰਡ:' : isHindi ? 'रिकॉर्ड:' : 'Records:'} {source.records.toLocaleString()}</p>
                    <p>{isPunjabi ? 'ਆਖਰੀ ਅਪਡੇਟ:' : isHindi ? 'आखिरी अपडेट:' : 'Last Update:'} {source.lastUpdate}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="ai-analysis" className="space-y-4">
          <h3 className="text-lg font-medium">
            {isPunjabi ? 'AI ਵਿਸ਼ਲੇਸ਼ਣ ਰਿਪੋਰਟ' : isHindi ? 'AI विश्लेषण रिपोर्ट' : 'AI Analysis Reports'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiAnalysis.map((analysis) => (
              <Card key={analysis.type}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{analysis.name}</h4>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(analysis.status)}`}></div>
                      {getStatusIcon(analysis.status)}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{isPunjabi ? 'ਸ਼ੁੱਧਤਾ:' : isHindi ? 'शुद्धता:' : 'Accuracy:'} {analysis.accuracy}%</p>
                    <p>{isPunjabi ? 'ਆਖਰੀ ਚਲਾਇਆ:' : isHindi ? 'आखिरी चलाया:' : 'Last Run:'} {analysis.lastRun}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Real-time Tab */}
        <TabsContent value="real-time" className="space-y-4">
          <h3 className="text-lg font-medium">
            {isPunjabi ? 'ਰੀਅਲ-ਟਾਈਮ ਮੈਟ੍ਰਿਕਸ' : isHindi ? 'रियल-टाइम मैट्रिक्स' : 'Real-time Metrics'}
          </h3>
          
          <RealTimeMetrics 
            crops={['Rice', 'Wheat', 'Corn']}
            primaryCrop="Rice"
            growthStage="vegetative"
          />
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-4">
          <h3 className="text-lg font-medium">
            {isPunjabi ? 'ਡੇਟਾ ਐਕਸਪੋਰਟ' : isHindi ? 'डेटा एक्सपोर्ट' : 'Data Export'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  {isPunjabi ? 'CSV ਐਕਸਪੋਰਟ' : isHindi ? 'CSV एक्सपोर्ट' : 'CSV Export'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {isPunjabi 
                    ? 'ਸਾਰੇ ਡੇਟਾ ਨੂੰ CSV ਫਾਰਮੈਟ ਵਿੱਚ ਡਾਊਨਲੋਡ ਕਰੋ'
                    : isHindi 
                    ? 'सभी डेटा को CSV फॉर्मेट में डाउनलोड करें'
                    : 'Download all data in CSV format'
                  }
                </p>
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  {isPunjabi ? 'CSV ਡਾਊਨਲੋਡ' : isHindi ? 'CSV डाउनलोड' : 'Download CSV'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {isPunjabi ? 'JSON ਐਕਸਪੋਰਟ' : isHindi ? 'JSON एक्सपोर्ट' : 'JSON Export'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {isPunjabi 
                    ? 'API ਲਈ JSON ਫਾਰਮੈਟ ਵਿੱਚ ਡੇਟਾ ਐਕਸਪੋਰਟ ਕਰੋ'
                    : isHindi 
                    ? 'API के लिए JSON फॉर्मेट में डेटा एक्सपोर्ट करें'
                    : 'Export data in JSON format for API'
                  }
                </p>
                <Button className="w-full" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  {isPunjabi ? 'JSON ਡਾਊਨਲੋਡ' : isHindi ? 'JSON डाउनलोड' : 'Download JSON'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnandSaathiUnifiedDataHub;