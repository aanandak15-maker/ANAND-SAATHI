/**
 * Enhanced TimesFM Service
 * Follows system design with proper API integration, retries, and mock data fallbacks
 */

import { BaseService, ApiResponse } from './BaseService';
import { 
  getMockMarketData, 
  getMockYieldData, 
  getMockWeatherData,
  generateForecastData,
  generateConfidenceIntervals,
  type TimesFMMockMarketData,
  type TimesFMMockYieldData,
  type TimesFMMockWeatherData
} from '@/data/timesfmMockData';

export interface TimesFMConfig {
  apiUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  useMockData: boolean;
  mockDelay: number;
}

export interface TimesFMRequest {
  fieldId: string;
  cropType: string;
  variety?: string;
  region?: string;
  district?: string;
  coordinates?: { lat: number; lng: number };
  plantingDate?: string;
  area?: number;
  metadata?: Record<string, any>;
}

export interface TimesFMYieldResponse {
  fieldId: string;
  cropType: string;
  variety: string;
  predictedYield: {
    tonsPerAcre: number;
    quintalsPerAcre: number;
    totalTons: number;
    confidence: number;
  };
  scenarios: {
    drought: number;
    normal: number;
    optimal: number;
  };
  riskFactors: Array<{
    factor: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    impact: string;
    recommendation: string;
    probability: number;
  }>;
  growthStages: Array<{
    stage: string;
    startDate: string;
    endDate: string;
    duration: number;
    keyActivities: string[];
    weatherSensitivity: number;
  }>;
  modelInfo: {
    model: string;
    version: string;
    accuracy: number;
    lastUpdated: string;
  };
}

export interface TimesFMMarketResponse {
  commodity: string;
  region: string;
  currentPrice: number;
  priceTrend: 'up' | 'down' | 'stable' | 'volatile';
  volatility: number;
  forecast: Array<{
    weekOffset: number;
    predicted: number;
    low: number;
    high: number;
    confidence: number;
    factors: string[];
  }>;
  recommendations: string[];
  marketFactors: {
    demand: 'high' | 'medium' | 'low';
    supply: 'high' | 'medium' | 'low';
    governmentSupport: 'msp' | 'subsidy' | 'none';
    exportPotential: 'high' | 'medium' | 'low';
  };
  modelInfo: {
    model: string;
    version: string;
    accuracy: number;
    lastUpdated: string;
  };
}

export interface TimesFMWeatherResponse {
  location: {
    lat: number;
    lng: number;
    district: string;
    state: string;
  };
  current: {
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    pressure: number;
    uvIndex: number;
  };
  forecast: Array<{
    date: string;
    temperature: { min: number; max: number; avg: number };
    humidity: number;
    precipitation: number;
    windSpeed: number;
    conditions: string;
    alerts: string[];
  }>;
  seasonal: {
    avgTemperature: number;
    avgRainfall: number;
    monsoonPeriod: { start: string; end: string };
    extremeEvents: Array<{
      type: 'heatwave' | 'frost' | 'storm' | 'drought' | 'flood';
      probability: number;
      impact: 'low' | 'medium' | 'high';
      period: string;
    }>;
  };
  modelInfo: {
    model: string;
    version: string;
    accuracy: number;
    lastUpdated: string;
  };
}

export interface TimesFMComprehensiveResponse {
  fieldId: string;
  timestamp: string;
  yield: TimesFMYieldResponse;
  market: TimesFMMarketResponse;
  weather: TimesFMWeatherResponse;
  integratedRecommendations: Array<{
    category: 'irrigation' | 'fertilizer' | 'pest_control' | 'harvest' | 'market';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    actionItems: string[];
    estimatedCost: number;
    expectedImpact: string;
    implementationWindow: string;
  }>;
  performanceMetrics: {
    yieldImprovement: number;
    costSavings: number;
    waterEfficiency: number;
    riskLevel: 'low' | 'medium' | 'high';
    overallScore: number;
  };
}

export class EnhancedTimesFMService extends BaseService {
  private config: TimesFMConfig;
  private circuitBreaker: {
    isOpen: boolean;
    failureCount: number;
    lastFailureTime: number;
    threshold: number;
    timeout: number;
  };

  constructor(config?: Partial<TimesFMConfig>) {
    super(process.env.VITE_TIMESFM_API_URL || 'https://timesfm.onrender.com');
    
    this.config = {
      apiUrl: process.env.VITE_TIMESFM_API_URL || 'https://timesfm.onrender.com',
      apiKey: process.env.VITE_TIMESFM_API_KEY || '',
      timeout: 30000,
      retryAttempts: 3,
      useMockData: process.env.VITE_TIMESFM_USE_MOCK === 'true' || !process.env.VITE_TIMESFM_API_KEY,
      mockDelay: 1000,
      ...config
    };

    this.circuitBreaker = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: 0,
      threshold: 5,
      timeout: 60000 // 1 minute
    };
  }

  /**
   * Check if circuit breaker is open
   */
  private isCircuitBreakerOpen(): boolean {
    if (!this.circuitBreaker.isOpen) return false;
    
    const now = Date.now();
    if (now - this.circuitBreaker.lastFailureTime > this.circuitBreaker.timeout) {
      this.circuitBreaker.isOpen = false;
      this.circuitBreaker.failureCount = 0;
      return false;
    }
    
    return true;
  }

  /**
   * Record API failure
   */
  private recordFailure(): void {
    this.circuitBreaker.failureCount++;
    this.circuitBreaker.lastFailureTime = Date.now();
    
    if (this.circuitBreaker.failureCount >= this.circuitBreaker.threshold) {
      this.circuitBreaker.isOpen = true;
    }
  }

  /**
   * Record API success
   */
  private recordSuccess(): void {
    this.circuitBreaker.failureCount = 0;
    this.circuitBreaker.isOpen = false;
  }

  /**
   * Make API request with retry logic
   */
  private async makeRequest<T>(
    endpoint: string,
    data: any,
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    if (this.config.useMockData || this.isCircuitBreakerOpen()) {
      return this.getMockData<T>(endpoint, data);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.config.apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Request-ID': `timesfm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      this.recordSuccess();
      
      return {
        success: true,
        data: result,
        metadata: {
          source: 'timesfm-api',
          timestamp: new Date().toISOString(),
          requestId: response.headers.get('X-Request-ID')
        }
      };

    } catch (error) {
      console.warn(`TimesFM API request failed (attempt ${retryCount + 1}):`, error);
      
      if (retryCount < this.config.retryAttempts) {
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest<T>(endpoint, data, retryCount + 1);
      }

      this.recordFailure();
      return this.getMockData<T>(endpoint, data);
    }
  }

  /**
   * Get mock data for fallback
   */
  private async getMockData<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, this.config.mockDelay));

    try {
      let mockData: any;

      switch (endpoint) {
        case '/api/yield-prediction':
          mockData = this.generateMockYieldData(data);
          break;
        case '/api/market-intelligence':
          mockData = this.generateMockMarketData(data);
          break;
        case '/api/weather-data':
          mockData = this.generateMockWeatherData(data);
          break;
        case '/api/comprehensive-forecast':
          mockData = this.generateMockComprehensiveData(data);
          break;
        default:
          throw new Error(`Unknown endpoint: ${endpoint}`);
      }

      return {
        success: true,
        data: mockData,
        metadata: {
          source: 'mock-data',
          timestamp: new Date().toISOString(),
          warning: 'Using mock data - TimesFM API unavailable'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate mock data'
      };
    }
  }

  /**
   * Generate mock yield data
   */
  private generateMockYieldData(request: TimesFMRequest): TimesFMYieldResponse {
    const mockData = getMockYieldData(
      request.cropType,
      request.variety || 'default',
      request.region || 'punjab'
    );

    return {
      fieldId: request.fieldId,
      cropType: request.cropType,
      variety: request.variety || 'default',
      predictedYield: mockData.predictedYield,
      scenarios: mockData.scenarios,
      riskFactors: mockData.riskFactors,
      growthStages: mockData.growthStages,
      modelInfo: {
        model: 'TimesFM-Mock-Yield',
        version: '1.0.0',
        accuracy: mockData.predictedYield.confidence,
        lastUpdated: new Date().toISOString()
      }
    };
  }

  /**
   * Generate mock market data
   */
  private generateMockMarketData(request: TimesFMRequest): TimesFMMarketResponse {
    const mockData = getMockMarketData(
      request.cropType,
      request.region || 'punjab',
      request.variety
    );

    return {
      commodity: request.cropType,
      region: request.region || 'punjab',
      currentPrice: mockData.baselinePrice,
      priceTrend: mockData.trend,
      volatility: mockData.volatility,
      forecast: mockData.forecast,
      recommendations: mockData.recommendations,
      marketFactors: mockData.marketFactors,
      modelInfo: {
        model: 'TimesFM-Mock-Market',
        version: '1.0.0',
        accuracy: 0.85,
        lastUpdated: new Date().toISOString()
      }
    };
  }

  /**
   * Generate mock weather data
   */
  private generateMockWeatherData(request: TimesFMRequest): TimesFMWeatherResponse {
    const coordinates = request.coordinates || { lat: 30.9010, lng: 75.8573 };
    const mockData = getMockWeatherData(coordinates.lat, coordinates.lng);

    return {
      ...mockData,
      modelInfo: {
        model: 'TimesFM-Mock-Weather',
        version: '1.0.0',
        accuracy: 0.90,
        lastUpdated: new Date().toISOString()
      }
    };
  }

  /**
   * Generate mock comprehensive data
   */
  private generateMockComprehensiveData(request: TimesFMRequest): TimesFMComprehensiveResponse {
    const yieldData = this.generateMockYieldData(request);
    const marketData = this.generateMockMarketData(request);
    const weatherData = this.generateMockWeatherData(request);

    // Generate integrated recommendations
    const integratedRecommendations = this.generateIntegratedRecommendations(
      yieldData,
      marketData,
      weatherData
    );

    // Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(
      yieldData,
      marketData,
      weatherData
    );

    return {
      fieldId: request.fieldId,
      timestamp: new Date().toISOString(),
      yield: yieldData,
      market: marketData,
      weather: weatherData,
      integratedRecommendations,
      performanceMetrics
    };
  }

  /**
   * Generate integrated recommendations
   */
  private generateIntegratedRecommendations(
    yieldData: TimesFMYieldResponse,
    marketData: TimesFMMarketResponse,
    weatherData: TimesFMWeatherResponse
  ): TimesFMComprehensiveResponse['integratedRecommendations'] {
    const recommendations: TimesFMComprehensiveResponse['integratedRecommendations'] = [];

    // Yield-based recommendations
    if (yieldData.predictedYield.confidence < 0.7) {
      recommendations.push({
        category: 'fertilizer',
        priority: 'high',
        title: 'Improve Yield Prediction Accuracy',
        description: 'Yield prediction confidence is low. Consider additional soil testing and field monitoring.',
        actionItems: ['Conduct soil analysis', 'Install field sensors', 'Monitor crop growth stages'],
        estimatedCost: 5000,
        expectedImpact: 'Improved yield prediction accuracy by 20%',
        implementationWindow: 'Next 2 weeks'
      });
    }

    // Risk-based recommendations
    const criticalRisks = yieldData.riskFactors.filter(r => r.severity === 'critical');
    criticalRisks.forEach(risk => {
      recommendations.push({
        category: 'pest_control',
        priority: 'critical',
        title: `Address ${risk.factor}`,
        description: risk.impact,
        actionItems: [risk.recommendation],
        estimatedCost: 3000,
        expectedImpact: 'Risk mitigation',
        implementationWindow: 'Immediate'
      });
    });

    // Market-based recommendations
    if (marketData.priceTrend === 'up' && marketData.volatility < 0.2) {
      recommendations.push({
        category: 'harvest',
        priority: 'medium',
        title: 'Optimize Harvest Timing',
        description: 'Prices are trending upward with low volatility. Consider timing harvest for maximum returns.',
        actionItems: ['Monitor price trends', 'Plan harvest timing', 'Prepare storage facilities'],
        estimatedCost: 0,
        expectedImpact: 'Better market returns',
        implementationWindow: 'Next 4 weeks'
      });
    }

    // Weather-based recommendations
    const extremeWeather = weatherData.seasonal.extremeEvents.find(e => e.probability > 0.3);
    if (extremeWeather) {
      recommendations.push({
        category: 'irrigation',
        priority: 'high',
        title: `Prepare for ${extremeWeather.type}`,
        description: `High probability of ${extremeWeather.type} with ${extremeWeather.impact} impact.`,
        actionItems: ['Install weather monitoring', 'Prepare contingency plans', 'Adjust irrigation schedule'],
        estimatedCost: 2000,
        expectedImpact: 'Risk mitigation',
        implementationWindow: 'Next 1 week'
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
    yieldData: TimesFMYieldResponse,
    marketData: TimesFMMarketResponse,
    weatherData: TimesFMWeatherResponse
  ): TimesFMComprehensiveResponse['performanceMetrics'] {
    const yieldImprovement = yieldData.predictedYield.confidence > 0.8 ? 15 : 5;
    const costSavings = marketData.priceTrend === 'up' ? 10 : 0;
    const waterEfficiency = weatherData.current.humidity > 60 ? 85 : 70;
    
    const riskFactors = yieldData.riskFactors.filter(r => r.severity === 'high' || r.severity === 'critical');
    const riskLevel = riskFactors.length > 2 ? 'high' : riskFactors.length > 0 ? 'medium' : 'low';
    
    const overallScore = Math.min(100, (
      yieldData.predictedYield.confidence * 30 +
      (marketData.volatility < 0.2 ? 25 : 15) +
      waterEfficiency * 0.25 +
      (riskLevel === 'low' ? 20 : riskLevel === 'medium' ? 15 : 10)
    ));

    return {
      yieldImprovement,
      costSavings,
      waterEfficiency,
      riskLevel,
      overallScore: Math.round(overallScore)
    };
  }

  /**
   * Get yield prediction
   */
  async getYieldPrediction(request: TimesFMRequest): Promise<ApiResponse<TimesFMYieldResponse>> {
    return this.makeRequest<TimesFMYieldResponse>('/api/yield-prediction', request);
  }

  /**
   * Get market intelligence
   */
  async getMarketIntelligence(request: TimesFMRequest): Promise<ApiResponse<TimesFMMarketResponse>> {
    return this.makeRequest<TimesFMMarketResponse>('/api/market-intelligence', request);
  }

  /**
   * Get weather data
   */
  async getWeatherData(request: TimesFMRequest): Promise<ApiResponse<TimesFMWeatherResponse>> {
    return this.makeRequest<TimesFMWeatherResponse>('/api/weather-data', request);
  }

  /**
   * Get comprehensive forecast
   */
  async getComprehensiveForecast(request: TimesFMRequest): Promise<ApiResponse<TimesFMComprehensiveResponse>> {
    return this.makeRequest<TimesFMComprehensiveResponse>('/api/comprehensive-forecast', request);
  }

  /**
   * Get service status
   */
  getServiceStatus(): {
    isHealthy: boolean;
    isUsingMockData: boolean;
    circuitBreakerOpen: boolean;
    lastFailureTime?: number;
    failureCount: number;
  } {
    return {
      isHealthy: !this.circuitBreaker.isOpen,
      isUsingMockData: this.config.useMockData,
      circuitBreakerOpen: this.circuitBreaker.isOpen,
      lastFailureTime: this.circuitBreaker.lastFailureTime || undefined,
      failureCount: this.circuitBreaker.failureCount
    };
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(): void {
    this.circuitBreaker.isOpen = false;
    this.circuitBreaker.failureCount = 0;
    this.circuitBreaker.lastFailureTime = 0;
  }
}

// Export singleton instance
export const enhancedTimesFMService = new EnhancedTimesFMService();

