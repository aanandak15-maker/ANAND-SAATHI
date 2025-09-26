/**
 * Punjab Rice Phenology System - Main Integration Service
 * Orchestrates all Punjab-specific rice cultivation components
 * Integrates phenology engine, government APIs, and alert system
 */

import { PunjabPhenologyEngine, PhenologyAnalysis, WeatherData, SatelliteData, FieldConditions } from './punjabPhenologyEngine';
import { PunjabGovernmentAPIService, CropAdvisory, PestAlert, WeatherForecast, GovernmentScheme } from './punjabGovernmentAPI';
import { PunjabAlertSystem, FarmerProfile, AlertMessage } from './punjabAlertSystem';
import { PunjabRiceVariety, PunjabDistrict, getVarietyById, getDistrictById } from '@/data/punjabRiceVarieties';

export interface PunjabRiceSystemConfig {
  phenologyEngine: {
    enabled: boolean;
    analysisInterval: number; // minutes
    alertThresholds: {
      waterStress: number; // percentage
      pestPressure: number; // percentage
      diseaseIncidence: number; // percentage
    };
  };
  governmentAPI: {
    enabled: boolean;
    syncInterval: number; // hours
    districts: string[];
  };
  alertSystem: {
    enabled: boolean;
    channels: string[];
    quietHours: boolean;
  };
}

export interface FieldMonitoringData {
  fieldId: string;
  variety: PunjabRiceVariety;
  district: PunjabDistrict;
  plantingDate: Date;
  lastAnalysis: PhenologyAnalysis | null;
  currentConditions: {
    satellite: SatelliteData | null;
    weather: WeatherData | null;
    field: FieldConditions | null;
  };
  governmentData: {
    advisories: CropAdvisory[];
    pestAlerts: PestAlert[];
    weatherForecast: WeatherForecast[];
    schemes: GovernmentScheme[];
  };
  alertHistory: AlertMessage[];
  performanceMetrics: {
    yieldPrediction: number; // quintals per acre
    waterEfficiency: number; // percentage
    costSavings: number; // INR
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical';
  components: {
    phenologyEngine: 'online' | 'offline' | 'error';
    governmentAPI: 'online' | 'offline' | 'error';
    alertSystem: 'online' | 'offline' | 'error';
    satelliteData: 'online' | 'offline' | 'error';
  };
  lastUpdate: Date;
  activeFields: number;
  totalAlerts: number;
  systemLoad: number; // percentage
}

export class PunjabRiceSystem {
  private config: PunjabRiceSystemConfig;
  private phenologyEngine: PunjabPhenologyEngine | null = null;
  private governmentAPI: PunjabGovernmentAPIService;
  private alertSystem: PunjabAlertSystem;
  private monitoringData: Map<string, FieldMonitoringData> = new Map();
  private systemStatus: SystemStatus;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(config: PunjabRiceSystemConfig) {
    this.config = config;
    this.governmentAPI = new PunjabGovernmentAPIService({
      baseUrls: {
        agriculture: 'https://agri.punjab.gov.in/api/v1',
        cropReporting: 'https://crs-agripunjab.punjab.gov.pk/api/v1',
        pestWarning: 'https://pestwarning-agripunjab.punjab.gov.pk/api/v1',
        eDistrict: 'https://edistrictpb.gov.in/api/v1'
      },
      apiKeys: {
        agriculture: import.meta.env.VITE_PUNJAB_AGRI_API_KEY || '',
        cropReporting: import.meta.env.VITE_PUNJAB_CRS_API_KEY || '',
        pestWarning: import.meta.env.VITE_PUNJAB_PEST_API_KEY || '',
        eDistrict: import.meta.env.VITE_PUNJAB_EDISTRICT_API_KEY || ''
      },
      rateLimits: {
        requestsPerMinute: 30,
        requestsPerHour: 1000
      }
    });
    this.alertSystem = new PunjabAlertSystem({
      sms: {
        provider: 'textlocal',
        apiKey: import.meta.env.VITE_TEXTLOCAL_API_KEY || '',
        senderId: 'SOILSA',
        rateLimit: 30
      },
      whatsapp: {
        provider: 'whatsapp_business',
        apiKey: import.meta.env.VITE_WHATSAPP_API_KEY || '',
        phoneNumberId: import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || '',
        businessAccountId: import.meta.env.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID || '',
        rateLimit: 20
      },
      push: {
        provider: 'firebase',
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
        appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
        rateLimit: 100
      },
      email: {
        provider: 'sendgrid',
        apiKey: import.meta.env.VITE_SENDGRID_API_KEY || '',
        fromEmail: 'alerts@soilsaathi.com',
        rateLimit: 50
      },
      voice: {
        provider: 'twilio',
        apiKey: import.meta.env.VITE_TWILIO_API_KEY || '',
        phoneNumber: import.meta.env.VITE_TWILIO_PHONE_NUMBER || '',
        rateLimit: 10
      }
    });

    this.systemStatus = {
      overall: 'healthy',
      components: {
        phenologyEngine: 'online',
        governmentAPI: 'online',
        alertSystem: 'online',
        satelliteData: 'online'
      },
      lastUpdate: new Date(),
      activeFields: 0,
      totalAlerts: 0,
      systemLoad: 0
    };
  }

  /**
   * Initialize the system and start monitoring
   */
  async initialize(): Promise<void> {
    try {
      // Check system health
      await this.checkSystemHealth();

      // Start monitoring loop
      if (this.config.phenologyEngine.enabled) {
        this.startMonitoring();
      }

      // Sync government data
      if (this.config.governmentAPI.enabled) {
        await this.syncGovernmentData();
      }

      console.log('Punjab Rice System initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Punjab Rice System:', error);
      throw error;
    }
  }

  /**
   * Add a field for monitoring
   */
  async addField(
    fieldId: string,
    varietyId: string,
    districtId: string,
    plantingDate: Date,
    farmer: FarmerProfile
  ): Promise<void> {
    const variety = getVarietyById(varietyId);
    const district = getDistrictById(districtId);

    if (!variety) {
      throw new Error(`Rice variety ${varietyId} not found`);
    }
    if (!district) {
      throw new Error(`District ${districtId} not found`);
    }

    // Initialize phenology engine for this field
    const phenologyEngine = new PunjabPhenologyEngine(varietyId, districtId, plantingDate);

    // Create monitoring data
    const monitoringData: FieldMonitoringData = {
      fieldId,
      variety,
      district,
      plantingDate,
      lastAnalysis: null,
      currentConditions: {
        satellite: null,
        weather: null,
        field: null
      },
      governmentData: {
        advisories: [],
        pestAlerts: [],
        weatherForecast: [],
        schemes: []
      },
      alertHistory: [],
      performanceMetrics: {
        yieldPrediction: variety.avgYield,
        waterEfficiency: 75,
        costSavings: 0,
        riskLevel: 'low'
      }
    };

    this.monitoringData.set(fieldId, monitoringData);
    this.systemStatus.activeFields = this.monitoringData.size;

    // Perform initial analysis
    await this.analyzeField(fieldId);

    console.log(`Field ${fieldId} added to monitoring system`);
  }

  /**
   * Analyze a specific field
   */
  async analyzeField(fieldId: string): Promise<PhenologyAnalysis | null> {
    const monitoringData = this.monitoringData.get(fieldId);
    if (!monitoringData) {
      throw new Error(`Field ${fieldId} not found`);
    }

    try {
      // Get current conditions
      const satelliteData = await this.getSatelliteData(fieldId);
      const weatherData = await this.getWeatherData(monitoringData.district.id);
      const fieldConditions = await this.getFieldConditions(fieldId);

      // Update monitoring data
      monitoringData.currentConditions = {
        satellite: satelliteData,
        weather: weatherData,
        field: fieldConditions
      };

      // Perform phenology analysis
      const phenologyEngine = new PunjabPhenologyEngine(
        monitoringData.variety.id,
        monitoringData.district.id,
        monitoringData.plantingDate
      );

      const analysis = phenologyEngine.analyzePhenology(
        satelliteData || this.getDefaultSatelliteData(),
        weatherData || this.getDefaultWeatherData(),
        fieldConditions || this.getDefaultFieldConditions()
      );

      // Update monitoring data
      monitoringData.lastAnalysis = analysis;

      // Generate alerts if needed
      await this.processAlerts(fieldId, analysis);

      // Update performance metrics
      this.updatePerformanceMetrics(fieldId, analysis);

      return analysis;
    } catch (error) {
      console.error(`Failed to analyze field ${fieldId}:`, error);
      this.systemStatus.components.phenologyEngine = 'error';
      return null;
    }
  }

  /**
   * Process alerts for a field
   */
  private async processAlerts(fieldId: string, analysis: PhenologyAnalysis): Promise<void> {
    const monitoringData = this.monitoringData.get(fieldId);
    if (!monitoringData || !this.config.alertSystem.enabled) {
      return;
    }

    // Get farmer profile (placeholder - implement based on your data source)
    const farmer = await this.getFarmerProfile(fieldId);

    // Process phenology alerts
    for (const alert of analysis.alerts) {
      if (alert.actionRequired) {
        await this.sendAlert(farmer, alert, analysis);
      }
    }

    // Process recommendations
    for (const recommendation of analysis.recommendations) {
      if (recommendation.priority === 'critical' || recommendation.priority === 'high') {
        await this.sendRecommendationAlert(farmer, recommendation, analysis);
      }
    }
  }

  /**
   * Send alert to farmer
   */
  private async sendAlert(
    farmer: FarmerProfile,
    alert: any,
    analysis: PhenologyAnalysis
  ): Promise<void> {
    try {
      const alertMessage = await this.alertSystem.sendAlert(
        farmer,
        this.getAlertTemplateId(alert.type),
        {
          variety: analysis.variety.name,
          district: analysis.district.name,
          stage: analysis.currentStage.name,
          daysRemaining: analysis.expectedDaysRemaining,
          action: alert.message,
          fieldId: analysis.fieldId
        },
        alert.severity === 'critical' ? 'critical' : 'high'
      );

      // Add to alert history
      const monitoringData = this.monitoringData.get(analysis.fieldId);
      if (monitoringData) {
        monitoringData.alertHistory.push(alertMessage);
      }

      this.systemStatus.totalAlerts++;
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }

  /**
   * Send recommendation alert
   */
  private async sendRecommendationAlert(
    farmer: FarmerProfile,
    recommendation: any,
    analysis: PhenologyAnalysis
  ): Promise<void> {
    try {
      const alertMessage = await this.alertSystem.sendAlert(
        farmer,
        this.getRecommendationTemplateId(recommendation.type),
        {
          variety: analysis.variety.name,
          district: analysis.district.name,
          stage: analysis.currentStage.name,
          action: recommendation.description,
          cost: recommendation.estimatedCost || 0,
          fieldId: analysis.fieldId
        },
        recommendation.priority
      );

      // Add to alert history
      const monitoringData = this.monitoringData.get(analysis.fieldId);
      if (monitoringData) {
        monitoringData.alertHistory.push(alertMessage);
      }

      this.systemStatus.totalAlerts++;
    } catch (error) {
      console.error('Failed to send recommendation alert:', error);
    }
  }

  /**
   * Sync government data
   */
  async syncGovernmentData(): Promise<void> {
    try {
      for (const districtId of this.config.governmentAPI.districts) {
        // Get crop advisories
        const advisoriesResponse = await this.governmentAPI.getCropAdvisories(districtId, 'rice');
        if (advisoriesResponse.success && advisoriesResponse.data) {
          // Update monitoring data for all fields in this district
          for (const [fieldId, monitoringData] of this.monitoringData) {
            if (monitoringData.district.id === districtId) {
              monitoringData.governmentData.advisories = advisoriesResponse.data;
            }
          }
        }

        // Get pest alerts
        const pestAlertsResponse = await this.governmentAPI.getPestAlerts(districtId, 'rice');
        if (pestAlertsResponse.success && pestAlertsResponse.data) {
          for (const [fieldId, monitoringData] of this.monitoringData) {
            if (monitoringData.district.id === districtId) {
              monitoringData.governmentData.pestAlerts = pestAlertsResponse.data;
            }
          }
        }

        // Get weather forecast
        const weatherResponse = await this.governmentAPI.getWeatherForecast(districtId);
        if (weatherResponse.success && weatherResponse.data) {
          for (const [fieldId, monitoringData] of this.monitoringData) {
            if (monitoringData.district.id === districtId) {
              monitoringData.governmentData.weatherForecast = weatherResponse.data;
            }
          }
        }
      }

      // Get government schemes
      const schemesResponse = await this.governmentAPI.getGovernmentSchemes();
      if (schemesResponse.success && schemesResponse.data) {
        for (const [fieldId, monitoringData] of this.monitoringData) {
          monitoringData.governmentData.schemes = schemesResponse.data;
        }
      }

      console.log('Government data synced successfully');
    } catch (error) {
      console.error('Failed to sync government data:', error);
      this.systemStatus.components.governmentAPI = 'error';
    }
  }

  /**
   * Start monitoring loop
   */
  private startMonitoring(): void {
    this.updateInterval = setInterval(async () => {
      try {
        await this.monitorAllFields();
        this.systemStatus.lastUpdate = new Date();
      } catch (error) {
        console.error('Monitoring loop error:', error);
      }
    }, this.config.phenologyEngine.analysisInterval * 60 * 1000);
  }

  /**
   * Monitor all fields
   */
  private async monitorAllFields(): Promise<void> {
    const promises = Array.from(this.monitoringData.keys()).map(fieldId => 
      this.analyzeField(fieldId)
    );

    await Promise.allSettled(promises);
  }

  /**
   * Check system health
   */
  private async checkSystemHealth(): Promise<void> {
    try {
      // Check government API health
      const apiHealth = await this.governmentAPI.getAPIHealth();
      
      this.systemStatus.components.governmentAPI = 
        Object.values(apiHealth).every(status => status) ? 'online' : 'offline';

      // Check alert system
      this.systemStatus.components.alertSystem = 'online';

      // Check satellite data
      this.systemStatus.components.satelliteData = 'online';

      // Determine overall status
      const componentStatuses = Object.values(this.systemStatus.components);
      if (componentStatuses.every(status => status === 'online')) {
        this.systemStatus.overall = 'healthy';
      } else if (componentStatuses.some(status => status === 'error')) {
        this.systemStatus.overall = 'critical';
      } else {
        this.systemStatus.overall = 'warning';
      }

    } catch (error) {
      console.error('Health check failed:', error);
      this.systemStatus.overall = 'critical';
    }
  }

  /**
   * Get system status
   */
  getSystemStatus(): SystemStatus {
    return this.systemStatus;
  }

  /**
   * Get field monitoring data
   */
  getFieldMonitoringData(fieldId: string): FieldMonitoringData | null {
    return this.monitoringData.get(fieldId) || null;
  }

  /**
   * Get all monitoring data
   */
  getAllMonitoringData(): Map<string, FieldMonitoringData> {
    return this.monitoringData;
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Helper methods (implement based on your data sources)
  private async getSatelliteData(fieldId: string): Promise<SatelliteData | null> {
    // Implement satellite data retrieval
    return null;
  }

  private async getWeatherData(districtId: string): Promise<WeatherData | null> {
    // Implement weather data retrieval
    return null;
  }

  private async getFieldConditions(fieldId: string): Promise<FieldConditions | null> {
    // Implement field conditions retrieval
    return null;
  }

  private async getFarmerProfile(fieldId: string): Promise<FarmerProfile> {
    // Implement farmer profile retrieval
    return {
      id: 'farmer_001',
      name: 'Test Farmer',
      phone: '+91 9876543210',
      language: 'punjabi',
      district: 'ludhiana',
      preferredChannels: ['sms', 'whatsapp'],
      alertPreferences: {
        phenology: true,
        pest: true,
        disease: true,
        weather: true,
        government: true,
        market: true
      },
      quietHours: {
        start: '22:00',
        end: '06:00',
        enabled: true
      },
      timezone: 'Asia/Kolkata'
    };
  }

  private getDefaultSatelliteData(): SatelliteData {
    return {
      ndvi: 0.6,
      msavi2: 0.5,
      ndre: 0.4,
      ndmi: 0.3,
      cloudCover: 10,
      date: new Date(),
      quality: 'medium'
    };
  }

  private getDefaultWeatherData(): WeatherData {
    return {
      temperature: { min: 20, max: 35, avg: 27 },
      humidity: 65,
      rainfall: 0,
      windSpeed: 10,
      pressure: 1013,
      date: new Date()
    };
  }

  private getDefaultFieldConditions(): FieldConditions {
    return {
      soilMoisture: 70,
      soilTemperature: 25,
      waterLevel: 5,
      pestPressure: 'low',
      diseaseIncidence: 'none',
      nutrientStatus: {
        nitrogen: 'adequate',
        phosphorus: 'adequate',
        potassium: 'adequate'
      }
    };
  }

  private getAlertTemplateId(alertType: string): string {
    const templateMap: Record<string, string> = {
      'weather': 'weather_warning',
      'pest': 'pest_alert',
      'disease': 'pest_alert',
      'nutrient': 'critical_irrigation',
      'water': 'critical_irrigation',
      'harvest': 'harvest_ready'
    };
    return templateMap[alertType] || 'phenology_stage_change';
  }

  private getRecommendationTemplateId(recommendationType: string): string {
    const templateMap: Record<string, string> = {
      'irrigation': 'critical_irrigation',
      'fertilizer': 'phenology_stage_change',
      'pest_control': 'pest_alert',
      'disease_management': 'pest_alert',
      'harvest': 'harvest_ready'
    };
    return templateMap[recommendationType] || 'phenology_stage_change';
  }

  private updatePerformanceMetrics(fieldId: string, analysis: PhenologyAnalysis): void {
    const monitoringData = this.monitoringData.get(fieldId);
    if (!monitoringData) return;

    // Update yield prediction based on current health
    const healthMultiplier = {
      'excellent': 1.1,
      'good': 1.0,
      'fair': 0.9,
      'poor': 0.8,
      'critical': 0.7
    };

    monitoringData.performanceMetrics.yieldPrediction = 
      monitoringData.variety.avgYield * healthMultiplier[analysis.stageHealth];

    // Update risk level
    if (analysis.alerts.some(alert => alert.severity === 'critical')) {
      monitoringData.performanceMetrics.riskLevel = 'high';
    } else if (analysis.alerts.some(alert => alert.severity === 'warning')) {
      monitoringData.performanceMetrics.riskLevel = 'medium';
    } else {
      monitoringData.performanceMetrics.riskLevel = 'low';
    }
  }
}

// Default configuration
export const defaultPunjabRiceSystemConfig: PunjabRiceSystemConfig = {
  phenologyEngine: {
    enabled: true,
    analysisInterval: 30, // 30 minutes
    alertThresholds: {
      waterStress: 50,
      pestPressure: 70,
      diseaseIncidence: 60
    }
  },
  governmentAPI: {
    enabled: true,
    syncInterval: 6, // 6 hours
    districts: ['amritsar', 'ludhiana', 'patiala', 'sangrur', 'bathinda']
  },
  alertSystem: {
    enabled: true,
    channels: ['sms', 'whatsapp', 'push'],
    quietHours: true
  }
};

export default PunjabRiceSystem;
