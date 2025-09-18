import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, ShoppingCart, AlertTriangle, Leaf, Bug, Droplets, RefreshCw, MapPin, TrendingUp, Target } from "lucide-react";
import { getMostRecentField, getStoredFields, type RealFieldData } from "@/lib/realFieldData";
import { toast } from "sonner";

const EnhancedDoseCalculator = () => {
  const [realFieldData, setRealFieldData] = useState<RealFieldData | null>(null);
  const [hasRealData, setHasRealData] = useState(false);
  const [fertilizerResult, setFertilizerResult] = useState<any>(null);
  const [pesticideResult, setPesticideResult] = useState<any>(null);
  const [irrigationResult, setIrrigationResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Check for real field data on component mount
  useEffect(() => {
    const checkForRealData = () => {
      const mostRecentField = getMostRecentField();
      if (mostRecentField) {
        setRealFieldData(mostRecentField);
        setHasRealData(true);
        console.log('🌾 DoseCalculator: Found real field data:', mostRecentField);
        // Auto-calculate when real data is available
        calculateAllRecommendations(mostRecentField);
      } else {
        setHasRealData(false);
        console.log('📊 DoseCalculator: No real field data found, using manual input');
      }
    };

    checkForRealData();
  }, []);

  // Calculate fertilizer recommendations based on real field data
  const calculateFertilizerRecommendations = (fieldData: RealFieldData) => {
    const analysis = fieldData.analysis;
    const area = fieldData.area;
    const crop = fieldData.crop;
    const cropStage = analysis.cropStage;

    // Base nutrient requirements by crop and stage
    const cropNutrientRequirements = {
      'Rice': { N: 120, P: 60, K: 60 },
      'Wheat': { N: 100, P: 50, K: 50 },
      'Maize': { N: 150, P: 70, K: 80 },
      'Sugarcane': { N: 200, P: 100, K: 120 },
      'Potato': { N: 180, P: 80, K: 200 }
    };

    // Adjust based on vegetation indices
    const ndviAdjustment = analysis.ndvi < 0.5 ? 1.3 : analysis.ndvi > 0.7 ? 0.8 : 1.0;
    const ndmiAdjustment = analysis.ndmi < 0.3 ? 1.2 : 1.0; // Water stress increases N need
    const ndreAdjustment = analysis.ndre < 0.4 ? 1.1 : 0.9; // Low chlorophyll needs more N

    // Stage adjustments
    const stageMultipliers = {
      'Sowing': 0.3,
      'Vegetative': 0.6,
      'Flowering': 1.0,
      'Maturity': 0.2
    };

    const baseRequirements = cropNutrientRequirements[crop] || cropNutrientRequirements['Rice'];
    const stageMultiplier = stageMultipliers[cropStage] || 1.0;

    const nitrogen = Math.round(baseRequirements.N * ndviAdjustment * ndmiAdjustment * ndreAdjustment * stageMultiplier * area);
    const phosphorus = Math.round(baseRequirements.P * ndviAdjustment * stageMultiplier * area);
    const potassium = Math.round(baseRequirements.K * ndviAdjustment * stageMultiplier * area);

    return {
      nitrogen,
      phosphorus,
      potassium,
      totalCost: Math.round((nitrogen * 0.8) + (phosphorus * 1.2) + (potassium * 0.6)),
      recommendations: [
        `Apply ${nitrogen} kg N per hectare based on NDVI (${analysis.ndvi.toFixed(2)}) and crop stage`,
        `Use ${phosphorus} kg P₂O₅ per hectare for optimal root development`,
        `Apply ${potassium} kg K₂O per hectare for stress resistance`,
        analysis.ndmi < 0.3 ? "Increase nitrogen by 20% due to water stress" : "Normal nitrogen application",
        analysis.ndre < 0.4 ? "Consider foliar nitrogen spray for chlorophyll improvement" : "Soil application sufficient"
      ],
      timing: getFertilizerTiming(cropStage),
      products: getRecommendedProducts(crop, analysis)
    };
  };

  // Calculate pesticide recommendations based on field conditions
  const calculatePesticideRecommendations = (fieldData: RealFieldData) => {
    const analysis = fieldData.analysis;
    const area = fieldData.area;
    const crop = fieldData.crop;

    // Determine pest pressure based on vegetation indices
    const pestPressure = analysis.ndvi < 0.4 ? 'High' : analysis.ndvi < 0.6 ? 'Medium' : 'Low';
    const diseaseRisk = analysis.ndmi > 0.6 ? 'High' : analysis.ndmi > 0.4 ? 'Medium' : 'Low';

    const dosage = area * (pestPressure === 'High' ? 2.5 : pestPressure === 'Medium' ? 2.0 : 1.5);
    const cost = Math.round(dosage * 0.8);

    return {
      pestPressure,
      diseaseRisk,
      dosage: Math.round(dosage * 10) / 10,
      cost,
      recommendations: [
        `Apply ${dosage.toFixed(1)} liters per hectare based on pest pressure (${pestPressure})`,
        `Disease risk: ${diseaseRisk} - ${diseaseRisk === 'High' ? 'Increase fungicide application' : 'Normal application'}`,
        analysis.ndvi < 0.4 ? "High pest pressure detected - use systemic insecticide" : "Contact insecticide sufficient",
        analysis.ndmi > 0.6 ? "High humidity detected - increase fungicide frequency" : "Normal fungicide schedule",
        `Target application during ${getOptimalSprayTime(analysis)}`
      ],
      products: getPesticideProducts(crop, pestPressure, diseaseRisk)
    };
  };

  // Calculate irrigation recommendations based on field conditions
  const calculateIrrigationRecommendations = (fieldData: RealFieldData) => {
    const analysis = fieldData.analysis;
    const area = fieldData.area;
    const crop = fieldData.crop;

    // Calculate water requirement based on NDMI and weather
    const baseWaterRequirement = {
      'Rice': 1200,
      'Wheat': 400,
      'Maize': 500,
      'Sugarcane': 1500,
      'Potato': 600
    };

    const baseRequirement = baseWaterRequirement[crop] || baseWaterRequirement['Rice'];
    const ndmiAdjustment = analysis.ndmi < 0.3 ? 1.5 : analysis.ndmi < 0.5 ? 1.2 : 1.0;
    const weatherAdjustment = fieldData.weather?.temperature > 35 ? 1.3 : 1.0;

    const waterRequirement = Math.round(baseRequirement * ndmiAdjustment * weatherAdjustment * area);
    const irrigationFrequency = analysis.ndmi < 0.3 ? 'Daily' : analysis.ndmi < 0.5 ? 'Every 2 days' : 'Every 3 days';

    return {
      waterRequirement,
      irrigationFrequency,
      cost: Math.round(waterRequirement * 0.05), // Cost per liter
      recommendations: [
        `Apply ${waterRequirement} liters per hectare based on NDMI (${analysis.ndmi.toFixed(2)})`,
        `Irrigation frequency: ${irrigationFrequency} due to water stress level`,
        analysis.ndmi < 0.3 ? "Critical water stress - increase irrigation immediately" : "Normal irrigation schedule",
        analysis.ndmi > 0.6 ? "Reduce irrigation to prevent waterlogging" : "Maintain current schedule",
        `Optimal irrigation time: ${getOptimalIrrigationTime(analysis)}`
      ],
      efficiency: getIrrigationEfficiency(analysis)
    };
  };

  // Helper functions
  const getFertilizerTiming = (cropStage: string) => {
    const timing = {
      'Sowing': 'Apply 30% N, 100% P, 50% K at sowing',
      'Vegetative': 'Apply 50% N, 0% P, 30% K at 25-30 days',
      'Flowering': 'Apply 20% N, 0% P, 20% K at flowering',
      'Maturity': 'No additional fertilizer needed'
    };
    return timing[cropStage] || 'Apply as per standard schedule';
  };

  const getRecommendedProducts = (crop: string, analysis: any) => {
    const products = {
      'Rice': ['Urea (46% N)', 'DAP (18% N, 46% P)', 'MOP (60% K)'],
      'Wheat': ['Urea (46% N)', 'SSP (16% P)', 'MOP (60% K)'],
      'Maize': ['Urea (46% N)', 'DAP (18% N, 46% P)', 'MOP (60% K)'],
      'Sugarcane': ['Urea (46% N)', 'DAP (18% N, 46% P)', 'MOP (60% K)'],
      'Potato': ['Urea (46% N)', 'SSP (16% P)', 'MOP (60% K)']
    };
    return products[crop] || products['Rice'];
  };

  const getPesticideProducts = (crop: string, pestPressure: string, diseaseRisk: string) => {
    const products = [];
    if (pestPressure === 'High') {
      products.push('Imidacloprid 17.8% SL', 'Chlorpyriphos 20% EC');
    } else {
      products.push('Neem Oil 0.3% EC', 'Spinosad 2.5% SC');
    }
    if (diseaseRisk === 'High') {
      products.push('Mancozeb 75% WP', 'Copper Oxychloride 50% WP');
    }
    return products;
  };

  const getOptimalSprayTime = (analysis: any) => {
    return analysis.ndmi > 0.6 ? 'early morning (6-8 AM)' : 'evening (5-7 PM)';
  };

  const getOptimalIrrigationTime = (analysis: any) => {
    return analysis.ndmi < 0.3 ? 'immediately' : 'early morning (5-7 AM)';
  };

  const getIrrigationEfficiency = (analysis: any) => {
    if (analysis.ndmi < 0.3) return 'Low - Increase frequency';
    if (analysis.ndmi < 0.5) return 'Medium - Monitor closely';
    if (analysis.ndmi < 0.7) return 'Good - Maintain schedule';
    return 'Excellent - Reduce if needed';
  };

  // Calculate all recommendations
  const calculateAllRecommendations = async (fieldData: RealFieldData) => {
    setIsCalculating(true);
    try {
      const fertilizer = calculateFertilizerRecommendations(fieldData);
      const pesticide = calculatePesticideRecommendations(fieldData);
      const irrigation = calculateIrrigationRecommendations(fieldData);

      setFertilizerResult(fertilizer);
      setPesticideResult(pesticide);
      setIrrigationResult(irrigation);

      toast.success("Field-specific calculations completed!");
    } catch (error) {
      console.error('Calculation error:', error);
      toast.error("Failed to calculate recommendations");
    } finally {
      setIsCalculating(false);
    }
  };

  const refreshCalculations = () => {
    if (realFieldData) {
      calculateAllRecommendations(realFieldData);
    } else {
      toast.error("No field data available for calculations");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Smart Dose Calculator
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
              {hasRealData ? 'Field Data' : 'Manual Input'}
            </Badge>
          </div>
          {hasRealData && (
            <Button 
              onClick={refreshCalculations} 
              variant="outline" 
              size="sm"
              disabled={isCalculating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
              Recalculate
            </Button>
          )}
        </CardTitle>
        {hasRealData && realFieldData && (
          <div className="text-sm text-muted-foreground">
            Calculating for {realFieldData.crop} field ({realFieldData.area} hectares) - {realFieldData.analysis.cropStage} stage
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="fertilizer" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fertilizer">Fertilizer</TabsTrigger>
            <TabsTrigger value="pesticide">Pesticide</TabsTrigger>
            <TabsTrigger value="irrigation">Irrigation</TabsTrigger>
          </TabsList>

          <TabsContent value="fertilizer" className="space-y-4">
            {hasRealData && fertilizerResult ? (
              <div className="space-y-4">
                <Alert>
                  <Target className="h-4 w-4" />
                  <AlertDescription>
                    Calculations based on real field data: NDVI {realFieldData?.analysis.ndvi.toFixed(2)}, 
                    NDMI {realFieldData?.analysis.ndmi.toFixed(2)}, NDRE {realFieldData?.analysis.ndre.toFixed(2)}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Leaf className="h-4 w-4 text-green-600" />
                        <span className="font-semibold">Nitrogen (N)</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">{fertilizerResult.nitrogen} kg</div>
                      <div className="text-sm text-muted-foreground">per hectare</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold">Phosphorus (P₂O₅)</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{fertilizerResult.phosphorus} kg</div>
                      <div className="text-sm text-muted-foreground">per hectare</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Droplets className="h-4 w-4 text-purple-600" />
                        <span className="font-semibold">Potassium (K₂O)</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">{fertilizerResult.potassium} kg</div>
                      <div className="text-sm text-muted-foreground">per hectare</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {fertilizerResult.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary font-bold">{index + 1}.</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-blue-900">Timing:</div>
                      <div className="text-blue-800">{fertilizerResult.timing}</div>
                    </div>
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="font-semibold text-green-900">Recommended Products:</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {fertilizerResult.products.map((product: string, index: number) => (
                          <Badge key={index} variant="secondary">{product}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <div className="font-semibold text-yellow-900">Estimated Cost:</div>
                      <div className="text-yellow-800">₹{fertilizerResult.totalCost} per hectare</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No field data available. Please map a field first to get automatic calculations.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pesticide" className="space-y-4">
            {hasRealData && pesticideResult ? (
              <div className="space-y-4">
                <Alert>
                  <Bug className="h-4 w-4" />
                  <AlertDescription>
                    Pest pressure: {pesticideResult.pestPressure}, Disease risk: {pesticideResult.diseaseRisk}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Bug className="h-4 w-4 text-red-600" />
                        <span className="font-semibold">Dosage</span>
                      </div>
                      <div className="text-2xl font-bold text-red-600">{pesticideResult.dosage} L</div>
                      <div className="text-sm text-muted-foreground">per hectare</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingCart className="h-4 w-4 text-orange-600" />
                        <span className="font-semibold">Cost</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-600">₹{pesticideResult.cost}</div>
                      <div className="text-sm text-muted-foreground">per hectare</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {pesticideResult.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary font-bold">{index + 1}.</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="font-semibold text-green-900">Recommended Products:</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {pesticideResult.products.map((product: string, index: number) => (
                          <Badge key={index} variant="secondary">{product}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No field data available. Please map a field first to get automatic calculations.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="irrigation" className="space-y-4">
            {hasRealData && irrigationResult ? (
              <div className="space-y-4">
                <Alert>
                  <Droplets className="h-4 w-4" />
                  <AlertDescription>
                    Water stress level: {realFieldData?.analysis.waterStressLevel}, 
                    NDMI: {realFieldData?.analysis.ndmi.toFixed(2)}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Droplets className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold">Water Required</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{irrigationResult.waterRequirement} L</div>
                      <div className="text-sm text-muted-foreground">per hectare</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="font-semibold">Frequency</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">{irrigationResult.irrigationFrequency}</div>
                      <div className="text-sm text-muted-foreground">irrigation schedule</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingCart className="h-4 w-4 text-purple-600" />
                        <span className="font-semibold">Cost</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">₹{irrigationResult.cost}</div>
                      <div className="text-sm text-muted-foreground">per hectare</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {irrigationResult.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary font-bold">{index + 1}.</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-blue-900">Irrigation Efficiency:</div>
                      <div className="text-blue-800">{irrigationResult.efficiency}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No field data available. Please map a field first to get automatic calculations.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedDoseCalculator;
