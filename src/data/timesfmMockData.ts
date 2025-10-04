/**
 * TimesFM Mock Data for Market Analysis and Forecasting
 * Comprehensive mock datasets for different crops, regions, and scenarios
 */

export interface TimesFMMockMarketData {
  commodity: string;
  region: string;
  district?: string;
  variety?: string;
  baselinePrice: number;
  weeklyPrices: number[];
  monthlyPrices: number[];
  volatility: number;
  trend: 'up' | 'down' | 'stable' | 'volatile';
  seasonality: {
    peak: number; // month (0-11)
    low: number;  // month (0-11)
    amplitude: number; // price variation factor
  };
  recommendations: string[];
  marketFactors: {
    demand: 'high' | 'medium' | 'low';
    supply: 'high' | 'medium' | 'low';
    governmentSupport: 'msp' | 'subsidy' | 'none';
    exportPotential: 'high' | 'medium' | 'low';
  };
  forecast: Array<{
    weekOffset: number;
    predicted: number;
    low: number;
    high: number;
    confidence: number;
    factors: string[];
  }>;
}

export interface TimesFMMockYieldData {
  cropType: string;
  variety: string;
  region: string;
  plantingDate: string;
  expectedHarvest: string;
  currentStage: string;
  stageProgress: number;
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
}

export interface TimesFMMockWeatherData {
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
    pressure: number;
    uvIndex: number;
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
}

// Market Data by Crop and Region
export const TIMESFM_MOCK_MARKET_DATA: Record<string, TimesFMMockMarketData> = {
  'rice_punjab': {
    commodity: 'rice',
    region: 'punjab',
    district: 'ludhiana',
    variety: 'PR-126',
    baselinePrice: 2450,
    weeklyPrices: [2420, 2460, 2480, 2510, 2530, 2550, 2570],
    monthlyPrices: [2400, 2450, 2500, 2550, 2600, 2650, 2700, 2750, 2800, 2850, 2900, 2950],
    volatility: 0.16,
    trend: 'up',
    seasonality: {
      peak: 9, // October
      low: 3,  // April
      amplitude: 0.25
    },
    recommendations: [
      'Monitor MSP announcements this month',
      'Stagger sales in 2-3 lots for better price realization',
      'Leverage local mandi days with higher footfall',
      'Consider storage if prices are below MSP'
    ],
    marketFactors: {
      demand: 'high',
      supply: 'medium',
      governmentSupport: 'msp',
      exportPotential: 'high'
    },
    forecast: [
      { weekOffset: 1, predicted: 2490, low: 2360, high: 2620, confidence: 0.85, factors: ['MSP announcement', 'Harvest pressure'] },
      { weekOffset: 2, predicted: 2520, low: 2390, high: 2650, confidence: 0.82, factors: ['Export demand', 'Storage capacity'] },
      { weekOffset: 3, predicted: 2550, low: 2420, high: 2680, confidence: 0.80, factors: ['Festival demand', 'Supply constraints'] },
      { weekOffset: 4, predicted: 2580, low: 2450, high: 2710, confidence: 0.78, factors: ['Winter storage', 'Quality premium'] }
    ]
  },
  'wheat_punjab': {
    commodity: 'wheat',
    region: 'punjab',
    district: 'amritsar',
    variety: 'HD-3086',
    baselinePrice: 2150,
    weeklyPrices: [2120, 2140, 2160, 2180, 2200, 2220, 2240],
    monthlyPrices: [2100, 2120, 2140, 2160, 2180, 2200, 2220, 2240, 2260, 2280, 2300, 2320],
    volatility: 0.12,
    trend: 'stable',
    seasonality: {
      peak: 4, // May
      low: 10, // November
      amplitude: 0.15
    },
    recommendations: [
      'Monitor government procurement announcements',
      'Prepare for rabi harvest season',
      'Check quality parameters for procurement',
      'Plan storage for off-season sales'
    ],
    marketFactors: {
      demand: 'medium',
      supply: 'high',
      governmentSupport: 'msp',
      exportPotential: 'medium'
    },
    forecast: [
      { weekOffset: 1, predicted: 2170, low: 2050, high: 2290, confidence: 0.88, factors: ['Procurement season', 'Quality standards'] },
      { weekOffset: 2, predicted: 2190, low: 2070, high: 2310, confidence: 0.85, factors: ['Storage capacity', 'Export demand'] },
      { weekOffset: 3, predicted: 2210, low: 2090, high: 2330, confidence: 0.82, factors: ['Market sentiment', 'Supply chain'] },
      { weekOffset: 4, predicted: 2230, low: 2110, high: 2350, confidence: 0.80, factors: ['Seasonal patterns', 'Government policies'] }
    ]
  },
  'cotton_punjab': {
    commodity: 'cotton',
    region: 'punjab',
    district: 'bathinda',
    variety: 'BT Cotton',
    baselinePrice: 6800,
    weeklyPrices: [6750, 6800, 6850, 6900, 6950, 7000, 7050],
    monthlyPrices: [6700, 6800, 6900, 7000, 7100, 7200, 7300, 7400, 7500, 7600, 7700, 7800],
    volatility: 0.22,
    trend: 'up',
    seasonality: {
      peak: 10, // November
      low: 5,   // June
      amplitude: 0.30
    },
    recommendations: [
      'Monitor international cotton prices',
      'Check quality parameters (staple length, micronaire)',
      'Consider forward contracts for price protection',
      'Monitor pest and disease reports'
    ],
    marketFactors: {
      demand: 'high',
      supply: 'medium',
      governmentSupport: 'msp',
      exportPotential: 'high'
    },
    forecast: [
      { weekOffset: 1, predicted: 6900, low: 6550, high: 7250, confidence: 0.75, factors: ['International prices', 'Quality premium'] },
      { weekOffset: 2, predicted: 7000, low: 6650, high: 7350, confidence: 0.72, factors: ['Export demand', 'Supply constraints'] },
      { weekOffset: 3, predicted: 7100, low: 6750, high: 7450, confidence: 0.70, factors: ['Market sentiment', 'Quality standards'] },
      { weekOffset: 4, predicted: 7200, low: 6850, high: 7550, confidence: 0.68, factors: ['Seasonal demand', 'Storage costs'] }
    ]
  },
  'maize_punjab': {
    commodity: 'maize',
    region: 'punjab',
    district: 'kapurthala',
    variety: 'Hybrid',
    baselinePrice: 1850,
    weeklyPrices: [1820, 1840, 1860, 1880, 1900, 1920, 1940],
    monthlyPrices: [1800, 1820, 1840, 1860, 1880, 1900, 1920, 1940, 1960, 1980, 2000, 2020],
    volatility: 0.18,
    trend: 'up',
    seasonality: {
      peak: 8, // September
      low: 2,  // March
      amplitude: 0.20
    },
    recommendations: [
      'Monitor poultry and dairy industry demand',
      'Check moisture content for storage',
      'Consider ethanol industry demand',
      'Monitor international maize prices'
    ],
    marketFactors: {
      demand: 'high',
      supply: 'medium',
      governmentSupport: 'none',
      exportPotential: 'medium'
    },
    forecast: [
      { weekOffset: 1, predicted: 1870, low: 1770, high: 1970, confidence: 0.80, factors: ['Poultry demand', 'Storage capacity'] },
      { weekOffset: 2, predicted: 1890, low: 1790, high: 1990, confidence: 0.78, factors: ['Ethanol demand', 'Quality standards'] },
      { weekOffset: 3, predicted: 1910, low: 1810, high: 2010, confidence: 0.75, factors: ['Export potential', 'Supply chain'] },
      { weekOffset: 4, predicted: 1930, low: 1830, high: 2030, confidence: 0.73, factors: ['Seasonal patterns', 'Market sentiment'] }
    ]
  }
};

// Yield Data by Crop and Variety
export const TIMESFM_MOCK_YIELD_DATA: Record<string, TimesFMMockYieldData> = {
  'rice_pr126_punjab': {
    cropType: 'rice',
    variety: 'PR-126',
    region: 'punjab',
    plantingDate: '2024-06-15',
    expectedHarvest: '2024-10-15',
    currentStage: 'reproductive',
    stageProgress: 0.65,
    predictedYield: {
      tonsPerAcre: 4.2,
      quintalsPerAcre: 42,
      totalTons: 10.5,
      confidence: 0.85
    },
    scenarios: {
      drought: 3.2,
      normal: 4.2,
      optimal: 5.1
    },
    riskFactors: [
      {
        factor: 'Water stress',
        severity: 'medium',
        impact: 'Reduced grain filling',
        recommendation: 'Increase irrigation frequency',
        probability: 0.3
      },
      {
        factor: 'Pest attack (Brown Plant Hopper)',
        severity: 'high',
        impact: 'Yield loss up to 30%',
        recommendation: 'Apply recommended pesticides immediately',
        probability: 0.4
      },
      {
        factor: 'Nutrient deficiency (Nitrogen)',
        severity: 'low',
        impact: 'Reduced tillering',
        recommendation: 'Apply urea 25kg/acre',
        probability: 0.2
      }
    ],
    growthStages: [
      {
        stage: 'Germination',
        startDate: '2024-06-15',
        endDate: '2024-06-25',
        duration: 10,
        keyActivities: ['Seed treatment', 'Field preparation', 'Sowing'],
        weatherSensitivity: 0.8
      },
      {
        stage: 'Vegetative',
        startDate: '2024-06-25',
        endDate: '2024-08-15',
        duration: 50,
        keyActivities: ['Weeding', 'Fertilizer application', 'Pest monitoring'],
        weatherSensitivity: 0.6
      },
      {
        stage: 'Reproductive',
        startDate: '2024-08-15',
        endDate: '2024-09-30',
        duration: 45,
        keyActivities: ['Panicle initiation', 'Flowering', 'Grain filling'],
        weatherSensitivity: 0.9
      },
      {
        stage: 'Maturity',
        startDate: '2024-09-30',
        endDate: '2024-10-15',
        duration: 15,
        keyActivities: ['Harvest planning', 'Quality assessment', 'Storage preparation'],
        weatherSensitivity: 0.7
      }
    ]
  },
  'wheat_hd3086_punjab': {
    cropType: 'wheat',
    variety: 'HD-3086',
    region: 'punjab',
    plantingDate: '2024-11-15',
    expectedHarvest: '2024-04-15',
    currentStage: 'vegetative',
    stageProgress: 0.35,
    predictedYield: {
      tonsPerAcre: 3.8,
      quintalsPerAcre: 38,
      totalTons: 9.5,
      confidence: 0.88
    },
    scenarios: {
      drought: 2.9,
      normal: 3.8,
      optimal: 4.6
    },
    riskFactors: [
      {
        factor: 'Terminal heat stress',
        severity: 'high',
        impact: 'Reduced grain weight',
        recommendation: 'Apply late irrigation and foliar spray',
        probability: 0.5
      },
      {
        factor: 'Yellow rust',
        severity: 'medium',
        impact: 'Leaf damage and yield loss',
        recommendation: 'Apply fungicide spray',
        probability: 0.3
      },
      {
        factor: 'Nitrogen deficiency',
        severity: 'low',
        impact: 'Reduced tillering',
        recommendation: 'Apply nitrogen fertilizer',
        probability: 0.2
      }
    ],
    growthStages: [
      {
        stage: 'Germination',
        startDate: '2024-11-15',
        endDate: '2024-11-25',
        duration: 10,
        keyActivities: ['Seed treatment', 'Field preparation', 'Sowing'],
        weatherSensitivity: 0.7
      },
      {
        stage: 'Vegetative',
        startDate: '2024-11-25',
        endDate: '2024-02-15',
        duration: 80,
        keyActivities: ['Weeding', 'Fertilizer application', 'Pest monitoring'],
        weatherSensitivity: 0.5
      },
      {
        stage: 'Reproductive',
        startDate: '2024-02-15',
        endDate: '2024-03-30',
        duration: 45,
        keyActivities: ['Tillering', 'Stem elongation', 'Heading'],
        weatherSensitivity: 0.8
      },
      {
        stage: 'Maturity',
        startDate: '2024-03-30',
        endDate: '2024-04-15',
        duration: 15,
        keyActivities: ['Grain filling', 'Harvest planning', 'Quality assessment'],
        weatherSensitivity: 0.9
      }
    ]
  }
};

// Weather Data by Location
export const TIMESFM_MOCK_WEATHER_DATA: Record<string, TimesFMMockWeatherData> = {
  'ludhiana_punjab': {
    location: {
      lat: 30.9010,
      lng: 75.8573,
      district: 'Ludhiana',
      state: 'Punjab'
    },
    current: {
      temperature: 28.5,
      humidity: 65,
      precipitation: 0,
      windSpeed: 12,
      pressure: 1013,
      uvIndex: 6
    },
    forecast: Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dayTemp = 25 + Math.sin(i * 0.3) * 5 + Math.random() * 3;
      const minTemp = dayTemp - 5 - Math.random() * 2;
      const maxTemp = dayTemp + 3 + Math.random() * 2;
      
      return {
        date: date.toISOString().split('T')[0],
        temperature: { min: minTemp, max: maxTemp, avg: dayTemp },
        humidity: 60 + Math.random() * 20,
        precipitation: Math.random() > 0.7 ? Math.random() * 5 : 0,
        windSpeed: 5 + Math.random() * 15,
        pressure: 1010 + Math.random() * 20,
        uvIndex: Math.max(0, 3 + Math.random() * 7),
        conditions: i % 3 === 0 ? 'Partly Cloudy' : 'Clear',
        alerts: dayTemp > 35 ? ['Heat wave warning'] : []
      };
    }),
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
        },
        {
          type: 'storm',
          probability: 0.4,
          impact: 'medium',
          period: 'July-September'
        }
      ]
    }
  },
  'amritsar_punjab': {
    location: {
      lat: 31.6340,
      lng: 74.8723,
      district: 'Amritsar',
      state: 'Punjab'
    },
    current: {
      temperature: 26.8,
      humidity: 68,
      precipitation: 0,
      windSpeed: 14,
      pressure: 1015,
      uvIndex: 5
    },
    forecast: Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dayTemp = 24 + Math.sin(i * 0.2) * 4 + Math.random() * 2;
      const minTemp = dayTemp - 4 - Math.random() * 2;
      const maxTemp = dayTemp + 2 + Math.random() * 2;
      
      return {
        date: date.toISOString().split('T')[0],
        temperature: { min: minTemp, max: maxTemp, avg: dayTemp },
        humidity: 65 + Math.random() * 15,
        precipitation: Math.random() > 0.8 ? Math.random() * 3 : 0,
        windSpeed: 8 + Math.random() * 12,
        pressure: 1012 + Math.random() * 18,
        uvIndex: Math.max(0, 2 + Math.random() * 6),
        conditions: i % 4 === 0 ? 'Partly Cloudy' : 'Clear',
        alerts: dayTemp > 32 ? ['Heat wave warning'] : []
      };
    }),
    seasonal: {
      avgTemperature: 24.2,
      avgRainfall: 580,
      monsoonPeriod: { start: '2024-07-01', end: '2024-09-30' },
      extremeEvents: [
        {
          type: 'heatwave',
          probability: 0.25,
          impact: 'medium',
          period: 'April-June'
        },
        {
          type: 'drought',
          probability: 0.15,
          impact: 'low',
          period: 'March-May'
        },
        {
          type: 'storm',
          probability: 0.35,
          impact: 'medium',
          period: 'July-September'
        }
      ]
    }
  }
};

// Helper functions to get mock data
export function getMockMarketData(crop: string, region: string, variety?: string): TimesFMMockMarketData {
  const key = `${crop}_${region}${variety ? `_${variety}` : ''}`.toLowerCase();
  return TIMESFM_MOCK_MARKET_DATA[key] || TIMESFM_MOCK_MARKET_DATA['rice_punjab'];
}

export function getMockYieldData(crop: string, variety: string, region: string): TimesFMMockYieldData {
  const key = `${crop}_${variety}_${region}`.toLowerCase();
  return TIMESFM_MOCK_YIELD_DATA[key] || TIMESFM_MOCK_YIELD_DATA['rice_pr126_punjab'];
}

export function getMockWeatherData(lat: number, lng: number): TimesFMMockWeatherData {
  // Simple location matching - in real implementation, use proper geocoding
  if (lat > 30.5 && lat < 31.5 && lng > 74.5 && lng < 76.5) {
    return TIMESFM_MOCK_WEATHER_DATA['ludhiana_punjab'];
  }
  return TIMESFM_MOCK_WEATHER_DATA['amritsar_punjab'];
}

// Generate realistic forecast data based on historical patterns
export function generateForecastData(
  baseValue: number,
  trend: 'up' | 'down' | 'stable' | 'volatile',
  volatility: number,
  periods: number,
  seasonality?: { peak: number; low: number; amplitude: number }
): number[] {
  const data: number[] = [];
  let currentValue = baseValue;
  
  for (let i = 0; i < periods; i++) {
    // Apply trend
    let trendFactor = 1;
    switch (trend) {
      case 'up':
        trendFactor = 1 + (i * 0.01);
        break;
      case 'down':
        trendFactor = 1 - (i * 0.01);
        break;
      case 'volatile':
        trendFactor = 1 + (Math.sin(i * 0.5) * 0.05);
        break;
      default:
        trendFactor = 1;
    }
    
    // Apply seasonality if provided
    if (seasonality) {
      const month = (i % 12);
      const seasonalFactor = 1 + (seasonality.amplitude * Math.sin((month - seasonality.peak) * Math.PI / 6));
      trendFactor *= seasonalFactor;
    }
    
    // Apply random volatility
    const randomFactor = 1 + (Math.random() - 0.5) * volatility;
    
    currentValue = baseValue * trendFactor * randomFactor;
    data.push(Math.max(0, currentValue));
  }
  
  return data;
}

// Generate confidence intervals
export function generateConfidenceIntervals(
  predictions: number[],
  confidence: number = 0.8
): number[][] {
  const zScore = confidence === 0.8 ? 1.28 : confidence === 0.9 ? 1.64 : 1.96;
  
  return predictions.map(value => {
    const margin = value * 0.1 * zScore; // 10% margin of error
    return [Math.max(0, value - margin), value + margin];
  });
}

