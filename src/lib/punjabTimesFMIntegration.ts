/**
 * Punjab Rice System + TimesFM Integration
 * Combines Punjab-specific rice phenology with TimesFM's advanced AI capabilities
 * Leverages existing yield prediction, satellite data, and soil analysis
 */

import { PunjabRiceSystem, FieldMonitoringData, SystemStatus } from './punjabRiceSystem';
import { PunjabRiceVariety, PunjabDistrict } from '@/data/punjabRiceVarieties';

export interface TimesFMIntegrationConfig {
  backendUrl: string;
  apiKey: string;
  endpoints: {
    yieldPrediction: string;
    satelliteData: string;
    soilAnalysis: string;
    weatherData: string;
    marketIntelligence: string;
  };
}

export interface EnhancedFieldAnalysis {
  fieldId: string;
  variety: PunjabRiceVariety;
  district: PunjabDistrict;
  
  // Punjab-specific phenology data
  phenologyData: {
    currentStage: string;
    stageProgress: number;
    daysInStage: number;
    expectedDaysRemaining: number;
    healthStatus: string;
  };
  
  // TimesFM AI predictions
  timesFMPredictions: {
    yieldPrediction: {
      tonsPerAcre: number;
      kgPerM2: number;
      totalYieldKg: number;
      confidence: number;
      scenarios: {
        drought: number;
        normal: number;
        optimal: number;
      };
    };
    riskFactors: Array<{
      factor: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      impact: string;
      recommendation: string;
    }>;
  };
  
  // Satellite data analysis
  satelliteAnalysis: {
    ndvi: number;
    ndwi: number;
    cropHealth: string;
    stressIndicators: string[];
    growthStage: string;
    lastUpdate: Date;
  };
  
  // Soil health analysis
  soilAnalysis: {
    ph: number;
    organicMatter: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    healthScore: number;
    recommendations: string[];
  };
  
  // Weather intelligence
  weatherIntelligence: {
    current: {
      temperature: number;
      humidity: number;
      precipitation: number;
      windSpeed: number;
    };
    forecast: Array<{
      date: string;
      temperature: { min: number; max: number };
      precipitation: number;
      conditions: string;
    }>;
    alerts: string[];
  };
  
  // Market intelligence
  marketIntelligence: {
    currentPrice: number; // INR per quintal
    priceTrend: 'up' | 'down' | 'stable';
    marketRecommendations: string[];
    harvestTiming: {
      optimalDate: Date;
      priceImpact: number;
    };
  };
  
  // Integrated recommendations
  integratedRecommendations: Array<{
    category: 'irrigation' | 'fertilizer' | 'pest_control' | 'harvest' | 'market';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    localDescription: string; // Punjabi
    actionItems: string[];
    estimatedCost: number;
    expectedImpact: string;
    implementationWindow: string;
  }>;
  
  // Performance metrics
  performanceMetrics: {
    yieldImprovement: number; // percentage
    costSavings: number; // INR
    waterEfficiency: number; // percentage
    riskLevel: 'low' | 'medium' | 'high';
    overallScore: number; // 0-100
  };
}

export class PunjabTimesFMIntegration {
  private punjabSystem: PunjabRiceSystem;
  private config: TimesFMIntegrationConfig;
  private cache: Map<string, any> = new Map();

  constructor(
    punjabSystem: PunjabRiceSystem,
    config: TimesFMIntegrationConfig
  ) {
    this.punjabSystem = punjabSystem;
    this.config = config;
  }

  /**
   * Get comprehensive field analysis combining Punjab system + TimesFM
   */
  async getEnhancedFieldAnalysis(fieldId: string): Promise<EnhancedFieldAnalysis | null> {
    try {
      // Get Punjab system data
      const punjabData = this.punjabSystem.getFieldMonitoringData(fieldId);
      if (!punjabData) {
        throw new Error(`Field ${fieldId} not found in Punjab system`);
      }

      // Get TimesFM predictions
      const timesFMPredictions = await this.getTimesFMYieldPrediction(fieldId, punjabData);
      
      // Get satellite analysis
      const satelliteAnalysis = await this.getSatelliteAnalysis(fieldId, punjabData);
      
      // Get soil analysis
      const soilAnalysis = await this.getSoilAnalysis(fieldId, punjabData);
      
      // Get weather intelligence
      const weatherIntelligence = await this.getWeatherIntelligence(fieldId, punjabData);
      
      // Get market intelligence
      const marketIntelligence = await this.getMarketIntelligence(fieldId, punjabData);
      
      // Generate integrated recommendations
      const integratedRecommendations = this.generateIntegratedRecommendations(
        punjabData,
        timesFMPredictions,
        satelliteAnalysis,
        soilAnalysis,
        weatherIntelligence,
        marketIntelligence
      );
      
      // Calculate performance metrics
      const performanceMetrics = this.calculatePerformanceMetrics(
        punjabData,
        timesFMPredictions,
        satelliteAnalysis,
        soilAnalysis
      );

      return {
        fieldId,
        variety: punjabData.variety,
        district: punjabData.district,
        phenologyData: {
          currentStage: punjabData.lastAnalysis?.currentStage.name || 'Unknown',
          stageProgress: punjabData.lastAnalysis?.stageProgress || 0,
          daysInStage: punjabData.lastAnalysis?.daysInStage || 0,
          expectedDaysRemaining: punjabData.lastAnalysis?.expectedDaysRemaining || 0,
          healthStatus: punjabData.lastAnalysis?.stageHealth || 'unknown'
        },
        timesFMPredictions,
        satelliteAnalysis,
        soilAnalysis,
        weatherIntelligence,
        marketIntelligence,
        integratedRecommendations,
        performanceMetrics
      };

    } catch (error) {
      console.error(`Failed to get enhanced field analysis for ${fieldId}:`, error);
      return null;
    }
  }

  /**
   * Get TimesFM yield prediction
   */
  private async getTimesFMYieldPrediction(
    fieldId: string,
    punjabData: FieldMonitoringData
  ): Promise<EnhancedFieldAnalysis['timesFMPredictions']> {
    try {
      const cacheKey = `yield_prediction_${fieldId}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await fetch(`${this.config.backendUrl}${this.config.endpoints.yieldPrediction}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          field_id: fieldId,
          crop_type: 'rice',
          variety: punjabData.variety.name,
          district: punjabData.district.name,
          planting_date: punjabData.plantingDate.toISOString(),
          field_area: punjabData.district.riceArea,
          current_conditions: punjabData.currentConditions
        })
      });

      if (!response.ok) {
        throw new Error(`TimesFM API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      const result = {
        yieldPrediction: {
          tonsPerAcre: data.predicted_yield || punjabData.variety.avgYield / 10, // Convert quintals to tons
          kgPerM2: (data.predicted_yield || punjabData.variety.avgYield / 10) * 0.404686,
          totalYieldKg: (data.predicted_yield || punjabData.variety.avgYield / 10) * 0.404686 * 10000, // Assuming 1 hectare
          confidence: data.confidence || 0.85,
          scenarios: {
            drought: data.scenarios?.drought || (data.predicted_yield * 0.7),
            normal: data.predicted_yield || punjabData.variety.avgYield / 10,
            optimal: data.scenarios?.optimal || (data.predicted_yield * 1.2)
          }
        },
        riskFactors: data.risk_factors || []
      };

      this.cache.set(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Failed to get TimesFM yield prediction:', error);
      // Return fallback data
      return {
        yieldPrediction: {
          tonsPerAcre: punjabData.variety.avgYield / 10,
          kgPerM2: (punjabData.variety.avgYield / 10) * 0.404686,
          totalYieldKg: (punjabData.variety.avgYield / 10) * 0.404686 * 10000,
          confidence: 0.75,
          scenarios: {
            drought: (punjabData.variety.avgYield / 10) * 0.7,
            normal: punjabData.variety.avgYield / 10,
            optimal: (punjabData.variety.avgYield / 10) * 1.2
          }
        },
        riskFactors: []
      };
    }
  }

  /**
   * Get satellite analysis from TimesFM
   */
  private async getSatelliteAnalysis(
    fieldId: string,
    punjabData: FieldMonitoringData
  ): Promise<EnhancedFieldAnalysis['satelliteAnalysis']> {
    try {
      const cacheKey = `satellite_${fieldId}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await fetch(`${this.config.backendUrl}${this.config.endpoints.satelliteData}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          field_id: fieldId,
          coordinates: {
            lat: punjabData.district.coordinates.lat,
            lng: punjabData.district.coordinates.lng
          },
          crop_type: 'rice',
          variety: punjabData.variety.name
        })
      });

      if (!response.ok) {
        throw new Error(`Satellite API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      const result = {
        ndvi: data.ndvi || 0.75,
        ndwi: data.ndwi || 0.45,
        cropHealth: data.crop_health || 'good',
        stressIndicators: data.stress_indicators || [],
        growthStage: data.growth_stage || 'vegetative',
        lastUpdate: new Date(data.last_update || Date.now())
      };

      this.cache.set(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Failed to get satellite analysis:', error);
      // Return fallback data
      return {
        ndvi: 0.75,
        ndwi: 0.45,
        cropHealth: 'good',
        stressIndicators: [],
        growthStage: 'vegetative',
        lastUpdate: new Date()
      };
    }
  }

  /**
   * Get soil analysis from TimesFM
   */
  private async getSoilAnalysis(
    fieldId: string,
    punjabData: FieldMonitoringData
  ): Promise<EnhancedFieldAnalysis['soilAnalysis']> {
    try {
      const cacheKey = `soil_${fieldId}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await fetch(`${this.config.backendUrl}${this.config.endpoints.soilAnalysis}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          field_id: fieldId,
          coordinates: {
            lat: punjabData.district.coordinates.lat,
            lng: punjabData.district.coordinates.lng
          },
          crop_type: 'rice'
        })
      });

      if (!response.ok) {
        throw new Error(`Soil API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      const result = {
        ph: data.ph || 6.8,
        organicMatter: data.organic_matter || 2.5,
        nitrogen: data.nitrogen || 45,
        phosphorus: data.phosphorus || 30,
        potassium: data.potassium || 180,
        healthScore: data.health_score || 75,
        recommendations: data.recommendations || []
      };

      this.cache.set(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Failed to get soil analysis:', error);
      // Return fallback data
      return {
        ph: 6.8,
        organicMatter: 2.5,
        nitrogen: 45,
        phosphorus: 30,
        potassium: 180,
        healthScore: 75,
        recommendations: []
      };
    }
  }

  /**
   * Get weather intelligence from TimesFM
   */
  private async getWeatherIntelligence(
    fieldId: string,
    punjabData: FieldMonitoringData
  ): Promise<EnhancedFieldAnalysis['weatherIntelligence']> {
    try {
      const cacheKey = `weather_${fieldId}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await fetch(`${this.config.backendUrl}${this.config.endpoints.weatherData}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          field_id: fieldId,
          coordinates: {
            lat: punjabData.district.coordinates.lat,
            lng: punjabData.district.coordinates.lng
          },
          district: punjabData.district.name
        })
      });

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      const result = {
        current: {
          temperature: data.current?.temperature || 28,
          humidity: data.current?.humidity || 65,
          precipitation: data.current?.precipitation || 0,
          windSpeed: data.current?.wind_speed || 10
        },
        forecast: data.forecast || [],
        alerts: data.alerts || []
      };

      this.cache.set(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Failed to get weather intelligence:', error);
      // Return fallback data
      return {
        current: {
          temperature: 28,
          humidity: 65,
          precipitation: 0,
          windSpeed: 10
        },
        forecast: [],
        alerts: []
      };
    }
  }

  /**
   * Get market intelligence from TimesFM
   */
  private async getMarketIntelligence(
    fieldId: string,
    punjabData: FieldMonitoringData
  ): Promise<EnhancedFieldAnalysis['marketIntelligence']> {
    try {
      const cacheKey = `market_${fieldId}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await fetch(`${this.config.backendUrl}${this.config.endpoints.marketIntelligence}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          field_id: fieldId,
          crop_type: 'rice',
          variety: punjabData.variety.name,
          district: punjabData.district.name,
          expected_harvest_date: punjabData.lastAnalysis?.harvestDate?.toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Market API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      const result = {
        currentPrice: data.current_price || 2500, // INR per quintal
        priceTrend: data.price_trend || 'stable',
        marketRecommendations: data.recommendations || [],
        harvestTiming: {
          optimalDate: new Date(data.optimal_harvest_date || Date.now() + 30 * 24 * 60 * 60 * 1000),
          priceImpact: data.price_impact || 0
        }
      };

      this.cache.set(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Failed to get market intelligence:', error);
      // Return fallback data
      return {
        currentPrice: 2500,
        priceTrend: 'stable',
        marketRecommendations: [],
        harvestTiming: {
          optimalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          priceImpact: 0
        }
      };
    }
  }

  /**
   * Generate integrated recommendations combining all data sources
   */
  private generateIntegratedRecommendations(
    punjabData: FieldMonitoringData,
    timesFMPredictions: any,
    satelliteAnalysis: any,
    soilAnalysis: any,
    weatherIntelligence: any,
    marketIntelligence: any
  ): EnhancedFieldAnalysis['integratedRecommendations'] {
    const recommendations: EnhancedFieldAnalysis['integratedRecommendations'] = [];

    // Phenology-based recommendations
    if (punjabData.lastAnalysis) {
      for (const rec of punjabData.lastAnalysis.recommendations) {
        recommendations.push({
          category: rec.type as any,
          priority: rec.priority,
          title: rec.title,
          description: rec.description,
          localDescription: rec.localDescription,
          actionItems: rec.actionItems,
          estimatedCost: rec.estimatedCost || 0,
          expectedImpact: rec.expectedImpact,
          implementationWindow: rec.implementationWindow
        });
      }
    }

    // TimesFM-based recommendations
    for (const risk of timesFMPredictions.riskFactors) {
      if (risk.severity === 'high' || risk.severity === 'critical') {
        recommendations.push({
          category: 'pest_control',
          priority: risk.severity === 'critical' ? 'critical' : 'high',
          title: `Address ${risk.factor}`,
          description: risk.impact,
          localDescription: risk.recommendation,
          actionItems: [risk.recommendation],
          estimatedCost: 2000,
          expectedImpact: 'Risk mitigation',
          implementationWindow: 'Immediate'
        });
      }
    }

    // Soil-based recommendations
    if (soilAnalysis.ph < 6.0) {
      recommendations.push({
        category: 'fertilizer',
        priority: 'medium',
        title: 'Soil pH Adjustment',
        description: 'Soil pH is below optimal range for rice cultivation',
        localDescription: 'ਮਿੱਟੀ ਦਾ pH ਚੌਲ ਦੀ ਖੇਤੀ ਲਈ ਘੱਟ ਹੈ',
        actionItems: ['Apply lime to increase pH', 'Test soil after 2 weeks'],
        estimatedCost: 3000,
        expectedImpact: 'Improved nutrient availability',
        implementationWindow: 'Next 2 weeks'
      });
    }

    // Weather-based recommendations
    if (weatherIntelligence.current.temperature > 35) {
      recommendations.push({
        category: 'irrigation',
        priority: 'high',
        title: 'Heat Stress Management',
        description: 'High temperature detected - increase irrigation frequency',
        localDescription: 'ਉੱਚ ਤਾਪਮਾਨ ਦਾ ਪਤਾ ਲੱਗਾ - ਸਿੰਚਾਈ ਦੀ ਬਾਰੰਬਾਰਤਾ ਵਧਾਓ',
        actionItems: ['Increase irrigation frequency', 'Monitor soil moisture'],
        estimatedCost: 1000,
        expectedImpact: 'Reduced heat stress',
        implementationWindow: 'Immediate'
      });
    }

    // Market-based recommendations
    if (marketIntelligence.priceTrend === 'up') {
      recommendations.push({
        category: 'harvest',
        priority: 'medium',
        title: 'Optimize Harvest Timing',
        description: 'Rice prices are trending upward - consider harvest timing',
        localDescription: 'ਚੌਲ ਦੀਆਂ ਕੀਮਤਾਂ ਵਧ ਰਹੀਆਂ ਹਨ - ਕਟਾਈ ਦੇ ਸਮੇਂ ਨੂੰ ਧਿਆਨ ਵਿੱਚ ਰੱਖੋ',
        actionItems: ['Monitor price trends', 'Plan harvest timing'],
        estimatedCost: 0,
        expectedImpact: 'Better market returns',
        implementationWindow: 'Next 2 weeks'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(
    punjabData: FieldMonitoringData,
    timesFMPredictions: any,
    satelliteAnalysis: any,
    soilAnalysis: any
  ): EnhancedFieldAnalysis['performanceMetrics'] {
    // Calculate yield improvement potential
    const currentYield = punjabData.variety.avgYield;
    const predictedYield = timesFMPredictions.yieldPrediction.tonsPerAcre * 10; // Convert to quintals
    const yieldImprovement = ((predictedYield - currentYield) / currentYield) * 100;

    // Calculate cost savings (simplified)
    const costSavings = yieldImprovement > 0 ? yieldImprovement * 1000 : 0;

    // Calculate water efficiency based on NDVI and soil moisture
    const waterEfficiency = Math.min(100, (satelliteAnalysis.ndvi * 100 + soilAnalysis.healthScore) / 2);

    // Determine risk level
    const riskFactors = timesFMPredictions.riskFactors.filter((rf: any) => 
      rf.severity === 'high' || rf.severity === 'critical'
    ).length;
    const riskLevel = riskFactors > 2 ? 'high' : riskFactors > 0 ? 'medium' : 'low';

    // Calculate overall score
    const overallScore = Math.min(100, (
      (satelliteAnalysis.ndvi * 100) * 0.3 +
      soilAnalysis.healthScore * 0.3 +
      waterEfficiency * 0.2 +
      (100 - riskFactors * 10) * 0.2
    ));

    return {
      yieldImprovement: Math.round(yieldImprovement),
      costSavings: Math.round(costSavings),
      waterEfficiency: Math.round(waterEfficiency),
      riskLevel,
      overallScore: Math.round(overallScore)
    };
  }

  /**
   * Clear cache for a field
   */
  clearFieldCache(fieldId: string): void {
    const keys = [
      `yield_prediction_${fieldId}`,
      `satellite_${fieldId}`,
      `soil_${fieldId}`,
      `weather_${fieldId}`,
      `market_${fieldId}`
    ];
    
    keys.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
  }
}

// Default configuration for TimesFM integration
export const defaultTimesFMConfig: TimesFMIntegrationConfig = {
  backendUrl: 'https://timesfm.onrender.com',
  apiKey: import.meta.env.VITE_TIMESFM_API_KEY || '',
  endpoints: {
    yieldPrediction: '/api/yield-prediction',
    satelliteData: '/api/satellite-data',
    soilAnalysis: '/api/soil-analysis',
    weatherData: '/api/weather-data',
    marketIntelligence: '/api/market-intelligence'
  }
};

export default PunjabTimesFMIntegration;
