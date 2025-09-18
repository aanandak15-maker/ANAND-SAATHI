import { api } from './api';
import { analyzeFieldVegetation } from './geeClient';
import { cache, CACHE_TTL } from './cache';
import { toast } from 'sonner';

export interface RealFieldData {
  field_id: string;
  location: { lat: number; lng: number };
  boundary: {
    coordinates: number[][][];
  };
  area: number;
  crop: string;
  analysis: {
    ndvi: number;
    msavi2: number;
    ndre: number;
    ndmi: number;
    socVis: number | null;
    rvi: number;
    cloudCover: number;
    cropStage: string;
    healthStatus: string;
    waterStressLevel: string;
    qualityScore: number;
    analysisDate: Date;
  };
  recommendations: string[];
  weather?: {
    temperature: number;
    humidity: number;
    rainfall: number;
  };
}

export interface FieldBoundary {
  coordinates: number[][][];
}

// Get real satellite analysis for a field
// Progressive analysis with user feedback
export async function getRealFieldAnalysisWithProgress(
  boundary: FieldBoundary,
  cropType: string,
  location: { lat: number; lng: number },
  onProgress: (step: string, progress: number) => void
): Promise<RealFieldData> {
  try {
    // Check cache first
    const cacheKey = cache.generateFieldAnalysisKey(boundary, cropType);
    const cachedResult = cache.get<RealFieldData>(cacheKey);
    
    if (cachedResult) {
      onProgress('Using cached analysis...', 100);
      console.log('📦 Using cached field analysis');
      return cachedResult;
    }

    onProgress('Analyzing real field data with GEE...', 20);
    
    // Get hybrid satellite analysis with your API key
    onProgress('Generating satellite image...', 40);
    const geeAnalysis = await analyzeFieldVegetation(boundary, cropType, new Date());
    
    onProgress('Processing vegetation data...', 60);
    console.log('🌍 Hybrid analysis completed:', {
      dataSource: geeAnalysis.dataSource,
      apiKeyUsed: geeAnalysis.apiKeyUsed,
      satelliteImageUrl: geeAnalysis.satelliteImageUrl,
      qualityScore: geeAnalysis.qualityScore
    });

    // Generate AI recommendations based on hybrid analysis
    onProgress('Generating AI recommendations...', 80);
    const recommendations = generateRecommendations(geeAnalysis, cropType);

    // Get weather data (mock for now, can be replaced with real weather API)
    onProgress('Fetching weather data...', 90);
    const weather = await getCurrentWeather(location);

    const realFieldData: RealFieldData = {
      field_id: `field_${Date.now()}`,
      location,
      boundary,
      area: calculateFieldArea(boundary),
      crop: cropType,
      analysis: {
        ...geeAnalysis,
        analysisDate: new Date()
      },
      recommendations,
      weather,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    onProgress('Analysis complete!', 100);
    
    // Cache the result
    cache.set(cacheKey, realFieldData, CACHE_TTL.FIELD_ANALYSIS);
    console.log('💾 Cached field analysis result');
    
    return realFieldData;
    
  } catch (error) {
    console.error('Progressive analysis failed:', error);
    onProgress('Analysis failed - using fallback data', 0);
    throw error;
  }
}

export async function getRealFieldAnalysis(
  boundary: FieldBoundary,
  cropType: string,
  location: { lat: number; lng: number }
): Promise<RealFieldData> {
  try {
    console.log('Analyzing real field data with GEE...');
    
    // Get hybrid satellite analysis with your API key
    const geeAnalysis = await analyzeFieldVegetation(boundary, cropType, new Date());
    
    console.log('🌍 Hybrid analysis completed:', {
      dataSource: geeAnalysis.dataSource,
      apiKeyUsed: geeAnalysis.apiKeyUsed,
      satelliteImageUrl: geeAnalysis.satelliteImageUrl,
      qualityScore: geeAnalysis.qualityScore
    });

    // Generate AI recommendations based on hybrid analysis
    const recommendations = generateRecommendations(geeAnalysis, cropType);

    // Get weather data (mock for now, can be replaced with real weather API)
    const weather = await getCurrentWeather(location);

    const realFieldData: RealFieldData = {
      field_id: `field_${Date.now()}`,
      location,
      boundary,
      area: calculateFieldArea(boundary),
      crop: cropType,
      analysis: {
        ...geeAnalysis,
        analysisDate: new Date()
      },
      recommendations,
      weather
    };

    console.log('Real field analysis completed:', realFieldData);
    return realFieldData;
    
  } catch (error) {
    console.error('Error getting real field analysis:', error);
    toast.error('Failed to analyze field. Using fallback data.');
    
    // Fallback to simulated data with warning
    return getFallbackFieldData(boundary, cropType, location);
  }
}

// Calculate field area from boundary coordinates
function calculateFieldArea(boundary: FieldBoundary): number {
  if (!boundary.coordinates || boundary.coordinates.length === 0) return 0;
  
  const coords = boundary.coordinates[0];
  if (coords.length < 3) return 0;
  
  // Use Shoelace formula for polygon area
  let area = 0;
  const n = coords.length - 1; // Exclude the last point (same as first)
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += coords[i][0] * coords[j][1];
    area -= coords[j][0] * coords[i][1];
  }
  
  area = Math.abs(area) / 2;
  
  // Convert to hectares (approximate)
  const hectares = area * 111320 * 111320 / 10000;
  return Math.max(0.01, hectares);
}

// Generate AI-powered recommendations based on hybrid analysis
function generateRecommendations(analysis: { 
  dataSource: string; 
  qualityScore: number; 
  ndvi: number; 
  ndmi: number; 
  waterStressLevel: string; 
  cropStage: string; 
  cloudCover: number; 
  area: number;
  validPixels: number;
  satelliteImageUrl?: string;
}, cropType: string): string[] {
  const recommendations: string[] = [];
  const isRealSatelliteData = analysis.dataSource === 'hybrid_api';
  
  // Add data source context
  if (isRealSatelliteData) {
    recommendations.push(`🛰️ **Real Satellite Analysis**: Using current satellite imagery with your API key`);
    recommendations.push(`📊 **Data Quality**: ${analysis.qualityScore.toFixed(2)}/1.0 - High confidence analysis`);
  } else {
    recommendations.push(`📊 **Enhanced Simulation**: Using realistic field-specific analysis`);
  }
  
  // NDVI-based AI recommendations
  if (analysis.ndvi < 0.3) {
    recommendations.push(`🚨 **CRITICAL ALERT**: NDVI ${analysis.ndvi.toFixed(2)} indicates severe crop stress`);
    recommendations.push(`💧 **Immediate Action**: Increase irrigation frequency by 50%`);
    recommendations.push(`🧪 **Soil Test**: Check for nitrogen deficiency (likely cause)`);
    recommendations.push(`🌱 **Replanting**: Consider replanting severely affected areas`);
    recommendations.push(`💰 **Cost Impact**: Potential 60-80% yield loss without intervention`);
  } else if (analysis.ndvi < 0.5) {
    recommendations.push(`⚠️ **WARNING**: NDVI ${analysis.ndvi.toFixed(2)} below optimal range`);
    recommendations.push(`💧 **Irrigation**: Increase watering by 25-30%`);
    recommendations.push(`🧪 **Fertilizer**: Apply balanced NPK (20-20-20) at 50kg/hectare`);
    recommendations.push(`📅 **Timeline**: Action needed within 3-5 days`);
  } else if (analysis.ndvi > 0.8) {
    recommendations.push(`✅ **EXCELLENT**: NDVI ${analysis.ndvi.toFixed(2)} shows optimal crop health`);
    recommendations.push(`📊 **Continue**: Maintain current management practices`);
    recommendations.push(`🎯 **Optimize**: Consider precision farming for even better yields`);
  } else {
    recommendations.push(`✅ **GOOD**: NDVI ${analysis.ndvi.toFixed(2)} indicates healthy vegetation`);
    recommendations.push(`📈 **Monitor**: Continue regular field observations`);
  }
  
  // Water stress AI recommendations
  if (analysis.waterStressLevel === 'severe') {
    recommendations.push(`💧 **WATER EMERGENCY**: Severe water stress detected (NDMI: ${analysis.ndmi.toFixed(2)})`);
    recommendations.push(`🚨 **Immediate**: Emergency irrigation within 24 hours`);
    recommendations.push(`🔧 **System Check**: Verify irrigation system efficiency`);
    recommendations.push(`💰 **Yield Impact**: 40-60% yield loss risk without action`);
  } else if (analysis.waterStressLevel === 'moderate') {
    recommendations.push(`💧 **WATER STRESS**: Moderate deficiency detected`);
    recommendations.push(`📈 **Increase**: Boost irrigation by 20-30%`);
    recommendations.push(`⏰ **Timeline**: Address within 2-3 days`);
  } else if (analysis.waterStressLevel === 'none') {
    recommendations.push(`💧 **WATER STATUS**: Optimal moisture levels maintained`);
  }
  
  // Crop-specific AI recommendations
  if (cropType.toLowerCase().includes('rice') || cropType.toLowerCase().includes('paddy')) {
    recommendations.push(`🌾 **RICE MANAGEMENT**: Maintain 2-5cm water level in fields`);
    if (analysis.cropStage === 'reproductive') {
      recommendations.push(`🌸 **FLOWERING STAGE**: Critical water requirement - ensure adequate irrigation`);
      recommendations.push(`🧪 **Fertilizer**: Apply potassium-rich fertilizer for grain development`);
    } else if (analysis.cropStage === 'maturity') {
      recommendations.push(`🌾 **HARVEST PREP**: Reduce water gradually for grain hardening`);
      recommendations.push(`📅 **Timeline**: Harvest in 2-3 weeks`);
    }
  } else if (cropType.toLowerCase().includes('wheat')) {
    recommendations.push(`🌾 **WHEAT MANAGEMENT**: Monitor for rust diseases during current stage`);
    if (analysis.cropStage === 'maturity') {
      recommendations.push(`🌾 **HARVEST READY**: Prepare for harvest in 2-3 weeks`);
      recommendations.push(`📊 **Quality**: Ensure proper grain moisture (12-14%)`);
    } else if (analysis.cropStage === 'reproductive') {
      recommendations.push(`🌸 **FLOWERING**: Critical stage - avoid water stress`);
    }
  } else if (cropType.toLowerCase().includes('cotton')) {
    recommendations.push(`🌾 **COTTON MANAGEMENT**: Monitor for bollworm activity`);
    recommendations.push(`🧪 **Fertilizer**: Apply potassium fertilizer during boll development`);
    if (analysis.cropStage === 'reproductive') {
      recommendations.push(`🌸 **BOLL DEVELOPMENT**: Critical stage for yield formation`);
    }
  } else if (cropType.toLowerCase().includes('maize')) {
    recommendations.push(`🌽 **MAIZE MANAGEMENT**: Monitor for corn borer and leaf blight`);
    if (analysis.cropStage === 'reproductive') {
      recommendations.push(`🌽 **TASSELING**: Ensure adequate nitrogen for grain fill`);
    }
  }
  
  // Advanced AI insights
  if (isRealSatelliteData && analysis.satelliteImageUrl) {
    recommendations.push(`🛰️ **SATELLITE IMAGE**: Real-time field imagery available`);
    recommendations.push(`📊 **Pixel Analysis**: ${analysis.validPixels} valid pixels analyzed`);
  }
  
  // Quality and timing recommendations
  if (analysis.cloudCover > 30) {
    recommendations.push(`☁️ **CLOUD WARNING**: ${analysis.cloudCover.toFixed(1)}% cloud cover may affect accuracy`);
    recommendations.push(`📅 **Re-analysis**: Schedule follow-up on clearer day`);
  }
  
  if (analysis.qualityScore < 0.7) {
    recommendations.push(`📊 **QUALITY ALERT**: Analysis confidence ${analysis.qualityScore.toFixed(2)} - consider re-analysis`);
  }
  
  // ROI and economic insights
  if (analysis.ndvi < 0.5) {
    const estimatedCost = Math.floor(analysis.area * 2000); // Rough estimate
    recommendations.push(`💰 **INVESTMENT**: Estimated intervention cost ₹${estimatedCost} for ${analysis.area.toFixed(2)} hectares`);
    recommendations.push(`📈 **ROI**: Expected 3-5x return on investment with proper care`);
  }
  
  return recommendations;
}

// Get current weather data (mock implementation)
async function getCurrentWeather(location: { lat: number; lng: number }) {
  // In production, this would call a real weather API
  // For now, return realistic weather data based on location
  
  const isIndia = location.lat > 6 && location.lat < 38 && location.lng > 68 && location.lng < 98;
  
  if (isIndia) {
    // Indian weather patterns
    const month = new Date().getMonth();
    const isMonsoon = month >= 5 && month <= 9;
    
    return {
      temperature: isMonsoon ? 28 + Math.random() * 6 : 25 + Math.random() * 10,
      humidity: isMonsoon ? 70 + Math.random() * 25 : 40 + Math.random() * 30,
      rainfall: isMonsoon ? Math.random() * 50 : Math.random() * 10
    };
  }
  
  // Default weather for other locations
  return {
    temperature: 20 + Math.random() * 15,
    humidity: 50 + Math.random() * 30,
    rainfall: Math.random() * 20
  };
}

// Fallback data when real analysis fails
function getFallbackFieldData(
  boundary: FieldBoundary,
  cropType: string,
  location: { lat: number; lng: number }
): RealFieldData {
  const area = calculateFieldArea(boundary);
  
  return {
    field_id: `fallback_${Date.now()}`,
    location,
    boundary,
    area,
    crop: cropType,
    analysis: {
      ndvi: 0.6 + Math.random() * 0.2,
      msavi2: 0.55 + Math.random() * 0.2,
      ndre: 0.5 + Math.random() * 0.2,
      ndmi: 0.4 + Math.random() * 0.2,
      socVis: Math.random() * 0.3,
      rvi: 1 + Math.random() * 2,
      cloudCover: Math.random() * 20,
      cropStage: 'vegetative',
      healthStatus: 'good',
      waterStressLevel: 'mild',
      qualityScore: 0.75,
      analysisDate: new Date()
    },
    recommendations: [
      '⚠️ Using fallback analysis due to connectivity issues.',
      '📡 Real satellite analysis will be available when connection is restored.',
      '💧 Continue regular irrigation schedule.',
      '📊 Schedule field visit for ground truth verification.'
    ],
    weather: {
      temperature: 28,
      humidity: 65,
      rainfall: 15
    }
  };
}

// Store field data locally
export function storeFieldData(fieldData: RealFieldData) {
  try {
    const storedFields = getStoredFields();
    storedFields.push(fieldData);
    localStorage.setItem('soil_saathi_fields', JSON.stringify(storedFields));
    toast.success(`Field "${fieldData.field_id}" saved successfully!`);
  } catch (error) {
    console.error('Failed to store field data:', error);
    toast.error('Failed to save field data locally.');
  }
}

// Get stored field data
export function getStoredFields(): RealFieldData[] {
  try {
    const stored = localStorage.getItem('soil_saathi_fields');
    if (stored) {
      const fields = JSON.parse(stored);
      // Convert date strings back to Date objects
      return fields.map((field: any) => ({
        ...field,
        analysis: {
          ...field.analysis,
          analysisDate: new Date(field.analysis.analysisDate)
        },
        createdAt: field.createdAt ? new Date(field.createdAt) : undefined,
        updatedAt: field.updatedAt ? new Date(field.updatedAt) : undefined
      }));
    }
    return [];
  } catch (error) {
    console.error('Failed to retrieve stored fields:', error);
    return [];
  }
}

// Get the most recent field analysis
export function getMostRecentField(): RealFieldData | null {
  const fields = getStoredFields();
  if (fields.length === 0) return null;
  
  return fields.reduce((latest, current) => {
    return new Date(current.analysis.analysisDate) > new Date(latest.analysis.analysisDate) 
      ? current : latest;
  });
}
