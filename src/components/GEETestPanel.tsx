import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Satellite, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  Activity,
  MapPin,
  Droplets,
  Leaf
} from "lucide-react";
import { api } from "@/lib/api";
import { type GEEAnalysisResult } from "@/lib/geeClient";
import { toast } from "sonner";

const GEETestPanel = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<GEEAnalysisResult | null>(null);

  // Test field boundaries for different regions
  const testFields = [
    {
      name: "Bihar Rice Field",
      location: "Nalanda, Bihar",
      cropType: "rice",
      boundary: {
        coordinates: [[[85.1000, 25.2041], [85.1010, 25.2041], [85.1010, 25.2051], [85.1000, 25.2051], [85.1000, 25.2041]]]
      }
    },
    {
      name: "Punjab Wheat Field", 
      location: "Ludhiana, Punjab",
      cropType: "wheat",
      boundary: {
        coordinates: [[[75.8500, 30.9000], [75.8510, 30.9000], [75.8510, 30.9010], [75.8500, 30.9010], [75.8500, 30.9000]]]
      }
    },
    {
      name: "Karnataka Sugarcane Field",
      location: "Belgaum, Karnataka", 
      cropType: "sugarcane",
      boundary: {
        coordinates: [[[74.5000, 15.8500], [74.5010, 15.8500], [74.5010, 15.8510], [74.5000, 15.8510], [74.5000, 15.8500]]]
      }
    }
  ];

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus(null);
    
    try {
      const result = await api.testGEEConnection();
      setConnectionStatus(result);
      
      if (result.success) {
        toast.success("Google Earth Engine API is working!");
      } else {
        toast.warning("GEE API not available, will use simulation");
      }
    } catch (error) {
      const errorResult = {
        success: false,
        message: `Connection test failed: ${error.message}`
      };
      setConnectionStatus(errorResult);
      toast.error("Failed to test GEE connection");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const analyzeTestField = async (fieldIndex: number) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    const field = testFields[fieldIndex];
    
    try {
      toast.info(`Analyzing ${field.name}...`);
      
      const result = await api.analyzeFieldWithGEE(
        field.boundary,
        field.cropType,
        new Date()
      );
      
      setAnalysisResult(result);
      
      if (result.dataSource === 'gee_api') {
        toast.success(`Real satellite data analysis complete for ${field.name}!`);
      } else {
        toast.info(`Analysis complete using simulation data for ${field.name}`);
      }
    } catch (error) {
      toast.error(`Failed to analyze ${field.name}: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'fair': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStressColor = (level: string) => {
    switch (level) {
      case 'none': return 'text-green-600 bg-green-50';
      case 'mild': return 'text-yellow-600 bg-yellow-50';
      case 'moderate': return 'text-orange-600 bg-orange-50';
      case 'severe': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5 text-primary" />
            Google Earth Engine API Test Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Test */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">API Connection Test</h3>
              <Button 
                onClick={testConnection} 
                disabled={isTestingConnection}
                variant="outline"
              >
                {isTestingConnection ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
            </div>

            {connectionStatus && (
              <Alert className={connectionStatus.success ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
                {connectionStatus.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
                <AlertDescription className="font-medium">
                  {connectionStatus.message}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Test Fields */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Test Field Analysis</h3>
            <div className="grid gap-3">
              {testFields.map((field, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{field.name}</p>
                      <p className="text-sm text-muted-foreground">{field.location} • {field.cropType}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => analyzeTestField(index)}
                    disabled={isAnalyzing}
                    size="sm"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Satellite className="h-4 w-4 mr-2" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Analysis Results
              <Badge variant={analysisResult.dataSource === 'gee_api' ? 'default' : 'secondary'}>
                {analysisResult.dataSource === 'gee_api' ? 'Real Satellite Data' : 'Simulation Data'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analysisResult.ndvi}</div>
                <div className="text-sm text-muted-foreground">NDVI</div>
                <Progress value={analysisResult.ndvi * 100} className="h-2 mt-2" />
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analysisResult.ndmi}</div>
                <div className="text-sm text-muted-foreground">NDMI</div>
                <Progress value={(analysisResult.ndmi + 1) * 50} className="h-2 mt-2" />
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{analysisResult.msavi2}</div>
                <div className="text-sm text-muted-foreground">MSAVI2</div>
                <Progress value={analysisResult.msavi2 * 100} className="h-2 mt-2" />
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{analysisResult.rvi}</div>
                <div className="text-sm text-muted-foreground">RVI</div>
                <Progress value={Math.min(analysisResult.rvi * 10, 100)} className="h-2 mt-2" />
              </div>
            </div>

            {/* Health Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(analysisResult.healthStatus)}`}>
                  {analysisResult.healthStatus.toUpperCase()}
                </div>
                <div className="text-sm text-muted-foreground mt-2">Crop Health</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStressColor(analysisResult.waterStressLevel)}`}>
                  <Droplets className="h-4 w-4 mr-1" />
                  {analysisResult.waterStressLevel.toUpperCase()}
                </div>
                <div className="text-sm text-muted-foreground mt-2">Water Stress</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-semibold text-primary">
                  {analysisResult.cropStage.charAt(0).toUpperCase() + analysisResult.cropStage.slice(1)}
                </div>
                <div className="text-sm text-muted-foreground mt-2">Crop Stage</div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Technical Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Cloud Cover:</span>
                  <div className="font-medium">{analysisResult.cloudCover}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Quality Score:</span>
                  <div className="font-medium">{analysisResult.qualityScore}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Pixel Count:</span>
                  <div className="font-medium">{analysisResult.pixelCount.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Valid Pixels:</span>
                  <div className="font-medium">{analysisResult.validPixels.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* API Key Status */}
            <Alert className={analysisResult.apiKeyUsed ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}>
              {analysisResult.apiKeyUsed ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Activity className="h-4 w-4 text-blue-600" />
              )}
              <AlertDescription>
                {analysisResult.apiKeyUsed 
                  ? "✅ Using real Google Earth Engine API with provided API key"
                  : "ℹ️ Using simulation data - GEE API not available"}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GEETestPanel;
