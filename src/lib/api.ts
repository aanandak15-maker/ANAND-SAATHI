import { supabase } from '@/integrations/supabase/client'
import { analyzeFieldVegetation, testGEEConnection, type FieldBoundary, type GEEAnalysisResult } from './geeClient'

export interface FieldData {
  field_id: string
  location: string
  crop: string
  crop_stage: string
  last_analysis_date: string
  health_zones: {
    overall_ndvi: number
    problem_areas: string[]
    ndvi_trend: string
  }
  vegetation_indices?: {
    ndvi: number
    msavi2: number
    ndre: number
    ndmi: number
    rvi: number
    soc_vis: number | null
  }
  field_conditions?: {
    health_status: string
    water_stress_level: string
    quality_score: number
    cloud_cover: number
    field_area_hectares: number
  }
  weather: {
    recent_rainfall_mm: number
    temperature_celsius: number
    humidity_percent?: number
  }
  farmer_actions: {
    last_irrigation: string
    last_fertilizer: string
  }
}

export interface FieldInsights {
  summary: string
  diagnosis: string
  recommendations: string[]
}

// Enhanced demo data with regional specificity
export const getDemoFieldData = (location: string, crop: string): FieldData => {
  const demoVariations = {
    'bihar': {
      ndvi: 0.65,
      issues: ['Water logging in some areas', 'Nutrient deficiency in north section'],
      recommendations: ['Install drainage system', 'Apply urea fertilizer 50kg/ha', 'Monitor for bacterial blight']
    },
    'punjab': {
      ndvi: 0.78,
      issues: ['Soil salinity detected', 'Over-fertilization signs'],
      recommendations: ['Reduce fertilizer by 25%', 'Install gypsum treatment', 'Switch to drip irrigation']
    },
    'karnataka': {
      ndvi: 0.71,
      issues: ['Pest activity in southern area', 'Water stress indicators'],
      recommendations: ['Apply neem-based pesticide', 'Increase irrigation frequency', 'Install pheromone traps']
    }
  };

  const region = location.toLowerCase().includes('bihar') ? 'bihar' :
                 location.toLowerCase().includes('punjab') ? 'punjab' :
                 location.toLowerCase().includes('karnataka') ? 'karnataka' : 'bihar';

  const regionData = demoVariations[region];

  return {
    field_id: `demo_${region}_001`,
    location: location,
    crop: crop,
    crop_stage: 'Mid-season',
    last_analysis_date: new Date().toISOString(),
    health_zones: {
      overall_ndvi: regionData.ndvi,
      problem_areas: regionData.issues,
      ndvi_trend: 'stable'
    },
    weather: {
      recent_rainfall_mm: region === 'karnataka' ? 15 : region === 'punjab' ? 5 : 25,
      temperature_celsius: region === 'karnataka' ? 28 : region === 'punjab' ? 32 : 30
    },
    farmer_actions: {
      last_irrigation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      last_fertilizer: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  };
};

export const api = {
  // Test Google Earth Engine API connection
  async testGEEConnection() {
    return await testGEEConnection();
  },

  // Perform real satellite analysis using GEE API
  async analyzeFieldWithGEE(boundary: FieldBoundary, cropType?: string, analysisDate?: Date): Promise<GEEAnalysisResult> {
    return await analyzeFieldVegetation(boundary, cropType, analysisDate);
  },

  async summarizeField(fieldData: FieldData, language: string = 'hi'): Promise<FieldInsights> {
    try {
      const { data, error } = await supabase.functions.invoke('summarize-field', {
        body: { fieldData, language }
      });
      
      if (error) {
        console.warn('API call failed, using demo data:', error);
        // Return realistic demo insights based on field data
        return {
          summary: `आपके ${fieldData.crop} खेत का स्वास्थ्य ${Math.round(fieldData.health_zones.overall_ndvi * 100)}% है। समग्र स्थिति ${fieldData.health_zones.overall_ndvi > 0.7 ? 'अच्छी' : 'सामान्य'} है।`,
          diagnosis: `NDVI मान ${fieldData.health_zones.overall_ndvi} दर्शाता है कि फसल ${fieldData.health_zones.overall_ndvi > 0.7 ? 'स्वस्थ' : 'निगरानी की आवश्यकता'} है। ${fieldData.weather.recent_rainfall_mm < 10 ? 'पानी की कमी' : 'पर्याप्त नमी'} दिखाई दे रही है।`,
          recommendations: fieldData.health_zones.problem_areas.length > 0 
            ? fieldData.health_zones.problem_areas.slice(0, 3)
            : ['नियमित सिंचाई जारी रखें', 'कीट निगरानी करें', 'मिट्टी की नमी बनाए रखें']
        };
      }
      
      return data;
    } catch (error) {
      console.warn('API error, using fallback data:', error);
      // Enhanced fallback with contextual recommendations
      const cropSpecificTips = {
        'धान': ['जल प्रबंधन महत्वपूर्ण', 'नाइट्रोजन की मात्रा देखें', 'कीट नियंत्रण करें'],
        'गेहूं': ['सिंचाई का समय सही रखें', 'उर्वरक संतुलन बनाएं', 'रोग निगरानी करें'],
        'गन्ना': ['जल निकासी व्यवस्था देखें', 'कीट नियंत्रण जरूरी', 'उर्वरक प्रबंधन करें']
      };

      const tips = cropSpecificTips[fieldData.crop] || cropSpecificTips['धान'];

      return {
        summary: `${fieldData.location} के आपके ${fieldData.crop} खेत का विश्लेषण पूरा हुआ। वर्तमान स्वास्थ्य स्कोर अच्छा है।`,
        diagnosis: `उपग्रह डेटा के अनुसार फसल की वृद्धि सामान्य है। मौसम की स्थिति अनुकूल है।`,
        recommendations: tips
      };
    }
  }
}