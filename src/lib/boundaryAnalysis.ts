/**
 * Field Boundary Analysis Engine for Punjab Rice System
 * Analyzes field edge effects, stress indicators, and provides boundary-specific recommendations
 * Integrates with existing vegetation indices and Punjab agricultural conditions
 */

import { PunjabDistrict, PunjabRiceVariety } from '@/data/punjabRiceVarieties';

export interface BoundaryAnalysis {
  fieldId: string;
  analysisDate: Date;
  edgeStressLevel: 'low' | 'medium' | 'high' | 'critical';
  pestPressure: number; // 0-100 scale
  erosionRisk: number; // 0-100 scale
  nutrientCompetition: number; // 0-100 scale
  shadingImpact: number; // 0-100 scale
  waterManagement: 'optimal' | 'needs_attention' | 'critical';
  boundaryHealth: number; // 0-100 overall health score
  recommendations: BoundaryRecommendation[];
  riskFactors: BoundaryRiskFactor[];
  vegetationIndices: BoundaryVegetationIndices;
}

export interface BoundaryRecommendation {
  id: string;
  type: 'pest_management' | 'soil_conservation' | 'water_management' | 'nutrient_optimization' | 'vegetation_management';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  localDescription: string; // Punjabi
  action: string;
  timeline: string;
  expectedBenefit: string;
  estimatedCost: number;
  implementationSteps: string[];
  localImplementationSteps: string[]; // Punjabi
}

export interface BoundaryRiskFactor {
  id: string;
  factor: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  localImpact: string; // Punjabi
  affectedArea: number; // percentage of boundary
  recommendation: string;
  localRecommendation: string; // Punjabi
  urgency: 'immediate' | 'within_week' | 'within_month' | 'seasonal';
}

export interface BoundaryVegetationIndices {
  edgeNDVI: number;
  centerNDVI: number;
  ndviGradient: number; // edge to center difference
  edgeMSAVI2: number;
  centerMSAVI2: number;
  edgeNDRE: number;
  centerNDRE: number;
  vegetationDensity: number; // 0-100
  stressIndicators: string[];
}

export interface BoundaryConditions {
  soilType: string;
  slope: number; // percentage
  drainage: 'excellent' | 'good' | 'moderate' | 'poor';
  neighboringCrops: string[];
  boundaryWidth: number; // meters
  vegetationType: string;
  waterSource: 'canal' | 'tube_well' | 'rainfed' | 'mixed';
  pestHistory: string[];
  erosionHistory: boolean;
}

export interface PunjabBoundaryCharacteristics {
  district: string;
  soilTypes: string[];
  commonBoundaryVegetation: string[];
  typicalSlopes: { min: number; max: number };
  erosionRisk: 'low' | 'medium' | 'high';
  pestPressure: 'low' | 'medium' | 'high';
  waterManagement: {
    drainageChallenges: string[];
    commonIssues: string[];
    solutions: string[];
  };
  bestPractices: {
    boundaryWidth: number; // recommended meters
    vegetationTypes: string[];
    maintenanceSchedule: string[];
  };
}

export class BoundaryAnalysisEngine {
  private punjabBoundaryData: Map<string, PunjabBoundaryCharacteristics> = new Map();
  private analysisCache: Map<string, BoundaryAnalysis> = new Map();

  constructor() {
    this.initializePunjabBoundaryData();
  }

  /**
   * Initialize Punjab-specific boundary characteristics
   */
  private initializePunjabBoundaryData(): void {
    const punjabBoundaryCharacteristics: PunjabBoundaryCharacteristics[] = [
      {
        district: 'amritsar',
        soilTypes: ['Alluvial', 'Sandy loam'],
        commonBoundaryVegetation: ['Kikar', 'Neem', 'Eucalyptus', 'Grass strips'],
        typicalSlopes: { min: 0.5, max: 2.0 },
        erosionRisk: 'medium',
        pestPressure: 'medium',
        waterManagement: {
          drainageChallenges: ['Waterlogging at edges', 'Poor drainage in low areas'],
          commonIssues: ['Boundary water stagnation', 'Uneven water distribution'],
          solutions: ['Proper field grading', 'Boundary drainage channels', 'Level field preparation']
        },
        bestPractices: {
          boundaryWidth: 3.0,
          vegetationTypes: ['Napier grass', 'Sesbania', 'Pigeon pea'],
          maintenanceSchedule: ['Monthly boundary inspection', 'Quarterly vegetation management', 'Annual soil testing']
        }
      },
      {
        district: 'ludhiana',
        soilTypes: ['Alluvial', 'Sandy'],
        commonBoundaryVegetation: ['Poplar', 'Eucalyptus', 'Grass strips', 'Hedge plants'],
        typicalSlopes: { min: 0.3, max: 1.5 },
        erosionRisk: 'high',
        pestPressure: 'high',
        waterManagement: {
          drainageChallenges: ['Sandy soil drainage', 'Water table depletion'],
          commonIssues: ['Rapid water percolation', 'Boundary drying'],
          solutions: ['Organic matter addition', 'Mulching', 'Drip irrigation at edges']
        },
        bestPractices: {
          boundaryWidth: 4.0,
          vegetationTypes: ['Napier grass', 'Sesbania', 'Leucaena'],
          maintenanceSchedule: ['Bi-weekly boundary inspection', 'Monthly vegetation management', 'Quarterly soil testing']
        }
      },
      {
        district: 'patiala',
        soilTypes: ['Alluvial', 'Clay loam'],
        commonBoundaryVegetation: ['Kikar', 'Neem', 'Grass strips', 'Hedge plants'],
        typicalSlopes: { min: 0.5, max: 2.5 },
        erosionRisk: 'medium',
        pestPressure: 'medium',
        waterManagement: {
          drainageChallenges: ['Clay soil drainage', 'Water retention issues'],
          commonIssues: ['Boundary waterlogging', 'Slow drainage'],
          solutions: ['Subsurface drainage', 'Raised beds', 'Organic matter addition']
        },
        bestPractices: {
          boundaryWidth: 3.5,
          vegetationTypes: ['Napier grass', 'Sesbania', 'Pigeon pea'],
          maintenanceSchedule: ['Monthly boundary inspection', 'Quarterly vegetation management', 'Annual soil testing']
        }
      },
      {
        district: 'sangrur',
        soilTypes: ['Alluvial', 'Sandy loam'],
        commonBoundaryVegetation: ['Eucalyptus', 'Poplar', 'Grass strips'],
        typicalSlopes: { min: 0.3, max: 1.8 },
        erosionRisk: 'high',
        pestPressure: 'high',
        waterManagement: {
          drainageChallenges: ['Sandy soil drainage', 'Water table issues'],
          commonIssues: ['Boundary erosion', 'Water percolation'],
          solutions: ['Vegetative barriers', 'Contour bunding', 'Mulching']
        },
        bestPractices: {
          boundaryWidth: 4.5,
          vegetationTypes: ['Napier grass', 'Sesbania', 'Leucaena', 'Vetiver'],
          maintenanceSchedule: ['Bi-weekly boundary inspection', 'Monthly vegetation management', 'Quarterly soil testing']
        }
      },
      {
        district: 'bathinda',
        soilTypes: ['Alluvial', 'Sandy'],
        commonBoundaryVegetation: ['Kikar', 'Eucalyptus', 'Grass strips'],
        typicalSlopes: { min: 0.2, max: 1.2 },
        erosionRisk: 'high',
        pestPressure: 'medium',
        waterManagement: {
          drainageChallenges: ['Sandy soil drainage', 'Water scarcity'],
          commonIssues: ['Boundary drying', 'Water stress'],
          solutions: ['Water conservation', 'Mulching', 'Drip irrigation']
        },
        bestPractices: {
          boundaryWidth: 5.0,
          vegetationTypes: ['Napier grass', 'Sesbania', 'Leucaena', 'Vetiver'],
          maintenanceSchedule: ['Bi-weekly boundary inspection', 'Monthly vegetation management', 'Quarterly soil testing']
        }
      }
    ];

    punjabBoundaryCharacteristics.forEach(data => {
      this.punjabBoundaryData.set(data.district, data);
    });
  }

  /**
   * Analyze field boundary conditions
   */
  async analyzeBoundary(
    fieldId: string,
    district: PunjabDistrict,
    variety: PunjabRiceVariety,
    boundaryConditions: BoundaryConditions,
    vegetationIndices: BoundaryVegetationIndices
  ): Promise<BoundaryAnalysis> {
    try {
      const cacheKey = `${fieldId}_${new Date().toISOString().split('T')[0]}`;
      if (this.analysisCache.has(cacheKey)) {
        return this.analysisCache.get(cacheKey)!;
      }

      // Get Punjab-specific boundary characteristics
      const punjabData = this.punjabBoundaryData.get(district.id);
      if (!punjabData) {
        throw new Error(`No boundary data available for district ${district.name}`);
      }

      // Calculate boundary stress indicators
      const edgeStressLevel = this.calculateEdgeStressLevel(vegetationIndices, boundaryConditions);
      const pestPressure = this.calculatePestPressure(district, boundaryConditions, vegetationIndices);
      const erosionRisk = this.calculateErosionRisk(district, boundaryConditions, punjabData);
      const nutrientCompetition = this.calculateNutrientCompetition(vegetationIndices, boundaryConditions);
      const shadingImpact = this.calculateShadingImpact(boundaryConditions, vegetationIndices);
      const waterManagement = this.assessWaterManagement(boundaryConditions, punjabData);

      // Calculate overall boundary health
      const boundaryHealth = this.calculateBoundaryHealth(
        edgeStressLevel,
        pestPressure,
        erosionRisk,
        nutrientCompetition,
        shadingImpact,
        waterManagement
      );

      // Generate recommendations
      const recommendations = this.generateBoundaryRecommendations(
        district,
        variety,
        boundaryConditions,
        vegetationIndices,
        {
          edgeStressLevel,
          pestPressure,
          erosionRisk,
          nutrientCompetition,
          shadingImpact,
          waterManagement
        }
      );

      // Identify risk factors
      const riskFactors = this.identifyRiskFactors(
        district,
        boundaryConditions,
        vegetationIndices,
        {
          edgeStressLevel,
          pestPressure,
          erosionRisk,
          nutrientCompetition,
          shadingImpact,
          waterManagement
        }
      );

      const analysis: BoundaryAnalysis = {
        fieldId,
        analysisDate: new Date(),
        edgeStressLevel,
        pestPressure,
        erosionRisk,
        nutrientCompetition,
        shadingImpact,
        waterManagement,
        boundaryHealth,
        recommendations,
        riskFactors,
        vegetationIndices
      };

      // Cache the analysis
      this.analysisCache.set(cacheKey, analysis);

      return analysis;

    } catch (error) {
      console.error(`Failed to analyze boundary for field ${fieldId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate edge stress level based on vegetation indices
   */
  private calculateEdgeStressLevel(
    vegetationIndices: BoundaryVegetationIndices,
    boundaryConditions: BoundaryConditions
  ): 'low' | 'medium' | 'high' | 'critical' {
    const ndviDifference = vegetationIndices.centerNDVI - vegetationIndices.edgeNDVI;
    const ndviGradient = Math.abs(vegetationIndices.ndviGradient);

    // High stress if edge NDVI is significantly lower than center
    if (ndviDifference > 0.3 || ndviGradient > 0.4) {
      return 'critical';
    } else if (ndviDifference > 0.2 || ndviGradient > 0.3) {
      return 'high';
    } else if (ndviDifference > 0.1 || ndviGradient > 0.2) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Calculate pest pressure at boundaries
   */
  private calculatePestPressure(
    district: PunjabDistrict,
    boundaryConditions: BoundaryConditions,
    vegetationIndices: BoundaryVegetationIndices
  ): number {
    let pestPressure = 0;

    // Base pest pressure from district characteristics
    const punjabData = this.punjabBoundaryData.get(district.id);
    if (punjabData) {
      switch (punjabData.pestPressure) {
        case 'high':
          pestPressure += 40;
          break;
        case 'medium':
          pestPressure += 25;
          break;
        case 'low':
          pestPressure += 10;
          break;
      }
    }

    // Add pest pressure based on neighboring crops
    const highRiskCrops = ['cotton', 'sugarcane', 'maize'];
    const neighboringRisk = boundaryConditions.neighboringCrops.filter(crop => 
      highRiskCrops.includes(crop.toLowerCase())
    ).length;
    pestPressure += neighboringRisk * 15;

    // Add pest pressure based on pest history
    pestPressure += boundaryConditions.pestHistory.length * 10;

    // Add pest pressure based on vegetation density (higher density = more pest habitat)
    pestPressure += (vegetationIndices.vegetationDensity / 100) * 20;

    // Add pest pressure based on NDVI stress
    if (vegetationIndices.edgeNDVI < 0.4) {
      pestPressure += 15; // Stressed plants are more susceptible to pests
    }

    return Math.min(100, pestPressure);
  }

  /**
   * Calculate erosion risk at boundaries
   */
  private calculateErosionRisk(
    district: PunjabDistrict,
    boundaryConditions: BoundaryConditions,
    punjabData: PunjabBoundaryCharacteristics
  ): number {
    let erosionRisk = 0;

    // Base erosion risk from district characteristics
    switch (punjabData.erosionRisk) {
      case 'high':
        erosionRisk += 40;
        break;
      case 'medium':
        erosionRisk += 25;
        break;
      case 'low':
        erosionRisk += 10;
        break;
    }

    // Add erosion risk based on slope
    if (boundaryConditions.slope > 2.0) {
      erosionRisk += 30;
    } else if (boundaryConditions.slope > 1.0) {
      erosionRisk += 20;
    } else if (boundaryConditions.slope > 0.5) {
      erosionRisk += 10;
    }

    // Add erosion risk based on soil type
    if (boundaryConditions.soilType.toLowerCase().includes('sandy')) {
      erosionRisk += 20;
    }

    // Add erosion risk based on drainage
    switch (boundaryConditions.drainage) {
      case 'poor':
        erosionRisk += 15;
        break;
      case 'moderate':
        erosionRisk += 10;
        break;
      case 'good':
        erosionRisk += 5;
        break;
    }

    // Add erosion risk based on erosion history
    if (boundaryConditions.erosionHistory) {
      erosionRisk += 25;
    }

    // Reduce erosion risk based on boundary width
    if (boundaryConditions.boundaryWidth >= 4.0) {
      erosionRisk -= 15;
    } else if (boundaryConditions.boundaryWidth >= 3.0) {
      erosionRisk -= 10;
    } else if (boundaryConditions.boundaryWidth < 2.0) {
      erosionRisk += 15;
    }

    return Math.min(100, Math.max(0, erosionRisk));
  }

  /**
   * Calculate nutrient competition at boundaries
   */
  private calculateNutrientCompetition(
    vegetationIndices: BoundaryVegetationIndices,
    boundaryConditions: BoundaryConditions
  ): number {
    let nutrientCompetition = 0;

    // Base competition based on vegetation density
    nutrientCompetition += (vegetationIndices.vegetationDensity / 100) * 40;

    // Add competition based on vegetation type
    const highCompetitionVegetation = ['trees', 'shrubs', 'dense_grass'];
    if (highCompetitionVegetation.includes(boundaryConditions.vegetationType)) {
      nutrientCompetition += 30;
    }

    // Add competition based on boundary width (narrower = more competition)
    if (boundaryConditions.boundaryWidth < 2.0) {
      nutrientCompetition += 20;
    } else if (boundaryConditions.boundaryWidth < 3.0) {
      nutrientCompetition += 10;
    }

    // Add competition based on NDVI difference (higher difference = more competition)
    const ndviDifference = vegetationIndices.centerNDVI - vegetationIndices.edgeNDVI;
    if (ndviDifference > 0.2) {
      nutrientCompetition += 20;
    } else if (ndviDifference > 0.1) {
      nutrientCompetition += 10;
    }

    return Math.min(100, nutrientCompetition);
  }

  /**
   * Calculate shading impact at boundaries
   */
  private calculateShadingImpact(
    boundaryConditions: BoundaryConditions,
    vegetationIndices: BoundaryVegetationIndices
  ): number {
    let shadingImpact = 0;

    // Base shading based on vegetation type
    const highShadingVegetation = ['trees', 'tall_grass', 'hedges'];
    if (highShadingVegetation.includes(boundaryConditions.vegetationType)) {
      shadingImpact += 40;
    }

    // Add shading based on vegetation density
    shadingImpact += (vegetationIndices.vegetationDensity / 100) * 30;

    // Add shading based on boundary width (wider = more shading)
    if (boundaryConditions.boundaryWidth > 4.0) {
      shadingImpact += 20;
    } else if (boundaryConditions.boundaryWidth > 3.0) {
      shadingImpact += 10;
    }

    // Add shading based on NDVI difference (lower edge NDVI = more shading)
    const ndviDifference = vegetationIndices.centerNDVI - vegetationIndices.edgeNDVI;
    if (ndviDifference > 0.15) {
      shadingImpact += 15;
    } else if (ndviDifference > 0.1) {
      shadingImpact += 10;
    }

    return Math.min(100, shadingImpact);
  }

  /**
   * Assess water management at boundaries
   */
  private assessWaterManagement(
    boundaryConditions: BoundaryConditions,
    punjabData: PunjabBoundaryCharacteristics
  ): 'optimal' | 'needs_attention' | 'critical' {
    let waterScore = 0;

    // Base score from drainage
    switch (boundaryConditions.drainage) {
      case 'excellent':
        waterScore += 40;
        break;
      case 'good':
        waterScore += 30;
        break;
      case 'moderate':
        waterScore += 20;
        break;
      case 'poor':
        waterScore += 5;
        break;
    }

    // Add score based on water source
    switch (boundaryConditions.waterSource) {
      case 'canal':
        waterScore += 25;
        break;
      case 'tube_well':
        waterScore += 20;
        break;
      case 'mixed':
        waterScore += 15;
        break;
      case 'rainfed':
        waterScore += 5;
        break;
    }

    // Add score based on boundary width
    if (boundaryConditions.boundaryWidth >= 3.0) {
      waterScore += 15;
    } else if (boundaryConditions.boundaryWidth >= 2.0) {
      waterScore += 10;
    }

    // Add score based on slope (moderate slope is better for drainage)
    if (boundaryConditions.slope >= 0.5 && boundaryConditions.slope <= 2.0) {
      waterScore += 20;
    } else if (boundaryConditions.slope < 0.5) {
      waterScore += 5; // Too flat, poor drainage
    } else {
      waterScore += 10; // Too steep, erosion risk
    }

    if (waterScore >= 70) {
      return 'optimal';
    } else if (waterScore >= 40) {
      return 'needs_attention';
    } else {
      return 'critical';
    }
  }

  /**
   * Calculate overall boundary health score
   */
  private calculateBoundaryHealth(
    edgeStressLevel: string,
    pestPressure: number,
    erosionRisk: number,
    nutrientCompetition: number,
    shadingImpact: number,
    waterManagement: string
  ): number {
    let healthScore = 100;

    // Reduce score based on edge stress
    switch (edgeStressLevel) {
      case 'critical':
        healthScore -= 40;
        break;
      case 'high':
        healthScore -= 25;
        break;
      case 'medium':
        healthScore -= 15;
        break;
      case 'low':
        healthScore -= 5;
        break;
    }

    // Reduce score based on pest pressure
    healthScore -= (pestPressure / 100) * 20;

    // Reduce score based on erosion risk
    healthScore -= (erosionRisk / 100) * 15;

    // Reduce score based on nutrient competition
    healthScore -= (nutrientCompetition / 100) * 10;

    // Reduce score based on shading impact
    healthScore -= (shadingImpact / 100) * 10;

    // Reduce score based on water management
    switch (waterManagement) {
      case 'critical':
        healthScore -= 20;
        break;
      case 'needs_attention':
        healthScore -= 10;
        break;
      case 'optimal':
        // No reduction
        break;
    }

    return Math.max(0, Math.min(100, healthScore));
  }

  /**
   * Generate boundary-specific recommendations
   */
  private generateBoundaryRecommendations(
    district: PunjabDistrict,
    variety: PunjabRiceVariety,
    boundaryConditions: BoundaryConditions,
    vegetationIndices: BoundaryVegetationIndices,
    analysisResults: any
  ): BoundaryRecommendation[] {
    const recommendations: BoundaryRecommendation[] = [];
    const punjabData = this.punjabBoundaryData.get(district.id);

    // Pest management recommendations
    if (analysisResults.pestPressure > 60) {
      recommendations.push({
        id: 'pest_management_1',
        type: 'pest_management',
        priority: 'high',
        title: 'Implement Perimeter Trap Cropping',
        description: 'High pest pressure detected at field boundaries. Implement perimeter trap cropping to protect main crop.',
        localDescription: 'ਖੇਤ ਦੀਆਂ ਹੱਦਾਂ \'ਤੇ ਉੱਚ ਕੀਟ ਦਬਾਅ ਦਾ ਪਤਾ ਲੱਗਾ। ਮੁੱਖ ਫਸਲ ਦੀ ਸੁਰੱਖਿਆ ਲਈ ਪਰਿਮੀਟਰ ਟ੍ਰੈਪ ਕ੍ਰੌਪਿੰਗ ਲਗਾਓ।',
        action: 'Plant trap crops around field perimeter',
        timeline: 'Within 1 week',
        expectedBenefit: '30-40% reduction in pest damage',
        estimatedCost: 5000,
        implementationSteps: [
          'Identify high-risk boundary areas',
          'Select appropriate trap crops (maize, sorghum)',
          'Plant trap crops 2-3 weeks before main crop',
          'Monitor trap crop effectiveness',
          'Apply targeted pest control if needed'
        ],
        localImplementationSteps: [
          'ਉੱਚ ਜੋਖਮ ਵਾਲੇ ਹੱਦੀ ਖੇਤਰਾਂ ਦੀ ਪਛਾਣ ਕਰੋ',
          'ਉਚਿਤ ਟ੍ਰੈਪ ਫਸਲਾਂ ਚੁਣੋ (ਮੱਕੀ, ਜਵਾਰ)',
          'ਮੁੱਖ ਫਸਲ ਤੋਂ 2-3 ਹਫ਼ਤੇ ਪਹਿਲਾਂ ਟ੍ਰੈਪ ਫਸਲਾਂ ਲਗਾਓ',
          'ਟ੍ਰੈਪ ਫਸਲ ਦੀ ਪ੍ਰਭਾਵਸ਼ੀਲਤਾ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ',
          'ਜ਼ਰੂਰਤ ਪਵੇ ਤਾਂ ਟੀਚੇਬੱਧ ਕੀਟ ਨਿਯੰਤਰਣ ਲਗਾਓ'
        ]
      });
    }

    // Soil conservation recommendations
    if (analysisResults.erosionRisk > 60) {
      recommendations.push({
        id: 'soil_conservation_1',
        type: 'soil_conservation',
        priority: 'high',
        title: 'Implement Soil Conservation Measures',
        description: 'High erosion risk detected at field boundaries. Implement soil conservation measures immediately.',
        localDescription: 'ਖੇਤ ਦੀਆਂ ਹੱਦਾਂ \'ਤੇ ਉੱਚ ਮਿੱਟੀ ਦੇ ਖਰਾਬ ਹੋਣ ਦਾ ਜੋਖਮ ਦਾ ਪਤਾ ਲੱਗਾ। ਤੁਰੰਤ ਮਿੱਟੀ ਸੰਭਾਲ ਉਪਾਅ ਲਗਾਓ।',
        action: 'Install vegetative barriers and contour bunding',
        timeline: 'Within 2 weeks',
        expectedBenefit: '50-60% reduction in soil erosion',
        estimatedCost: 8000,
        implementationSteps: [
          'Install vegetative barriers (Napier grass, Vetiver)',
          'Create contour bunds along slopes',
          'Add organic matter to improve soil structure',
          'Implement mulching in vulnerable areas',
          'Monitor erosion control effectiveness'
        ],
        localImplementationSteps: [
          'ਵਨਸਪਤੀ ਬੈਰੀਅਰ ਲਗਾਓ (ਨੇਪੀਅਰ ਘਾਹ, ਵੇਟੀਵਰ)',
          'ਢਲਾਨਾਂ ਦੇ ਨਾਲ ਕੰਟੂਰ ਬੰਡ ਬਣਾਓ',
          'ਮਿੱਟੀ ਦੀ ਬਣਤਰ ਸੁਧਾਰਨ ਲਈ ਜੈਵਿਕ ਪਦਾਰਥ ਮਿਲਾਓ',
          'ਘੱਟਜੋਖਮ ਵਾਲੇ ਖੇਤਰਾਂ ਵਿੱਚ ਮਲਚਿੰਗ ਲਗਾਓ',
          'ਮਿੱਟੀ ਦੇ ਖਰਾਬ ਹੋਣ ਦੇ ਨਿਯੰਤਰਣ ਦੀ ਪ੍ਰਭਾਵਸ਼ੀਲਤਾ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ'
        ]
      });
    }

    // Water management recommendations
    if (analysisResults.waterManagement === 'critical') {
      recommendations.push({
        id: 'water_management_1',
        type: 'water_management',
        priority: 'critical',
        title: 'Improve Boundary Water Management',
        description: 'Critical water management issues at field boundaries. Immediate action required.',
        localDescription: 'ਖੇਤ ਦੀਆਂ ਹੱਦਾਂ \'ਤੇ ਗੰਭੀਰ ਪਾਣੀ ਪ੍ਰਬੰਧਨ ਦੀਆਂ ਸਮੱਸਿਆਵਾਂ। ਤੁਰੰਤ ਕਾਰਵਾਈ ਜ਼ਰੂਰੀ।',
        action: 'Install proper drainage and water management systems',
        timeline: 'Immediate',
        expectedBenefit: 'Improved water distribution and drainage',
        estimatedCost: 12000,
        implementationSteps: [
          'Install subsurface drainage pipes',
          'Create boundary drainage channels',
          'Improve field grading (0.05-2% slope)',
          'Install water control structures',
          'Monitor water flow and distribution'
        ],
        localImplementationSteps: [
          'ਭੂਮੀਗਤ ਨਿਕਾਸੀ ਪਾਈਪਾਂ ਲਗਾਓ',
          'ਹੱਦੀ ਨਿਕਾਸੀ ਚੈਨਲ ਬਣਾਓ',
          'ਖੇਤ ਦੀ ਗ੍ਰੇਡਿੰਗ ਸੁਧਾਰੋ (0.05-2% ਢਲਾਨ)',
          'ਪਾਣੀ ਨਿਯੰਤਰਣ ਢਾਂਚੇ ਲਗਾਓ',
          'ਪਾਣੀ ਦੇ ਪ੍ਰਵਾਹ ਅਤੇ ਵੰਡ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ'
        ]
      });
    }

    // Nutrient optimization recommendations
    if (analysisResults.nutrientCompetition > 50) {
      recommendations.push({
        id: 'nutrient_optimization_1',
        type: 'nutrient_optimization',
        priority: 'medium',
        title: 'Optimize Boundary Nutrient Management',
        description: 'High nutrient competition detected at field boundaries. Optimize nutrient application.',
        localDescription: 'ਖੇਤ ਦੀਆਂ ਹੱਦਾਂ \'ਤੇ ਉੱਚ ਪੋਸ਼ਕ ਤੱਤਾਂ ਦੀ ਮੁਕਾਬਲੇਬਾਜ਼ੀ ਦਾ ਪਤਾ ਲੱਗਾ। ਪੋਸ਼ਕ ਤੱਤਾਂ ਦੀ ਵਰਤੋਂ ਆਪਟੀਮਾਈਜ਼ ਕਰੋ।',
        action: 'Implement precision nutrient application at boundaries',
        timeline: 'Within 1 month',
        expectedBenefit: '20-30% improvement in nutrient efficiency',
        estimatedCost: 3000,
        implementationSteps: [
          'Conduct soil testing at boundary areas',
          'Apply nutrients based on soil test results',
          'Use slow-release fertilizers at boundaries',
          'Implement root barriers if needed',
          'Monitor nutrient levels regularly'
        ],
        localImplementationSteps: [
          'ਹੱਦੀ ਖੇਤਰਾਂ ਵਿੱਚ ਮਿੱਟੀ ਦੀ ਜਾਂਚ ਕਰੋ',
          'ਮਿੱਟੀ ਦੇ ਟੈਸਟ ਨਤੀਜਿਆਂ ਦੇ ਆਧਾਰ \'ਤੇ ਪੋਸ਼ਕ ਤੱਤ ਲਗਾਓ',
          'ਹੱਦਾਂ \'ਤੇ ਹੌਲੀ-ਰਿਲੀਜ਼ ਖਾਦਾਂ ਵਰਤੋ',
          'ਜ਼ਰੂਰਤ ਪਵੇ ਤਾਂ ਜੜ੍ਹ ਬੈਰੀਅਰ ਲਗਾਓ',
          'ਪੋਸ਼ਕ ਤੱਤਾਂ ਦੇ ਪੱਧਰ ਦੀ ਨਿਯਮਿਤ ਨਿਗਰਾਨੀ ਕਰੋ'
        ]
      });
    }

    // Vegetation management recommendations
    if (analysisResults.shadingImpact > 40) {
      recommendations.push({
        id: 'vegetation_management_1',
        type: 'vegetation_management',
        priority: 'medium',
        title: 'Manage Boundary Vegetation',
        description: 'High shading impact from boundary vegetation. Manage vegetation to reduce shading.',
        localDescription: 'ਹੱਦੀ ਵਨਸਪਤੀ ਤੋਂ ਉੱਚ ਛਾਂ ਦਾ ਪ੍ਰਭਾਵ। ਛਾਂ ਘਟਾਉਣ ਲਈ ਵਨਸਪਤੀ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ।',
        action: 'Prune and manage boundary vegetation',
        timeline: 'Within 2 weeks',
        expectedBenefit: 'Reduced shading and improved light penetration',
        estimatedCost: 2000,
        implementationSteps: [
          'Prune overhanging branches',
          'Trim tall grasses and hedges',
          'Maintain optimal boundary width',
          'Plant low-growing vegetation',
          'Regular maintenance schedule'
        ],
        localImplementationSteps: [
          'ਲਟਕਦੀਆਂ ਟਹਿਣੀਆਂ ਦੀ ਕਟਾਈ ਕਰੋ',
          'ਉੱਚੇ ਘਾਹ ਅਤੇ ਹੇਜਾਂ ਦੀ ਕਟਾਈ ਕਰੋ',
          'ਆਪਟੀਮਲ ਹੱਦੀ ਚੌੜਾਈ ਬਣਾਈ ਰੱਖੋ',
          'ਘੱਟ ਉੱਚਾਈ ਵਾਲੀ ਵਨਸਪਤੀ ਲਗਾਓ',
          'ਨਿਯਮਿਤ ਰੱਖ-ਰਖਾਅ ਦਾ ਸਮਾਂ-ਸਾਰਣੀ'
        ]
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Identify risk factors at boundaries
   */
  private identifyRiskFactors(
    district: PunjabDistrict,
    boundaryConditions: BoundaryConditions,
    vegetationIndices: BoundaryVegetationIndices,
    analysisResults: any
  ): BoundaryRiskFactor[] {
    const riskFactors: BoundaryRiskFactor[] = [];

    // High pest pressure risk
    if (analysisResults.pestPressure > 70) {
      riskFactors.push({
        id: 'pest_risk_1',
        factor: 'High Pest Pressure',
        severity: 'high',
        impact: 'Significant crop damage from boundary pests',
        localImpact: 'ਹੱਦੀ ਕੀਟਾਂ ਤੋਂ ਫਸਲ ਨੂੰ ਮਹੱਤਵਪੂਰਨ ਨੁਕਸਾਨ',
        affectedArea: Math.min(100, analysisResults.pestPressure),
        recommendation: 'Implement immediate pest control measures',
        localRecommendation: 'ਤੁਰੰਤ ਕੀਟ ਨਿਯੰਤਰਣ ਉਪਾਅ ਲਗਾਓ',
        urgency: 'immediate'
      });
    }

    // High erosion risk
    if (analysisResults.erosionRisk > 70) {
      riskFactors.push({
        id: 'erosion_risk_1',
        factor: 'High Erosion Risk',
        severity: 'high',
        impact: 'Soil loss and reduced field productivity',
        localImpact: 'ਮਿੱਟੀ ਦਾ ਨੁਕਸਾਨ ਅਤੇ ਖੇਤ ਦੀ ਉਤਪਾਦਕਤਾ ਵਿੱਚ ਕਮੀ',
        affectedArea: Math.min(100, analysisResults.erosionRisk),
        recommendation: 'Install soil conservation measures immediately',
        localRecommendation: 'ਤੁਰੰਤ ਮਿੱਟੀ ਸੰਭਾਲ ਉਪਾਅ ਲਗਾਓ',
        urgency: 'within_week'
      });
    }

    // Critical water management
    if (analysisResults.waterManagement === 'critical') {
      riskFactors.push({
        id: 'water_risk_1',
        factor: 'Critical Water Management',
        severity: 'critical',
        impact: 'Waterlogging or drought stress at boundaries',
        localImpact: 'ਹੱਦਾਂ \'ਤੇ ਪਾਣੀ ਭਰਨਾ ਜਾਂ ਸੋਕੇ ਦਾ ਤਣਾਅ',
        affectedArea: 80,
        recommendation: 'Install drainage and water management systems',
        localRecommendation: 'ਨਿਕਾਸੀ ਅਤੇ ਪਾਣੀ ਪ੍ਰਬੰਧਨ ਸਿਸਟਮ ਲਗਾਓ',
        urgency: 'immediate'
      });
    }

    // High nutrient competition
    if (analysisResults.nutrientCompetition > 60) {
      riskFactors.push({
        id: 'nutrient_risk_1',
        factor: 'High Nutrient Competition',
        severity: 'medium',
        impact: 'Reduced nutrient availability for main crop',
        localImpact: 'ਮੁੱਖ ਫਸਲ ਲਈ ਪੋਸ਼ਕ ਤੱਤਾਂ ਦੀ ਘੱਟ ਉਪਲਬਧਤਾ',
        affectedArea: Math.min(100, analysisResults.nutrientCompetition),
        recommendation: 'Optimize nutrient application and manage vegetation',
        localRecommendation: 'ਪੋਸ਼ਕ ਤੱਤਾਂ ਦੀ ਵਰਤੋਂ ਆਪਟੀਮਾਈਜ਼ ਕਰੋ ਅਤੇ ਵਨਸਪਤੀ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ',
        urgency: 'within_month'
      });
    }

    // High shading impact
    if (analysisResults.shadingImpact > 50) {
      riskFactors.push({
        id: 'shading_risk_1',
        factor: 'High Shading Impact',
        severity: 'medium',
        impact: 'Reduced light penetration and crop growth',
        localImpact: 'ਘੱਟ ਰੌਸ਼ਨੀ ਪ੍ਰਵੇਸ਼ ਅਤੇ ਫਸਲ ਦੀ ਵਾਧੇ ਵਿੱਚ ਕਮੀ',
        affectedArea: Math.min(100, analysisResults.shadingImpact),
        recommendation: 'Prune and manage boundary vegetation',
        localRecommendation: 'ਹੱਦੀ ਵਨਸਪਤੀ ਦੀ ਕਟਾਈ ਅਤੇ ਪ੍ਰਬੰਧਨ ਕਰੋ',
        urgency: 'within_week'
      });
    }

    return riskFactors.sort((a, b) => {
      const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Get Punjab boundary characteristics for a district
   */
  getPunjabBoundaryCharacteristics(districtId: string): PunjabBoundaryCharacteristics | null {
    return this.punjabBoundaryData.get(districtId) || null;
  }

  /**
   * Clear analysis cache
   */
  clearCache(): void {
    this.analysisCache.clear();
  }

  /**
   * Get cached analysis
   */
  getCachedAnalysis(fieldId: string, date: string): BoundaryAnalysis | null {
    const cacheKey = `${fieldId}_${date}`;
    return this.analysisCache.get(cacheKey) || null;
  }
}

export default BoundaryAnalysisEngine;
