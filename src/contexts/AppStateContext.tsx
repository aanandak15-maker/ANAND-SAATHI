/**
 * Anand Saathi - Global Application State Management
 * Centralized state for all critical platform features
 */

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { FieldData } from '@/lib/anandSaathiBackend';

// ===== TYPE DEFINITIONS =====

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  language: 'english' | 'punjabi' | 'hindi';
  farmerId?: string;
}

export interface IoTSensor {
  id: string;
  fieldId: string;
  type: 'soil_moisture' | 'temperature' | 'humidity' | 'ph' | 'npk';
  value: number;
  unit: string;
  timestamp: Date;
  status: 'active' | 'inactive' | 'error';
}

export interface GovernmentRecord {
  id: string;
  farmerId: string;
  recordType: 'land_ownership' | 'subsidy' | 'scheme' | 'insurance';
  documentUrl?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  data: Record<string, any>;
}

export interface AIForecast {
  id: string;
  fieldId: string;
  type: 'yield' | 'market' | 'weather';
  predictions: number[];
  confidence: number;
  generatedAt: Date;
  modelVersion: string;
}

export interface VegetationAnalysis {
  id: string;
  fieldId: string;
  ndvi: number;
  ndmi: number;
  msavi2: number;
  ndre: number;
  timestamp: Date;
  healthStatus: 'excellent' | 'good' | 'moderate' | 'poor';
}

export interface AppState {
  // User & Authentication
  user: User | null;
  isAuthenticated: boolean;
  
  // Field Management
  fields: FieldData[];
  selectedFieldId: string | null;
  
  // IoT Sensors
  sensors: IoTSensor[];
  sensorData: Map<string, IoTSensor[]>;
  
  // Government Integration
  governmentRecords: GovernmentRecord[];
  
  // AI Forecasting
  forecasts: AIForecast[];
  
  // Vegetation Analysis
  vegetationData: VegetationAnalysis[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
  
  // Integration Status
  integrationStatus: {
    iot: 'connected' | 'disconnected' | 'error';
    government: 'connected' | 'disconnected' | 'error';
    timesfm: 'connected' | 'disconnected' | 'error';
    satellite: 'connected' | 'disconnected' | 'error';
  };
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: Date;
  read: boolean;
}

// ===== ACTION TYPES =====

export type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_FIELD'; payload: FieldData }
  | { type: 'UPDATE_FIELD'; payload: FieldData }
  | { type: 'DELETE_FIELD'; payload: string }
  | { type: 'SELECT_FIELD'; payload: string | null }
  | { type: 'SET_FIELDS'; payload: FieldData[] }
  | { type: 'ADD_SENSOR'; payload: IoTSensor }
  | { type: 'UPDATE_SENSOR_DATA'; payload: { sensorId: string; data: IoTSensor } }
  | { type: 'SET_SENSORS'; payload: IoTSensor[] }
  | { type: 'ADD_GOVERNMENT_RECORD'; payload: GovernmentRecord }
  | { type: 'UPDATE_GOVERNMENT_RECORD'; payload: GovernmentRecord }
  | { type: 'SET_GOVERNMENT_RECORDS'; payload: GovernmentRecord[] }
  | { type: 'ADD_FORECAST'; payload: AIForecast }
  | { type: 'SET_FORECASTS'; payload: AIForecast[] }
  | { type: 'ADD_VEGETATION_ANALYSIS'; payload: VegetationAnalysis }
  | { type: 'SET_VEGETATION_DATA'; payload: VegetationAnalysis[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'UPDATE_INTEGRATION_STATUS'; payload: Partial<AppState['integrationStatus']> };

// ===== INITIAL STATE =====

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  fields: [],
  selectedFieldId: null,
  sensors: [],
  sensorData: new Map(),
  governmentRecords: [],
  forecasts: [],
  vegetationData: [],
  isLoading: false,
  error: null,
  notifications: [],
  integrationStatus: {
    iot: 'disconnected',
    government: 'disconnected',
    timesfm: 'disconnected',
    satellite: 'disconnected',
  },
};

// ===== REDUCER =====

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true };
    
    case 'LOGOUT':
      return { ...initialState };
    
    case 'ADD_FIELD':
      return { ...state, fields: [...state.fields, action.payload] };
    
    case 'UPDATE_FIELD':
      return {
        ...state,
        fields: state.fields.map(f => f.id === action.payload.id ? action.payload : f),
      };
    
    case 'DELETE_FIELD':
      return {
        ...state,
        fields: state.fields.filter(f => f.id !== action.payload),
        selectedFieldId: state.selectedFieldId === action.payload ? null : state.selectedFieldId,
      };
    
    case 'SELECT_FIELD':
      return { ...state, selectedFieldId: action.payload };
    
    case 'SET_FIELDS':
      return { ...state, fields: action.payload };
    
    case 'ADD_SENSOR':
      return { ...state, sensors: [...state.sensors, action.payload] };
    
    case 'UPDATE_SENSOR_DATA': {
      const newSensorData = new Map(state.sensorData);
      const sensorHistory = newSensorData.get(action.payload.sensorId) || [];
      newSensorData.set(action.payload.sensorId, [...sensorHistory, action.payload.data]);
      return { ...state, sensorData: newSensorData };
    }
    
    case 'SET_SENSORS':
      return { ...state, sensors: action.payload };
    
    case 'ADD_GOVERNMENT_RECORD':
      return { ...state, governmentRecords: [...state.governmentRecords, action.payload] };
    
    case 'UPDATE_GOVERNMENT_RECORD':
      return {
        ...state,
        governmentRecords: state.governmentRecords.map(r =>
          r.id === action.payload.id ? action.payload : r
        ),
      };
    
    case 'SET_GOVERNMENT_RECORDS':
      return { ...state, governmentRecords: action.payload };
    
    case 'ADD_FORECAST':
      return { ...state, forecasts: [...state.forecasts, action.payload] };
    
    case 'SET_FORECASTS':
      return { ...state, forecasts: action.payload };
    
    case 'ADD_VEGETATION_ANALYSIS':
      return { ...state, vegetationData: [...state.vegetationData, action.payload] };
    
    case 'SET_VEGETATION_DATA':
      return { ...state, vegetationData: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    
    case 'UPDATE_INTEGRATION_STATUS':
      return {
        ...state,
        integrationStatus: { ...state.integrationStatus, ...action.payload },
      };
    
    default:
      return state;
  }
}

// ===== CONTEXT =====

interface AppStateContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

// ===== PROVIDER =====

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

// ===== CUSTOM HOOK =====

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}

// ===== SELECTOR HOOKS =====

export function useUser() {
  const { state } = useAppState();
  return state.user;
}

export function useFields() {
  const { state } = useAppState();
  return state.fields;
}

export function useSelectedField() {
  const { state } = useAppState();
  return state.fields.find(f => f.id === state.selectedFieldId) || null;
}

export function useSensors() {
  const { state } = useAppState();
  return state.sensors;
}

export function useForecast(fieldId: string) {
  const { state } = useAppState();
  return state.forecasts.filter(f => f.fieldId === fieldId);
}

export function useVegetationAnalysis(fieldId: string) {
  const { state } = useAppState();
  return state.vegetationData.filter(v => v.fieldId === fieldId);
}

export function useIntegrationStatus() {
  const { state } = useAppState();
  return state.integrationStatus;
}
