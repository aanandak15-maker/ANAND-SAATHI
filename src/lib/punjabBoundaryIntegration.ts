/**
 * Punjab Boundary Integration Service
 * Integrates boundary analysis with existing Punjab rice phenology system
 * Enhances field monitoring with boundary-specific intelligence
 */

import { BoundaryAnalysisEngine, BoundaryAnalysis, BoundaryConditions, BoundaryVegetationIndices } from './boundaryAnalysis';
import { PunjabRiceSystem, FieldMonitoringData } from './punjabRiceSystem';
import { PunjabDistrict, PunjabRiceVariety } from '@/data/punjabRiceVarieties';

export interface EnhancedFieldAnalysis {
  fieldId: string;
  variety: PunjabRiceVariety;
  district: PunjabDistrict;
  
  // Existing phenology data
  phenologyData: {
    currentStage: string;
    stageProgress: number;
    daysInStage: number;
    expectedDaysRemaining: number;
    healthStatus: string;
  };
  
  // Enhanced boundary analysis
  boundaryAnalysis: BoundaryAnalysis;
  
  // Integrated recommendations
  integratedRecommendations: Array<{
    category: 'phenology' | 'boundary' | 'pest_management' | 'soil_conservation' | 'water_management' | 'nutrient_optimization';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    localDescription: string;
    actionItems: string[];
    estimatedCost: number;
    expectedImpact: string;
    implementationWindow: string;
    source: 'phenology' | 'boundary' | 'integrated';
  }>;
  
  // Performance metrics
  performanceMetrics: {
    overallHealth: number; // 0-100
    boundaryHealth: number; // 0-100
    yieldPotential: number; // percentage improvement
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    costSavings: number; // INR
    waterEfficiency: number; // percentage
  };
  
  // Alert summary
  alerts: Array<{
    type: 'phenology' | 'boundary' | 'pest' | 'disease' | 'weather' | 'water' | 'nutrient';
    severity: 'info' | 'warning' | 'critical';
    title: string;
    message: string;
    localMessage: string;
    actionRequired: boolean;
    deadline?: Date;
  }>;
}

export interface BoundaryMonitoringConfig {
  analysisInterval: number; // minutes
  alertThresholds: {
    boundaryHealth: number; // 0-100
    pestPressure: number; // 0-100
    erosionRisk: number; // 0-100
    waterManagement: string;
  };
  enableBoundaryAlerts: boolean;
  enableBoundaryRecommendations: boolean;
}

export class PunjabBoundaryIntegration {
  private punjabSystem: PunjabRiceSystem;
  private boundaryEngine: BoundaryAnalysisEngine;
  private config: BoundaryMonitoringConfig;
  private monitoringData: Map<string, EnhancedFieldAnalysis> = new Map();

  constructor(
    punjabSystem: PunjabRiceSystem,
    config: BoundaryMonitoringConfig
  ) {
    this.punjabSystem = punjabSystem;
    this.boundaryEngine = new BoundaryAnalysisEngine();
    this.config = config;
  }

  /**
   * Get enhanced field analysis with boundary intelligence
   */
  async getEnhancedFieldAnalysis(fieldId: string): Promise<EnhancedFieldAnalysis | null> {
    try {
      // Get existing field data from Punjab system
      const fieldData = this.punjabSystem.getFieldMonitoringData(fieldId);
      if (!fieldData) {
        throw new Error(`Field ${fieldId} not found in Punjab system`);
      }

      // Get boundary conditions (this would come from field survey or satellite data)
      const boundaryConditions = await this.getBoundaryConditions(fieldId, fieldData);
      
      // Get boundary vegetation indices (this would come from satellite analysis)
      const boundaryVegetationIndices = await this.getBoundaryVegetationIndices(fieldId, fieldData);
      
      // Perform boundary analysis
      const boundaryAnalysis = await this.boundaryEngine.analyzeBoundary(
        fieldId,
        fieldData.district,
        fieldData.variety,
        boundaryConditions,
        boundaryVegetationIndices
      );

      // Generate integrated recommendations
      const integratedRecommendations = this.generateIntegratedRecommendations(
        fieldData,
        boundaryAnalysis
      );

      // Calculate performance metrics
      const performanceMetrics = this.calculatePerformanceMetrics(
        fieldData,
        boundaryAnalysis
      );

      // Generate alerts
      const alerts = this.generateAlerts(fieldData, boundaryAnalysis);

      const enhancedAnalysis: EnhancedFieldAnalysis = {
        fieldId,
        variety: fieldData.variety,
        district: fieldData.district,
        phenologyData: {
          currentStage: fieldData.lastAnalysis?.currentStage.name || 'Unknown',
          stageProgress: fieldData.lastAnalysis?.stageProgress || 0,
          daysInStage: fieldData.lastAnalysis?.daysInStage || 0,
          expectedDaysRemaining: fieldData.lastAnalysis?.expectedDaysRemaining || 0,
          healthStatus: fieldData.lastAnalysis?.stageHealth || 'unknown'
        },
        boundaryAnalysis,
        integratedRecommendations,
        performanceMetrics,
        alerts
      };

      // Cache the analysis
      this.monitoringData.set(fieldId, enhancedAnalysis);

      return enhancedAnalysis;

    } catch (error) {
      console.error(`Failed to get enhanced field analysis for ${fieldId}:`, error);
      return null;
    }
  }

  /**
   * Get boundary conditions for a field
   */
  private async getBoundaryConditions(
    fieldId: string,
    fieldData: FieldMonitoringData
  ): Promise<BoundaryConditions> {
    // In a real implementation, this would come from:
    // 1. Field survey data
    // 2. Satellite imagery analysis
    // 3. Historical field data
    // 4. Farmer input
    
    // For now, we'll generate realistic boundary conditions based on district characteristics
    const punjabData = this.boundaryEngine.getPunjabBoundaryCharacteristics(fieldData.district.id);
    
    return {
      soilType: punjabData?.soilTypes[0] || 'Alluvial',
      slope: this.getRandomSlope(punjabData?.typicalSlopes || { min: 0.5, max: 2.0 }),
      drainage: this.getDrainageCondition(fieldData.district.id),
      neighboringCrops: this.getNeighboringCrops(fieldData.district.id),
      boundaryWidth: punjabData?.bestPractices.boundaryWidth || 3.0,
      vegetationType: punjabData?.commonBoundaryVegetation[0] || 'Grass strips',
      waterSource: this.getWaterSource(fieldData.district.id),
      pestHistory: this.getPestHistory(fieldData.district.id),
      erosionHistory: this.getErosionHistory(fieldData.district.id)
    };
  }

  /**
   * Get boundary vegetation indices
   */
  private async getBoundaryVegetationIndices(
    fieldId: string,
    fieldData: FieldMonitoringData
  ): Promise<BoundaryVegetationIndices> {
    // In a real implementation, this would come from:
    // 1. Satellite imagery analysis (Sentinel-2, Landsat)
    // 2. Drone imagery
    // 3. Field sensors
    // 4. Historical vegetation data
    
    // For now, we'll generate realistic vegetation indices
    const baseNDVI = 0.75; // Typical rice field NDVI
    const edgeReduction = 0.1 + Math.random() * 0.2; // 10-30% reduction at edges
    
    return {
      edgeNDVI: baseNDVI - edgeReduction,
      centerNDVI: baseNDVI,
      ndviGradient: edgeReduction,
      edgeMSAVI2: 0.65 - edgeReduction,
      centerMSAVI2: 0.65,
      edgeNDRE: 0.55 - edgeReduction,
      centerNDRE: 0.55,
      vegetationDensity: 60 + Math.random() * 30, // 60-90%
      stressIndicators: this.getStressIndicators(fieldData.district.id)
    };
  }

  /**
   * Generate integrated recommendations combining phenology and boundary data
   */
  private generateIntegratedRecommendations(
    fieldData: FieldMonitoringData,
    boundaryAnalysis: BoundaryAnalysis
  ): EnhancedFieldAnalysis['integratedRecommendations'] {
    const recommendations: EnhancedFieldAnalysis['integratedRecommendations'] = [];

    // Add phenology-based recommendations
    if (fieldData.lastAnalysis) {
      for (const rec of fieldData.lastAnalysis.recommendations) {
        recommendations.push({
          category: rec.type as any,
          priority: rec.priority,
          title: rec.title,
          description: rec.description,
          localDescription: rec.localDescription,
          actionItems: rec.actionItems,
          estimatedCost: rec.estimatedCost || 0,
          expectedImpact: rec.expectedImpact,
          implementationWindow: rec.implementationWindow,
          source: 'phenology'
        });
      }
    }

    // Add boundary-based recommendations
    for (const rec of boundaryAnalysis.recommendations) {
      recommendations.push({
        category: rec.type as any,
        priority: rec.priority,
        title: rec.title,
        description: rec.description,
        localDescription: rec.localDescription,
        actionItems: rec.implementationSteps,
        estimatedCost: rec.estimatedCost,
        expectedImpact: rec.expectedBenefit,
        implementationWindow: rec.timeline,
        source: 'boundary'
      });
    }

    // Generate integrated recommendations based on both systems
    const integratedRecs = this.generateIntegratedRecommendationsLogic(
      fieldData,
      boundaryAnalysis
    );
    recommendations.push(...integratedRecs);

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate integrated recommendations logic
   */
  private generateIntegratedRecommendationsLogic(
    fieldData: FieldMonitoringData,
    boundaryAnalysis: BoundaryAnalysis
  ): EnhancedFieldAnalysis['integratedRecommendations'] {
    const recommendations: EnhancedFieldAnalysis['integratedRecommendations'] = [];

    // If both phenology and boundary show high pest pressure
    const phenologyPestAlerts = fieldData.lastAnalysis?.alerts.filter(alert => 
      alert.type === 'pest' && alert.severity === 'critical'
    ) || [];
    
    if (phenologyPestAlerts.length > 0 && boundaryAnalysis.pestPressure > 70) {
      recommendations.push({
        category: 'pest_management',
        priority: 'critical',
        title: 'Integrated Pest Management Required',
        description: 'High pest pressure detected in both field center and boundaries. Implement comprehensive pest management strategy.',
        localDescription: 'ਖੇਤ ਦੇ ਕੇਂਦਰ ਅਤੇ ਹੱਦਾਂ ਦੋਵਾਂ ਵਿੱਚ ਉੱਚ ਕੀਟ ਦਬਾਅ ਦਾ ਪਤਾ ਲੱਗਾ। ਵਿਆਪਕ ਕੀਟ ਪ੍ਰਬੰਧਨ ਰਣਨੀਤੀ ਲਗਾਓ।',
        actionItems: [
          'Implement perimeter trap cropping',
          'Apply targeted pest control in center',
          'Monitor pest movement from boundaries',
          'Coordinate with neighboring farmers',
          'Use integrated pest management approach'
        ],
        estimatedCost: 8000,
        expectedImpact: '40-50% reduction in pest damage',
        implementationWindow: 'Immediate',
        source: 'integrated'
      });
    }

    // If boundary erosion risk is high and phenology shows water stress
    const waterStressAlerts = fieldData.lastAnalysis?.alerts.filter(alert => 
      alert.type === 'water' && alert.severity === 'critical'
    ) || [];
    
    if (waterStressAlerts.length > 0 && boundaryAnalysis.erosionRisk > 70) {
      recommendations.push({
        category: 'water_management',
        priority: 'high',
        title: 'Integrated Water and Soil Management',
        description: 'Water stress and high erosion risk detected. Implement integrated water and soil conservation measures.',
        localDescription: 'ਪਾਣੀ ਦਾ ਤਣਾਅ ਅਤੇ ਉੱਚ ਮਿੱਟੀ ਦੇ ਖਰਾਬ ਹੋਣ ਦਾ ਜੋਖਮ ਦਾ ਪਤਾ ਲੱਗਾ। ਇਕੀਕ੍ਰਿਤ ਪਾਣੀ ਅਤੇ ਮਿੱਟੀ ਸੰਭਾਲ ਉਪਾਅ ਲਗਾਓ।',
        actionItems: [
          'Install boundary drainage systems',
          'Implement soil conservation measures',
          'Optimize irrigation scheduling',
          'Add organic matter to improve water retention',
          'Monitor soil moisture at boundaries'
        ],
        estimatedCost: 10000,
        expectedImpact: 'Improved water efficiency and soil conservation',
        implementationWindow: 'Within 1 week',
        source: 'integrated'
      });
    }

    // If boundary shading is high and phenology shows nutrient deficiency
    const nutrientAlerts = fieldData.lastAnalysis?.alerts.filter(alert => 
      alert.type === 'nutrient' && alert.severity === 'warning'
    ) || [];
    
    if (nutrientAlerts.length > 0 && boundaryAnalysis.shadingImpact > 50) {
      recommendations.push({
        category: 'nutrient_optimization',
        priority: 'medium',
        title: 'Boundary Vegetation and Nutrient Management',
        description: 'High shading impact and nutrient deficiency detected. Manage boundary vegetation and optimize nutrient application.',
        localDescription: 'ਉੱਚ ਛਾਂ ਦਾ ਪ੍ਰਭਾਵ ਅਤੇ ਪੋਸ਼ਕ ਤੱਤਾਂ ਦੀ ਕਮੀ ਦਾ ਪਤਾ ਲੱਗਾ। ਹੱਦੀ ਵਨਸਪਤੀ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ ਅਤੇ ਪੋਸ਼ਕ ਤੱਤਾਂ ਦੀ ਵਰਤੋਂ ਆਪਟੀਮਾਈਜ਼ ਕਰੋ।',
        actionItems: [
          'Prune boundary vegetation to reduce shading',
          'Apply targeted nutrients in shaded areas',
          'Use slow-release fertilizers',
          'Monitor nutrient levels at boundaries',
          'Implement precision nutrient application'
        ],
        estimatedCost: 4000,
        expectedImpact: 'Improved nutrient availability and reduced shading',
        implementationWindow: 'Within 2 weeks',
        source: 'integrated'
      });
    }

    return recommendations;
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(
    fieldData: FieldMonitoringData,
    boundaryAnalysis: BoundaryAnalysis
  ): EnhancedFieldAnalysis['performanceMetrics'] {
    // Calculate overall health (weighted average of phenology and boundary health)
    const phenologyHealth = fieldData.lastAnalysis?.stageHealth === 'excellent' ? 90 :
                           fieldData.lastAnalysis?.stageHealth === 'good' ? 75 :
                           fieldData.lastAnalysis?.stageHealth === 'fair' ? 60 :
                           fieldData.lastAnalysis?.stageHealth === 'poor' ? 40 : 25;
    
    const overallHealth = Math.round((phenologyHealth * 0.6 + boundaryAnalysis.boundaryHealth * 0.4));
    
    // Calculate yield potential improvement
    const yieldImprovement = Math.max(0, 100 - boundaryAnalysis.pestPressure - boundaryAnalysis.erosionRisk - boundaryAnalysis.nutrientCompetition);
    
    // Determine risk level
    const riskFactors = [
      boundaryAnalysis.pestPressure > 70,
      boundaryAnalysis.erosionRisk > 70,
      boundaryAnalysis.waterManagement === 'critical',
      fieldData.lastAnalysis?.stageHealth === 'critical'
    ].filter(Boolean).length;
    
    const riskLevel = riskFactors >= 3 ? 'critical' : 
                     riskFactors >= 2 ? 'high' : 
                     riskFactors >= 1 ? 'medium' : 'low';
    
    // Calculate cost savings (simplified)
    const costSavings = Math.max(0, (100 - boundaryAnalysis.pestPressure) * 50 + 
                                  (100 - boundaryAnalysis.erosionRisk) * 30);
    
    // Calculate water efficiency
    const waterEfficiency = boundaryAnalysis.waterManagement === 'optimal' ? 85 :
                           boundaryAnalysis.waterManagement === 'needs_attention' ? 65 : 45;

    return {
      overallHealth,
      boundaryHealth: boundaryAnalysis.boundaryHealth,
      yieldPotential: Math.round(yieldImprovement),
      riskLevel,
      costSavings: Math.round(costSavings),
      waterEfficiency: Math.round(waterEfficiency)
    };
  }

  /**
   * Generate alerts based on both systems
   */
  private generateAlerts(
    fieldData: FieldMonitoringData,
    boundaryAnalysis: BoundaryAnalysis
  ): EnhancedFieldAnalysis['alerts'] {
    const alerts: EnhancedFieldAnalysis['alerts'] = [];

    // Add phenology alerts
    if (fieldData.lastAnalysis) {
      for (const alert of fieldData.lastAnalysis.alerts) {
        alerts.push({
          type: alert.type as any,
          severity: alert.severity as any,
          title: alert.title,
          message: alert.message,
          localMessage: alert.localMessage,
          actionRequired: alert.actionRequired,
          deadline: alert.deadline
        });
      }
    }

    // Add boundary alerts
    for (const risk of boundaryAnalysis.riskFactors) {
      alerts.push({
        type: 'boundary',
        severity: risk.severity === 'critical' ? 'critical' : 
                 risk.severity === 'high' ? 'warning' : 'info',
        title: `Boundary Risk: ${risk.factor}`,
        message: risk.impact,
        localMessage: risk.localImpact,
        actionRequired: risk.urgency === 'immediate',
        deadline: risk.urgency === 'immediate' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined
      });
    }

    return alerts.sort((a, b) => {
      const severityOrder = { 'critical': 4, 'warning': 3, 'info': 2 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  // Helper methods for generating realistic data
  private getRandomSlope(typicalSlopes: { min: number; max: number }): number {
    return typicalSlopes.min + Math.random() * (typicalSlopes.max - typicalSlopes.min);
  }

  private getDrainageCondition(districtId: string): 'excellent' | 'good' | 'moderate' | 'poor' {
    const drainageMap: Record<string, string[]> = {
      'amritsar': ['good', 'moderate'],
      'ludhiana': ['moderate', 'poor'],
      'patiala': ['good', 'moderate'],
      'sangrur': ['moderate', 'poor'],
      'bathinda': ['poor', 'moderate']
    };
    
    const options = drainageMap[districtId] || ['moderate'];
    return options[Math.floor(Math.random() * options.length)] as any;
  }

  private getNeighboringCrops(districtId: string): string[] {
    const cropMap: Record<string, string[]> = {
      'amritsar': ['wheat', 'cotton', 'maize'],
      'ludhiana': ['wheat', 'cotton', 'maize', 'sugarcane'],
      'patiala': ['wheat', 'cotton'],
      'sangrur': ['wheat', 'cotton', 'maize'],
      'bathinda': ['wheat', 'cotton']
    };
    
    const crops = cropMap[districtId] || ['wheat'];
    return crops.slice(0, Math.floor(Math.random() * crops.length) + 1);
  }

  private getWaterSource(districtId: string): 'canal' | 'tube_well' | 'rainfed' | 'mixed' {
    const waterMap: Record<string, string[]> = {
      'amritsar': ['canal', 'tube_well'],
      'ludhiana': ['tube_well', 'mixed'],
      'patiala': ['canal', 'tube_well'],
      'sangrur': ['tube_well', 'mixed'],
      'bathinda': ['tube_well', 'rainfed']
    };
    
    const options = waterMap[districtId] || ['tube_well'];
    return options[Math.floor(Math.random() * options.length)] as any;
  }

  private getPestHistory(districtId: string): string[] {
    const pestMap: Record<string, string[]> = {
      'amritsar': ['brown_plant_hopper', 'stem_borer'],
      'ludhiana': ['brown_plant_hopper', 'stem_borer', 'leaf_folder'],
      'patiala': ['brown_plant_hopper'],
      'sangrur': ['brown_plant_hopper', 'stem_borer'],
      'bathinda': ['brown_plant_hopper', 'white_backed_plant_hopper']
    };
    
    const pests = pestMap[districtId] || ['brown_plant_hopper'];
    return pests.slice(0, Math.floor(Math.random() * pests.length) + 1);
  }

  private getErosionHistory(districtId: string): boolean {
    const erosionMap: Record<string, number> = {
      'amritsar': 0.3,
      'ludhiana': 0.6,
      'patiala': 0.4,
      'sangrur': 0.7,
      'bathinda': 0.8
    };
    
    const probability = erosionMap[districtId] || 0.5;
    return Math.random() < probability;
  }

  private getStressIndicators(districtId: string): string[] {
    const stressMap: Record<string, string[]> = {
      'amritsar': ['water_stress', 'nutrient_deficiency'],
      'ludhiana': ['water_stress', 'pest_pressure', 'nutrient_deficiency'],
      'patiala': ['water_stress'],
      'sangrur': ['water_stress', 'pest_pressure'],
      'bathinda': ['water_stress', 'pest_pressure', 'nutrient_deficiency']
    };
    
    const stresses = stressMap[districtId] || ['water_stress'];
    return stresses.slice(0, Math.floor(Math.random() * stresses.length) + 1);
  }

  /**
   * Get all monitoring data
   */
  getAllMonitoringData(): Map<string, EnhancedFieldAnalysis> {
    return this.monitoringData;
  }

  /**
   * Clear monitoring data
   */
  clearMonitoringData(): void {
    this.monitoringData.clear();
  }
}

// Default configuration
export const defaultBoundaryMonitoringConfig: BoundaryMonitoringConfig = {
  analysisInterval: 30, // 30 minutes
  alertThresholds: {
    boundaryHealth: 60,
    pestPressure: 70,
    erosionRisk: 70,
    waterManagement: 'needs_attention'
  },
  enableBoundaryAlerts: true,
  enableBoundaryRecommendations: true
};

export default PunjabBoundaryIntegration;
