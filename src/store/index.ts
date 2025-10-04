import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { AppState, User, Field, ForecastData, IoTSensor, GovernmentRecord, VegetationAnalysis, Notification, IntegrationStatus, AppError } from './types';

// Store actions interface
interface AppActions {
  // User actions
  setUser: (user: User | null) => void;
  updateUserPreferences: (preferences: Partial<AppState['user']['preferences']>) => void;
  logout: () => void;
  
  // Field actions
  setFields: (fields: Field[]) => void;
  addField: (field: Field) => void;
  updateField: (fieldId: string, updates: Partial<Field>) => void;
  deleteField: (fieldId: string) => void;
  selectField: (fieldId: string | null) => void;
  
  // IoT Sensor actions
  setSensors: (sensors: IoTSensor[]) => void;
  addSensor: (sensor: IoTSensor) => void;
  updateSensor: (sensorId: string, updates: Partial<IoTSensor>) => void;
  addSensorReading: (sensorId: string, reading: any) => void;
  
  // Government Records actions
  setGovernmentRecords: (records: GovernmentRecord[]) => void;
  addGovernmentRecord: (record: GovernmentRecord) => void;
  updateGovernmentRecord: (recordId: string, updates: Partial<GovernmentRecord>) => void;
  
  // Forecast actions
  setForecasts: (fieldId: string, forecasts: ForecastData[]) => void;
  addForecast: (fieldId: string, forecast: ForecastData) => void;
  updateForecast: (fieldId: string, forecastId: string, updates: Partial<ForecastData>) => void;
  removeForecast: (fieldId: string, forecastId: string) => void;
  
  // Vegetation Analysis actions
  setVegetationData: (data: VegetationAnalysis[]) => void;
  addVegetationAnalysis: (analysis: VegetationAnalysis) => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (notificationId: string) => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  
  // Integration Status actions
  updateIntegrationStatus: (status: Partial<IntegrationStatus>) => void;
  
  // UI State actions
  setLoading: (loading: boolean) => void;
  setError: (error: AppError | null) => void;
  clearError: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveTab: (tab: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  
  // Utility actions
  reset: () => void;
}

// Combined store type
type AppStore = AppState & AppActions;

// Initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  fields: [],
  selectedFieldId: null,
  sensors: [],
  sensorData: new Map(),
  governmentRecords: [],
  forecasts: {},
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
  sidebarCollapsed: false,
  activeTab: 'dashboard',
  theme: 'auto',
};

// Create the store
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        // User actions
        setUser: (user) => set((state) => {
          state.user = user;
          state.isAuthenticated = !!user;
        }),
        
        updateUserPreferences: (preferences) => set((state) => {
          if (state.user) {
            state.user.preferences = { ...state.user.preferences, ...preferences };
          }
        }),
        
        logout: () => set((state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.fields = [];
          state.selectedFieldId = null;
          state.sensors = [];
          state.sensorData = new Map();
          state.governmentRecords = [];
          state.forecasts = {};
          state.vegetationData = [];
          state.notifications = [];
          state.error = null;
        }),
        
        // Field actions
        setFields: (fields) => set((state) => {
          state.fields = fields;
        }),
        
        addField: (field) => set((state) => {
          state.fields.push(field);
        }),
        
        updateField: (fieldId, updates) => set((state) => {
          const fieldIndex = state.fields.findIndex(f => f.id === fieldId);
          if (fieldIndex !== -1) {
            state.fields[fieldIndex] = { ...state.fields[fieldIndex], ...updates };
          }
        }),
        
        deleteField: (fieldId) => set((state) => {
          state.fields = state.fields.filter(f => f.id !== fieldId);
          if (state.selectedFieldId === fieldId) {
            state.selectedFieldId = null;
          }
          // Clean up related data
          delete state.forecasts[fieldId];
          state.sensors = state.sensors.filter(s => s.fieldId !== fieldId);
          state.governmentRecords = state.governmentRecords.filter(r => r.fieldId !== fieldId);
          state.vegetationData = state.vegetationData.filter(v => v.fieldId !== fieldId);
        }),
        
        selectField: (fieldId) => set((state) => {
          state.selectedFieldId = fieldId;
        }),
        
        // IoT Sensor actions
        setSensors: (sensors) => set((state) => {
          state.sensors = sensors;
        }),
        
        addSensor: (sensor) => set((state) => {
          state.sensors.push(sensor);
        }),
        
        updateSensor: (sensorId, updates) => set((state) => {
          const sensorIndex = state.sensors.findIndex(s => s.id === sensorId);
          if (sensorIndex !== -1) {
            state.sensors[sensorIndex] = { ...state.sensors[sensorIndex], ...updates };
          }
        }),
        
        addSensorReading: (sensorId, reading) => set((state) => {
          const existingReadings = state.sensorData.get(sensorId) || [];
          state.sensorData.set(sensorId, [...existingReadings, reading]);
        }),
        
        // Government Records actions
        setGovernmentRecords: (records) => set((state) => {
          state.governmentRecords = records;
        }),
        
        addGovernmentRecord: (record) => set((state) => {
          state.governmentRecords.push(record);
        }),
        
        updateGovernmentRecord: (recordId, updates) => set((state) => {
          const recordIndex = state.governmentRecords.findIndex(r => r.id === recordId);
          if (recordIndex !== -1) {
            state.governmentRecords[recordIndex] = { ...state.governmentRecords[recordIndex], ...updates };
          }
        }),
        
        // Forecast actions
        setForecasts: (fieldId, forecasts) => set((state) => {
          state.forecasts[fieldId] = forecasts;
        }),
        
        addForecast: (fieldId, forecast) => set((state) => {
          if (!state.forecasts[fieldId]) {
            state.forecasts[fieldId] = [];
          }
          state.forecasts[fieldId].push(forecast);
        }),
        
        updateForecast: (fieldId, forecastId, updates) => set((state) => {
          if (state.forecasts[fieldId]) {
            const forecastIndex = state.forecasts[fieldId].findIndex(f => f.id === forecastId);
            if (forecastIndex !== -1) {
              state.forecasts[fieldId][forecastIndex] = { ...state.forecasts[fieldId][forecastIndex], ...updates };
            }
          }
        }),
        
        removeForecast: (fieldId, forecastId) => set((state) => {
          if (state.forecasts[fieldId]) {
            state.forecasts[fieldId] = state.forecasts[fieldId].filter(f => f.id !== forecastId);
          }
        }),
        
        // Vegetation Analysis actions
        setVegetationData: (data) => set((state) => {
          state.vegetationData = data;
        }),
        
        addVegetationAnalysis: (analysis) => set((state) => {
          state.vegetationData.push(analysis);
        }),
        
        // Notification actions
        addNotification: (notification) => set((state) => {
          const newNotification: Notification = {
            ...notification,
            id: crypto.randomUUID(),
            createdAt: new Date(),
          };
          state.notifications.push(newNotification);
        }),
        
        markNotificationRead: (notificationId) => set((state) => {
          const notification = state.notifications.find(n => n.id === notificationId);
          if (notification) {
            notification.read = true;
          }
        }),
        
        removeNotification: (notificationId) => set((state) => {
          state.notifications = state.notifications.filter(n => n.id !== notificationId);
        }),
        
        clearAllNotifications: () => set((state) => {
          state.notifications = [];
        }),
        
        // Integration Status actions
        updateIntegrationStatus: (status) => set((state) => {
          state.integrationStatus = { ...state.integrationStatus, ...status };
        }),
        
        // UI State actions
        setLoading: (loading) => set((state) => {
          state.isLoading = loading;
        }),
        
        setError: (error) => set((state) => {
          state.error = error;
        }),
        
        clearError: () => set((state) => {
          state.error = null;
        }),
        
        setSidebarCollapsed: (collapsed) => set((state) => {
          state.sidebarCollapsed = collapsed;
        }),
        
        setActiveTab: (tab) => set((state) => {
          state.activeTab = tab;
        }),
        
        setTheme: (theme) => set((state) => {
          state.theme = theme;
        }),
        
        // Utility actions
        reset: () => set(() => initialState),
      })),
      {
        name: 'anand-saathi-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          fields: state.fields,
          selectedFieldId: state.selectedFieldId,
          sidebarCollapsed: state.sidebarCollapsed,
          activeTab: state.activeTab,
          theme: state.theme,
          notifications: state.notifications,
        }),
      }
    ),
    {
      name: 'anand-saathi-store',
    }
  )
);

// Selector hooks for better performance
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useFields = () => useAppStore((state) => state.fields);
export const useSelectedField = () => useAppStore((state) => 
  state.fields.find(f => f.id === state.selectedFieldId)
);
export const useForecasts = (fieldId?: string) => useAppStore((state) => 
  fieldId ? state.forecasts[fieldId] || [] : state.forecasts
);
export const useSensors = () => useAppStore((state) => state.sensors);
export const useNotifications = () => useAppStore((state) => state.notifications);
export const useIntegrationStatus = () => useAppStore((state) => state.integrationStatus);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => state.error);
export const useTheme = () => useAppStore((state) => state.theme);
