import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, TrendingUp, TrendingDown, Minus, Info, Copy, CheckCircle2, Target, Lightbulb, Crop, Calendar, BarChart3, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getMostRecentField, getStoredFields, type RealFieldData } from "@/lib/realFieldData";

const VegetationIndices = () => {
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

  const pitchNotes = {
    ndvi: "NDVI shows vegetation vigor through chlorophyll content—higher values = healthier crops. Our AI uses NDVI trends to predict yield potential 2-3 weeks earlier than visual inspection, enabling precise fertilizer timing that increases yields by 8-12%.",
    msavi2: "MSAVI2 reduces soil background interference that makes NDVI unreliable in early growth stages. This gives us accurate health readings when crops are small (0-30 days), enabling early intervention that prevents 60-80% of potential yield losses."
  };

  const indexExplanations = {
    NDVI: { fullName: "Normalized Difference Vegetation Index", hindiName: "सामान्यीकृत वनस्पति सूचकांक", howItWorks: "NDVI measures vegetation health", formula: "NDVI = (NIR - Red) / (NIR + Red)", uses: ["Crop monitoring"], investorInfo: ["Industry standard"] },
    MSAVI2: { fullName: "Modified Soil Adjusted Vegetation Index", hindiName: "संशोधित मिट्टी समायोजित वनस्पति सूचकांक", howItWorks: "MSAVI2 reduces soil effects", formula: "Complex formula", uses: ["Early detection"], investorInfo: ["Early intervention"] }
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

  const cropStages = [
    { stage: "Sowing", duration: "0-2 weeks", indices: ["MSAVI2", "SOC_VIS"], status: "complete" },
    { stage: "Vegetative", duration: "2-8 weeks", indices: ["NDVI", "MSAVI2"], status: "current" },
    { stage: "Flowering", duration: "8-12 weeks", indices: ["NDVI", "NDRE"], status: "upcoming" },
    { stage: "Maturity", duration: "12-16 weeks", indices: ["NDRE", "NDMI"], status: "future" }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Healthy":
        return "bg-success/10 text-success";
      case "Good":
        return "bg-accent/10 text-accent";
      case "Monitor":
        return "bg-warning/10 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-destructive";
      case "medium": return "text-warning";
      case "low": return "text-success";
      default: return "text-muted-foreground";
    }
  };

  const getStageStatus = (status: string) => {
    switch (status) {
      case "complete": return "bg-success/20 text-success";
      case "current": return "bg-primary/20 text-primary";
      case "upcoming": return "bg-accent/20 text-accent";
      default: return "bg-muted/20 text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            Vegetation Indices
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Info className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Vegetation Indices Guide</DialogTitle>
                <DialogDescription>
                  Understanding NDVI, MSAVI2, and their applications in precision agriculture
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="ndvi" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ndvi">NDVI</TabsTrigger>
                  <TabsTrigger value="msavi2">MSAVI2</TabsTrigger>
                  <TabsTrigger value="pitch">Investor Notes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="ndvi" className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">What is NDVI?</h4>
                      <p className="text-sm text-muted-foreground">
                        Normalized Difference Vegetation Index measures vegetation health by comparing 
                        how plants reflect near-infrared light (which they reflect strongly) vs red light (which they absorb).
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Formula</h4>
                      <code className="text-sm bg-muted p-2 rounded block">
                        NDVI = (NIR - Red) / (NIR + Red)
                      </code>
                      <p className="text-xs text-muted-foreground mt-1">
                        NIR = Near Infrared, Red = Red band reflectance
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Range & Interpretation</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>0.8-1.0: Dense, healthy vegetation</div>
                        <div>0.6-0.8: Moderate vegetation</div>
                        <div>0.2-0.6: Sparse vegetation</div>
                        <div>-0.1-0.2: Bare soil, rocks</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">When NDVI Fails</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Saturates at high biomass (dense crops)</li>
                        <li>• Soil background interference in early growth</li>
                        <li>• Sensitive to atmospheric conditions</li>
                        <li>• Less reliable with high soil exposure</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="msavi2" className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">What is MSAVI2?</h4>
                      <p className="text-sm text-muted-foreground">
                        Modified Soil-Adjusted Vegetation Index 2 reduces soil background effects that 
                        make NDVI unreliable when vegetation cover is low (like early crop growth).
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Formula</h4>
                      <code className="text-sm bg-muted p-2 rounded block text-xs">
                        MSAVI2 = (2×NIR + 1 - √((2×NIR+1)² - 8×(NIR-Red))) / 2
                      </code>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Why It's Better Early Season</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Reduces soil brightness variations</li>
                        <li>• More accurate when canopy cover &lt; 50%</li>
                        <li>• Better for monitoring germination</li>
                        <li>• Clearer signal during establishment phase</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Practical Value for Farmers</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Detect poor germination 7-10 days earlier</li>
                        <li>• Identify uneven growth patterns</li>
                        <li>• Optimize replanting decisions</li>
                        <li>• Track establishment success</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="pitch" className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">NDVI - Investor Pitch</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(pitchNotes.ndvi, 'NDVI Pitch Notes')}
                          className="h-6 w-6 p-0"
                        >
                          {copiedText === 'NDVI Pitch Notes' ? 
                            <CheckCircle2 className="h-3 w-3 text-green-600" /> : 
                            <Copy className="h-3 w-3" />
                          }
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{pitchNotes.ndvi}</p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">MSAVI2 - Investor Pitch</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(pitchNotes.msavi2, 'MSAVI2 Pitch Notes')}
                          className="h-6 w-6 p-0"
                        >
                          {copiedText === 'MSAVI2 Pitch Notes' ? 
                            <CheckCircle2 className="h-3 w-3 text-green-600" /> : 
                            <Copy className="h-3 w-3" />
                          }
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{pitchNotes.msavi2}</p>
                    </div>
                    
                    <div className="p-4 bg-amber-50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Key Differentiators</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Multi-index approach reduces false positives by 40%</li>
                        <li>• Early detection window gives 2-3 weeks intervention advantage</li>
                        <li>• Measurable ROI: 8-15% yield increase, 20-30% input optimization</li>
                        <li>• Works across crop types and growth stages</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>
          Satellite-based crop health indicators
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Current Analysis</TabsTrigger>
            <TabsTrigger value="trends">Growth Stages</TabsTrigger>
            <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            {indices.map((index) => (
              <div key={index.name} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{index.name}</h4>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSelectedIndex(index.name)}>
                            <Info className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <BarChart3 className="h-5 w-5 text-primary" />
                              {index.name} - Detailed Information
                            </DialogTitle>
                          </DialogHeader>
                          {selectedIndex && indexExplanations[selectedIndex as keyof typeof indexExplanations] && (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-primary mb-2">Full Name</h4>
                                <p>{indexExplanations[selectedIndex as keyof typeof indexExplanations].fullName}</p>
                                <p className="text-sm text-muted-foreground">{indexExplanations[selectedIndex as keyof typeof indexExplanations].hindiName}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-primary mb-2">How It Works</h4>
                                <p className="text-sm">{indexExplanations[selectedIndex as keyof typeof indexExplanations].howItWorks}</p>
                                <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted p-2 rounded">
                                  {indexExplanations[selectedIndex as keyof typeof indexExplanations].formula}
                                </p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-primary mb-2">Agricultural Uses</h4>
                                <ul className="space-y-1">
                                  {indexExplanations[selectedIndex as keyof typeof indexExplanations].uses.map((use, i) => (
                                    <li key={i} className="text-sm">{use}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-blue-900 mb-2">💼 Investor Key Points</h4>
                                <ul className="space-y-1">
                                  {indexExplanations[selectedIndex as keyof typeof indexExplanations].investorInfo.map((info, i) => (
                                    <li key={i} className="text-sm text-blue-800">• {info}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Badge className={getStatusColor(index.status)} variant="secondary">
                        {index.status}
                      </Badge>
                      {index.priority === "high" && (
                        <Badge variant="destructive" className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          Action Needed
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{index.description}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span>Optimal: {index.optimal.min} - {index.optimal.max}</span>
                      <span className="text-muted-foreground">Stage: {index.growthStage}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold">{index.value}</span>
                      {getTrendIcon(index.trend)}
                    </div>
                    <span className="text-sm text-muted-foreground">{index.change}</span>
                  </div>
                </div>
                
                {/* Enhanced visual indicator */}
                <div className="space-y-2">
                  <div className="w-full bg-muted rounded-full h-3 relative">
                    {/* Optimal range indicator */}
                    <div 
                      className="absolute bg-success/30 rounded-full h-3"
                      style={{ 
                        left: `${index.optimal.min * 100}%`,
                        width: `${(index.optimal.max - index.optimal.min) * 100}%`
                      }}
                    ></div>
                    {/* Current value indicator */}
                    <div 
                      className="bg-primary rounded-full h-3 transition-all duration-300"
                      style={{ width: `${index.value * 100}%` }}
                    ></div>
                    {/* Current value marker */}
                    <div 
                      className="absolute w-1 h-5 bg-primary -top-1 rounded"
                      style={{ left: `${index.value * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.0</span>
                    <span>Optimal Range</span>
                    <span>1.0</span>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="bg-muted/50 p-2 rounded text-sm">
                  <div className="flex items-center gap-1 mb-1">
                    <Lightbulb className={`h-3 w-3 ${getPriorityColor(index.priority)}`} />
                    <span className="font-medium">Recommendation:</span>
                  </div>
                  <p className="text-muted-foreground">{index.recommendation}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Crop className="h-4 w-4" />
                Crop Growth Timeline
              </h4>
              {cropStages.map((stage, index) => (
                <div key={stage.stage} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{stage.stage}</span>
                      <Badge className={getStageStatus(stage.status)} variant="secondary">
                        {stage.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{stage.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Key Indices:</p>
                    <p className="text-xs text-muted-foreground">{stage.indices.join(", ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="space-y-3">
              {indices
                .filter(index => index.priority === "high")
                .map((index) => (
                  <div key={index.name} className="border-l-4 border-destructive bg-destructive/5 p-4 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-destructive" />
                      <span className="font-semibold">High Priority: {index.name}</span>
                    </div>
                    <p className="text-sm mb-2">{index.recommendation}</p>
                    <Button size="sm" className="w-full">
                      View Products for {index.name} Issue
                    </Button>
                  </div>
                ))}
              
              {indices
                .filter(index => index.priority === "medium")
                .map((index) => (
                  <div key={index.name} className="border-l-4 border-warning bg-warning/5 p-4 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-warning" />
                      <span className="font-semibold">Monitor: {index.name}</span>
                    </div>
                    <p className="text-sm">{index.recommendation}</p>
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Data Summary</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Last Update:</span>
              <p>Today at 10:30 AM</p>
            </div>
            <div>
              <span className="text-muted-foreground">Next Update:</span>
              <p>Tomorrow at 10:30 AM</p>
            </div>
            <div>
              <span className="text-muted-foreground">Data Source:</span>
              <p>Sentinel-2 + PlanetScope</p>
            </div>
            <div>
              <span className="text-muted-foreground">Cloud Cover:</span>
              <p>5% (Excellent)</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VegetationIndices;