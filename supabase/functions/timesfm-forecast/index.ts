/**
 * TimesFM Forecasting Edge Function
 * Handles AI forecasting requests and integrates with TimesFM API
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface TimesFMRequest {
  fieldId: string;
  cropType: string;
  variety?: string;
  region?: string;
  district?: string;
  coordinates?: { lat: number; lng: number };
  plantingDate?: string;
  area?: number;
  forecastType: 'yield' | 'market' | 'weather' | 'comprehensive';
  metadata?: Record<string, any>;
}

interface TimesFMResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    source: 'timesfm-api' | 'mock-data' | 'fallback';
    timestamp: string;
    processingTime: number;
    requestId: string;
  };
}

// TimesFM API configuration
const TIMESFM_CONFIG = {
  apiUrl: Deno.env.get('TIMESFM_API_URL') || 'https://timesfm.onrender.com',
  apiKey: Deno.env.get('TIMESFM_API_KEY') || '',
  timeout: 30000,
  retryAttempts: 3,
  useMockData: Deno.env.get('TIMESFM_USE_MOCK') === 'true' || !Deno.env.get('TIMESFM_API_KEY'),
};

// Mock data generators
const generateMockYieldData = (request: TimesFMRequest) => {
  const baseYield = request.cropType === 'rice' ? 4.2 : 
                   request.cropType === 'wheat' ? 3.8 : 
                   request.cropType === 'cotton' ? 2.5 : 3.0;
  
  const confidence = 0.75 + Math.random() * 0.2;
  
  return {
    fieldId: request.fieldId,
    cropType: request.cropType,
    variety: request.variety || 'default',
    predictedYield: {
      tonsPerAcre: baseYield + (Math.random() - 0.5) * 0.5,
      quintalsPerAcre: (baseYield + (Math.random() - 0.5) * 0.5) * 10,
      totalTons: (baseYield + (Math.random() - 0.5) * 0.5) * (request.area || 2.5),
      confidence: confidence
    },
    scenarios: {
      drought: baseYield * 0.7,
      normal: baseYield,
      optimal: baseYield * 1.2
    },
    riskFactors: [
      {
        factor: 'Water stress',
        severity: Math.random() > 0.5 ? 'medium' : 'low',
        impact: 'Reduced grain filling',
        recommendation: 'Increase irrigation frequency',
        probability: 0.3
      },
      {
        factor: 'Pest attack',
        severity: Math.random() > 0.7 ? 'high' : 'medium',
        impact: 'Yield loss up to 25%',
        recommendation: 'Apply recommended pesticides',
        probability: 0.4
      }
    ],
    growthStages: [
      {
        stage: 'Vegetative',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        keyActivities: ['Weeding', 'Fertilizer application', 'Pest monitoring'],
        weatherSensitivity: 0.6
      },
      {
        stage: 'Reproductive',
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 30,
        keyActivities: ['Flowering', 'Grain filling', 'Quality monitoring'],
        weatherSensitivity: 0.9
      }
    ],
    modelInfo: {
      model: 'TimesFM-Mock-Yield',
      version: '1.0.0',
      accuracy: confidence,
      lastUpdated: new Date().toISOString()
    }
  };
};

const generateMockMarketData = (request: TimesFMRequest) => {
  const basePrice = request.cropType === 'rice' ? 2450 :
                   request.cropType === 'wheat' ? 2150 :
                   request.cropType === 'cotton' ? 6800 : 2000;
  
  const volatility = 0.15 + Math.random() * 0.1;
  const trend = Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down';
  
  return {
    commodity: request.cropType,
    region: request.region || 'punjab',
    currentPrice: basePrice + (Math.random() - 0.5) * 200,
    priceTrend: trend,
    volatility: volatility,
    forecast: Array.from({ length: 4 }, (_, i) => ({
      weekOffset: i + 1,
      predicted: basePrice + (Math.random() - 0.5) * 300,
      low: basePrice * 0.9,
      high: basePrice * 1.1,
      confidence: 0.8 + Math.random() * 0.15,
      factors: ['Market demand', 'Supply chain', 'Government policies']
    })),
    recommendations: [
      'Monitor MSP announcements',
      'Stagger sales for better price realization',
      'Check quality parameters',
      'Consider storage for off-season sales'
    ],
    marketFactors: {
      demand: Math.random() > 0.5 ? 'high' : 'medium',
      supply: Math.random() > 0.5 ? 'medium' : 'high',
      governmentSupport: 'msp',
      exportPotential: Math.random() > 0.5 ? 'high' : 'medium'
    },
    modelInfo: {
      model: 'TimesFM-Mock-Market',
      version: '1.0.0',
      accuracy: 0.85,
      lastUpdated: new Date().toISOString()
    }
  };
};

const generateMockWeatherData = (request: TimesFMRequest) => {
  const lat = request.coordinates?.lat || 30.9010;
  const lng = request.coordinates?.lng || 75.8573;
  
  return {
    location: {
      lat,
      lng,
      district: request.district || 'Ludhiana',
      state: request.region || 'Punjab'
    },
    current: {
      temperature: 25 + Math.random() * 10,
      humidity: 60 + Math.random() * 20,
      precipitation: Math.random() * 5,
      windSpeed: 5 + Math.random() * 15,
      pressure: 1010 + Math.random() * 20,
      uvIndex: 3 + Math.random() * 7
    },
    forecast: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
      temperature: {
        min: 15 + Math.random() * 10,
        max: 25 + Math.random() * 15,
        avg: 20 + Math.random() * 12
      },
      humidity: 50 + Math.random() * 30,
      precipitation: Math.random() * 10,
      windSpeed: 5 + Math.random() * 15,
      conditions: ['Clear', 'Partly Cloudy', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
      alerts: Math.random() > 0.8 ? ['Heat wave warning'] : []
    })),
    seasonal: {
      avgTemperature: 25.5,
      avgRainfall: 650,
      monsoonPeriod: { start: '2024-07-01', end: '2024-09-30' },
      extremeEvents: [
        {
          type: 'heatwave',
          probability: 0.3,
          impact: 'high',
          period: 'April-June'
        },
        {
          type: 'drought',
          probability: 0.2,
          impact: 'medium',
          period: 'March-May'
        }
      ]
    },
    modelInfo: {
      model: 'TimesFM-Mock-Weather',
      version: '1.0.0',
      accuracy: 0.90,
      lastUpdated: new Date().toISOString()
    }
  };
};

// Make request to TimesFM API
async function callTimesFMAPI(endpoint: string, data: any): Promise<any> {
  if (TIMESFM_CONFIG.useMockData) {
    throw new Error('Mock data mode enabled');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMESFM_CONFIG.timeout);

  try {
    const response = await fetch(`${TIMESFM_CONFIG.apiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TIMESFM_CONFIG.apiKey}`,
        'X-Request-ID': `timesfm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();

  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Main handler
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const requestId = `timesfm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request
    const request: TimesFMRequest = await req.json();

    if (!request.fieldId || !request.cropType || !request.forecastType) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: fieldId, cropType, forecastType'
        } as TimesFMResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let data: any;
    let source: 'timesfm-api' | 'mock-data' | 'fallback' = 'mock-data';

    try {
      // Try TimesFM API first
      switch (request.forecastType) {
        case 'yield':
          data = await callTimesFMAPI('/api/yield-prediction', request);
          source = 'timesfm-api';
          break;
        case 'market':
          data = await callTimesFMAPI('/api/market-intelligence', request);
          source = 'timesfm-api';
          break;
        case 'weather':
          data = await callTimesFMAPI('/api/weather-data', request);
          source = 'timesfm-api';
          break;
        case 'comprehensive':
          data = await callTimesFMAPI('/api/comprehensive-forecast', request);
          source = 'timesfm-api';
          break;
        default:
          throw new Error(`Unknown forecast type: ${request.forecastType}`);
      }

    } catch (error) {
      console.warn('TimesFM API call failed, using mock data:', error);
      
      // Generate mock data based on forecast type
      switch (request.forecastType) {
        case 'yield':
          data = generateMockYieldData(request);
          break;
        case 'market':
          data = generateMockMarketData(request);
          break;
        case 'weather':
          data = generateMockWeatherData(request);
          break;
        case 'comprehensive':
          data = {
            fieldId: request.fieldId,
            timestamp: new Date().toISOString(),
            yield: generateMockYieldData(request),
            market: generateMockMarketData(request),
            weather: generateMockWeatherData(request),
            integratedRecommendations: [
              {
                category: 'fertilizer',
                priority: 'medium',
                title: 'Apply Nitrogen Fertilizer',
                description: 'Based on current growth stage and soil conditions',
                actionItems: ['Apply urea 25kg/acre', 'Monitor plant response'],
                estimatedCost: 2000,
                expectedImpact: 'Improved yield by 10-15%',
                implementationWindow: 'Next 1 week'
              }
            ],
            performanceMetrics: {
              yieldImprovement: 12,
              costSavings: 8,
              waterEfficiency: 85,
              riskLevel: 'medium',
              overallScore: 78
            }
          };
          break;
      }
      source = 'fallback';
    }

    // Store forecast result in database
    try {
      const { error: dbError } = await supabaseClient
        .from('forecast_results')
        .insert({
          field_id: request.fieldId,
          forecast_type: request.forecastType,
          request_data: request,
          response_data: data,
          source: source,
          processing_time: Date.now() - startTime,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Failed to store forecast result:', dbError);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    const response: TimesFMResponse = {
      success: true,
      data: data,
      metadata: {
        source: source,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        requestId: requestId
      }
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('TimesFM forecast error:', error);

    const response: TimesFMResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      metadata: {
        source: 'fallback',
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        requestId: requestId
      }
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

