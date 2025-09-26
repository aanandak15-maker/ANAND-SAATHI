/**
 * Punjab Rice Phenology Engine
 * Advanced algorithms for Punjab-specific rice cultivation monitoring
 * Integrates with satellite data, weather patterns, and regional characteristics
 */

import { 
  PunjabRiceVariety, 
  PunjabDistrict, 
  PunjabPhenologyStage,
  getVarietyById,
  getDistrictById,
  getPhenologyStageById
} from '@/data/punjabRiceVarieties';

export interface PhenologyAnalysis {
  fieldId: string;
  variety: PunjabRiceVariety;
  district: PunjabDistrict;
  currentStage: PunjabPhenologyStage;
  stageProgress: number; // 0-100%
  daysInStage: number;
  expectedDaysRemaining: number;
  ndviValue: number;
  stageHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  recommendations: PhenologyRecommendation[];
  alerts: PhenologyAlert[];
  nextStage: PunjabPhenologyStage | null;
  harvestDate: Date | null;
}

export interface PhenologyRecommendation {
  id: string;
  type: 'irrigation' | 'fertilizer' | 'pest_control' | 'disease_management' | 'harvest';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  localDescription: string; // Punjabi
  actionItems: string[];
  estimatedCost?: number;
  implementationWindow: string;
  expectedImpact: string;
}

export interface PhenologyAlert {
  id: string;
  type: 'weather' | 'pest' | 'disease' | 'nutrient' | 'water' | 'harvest';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  localMessage: string; // Punjabi
  actionRequired: boolean;
  deadline?: Date;
  affectedArea?: number; // percentage
}

export interface WeatherData {
  temperature: {
    min: number;
    max: number;
    avg: number;
  };
  humidity: number;
  rainfall: number;
  windSpeed: number;
  pressure: number;
  date: Date;
}

export interface SatelliteData {
  ndvi: number;
  msavi2: number;
  ndre: number;
  ndmi: number;
  cloudCover: number;
  date: Date;
  quality: 'high' | 'medium' | 'low';
}

export interface FieldConditions {
  soilMoisture: number; // percentage
  soilTemperature: number; // celsius
  waterLevel: number; // cm
  pestPressure: 'low' | 'medium' | 'high';
  diseaseIncidence: 'none' | 'low' | 'medium' | 'high';
  nutrientStatus: {
    nitrogen: 'deficient' | 'adequate' | 'excess';
    phosphorus: 'deficient' | 'adequate' | 'excess';
    potassium: 'deficient' | 'adequate' | 'excess';
  };
}

export class PunjabPhenologyEngine {
  private variety: PunjabRiceVariety;
  private district: PunjabDistrict;
  private plantingDate: Date;

  constructor(
    varietyId: string,
    districtId: string,
    plantingDate: Date
  ) {
    const variety = getVarietyById(varietyId);
    const district = getDistrictById(districtId);

    if (!variety) {
      throw new Error(`Rice variety ${varietyId} not found`);
    }
    if (!district) {
      throw new Error(`District ${districtId} not found`);
    }

    this.variety = variety;
    this.district = district;
    this.plantingDate = plantingDate;
  }

  /**
   * Analyze current phenology stage based on days since planting
   */
  analyzePhenology(
    satelliteData: SatelliteData,
    weatherData: WeatherData,
    fieldConditions: FieldConditions
  ): PhenologyAnalysis {
    const daysSincePlanting = this.getDaysSincePlanting();
    const currentStage = this.getCurrentStage(daysSincePlanting);
    const stageProgress = this.calculateStageProgress(daysSincePlanting, currentStage);
    const stageHealth = this.assessStageHealth(satelliteData, weatherData, fieldConditions, currentStage);
    
    const recommendations = this.generateRecommendations(
      currentStage,
      satelliteData,
      weatherData,
      fieldConditions
    );

    const alerts = this.generateAlerts(
      currentStage,
      satelliteData,
      weatherData,
      fieldConditions
    );

    const nextStage = this.getNextStage(currentStage);
    const harvestDate = this.calculateHarvestDate();

    return {
      fieldId: `field_${this.variety.id}_${this.district.id}`,
      variety: this.variety,
      district: this.district,
      currentStage,
      stageProgress,
      daysInStage: this.getDaysInCurrentStage(daysSincePlanting, currentStage),
      expectedDaysRemaining: this.getExpectedDaysRemaining(currentStage, stageProgress),
      ndviValue: satelliteData.ndvi,
      stageHealth,
      recommendations,
      alerts,
      nextStage,
      harvestDate
    };
  }

  /**
   * Get current phenology stage based on days since planting
   */
  private getCurrentStage(daysSincePlanting: number): PunjabPhenologyStage {
    const stages = [
      { stage: 'germination', endDay: this.variety.phenologyStages.germination },
      { stage: 'tillering', endDay: this.variety.phenologyStages.tillering },
      { stage: 'panicle-initiation', endDay: this.variety.phenologyStages.panicleInitiation },
      { stage: 'flowering', endDay: this.variety.phenologyStages.flowering },
      { stage: 'grain-filling', endDay: this.variety.phenologyStages.grainFilling },
      { stage: 'maturity', endDay: this.variety.phenologyStages.maturity }
    ];

    for (const { stage, endDay } of stages) {
      if (daysSincePlanting <= endDay) {
        return getPhenologyStageById(stage)!;
      }
    }

    // If beyond maturity, return maturity stage
    return getPhenologyStageById('maturity')!;
  }

  /**
   * Calculate progress within current stage (0-100%)
   */
  private calculateStageProgress(daysSincePlanting: number, currentStage: PunjabPhenologyStage): number {
    const stageStartDay = this.getStageStartDay(currentStage);
    const daysInStage = daysSincePlanting - stageStartDay;
    const stageDuration = currentStage.duration;
    
    return Math.min(100, Math.max(0, (daysInStage / stageDuration) * 100));
  }

  /**
   * Assess health of current phenology stage
   */
  private assessStageHealth(
    satelliteData: SatelliteData,
    weatherData: WeatherData,
    fieldConditions: FieldConditions,
    currentStage: PunjabPhenologyStage
  ): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    let healthScore = 100;

    // NDVI assessment
    const ndviThresholds = this.variety.ndviThresholds[currentStage.id as keyof typeof this.variety.ndviThresholds];
    if (satelliteData.ndvi < ndviThresholds.min) {
      healthScore -= 30;
    } else if (satelliteData.ndvi > ndviThresholds.max) {
      healthScore -= 20;
    }

    // Weather stress assessment
    if (weatherData.temperature.max > 35) {
      healthScore -= 20; // High temperature stress
    }
    if (weatherData.temperature.min < 15) {
      healthScore -= 15; // Low temperature stress
    }
    if (weatherData.humidity < 40) {
      healthScore -= 10; // Low humidity stress
    }

    // Field conditions assessment
    if (fieldConditions.soilMoisture < 60) {
      healthScore -= 25; // Water stress
    }
    if (fieldConditions.pestPressure === 'high') {
      healthScore -= 20;
    }
    if (fieldConditions.diseaseIncidence === 'high') {
      healthScore -= 25;
    }

    // Nutrient assessment
    if (fieldConditions.nutrientStatus.nitrogen === 'deficient') {
      healthScore -= 15;
    }
    if (fieldConditions.nutrientStatus.phosphorus === 'deficient') {
      healthScore -= 10;
    }
    if (fieldConditions.nutrientStatus.potassium === 'deficient') {
      healthScore -= 10;
    }

    // Determine health category
    if (healthScore >= 90) return 'excellent';
    if (healthScore >= 75) return 'good';
    if (healthScore >= 60) return 'fair';
    if (healthScore >= 40) return 'poor';
    return 'critical';
  }

  /**
   * Generate stage-specific recommendations
   */
  private generateRecommendations(
    currentStage: PunjabPhenologyStage,
    satelliteData: SatelliteData,
    weatherData: WeatherData,
    fieldConditions: FieldConditions
  ): PhenologyRecommendation[] {
    const recommendations: PhenologyRecommendation[] = [];

    // Stage-specific recommendations
    switch (currentStage.id) {
      case 'germination':
        if (fieldConditions.soilMoisture < 70) {
          recommendations.push({
            id: 'germ_water_1',
            type: 'irrigation',
            priority: 'high',
            title: 'Maintain Soil Moisture',
            description: 'Ensure adequate soil moisture for proper germination',
            localDescription: 'ਅੰਕੁਰਣ ਲਈ ਮਿੱਟੀ ਦੀ ਨਮੀ ਬਣਾਈ ਰੱਖੋ',
            actionItems: [
              'Maintain 5-7 cm water level',
              'Check soil moisture daily',
              'Avoid waterlogging'
            ],
            estimatedCost: 500,
            implementationWindow: 'Immediate',
            expectedImpact: 'Improved germination rate'
          });
        }
        break;

      case 'tillering':
        if (fieldConditions.nutrientStatus.nitrogen === 'deficient') {
          recommendations.push({
            id: 'till_nitrogen_1',
            type: 'fertilizer',
            priority: 'high',
            title: 'Apply Nitrogen Fertilizer',
            description: 'Apply nitrogen fertilizer for optimal tillering',
            localDescription: 'ਬਿਹਤਰ ਕਲੋਮ ਲਈ ਨਾਈਟ੍ਰੋਜਨ ਖਾਦ ਪਾਓ',
            actionItems: [
              `Apply ${this.variety.recommendations.fertilizer.nitrogen} kg/acre nitrogen`,
              'Split application recommended',
              'Incorporate into soil'
            ],
            estimatedCost: 2000,
            implementationWindow: 'Next 3 days',
            expectedImpact: 'Increased tiller production'
          });
        }
        break;

      case 'panicle-initiation':
        if (fieldConditions.soilMoisture < 80) {
          recommendations.push({
            id: 'panicle_water_1',
            type: 'irrigation',
            priority: 'critical',
            title: 'Critical Irrigation Period',
            description: 'Maintain optimal water level during panicle initiation',
            localDescription: 'ਬਾਲੀ ਦੇ ਬਣਨ ਦੇ ਸਮੇਂ ਪਾਣੀ ਦਾ ਪੱਧਰ ਬਣਾਈ ਰੱਖੋ',
            actionItems: [
              'Maintain 7-10 cm water level',
              'Monitor daily',
              'Avoid water stress'
            ],
            estimatedCost: 800,
            implementationWindow: 'Immediate',
            expectedImpact: 'Better panicle development'
          });
        }
        break;

      case 'flowering':
        if (weatherData.temperature.max > 35) {
          recommendations.push({
            id: 'flower_temp_1',
            type: 'irrigation',
            priority: 'high',
            title: 'Temperature Stress Management',
            description: 'Manage high temperature stress during flowering',
            localDescription: 'ਫੁੱਲ ਆਉਣ ਦੇ ਸਮੇਂ ਤਾਪਮਾਨ ਦੇ ਤਣਾਅ ਨੂੰ ਕੰਟਰੋਲ ਕਰੋ',
            actionItems: [
              'Increase water level to 8-10 cm',
              'Monitor temperature daily',
              'Consider foliar spray if needed'
            ],
            estimatedCost: 600,
            implementationWindow: 'Next 2 days',
            expectedImpact: 'Reduced temperature stress'
          });
        }
        break;

      case 'grain-filling':
        if (fieldConditions.nutrientStatus.potassium === 'deficient') {
          recommendations.push({
            id: 'grain_potassium_1',
            type: 'fertilizer',
            priority: 'medium',
            title: 'Potassium Application',
            description: 'Apply potassium for better grain filling',
            localDescription: 'ਬਿਹਤਰ ਦਾਣਾ ਭਰਨ ਲਈ ਪੋਟਾਸ਼ੀਅਮ ਪਾਓ',
            actionItems: [
              `Apply ${this.variety.recommendations.fertilizer.potassium} kg/acre potassium`,
              'Foliar application recommended',
              'Monitor grain development'
            ],
            estimatedCost: 1500,
            implementationWindow: 'Next 5 days',
            expectedImpact: 'Improved grain quality'
          });
        }
        break;

      case 'maturity':
        recommendations.push({
          id: 'harvest_prep_1',
          type: 'harvest',
          priority: 'medium',
          title: 'Harvest Preparation',
          description: 'Prepare for harvest and stop irrigation',
          localDescription: 'ਕਟਾਈ ਦੀ ਤਿਆਰੀ ਕਰੋ ਅਤੇ ਸਿੰਚਾਈ ਬੰਦ ਕਰੋ',
          actionItems: [
            'Stop irrigation 10 days before harvest',
            'Monitor grain moisture content',
            'Arrange harvesting equipment'
          ],
          estimatedCost: 0,
          implementationWindow: 'Next 7 days',
          expectedImpact: 'Optimal harvest timing'
        });
        break;
    }

    // Pest and disease management
    if (fieldConditions.pestPressure === 'high') {
      recommendations.push({
        id: 'pest_control_1',
        type: 'pest_control',
        priority: 'high',
        title: 'Pest Control Required',
        description: 'High pest pressure detected, immediate action needed',
        localDescription: 'ਉੱਚ ਕੀਟ ਦਬਾਅ ਦਾ ਪਤਾ ਲੱਗਾ, ਤੁਰੰਤ ਕਾਰਵਾਈ ਜ਼ਰੂਰੀ',
        actionItems: [
          'Identify pest species',
          'Apply appropriate pesticide',
          'Monitor effectiveness'
        ],
        estimatedCost: 3000,
        implementationWindow: 'Immediate',
        expectedImpact: 'Reduced pest damage'
      });
    }

    return recommendations;
  }

  /**
   * Generate alerts based on current conditions
   */
  private generateAlerts(
    currentStage: PunjabPhenologyStage,
    satelliteData: SatelliteData,
    weatherData: WeatherData,
    fieldConditions: FieldConditions
  ): PhenologyAlert[] {
    const alerts: PhenologyAlert[] = [];

    // Weather alerts
    if (weatherData.temperature.max > 38) {
      alerts.push({
        id: 'temp_alert_1',
        type: 'weather',
        severity: 'critical',
        title: 'High Temperature Alert',
        message: 'Extreme high temperature detected',
        localMessage: 'ਬਹੁਤ ਜ਼ਿਆਦਾ ਤਾਪਮਾਨ ਦਾ ਪਤਾ ਲੱਗਾ',
        actionRequired: true,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });
    }

    // Water stress alerts
    if (fieldConditions.soilMoisture < 50) {
      alerts.push({
        id: 'water_alert_1',
        type: 'water',
        severity: 'critical',
        title: 'Water Stress Alert',
        message: 'Critical water stress detected',
        localMessage: 'ਗੰਭੀਰ ਪਾਣੀ ਦਾ ਤਣਾਅ ਦਾ ਪਤਾ ਲੱਗਾ',
        actionRequired: true,
        deadline: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours
      });
    }

    // NDVI alerts
    const ndviThresholds = this.variety.ndviThresholds[currentStage.id as keyof typeof this.variety.ndviThresholds];
    if (satelliteData.ndvi < ndviThresholds.min * 0.8) {
      alerts.push({
        id: 'ndvi_alert_1',
        type: 'nutrient',
        severity: 'warning',
        title: 'Low Vegetation Index',
        message: 'NDVI below expected range for current stage',
        localMessage: 'ਮੌਜੂਦਾ ਪੜਾਅ ਲਈ NDVI ਘੱਟ ਹੈ',
        actionRequired: true
      });
    }

    // Harvest timing alerts
    if (currentStage.id === 'maturity' && this.getDaysSincePlanting() >= this.variety.maturityDays - 5) {
      alerts.push({
        id: 'harvest_alert_1',
        type: 'harvest',
        severity: 'info',
        title: 'Harvest Window Opening',
        message: 'Harvest window is opening soon',
        localMessage: 'ਕਟਾਈ ਦਾ ਸਮਾਂ ਜਲਦੀ ਆ ਰਿਹਾ ਹੈ',
        actionRequired: false
      });
    }

    return alerts;
  }

  /**
   * Calculate harvest date based on variety and planting date
   */
  private calculateHarvestDate(): Date {
    const harvestDate = new Date(this.plantingDate);
    harvestDate.setDate(harvestDate.getDate() + this.variety.maturityDays);
    return harvestDate;
  }

  /**
   * Get days since planting
   */
  private getDaysSincePlanting(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.plantingDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get start day of a phenology stage
   */
  private getStageStartDay(stage: PunjabPhenologyStage): number {
    const stageOrder = ['germination', 'tillering', 'panicle-initiation', 'flowering', 'grain-filling', 'maturity'];
    const stageIndex = stageOrder.indexOf(stage.id);
    
    if (stageIndex === 0) return 0;
    
    let startDay = 0;
    for (let i = 0; i < stageIndex; i++) {
      const prevStage = getPhenologyStageById(stageOrder[i])!;
      startDay += prevStage.duration;
    }
    
    return startDay;
  }

  /**
   * Get days in current stage
   */
  private getDaysInCurrentStage(daysSincePlanting: number, currentStage: PunjabPhenologyStage): number {
    const stageStartDay = this.getStageStartDay(currentStage);
    return Math.max(0, daysSincePlanting - stageStartDay);
  }

  /**
   * Get expected days remaining in current stage
   */
  private getExpectedDaysRemaining(currentStage: PunjabPhenologyStage, stageProgress: number): number {
    const remainingProgress = 100 - stageProgress;
    return Math.ceil((remainingProgress / 100) * currentStage.duration);
  }

  /**
   * Get next phenology stage
   */
  private getNextStage(currentStage: PunjabPhenologyStage): PunjabPhenologyStage | null {
    const stageOrder = ['germination', 'tillering', 'panicle-initiation', 'flowering', 'grain-filling', 'maturity'];
    const currentIndex = stageOrder.indexOf(currentStage.id);
    
    if (currentIndex < stageOrder.length - 1) {
      return getPhenologyStageById(stageOrder[currentIndex + 1])!;
    }
    
    return null;
  }

  /**
   * Get variety-specific NDVI thresholds for a stage
   */
  getNDVIThresholds(stageId: string): { min: number; max: number } {
    return this.variety.ndviThresholds[stageId as keyof typeof this.variety.ndviThresholds];
  }

  /**
   * Get district-specific recommendations
   */
  getDistrictRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.district.waterTable === 'low') {
      recommendations.push('Use water-efficient irrigation methods');
      recommendations.push('Consider drought-tolerant varieties');
    }
    
    if (this.district.region === 'Malwa') {
      recommendations.push('Monitor for cotton pests that may affect rice');
      recommendations.push('Consider intercropping with legumes');
    }
    
    return recommendations;
  }
}

export default PunjabPhenologyEngine;
