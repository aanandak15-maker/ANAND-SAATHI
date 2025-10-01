/**
 * Anand Saathi - Centralized Routing Configuration
 * All application routes defined in one place for easy management
 */

export interface RouteConfig {
  path: string;
  name: string;
  requiresAuth: boolean;
  category: 'core' | 'advanced' | 'admin' | 'integration';
}

export const routes: Record<string, RouteConfig> = {
  // Core Routes
  HOME: {
    path: '/',
    name: 'Home',
    requiresAuth: false,
    category: 'core',
  },
  DASHBOARD: {
    path: '/dashboard',
    name: 'Dashboard',
    requiresAuth: true,
    category: 'core',
  },
  SIGNIN: {
    path: '/signin',
    name: 'Sign In',
    requiresAuth: false,
    category: 'core',
  },
  
  // Field Management
  FIELD_MAPPER: {
    path: '/field-mapper',
    name: 'Field Mapper',
    requiresAuth: true,
    category: 'core',
  },
  FIELD_DETAILS: {
    path: '/field/:id',
    name: 'Field Details',
    requiresAuth: true,
    category: 'core',
  },
  
  // AI & Forecasting
  AI_FORECASTING: {
    path: '/ai-forecasting',
    name: 'AI Forecasting',
    requiresAuth: true,
    category: 'advanced',
  },
  
  // IoT & Sensors
  IOT_DASHBOARD: {
    path: '/iot-dashboard',
    name: 'IoT Dashboard',
    requiresAuth: true,
    category: 'advanced',
  },
  SENSOR_MANAGEMENT: {
    path: '/sensors',
    name: 'Sensor Management',
    requiresAuth: true,
    category: 'advanced',
  },
  
  // Government Integration
  GOVERNMENT_INTEGRATION: {
    path: '/government',
    name: 'Government Integration',
    requiresAuth: true,
    category: 'integration',
  },
  SUBSIDY_TRACKER: {
    path: '/subsidy',
    name: 'Subsidy Tracker',
    requiresAuth: true,
    category: 'integration',
  },
  
  // Vegetation Analysis
  VEGETATION_ANALYSIS: {
    path: '/vegetation',
    name: 'Vegetation Analysis',
    requiresAuth: true,
    category: 'advanced',
  },
  
  // Farm Management
  CROP_MANAGEMENT: {
    path: '/crop-management',
    name: 'Crop Management',
    requiresAuth: true,
    category: 'core',
  },
  IRRIGATION: {
    path: '/irrigation',
    name: 'Irrigation Management',
    requiresAuth: true,
    category: 'core',
  },
  PEST_DISEASE: {
    path: '/pest-disease',
    name: 'Pest & Disease Management',
    requiresAuth: true,
    category: 'core',
  },
  SOIL_ANALYSIS: {
    path: '/soil-analysis',
    name: 'Soil Analysis',
    requiresAuth: true,
    category: 'advanced',
  },
  
  // Financial
  FINANCIAL: {
    path: '/financial',
    name: 'Financial Management',
    requiresAuth: true,
    category: 'core',
  },
  MARKET_ANALYSIS: {
    path: '/market-analysis',
    name: 'Market Analysis',
    requiresAuth: true,
    category: 'core',
  },
  
  // Weather & Monitoring
  WEATHER: {
    path: '/weather',
    name: 'Weather Monitoring',
    requiresAuth: true,
    category: 'core',
  },
  ALERTS: {
    path: '/alerts',
    name: 'Alerts',
    requiresAuth: true,
    category: 'core',
  },
  
  // Tools & Utilities
  FERTILIZER_CALCULATOR: {
    path: '/fertilizer-calculator',
    name: 'Fertilizer Calculator',
    requiresAuth: true,
    category: 'core',
  },
  CROP_ROTATION: {
    path: '/crop-rotation',
    name: 'Crop Rotation',
    requiresAuth: true,
    category: 'core',
  },
  HARVEST_PLANNING: {
    path: '/harvest-planning',
    name: 'Harvest Planning',
    requiresAuth: true,
    category: 'core',
  },
  
  // Reports & Settings
  REPORTS: {
    path: '/reports',
    name: 'Reports',
    requiresAuth: true,
    category: 'core',
  },
  SETTINGS: {
    path: '/settings',
    name: 'Settings',
    requiresAuth: true,
    category: 'core',
  },
  
  // Advanced Features
  VOICE_ASSISTANT: {
    path: '/voice-assistant',
    name: 'Voice Assistant',
    requiresAuth: true,
    category: 'advanced',
  },
  MARKETPLACE: {
    path: '/marketplace',
    name: 'Marketplace',
    requiresAuth: true,
    category: 'advanced',
  },
  WHATSAPP: {
    path: '/whatsapp',
    name: 'WhatsApp Integration',
    requiresAuth: true,
    category: 'integration',
  },
  
  // Admin
  ADMIN_DASHBOARD: {
    path: '/admin',
    name: 'Admin Dashboard',
    requiresAuth: true,
    category: 'admin',
  },
};

// Helper function to get route path
export function getRoutePath(routeKey: keyof typeof routes): string {
  return routes[routeKey].path;
}

// Helper function to generate dynamic route
export function generateRoute(routeKey: keyof typeof routes, params: Record<string, string>): string {
  let path = routes[routeKey].path;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, value);
  });
  return path;
}
