// Centralized type definitions for the application store
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'farmer' | 'admin' | 'analyst';
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
  units: 'metric' | 'imperial';
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  forecastAlerts: boolean;
  weatherAlerts: boolean;
  diseaseAlerts: boolean;
}

export interface Field {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  area: number; // in hectares
  cropType: string;
  soilType: string;
  plantingDate: Date;
  expectedHarvestDate: Date;
  status: 'active' | 'inactive' | 'harvested';
  createdAt: Date;
  updatedAt: Date;
}

export interface ForecastData {
  id: string;
  fieldId: string;
  type: 'weather' | 'yield' | 'disease' | 'pest' | 'irrigation';
  title: string;
  description: string;
  confidence: number; // 0-100
  data: any; // Flexible data structure
  predictions: Prediction[];
  createdAt: Date;
  validUntil: Date;
  source: 'timesfm' | 'satellite' | 'iot' | 'manual';
}

export interface Prediction {
  date: Date;
  value: number | string;
  unit: string;
  confidence: number;
  metadata?: any;
}

export interface IoTSensor {
  id: string;
  fieldId: string;
  type: 'soil_moisture' | 'temperature' | 'humidity' | 'ph' | 'nutrients';
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: 'active' | 'inactive' | 'error';
  lastReading: Date;
  readings: SensorReading[];
}

export interface SensorReading {
  id: string;
  sensorId: string;
  value: number;
  unit: string;
  timestamp: Date;
  quality: 'good' | 'fair' | 'poor';
}

export interface GovernmentRecord {
  id: string;
  fieldId: string;
  type: 'subsidy' | 'certification' | 'inspection' | 'permit';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  amount?: number;
  currency?: string;
  validFrom: Date;
  validUntil: Date;
  documents: string[];
  createdAt: Date;
}

export interface VegetationAnalysis {
  id: string;
  fieldId: string;
  date: Date;
  ndvi: number;
  evi: number;
  healthIndex: number;
  coverage: number;
  anomalies: VegetationAnomaly[];
  imageUrl?: string;
  source: 'satellite' | 'drone' | 'manual';
}

export interface VegetationAnomaly {
  type: 'disease' | 'pest' | 'drought' | 'flood' | 'nutrient_deficiency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
  };
  description: string;
  confidence: number;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  metadata?: any;
}

export interface IntegrationStatus {
  iot: 'connected' | 'disconnected' | 'error';
  government: 'connected' | 'disconnected' | 'error';
  timesfm: 'connected' | 'disconnected' | 'error';
  satellite: 'connected' | 'disconnected' | 'error';
}

export interface AppError {
  id: string;
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  context?: string;
  resolved: boolean;
}

// Store state interface
export interface AppState {
  // User & Authentication
  user: User | null;
  isAuthenticated: boolean;
  
  // Field Management
  fields: Field[];
  selectedFieldId: string | null;
  
  // IoT Sensors
  sensors: IoTSensor[];
  sensorData: Map<string, SensorReading[]>;
  
  // Government Integration
  governmentRecords: GovernmentRecord[];
  
  // AI Forecasting
  forecasts: Record<string, ForecastData[]>;
  
  // Vegetation Analysis
  vegetationData: VegetationAnalysis[];
  
  // UI State
  isLoading: boolean;
  error: AppError | null;
  notifications: Notification[];
  
  // Integration Status
  integrationStatus: IntegrationStatus;
  
  // UI Preferences
  sidebarCollapsed: boolean;
  activeTab: string;
  theme: 'light' | 'dark' | 'auto';
}
