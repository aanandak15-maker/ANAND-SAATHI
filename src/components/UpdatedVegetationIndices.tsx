import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, TrendingUp, TrendingDown, Minus, Info, Copy, CheckCircle2, Target, Lightbulb, Crop, Calendar, BarChart3, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getMostRecentField, getStoredFields, type RealFieldData } from "@/lib/realFieldData";

const UpdatedVegetationIndices = () => {
  const [copiedText, setCopiedText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);
  const [realFieldData, setRealFieldData] = useState<RealFieldData | null>(null);
  const [hasRealData, setHasRealData] = useState(false);

  // Check for real field data on component mount
  useEffect(() => {
    const checkForRealData = () => {
      const mostRecentField = getMostRecentField();
      if (mostRecentField) {
        setRealFieldData(mostRecentField);
        setHasRealData(true);
        console.log('🌾 VegetationIndices: Found real field data:', mostRecentField);
      } else {
        setHasRealData(false);
        console.log('📊 VegetationIndices: No real field data found, using demo data');
      }
    };

    checkForRealData();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedText(''), 2000);
  };

  // Generate indices based on real field data or demo data
  const generateIndices = () => {
    if (realFieldData && hasRealData) {
      const analysis = realFieldData.analysis;
      return [
        { 
          name: "NDVI", 
          value: analysis.ndvi, 
          change: analysis.ndvi > 0.6 ? "+5%" : "-2%", 
          trend: analysis.ndvi > 0.6 ? "up" : "down", 
          description: "Normalized Difference Vegetation Index",
          status: analysis.ndvi > 0.6 ? "Healthy" : "Needs Attention",
          optimal: { min: 0.7, max: 0.9 },
          growthStage: analysis.cropStage,
          recommendation: analysis.ndvi > 0.6 ? "Maintain current irrigation schedule" : "Increase irrigation frequency",
          priority: "high"
        },
        { 
          name: "MSAVI2", 
          value: analysis.msavi2, 
          change: analysis.msavi2 > 0.6 ? "+2%" : "-1%", 
          trend: analysis.msavi2 > 0.6 ? "up" : "down", 
          description: "Modified Soil Adjusted Vegetation Index",
          status: analysis.msavi2 > 0.6 ? "Good" : "Moderate",
          optimal: { min: 0.6, max: 0.8 },
          growthStage: analysis.cropStage,
          recommendation: analysis.msavi2 > 0.6 ? "Good early growth, continue nutrients" : "Increase soil-adjusted monitoring",
          priority: "medium"
        },
        { 
          name: "NDRE", 
          value: analysis.ndre, 
          change: analysis.ndre > 0.5 ? "+3%" : "-3%", 
          trend: analysis.ndre > 0.5 ? "up" : "down", 
          description: "Normalized Difference Red Edge",
          status: analysis.ndre > 0.5 ? "Good" : "Monitor",
          optimal: { min: 0.5, max: 0.7 },
          growthStage: analysis.cropStage,
          recommendation: analysis.ndre > 0.5 ? "Chlorophyll levels good" : "Apply foliar nitrogen spray",
          priority: "high"
        },
        { 
          name: "NDMI", 
          value: analysis.ndmi, 
          change: analysis.ndmi > 0.4 ? "0%" : "-5%", 
          trend: analysis.ndmi > 0.4 ? "stable" : "down", 
          description: "Normalized Difference Moisture Index",
          status: analysis.ndmi > 0.4 ? "Stable" : "Water Stress",
          optimal: { min: 0.4, max: 0.8 },
          growthStage: "All stages",
          recommendation: analysis.ndmi > 0.4 ? "Water stress moderate, monitor closely" : "Increase irrigation frequency",
          priority: "medium"
        },
        {
          name: "SOC_VIS",
          value: analysis.socVis || 0.35,
          change: (analysis.socVis || 0.35) > 0.3 ? "+8%" : "+2%",
          trend: (analysis.socVis || 0.35) > 0.3 ? "up" : "stable",
          description: "Soil Organic Carbon Visible",
          status: (analysis.socVis || 0.35) > 0.3 ? "Improving" : "Stable",
          optimal: { min: 0.3, max: 0.6 },
          growthStage: "Bare soil",
          recommendation: (analysis.socVis || 0.35) > 0.3 ? "Good soil health improvement" : "Consider organic matter addition",
          priority: "low"
        },
        {
          name: "RVI",
          value: analysis.rvi,
          change: analysis.rvi > 2.0 ? "+1%" : "-2%",
          trend: analysis.rvi > 2.0 ? "up" : "down",
          description: "Ratio Vegetation Index",
          status: analysis.rvi > 2.0 ? "Good" : "Moderate",
          optimal: { min: 2.0, max: 4.0 },
          growthStage: analysis.cropStage,
          recommendation: analysis.rvi > 2.0 ? "Biomass accumulation good" : "Monitor biomass development",
          priority: "medium"
        }
      ];
    } else {
      // Demo data fallback
      return [
        { 
          name: "NDVI", 
          value: 0.75, 
          change: "+5%", 
          trend: "up", 
          description: "Normalized Difference Vegetation Index",
          status: "Healthy",
          optimal: { min: 0.7, max: 0.9 },
          growthStage: "Flowering",
          recommendation: "Maintain current irrigation schedule",
          priority: "high"
        },
        { 
          name: "MSAVI2", 
          value: 0.68, 
          change: "+2%", 
          trend: "up", 
          description: "Modified Soil Adjusted Vegetation Index",
          status: "Good",
          optimal: { min: 0.6, max: 0.8 },
          growthStage: "Vegetative",
          recommendation: "Good early growth, continue nutrients",
          priority: "medium"
        },
        { 
          name: "NDRE", 
          value: 0.45, 
          change: "-3%", 
          trend: "down", 
          description: "Normalized Difference Red Edge",
          status: "Monitor",
          optimal: { min: 0.5, max: 0.7 },
          growthStage: "Pre-harvest",
          recommendation: "Apply foliar nitrogen spray",
          priority: "high"
        },
        { 
          name: "NDMI", 
          value: 0.52, 
          change: "0%", 
          trend: "stable", 
          description: "Normalized Difference Moisture Index",
          status: "Stable",
          optimal: { min: 0.4, max: 0.8 },
          growthStage: "All stages",
          recommendation: "Water stress moderate, monitor closely",
          priority: "medium"
        },
        {
          name: "SOC_VIS",
          value: 0.35,
          change: "+8%",
          trend: "up",
          description: "Soil Organic Carbon Visible",
          status: "Improving",
          optimal: { min: 0.3, max: 0.6 },
          growthStage: "Bare soil",
          recommendation: "Good soil health improvement",
          priority: "low"
        },
        {
          name: "RVI",
          value: 0.62,
          change: "+1%",
          trend: "up",
          description: "Ratio Vegetation Index",
          status: "Good",
          optimal: { min: 2.0, max: 4.0 },
          growthStage: "All stages",
          recommendation: "Biomass accumulation on track",
          priority: "medium"
        }
      ];
    }
  };

  const indices = generateIndices();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'good':
      case 'improving':
        return 'bg-green-100 text-green-800';
      case 'moderate':
      case 'stable':
        return 'bg-yellow-100 text-yellow-800';
      case 'monitor':
      case 'needs attention':
      case 'water stress':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            Vegetation Indices
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
              {hasRealData ? 'Real Data' : 'Demo Data'}
            </Badge>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          {hasRealData 
            ? `Real-time vegetation analysis for ${realFieldData?.crop} field` 
            : 'Comprehensive vegetation health monitoring using satellite data'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {indices.map((index, idx) => (
                <Card key={idx} className="border-l-4" style={{ borderLeftColor: index.priority === 'high' ? '#ef4444' : index.priority === 'medium' ? '#f59e0b' : '#10b981' }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">{index.name}</h4>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(index.trend)}
                        <span className="text-xs font-medium">{index.change}</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold mb-2">{index.value.toFixed(2)}</div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getStatusColor(index.status)} variant="secondary">
                        {index.status}
                      </Badge>
                      <Badge className={getPriorityColor(index.priority)} variant="outline">
                        {index.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{index.description}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Growth Stage:</span>
                        <span className="font-medium">{index.growthStage}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{index.recommendation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            <div className="space-y-4">
              {indices.map((index, idx) => (
                <Card key={idx}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <BarChart3 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{index.name}</h3>
                          <p className="text-sm text-muted-foreground">{index.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">{index.value.toFixed(2)}</div>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(index.trend)}
                          <span className="text-sm font-medium">{index.change}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Status</h4>
                        <Badge className={getStatusColor(index.status)} variant="secondary">
                          {index.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Growth Stage</h4>
                        <div className="flex items-center gap-2">
                          <Crop className="h-4 w-4" />
                          <span className="text-sm">{index.growthStage}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Priority</h4>
                        <Badge className={getPriorityColor(index.priority)} variant="outline">
                          {index.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Optimal Range</h4>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          <span className="text-sm">{index.optimal.min} - {index.optimal.max}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Recommendation</h4>
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 mt-0.5" />
                          <span className="text-sm">{index.recommendation}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">AI-Powered Insights</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Field Health Summary</h4>
                  <p className="text-blue-800">
                    {hasRealData 
                      ? `Your ${realFieldData?.crop} field shows ${realFieldData?.analysis.healthStatus} health with a quality score of ${realFieldData?.analysis.qualityScore}. The vegetation indices indicate ${realFieldData?.analysis.waterStressLevel} water stress levels.`
                      : 'Based on the vegetation indices, your field shows good overall health with some areas needing attention. NDVI and MSAVI2 values indicate healthy crop growth, while NDMI suggests moderate water stress in certain zones.'
                    }
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Key Recommendations</h4>
                  <ul className="space-y-2 text-blue-800">
                    {hasRealData ? (
                      realFieldData?.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">{idx + 1}.</span>
                          <span>{rec}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">1.</span>
                          <span>Monitor NDMI values closely and increase irrigation if water stress persists</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">2.</span>
                          <span>Apply foliar nitrogen spray to improve NDRE values</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">3.</span>
                          <span>Continue current nutrient management for optimal NDVI and MSAVI2</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UpdatedVegetationIndices;
