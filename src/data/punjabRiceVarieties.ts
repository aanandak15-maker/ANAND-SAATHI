/**
 * Punjab Rice Varieties Database
 * Comprehensive data for Punjab-specific rice cultivation
 * Based on Punjab Agricultural University and Government recommendations
 */

export interface PunjabRiceVariety {
  id: string;
  name: string;
  localName: string; // Punjabi name
  maturityDays: number;
  avgYield: number; // quintals per acre
  waterRequirement: 'high' | 'medium' | 'low';
  diseaseResistance: string[];
  suitableDistricts: string[];
  banned: boolean;
  plantingWindow: {
    start: string; // Month
    end: string; // Month
  };
  characteristics: {
    grainType: 'long' | 'medium' | 'short';
    cookingQuality: 'excellent' | 'good' | 'average';
    marketPrice: 'premium' | 'standard' | 'economy';
    parboilingSuitable: boolean;
  };
  phenologyStages: {
    germination: number; // days
    tillering: number; // days
    panicleInitiation: number; // days
    flowering: number; // days
    grainFilling: number; // days
    maturity: number; // days
  };
  ndviThresholds: {
    germination: { min: number; max: number };
    vegetative: { min: number; max: number };
    reproductive: { min: number; max: number };
    maturity: { min: number; max: number };
  };
  recommendations: {
    fertilizer: {
      nitrogen: number; // kg/acre
      phosphorus: number; // kg/acre
      potassium: number; // kg/acre
    };
    irrigation: {
      frequency: string;
      depth: string;
      criticalPeriods: string[];
    };
    pestManagement: string[];
  };
}

export interface PunjabDistrict {
  id: string;
  name: string;
  localName: string; // Punjabi name
  region: 'Majha' | 'Malwa' | 'Doaba';
  coordinates: { lat: number; lng: number };
  avgRainfall: number; // mm
  soilType: string;
  majorCrops: string[];
  riceArea: number; // hectares
  avgYield: number; // quintals per acre
  waterTable: 'high' | 'medium' | 'low';
  climateZone: string;
  marketAccess: 'excellent' | 'good' | 'moderate';
  governmentSchemes: string[];
}

export interface PunjabPhenologyStage {
  id: string;
  name: string;
  localName: string; // Punjabi name
  description: string;
  duration: number; // days
  criticalFactors: string[];
  ndviRange: { min: number; max: number };
  managementPractices: string[];
  alerts: string[];
}

// Punjab Rice Varieties Database
export const punjabRiceVarieties: PunjabRiceVariety[] = [
  {
    id: 'pr-126',
    name: 'PR-126',
    localName: 'ਪੀਆਰ-126',
    maturityDays: 93,
    avgYield: 30,
    waterRequirement: 'medium',
    diseaseResistance: ['bacterial blight', 'blast', 'brown spot'],
    suitableDistricts: ['Amritsar', 'Ludhiana', 'Patiala', 'Sangrur', 'Bathinda'],
    banned: false,
    plantingWindow: {
      start: 'June',
      end: 'July'
    },
    characteristics: {
      grainType: 'medium',
      cookingQuality: 'excellent',
      marketPrice: 'premium',
      parboilingSuitable: true
    },
    phenologyStages: {
      germination: 7,
      tillering: 25,
      panicleInitiation: 45,
      flowering: 65,
      grainFilling: 80,
      maturity: 93
    },
    ndviThresholds: {
      germination: { min: 0.1, max: 0.3 },
      vegetative: { min: 0.4, max: 0.8 },
      reproductive: { min: 0.6, max: 0.9 },
      maturity: { min: 0.3, max: 0.6 }
    },
    recommendations: {
      fertilizer: {
        nitrogen: 120,
        phosphorus: 60,
        potassium: 40
      },
      irrigation: {
        frequency: 'Every 3-4 days',
        depth: '5-7 cm',
        criticalPeriods: ['Panicle initiation', 'Flowering', 'Grain filling']
      },
      pestManagement: ['Brown plant hopper', 'Stem borer', 'Leaf folder']
    }
  },
  {
    id: 'hkr-47',
    name: 'HKR-47',
    localName: 'ਐਚਕੇਆਰ-47',
    maturityDays: 104,
    avgYield: 29.5,
    waterRequirement: 'medium',
    diseaseResistance: ['bacterial blight', 'blast'],
    suitableDistricts: ['Amritsar', 'Ludhiana', 'Patiala', 'Sangrur'],
    banned: false,
    plantingWindow: {
      start: 'June',
      end: 'July'
    },
    characteristics: {
      grainType: 'long',
      cookingQuality: 'good',
      marketPrice: 'standard',
      parboilingSuitable: true
    },
    phenologyStages: {
      germination: 7,
      tillering: 28,
      panicleInitiation: 50,
      flowering: 70,
      grainFilling: 90,
      maturity: 104
    },
    ndviThresholds: {
      germination: { min: 0.1, max: 0.3 },
      vegetative: { min: 0.4, max: 0.8 },
      reproductive: { min: 0.6, max: 0.9 },
      maturity: { min: 0.3, max: 0.6 }
    },
    recommendations: {
      fertilizer: {
        nitrogen: 110,
        phosphorus: 55,
        potassium: 35
      },
      irrigation: {
        frequency: 'Every 3-4 days',
        depth: '5-7 cm',
        criticalPeriods: ['Panicle initiation', 'Flowering', 'Grain filling']
      },
      pestManagement: ['Brown plant hopper', 'Stem borer', 'Leaf folder']
    }
  },
  {
    id: 'pusa-44',
    name: 'Pusa-44',
    localName: 'ਪੂਸਾ-44',
    maturityDays: 125,
    avgYield: 35,
    waterRequirement: 'high',
    diseaseResistance: ['bacterial blight'],
    suitableDistricts: ['Amritsar', 'Ludhiana', 'Patiala'],
    banned: true, // Banned in Punjab due to water consumption
    plantingWindow: {
      start: 'May',
      end: 'June'
    },
    characteristics: {
      grainType: 'long',
      cookingQuality: 'excellent',
      marketPrice: 'premium',
      parboilingSuitable: true
    },
    phenologyStages: {
      germination: 7,
      tillering: 35,
      panicleInitiation: 60,
      flowering: 85,
      grainFilling: 110,
      maturity: 125
    },
    ndviThresholds: {
      germination: { min: 0.1, max: 0.3 },
      vegetative: { min: 0.4, max: 0.8 },
      reproductive: { min: 0.6, max: 0.9 },
      maturity: { min: 0.3, max: 0.6 }
    },
    recommendations: {
      fertilizer: {
        nitrogen: 140,
        phosphorus: 70,
        potassium: 50
      },
      irrigation: {
        frequency: 'Every 2-3 days',
        depth: '7-10 cm',
        criticalPeriods: ['Panicle initiation', 'Flowering', 'Grain filling']
      },
      pestManagement: ['Brown plant hopper', 'Stem borer', 'Leaf folder', 'White backed plant hopper']
    }
  },
  {
    id: 'pr-121',
    name: 'PR-121',
    localName: 'ਪੀਆਰ-121',
    maturityDays: 95,
    avgYield: 28,
    waterRequirement: 'low',
    diseaseResistance: ['bacterial blight', 'blast', 'brown spot'],
    suitableDistricts: ['Bathinda', 'Sangrur', 'Mansa', 'Faridkot'],
    banned: false,
    plantingWindow: {
      start: 'June',
      end: 'July'
    },
    characteristics: {
      grainType: 'medium',
      cookingQuality: 'good',
      marketPrice: 'standard',
      parboilingSuitable: false
    },
    phenologyStages: {
      germination: 7,
      tillering: 26,
      panicleInitiation: 47,
      flowering: 67,
      grainFilling: 82,
      maturity: 95
    },
    ndviThresholds: {
      germination: { min: 0.1, max: 0.3 },
      vegetative: { min: 0.4, max: 0.8 },
      reproductive: { min: 0.6, max: 0.9 },
      maturity: { min: 0.3, max: 0.6 }
    },
    recommendations: {
      fertilizer: {
        nitrogen: 100,
        phosphorus: 50,
        potassium: 30
      },
      irrigation: {
        frequency: 'Every 4-5 days',
        depth: '4-6 cm',
        criticalPeriods: ['Panicle initiation', 'Flowering', 'Grain filling']
      },
      pestManagement: ['Brown plant hopper', 'Stem borer', 'Leaf folder']
    }
  }
];

// Punjab Districts Database
export const punjabDistricts: PunjabDistrict[] = [
  {
    id: 'amritsar',
    name: 'Amritsar',
    localName: 'ਅੰਮ੍ਰਿਤਸਰ',
    region: 'Majha',
    coordinates: { lat: 31.6340, lng: 74.8723 },
    avgRainfall: 680,
    soilType: 'Alluvial',
    majorCrops: ['Rice', 'Wheat', 'Cotton'],
    riceArea: 45000,
    avgYield: 32,
    waterTable: 'medium',
    climateZone: 'Semi-arid',
    marketAccess: 'excellent',
    governmentSchemes: ['PM Kisan', 'Crop Insurance', 'Direct Seeding']
  },
  {
    id: 'ludhiana',
    name: 'Ludhiana',
    localName: 'ਲੁਧਿਆਣਾ',
    region: 'Malwa',
    coordinates: { lat: 30.9010, lng: 75.8573 },
    avgRainfall: 650,
    soilType: 'Alluvial',
    majorCrops: ['Rice', 'Wheat', 'Cotton', 'Maize'],
    riceArea: 52000,
    avgYield: 33,
    waterTable: 'low',
    climateZone: 'Semi-arid',
    marketAccess: 'excellent',
    governmentSchemes: ['PM Kisan', 'Crop Insurance', 'Direct Seeding', 'Drip Irrigation']
  },
  {
    id: 'patiala',
    name: 'Patiala',
    localName: 'ਪਟਿਆਲਾ',
    region: 'Malwa',
    coordinates: { lat: 30.3398, lng: 76.3869 },
    avgRainfall: 620,
    soilType: 'Alluvial',
    majorCrops: ['Rice', 'Wheat', 'Cotton'],
    riceArea: 38000,
    avgYield: 31,
    waterTable: 'medium',
    climateZone: 'Semi-arid',
    marketAccess: 'good',
    governmentSchemes: ['PM Kisan', 'Crop Insurance', 'Direct Seeding']
  },
  {
    id: 'sangrur',
    name: 'Sangrur',
    localName: 'ਸੰਗਰੂਰ',
    region: 'Malwa',
    coordinates: { lat: 30.2453, lng: 75.8449 },
    avgRainfall: 600,
    soilType: 'Alluvial',
    majorCrops: ['Rice', 'Wheat', 'Cotton'],
    riceArea: 42000,
    avgYield: 30,
    waterTable: 'low',
    climateZone: 'Semi-arid',
    marketAccess: 'good',
    governmentSchemes: ['PM Kisan', 'Crop Insurance', 'Direct Seeding', 'Drip Irrigation']
  },
  {
    id: 'bathinda',
    name: 'Bathinda',
    localName: 'ਬਠਿੰਡਾ',
    region: 'Malwa',
    coordinates: { lat: 30.2110, lng: 74.9455 },
    avgRainfall: 580,
    soilType: 'Alluvial',
    majorCrops: ['Rice', 'Wheat', 'Cotton'],
    riceArea: 35000,
    avgYield: 29,
    waterTable: 'low',
    climateZone: 'Semi-arid',
    marketAccess: 'moderate',
    governmentSchemes: ['PM Kisan', 'Crop Insurance', 'Direct Seeding', 'Drip Irrigation']
  }
];

// Punjab Rice Phenology Stages
export const punjabPhenologyStages: PunjabPhenologyStage[] = [
  {
    id: 'germination',
    name: 'Germination',
    localName: 'ਅੰਕੁਰਣ',
    description: 'Seed germination and early seedling establishment',
    duration: 7,
    criticalFactors: ['Soil moisture', 'Temperature', 'Seed quality'],
    ndviRange: { min: 0.1, max: 0.3 },
    managementPractices: ['Maintain proper soil moisture', 'Ensure good seed quality', 'Monitor for pests'],
    alerts: ['Low soil moisture', 'Poor germination', 'Pest attack']
  },
  {
    id: 'tillering',
    name: 'Tillering',
    localName: 'ਕਲੋਮ ਫੁੱਟਣਾ',
    description: 'Active tiller production and vegetative growth',
    duration: 25,
    criticalFactors: ['Nitrogen availability', 'Water management', 'Plant density'],
    ndviRange: { min: 0.4, max: 0.8 },
    managementPractices: ['Apply nitrogen fertilizer', 'Maintain proper water level', 'Monitor plant density'],
    alerts: ['Nitrogen deficiency', 'Water stress', 'Over-tillering']
  },
  {
    id: 'panicle-initiation',
    name: 'Panicle Initiation',
    localName: 'ਬਾਲੀ ਦਾ ਬਣਨਾ',
    description: 'Panicle primordia formation and reproductive development',
    duration: 20,
    criticalFactors: ['Photoperiod', 'Temperature', 'Nitrogen status'],
    ndviRange: { min: 0.6, max: 0.9 },
    managementPractices: ['Critical irrigation period', 'Monitor nitrogen status', 'Check for diseases'],
    alerts: ['Water stress', 'Nitrogen deficiency', 'Disease symptoms']
  },
  {
    id: 'flowering',
    name: 'Flowering',
    localName: 'ਫੁੱਲ ਆਉਣਾ',
    description: 'Anthesis and pollination period',
    duration: 15,
    criticalFactors: ['Temperature', 'Humidity', 'Water level'],
    ndviRange: { min: 0.6, max: 0.9 },
    managementPractices: ['Maintain proper water level', 'Monitor temperature', 'Check for pests'],
    alerts: ['High temperature stress', 'Water stress', 'Pest attack']
  },
  {
    id: 'grain-filling',
    name: 'Grain Filling',
    localName: 'ਦਾਣਾ ਭਰਨਾ',
    description: 'Grain development and filling period',
    duration: 25,
    criticalFactors: ['Water availability', 'Temperature', 'Nutrient status'],
    ndviRange: { min: 0.5, max: 0.8 },
    managementPractices: ['Maintain water level', 'Monitor grain development', 'Check for diseases'],
    alerts: ['Water stress', 'Grain filling problems', 'Disease symptoms']
  },
  {
    id: 'maturity',
    name: 'Maturity',
    localName: 'ਪੱਕਣਾ',
    description: 'Grain maturation and harvest preparation',
    duration: 10,
    criticalFactors: ['Moisture content', 'Weather conditions', 'Harvest timing'],
    ndviRange: { min: 0.3, max: 0.6 },
    managementPractices: ['Stop irrigation', 'Monitor moisture content', 'Prepare for harvest'],
    alerts: ['Over-ripening', 'Weather damage', 'Harvest delay']
  }
];

// Helper functions
export const getVarietyById = (id: string): PunjabRiceVariety | undefined => {
  return punjabRiceVarieties.find(variety => variety.id === id);
};

export const getVarietiesByDistrict = (districtId: string): PunjabRiceVariety[] => {
  return punjabRiceVarieties.filter(variety => 
    variety.suitableDistricts.some(district => 
      district.toLowerCase() === districtId.toLowerCase()
    )
  );
};

export const getDistrictById = (id: string): PunjabDistrict | undefined => {
  return punjabDistricts.find(district => district.id === id);
};

export const getDistrictsByRegion = (region: 'Majha' | 'Malwa' | 'Doaba'): PunjabDistrict[] => {
  return punjabDistricts.filter(district => district.region === region);
};

export const getPhenologyStageById = (id: string): PunjabPhenologyStage | undefined => {
  return punjabPhenologyStages.find(stage => stage.id === id);
};

export const getVarietiesByMaturity = (maxDays: number): PunjabRiceVariety[] => {
  return punjabRiceVarieties.filter(variety => variety.maturityDays <= maxDays);
};

export const getVarietiesByWaterRequirement = (requirement: 'high' | 'medium' | 'low'): PunjabRiceVariety[] => {
  return punjabRiceVarieties.filter(variety => variety.waterRequirement === requirement);
};

export default {
  punjabRiceVarieties,
  punjabDistricts,
  punjabPhenologyStages,
  getVarietyById,
  getVarietiesByDistrict,
  getDistrictById,
  getDistrictsByRegion,
  getPhenologyStageById,
  getVarietiesByMaturity,
  getVarietiesByWaterRequirement
};
