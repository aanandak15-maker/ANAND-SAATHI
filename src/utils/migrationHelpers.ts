// Migration utilities to help transition from old Context API to new Zustand store

import { useAppStore } from '@/store';
import { ErrorHandler } from './errorHandling';

// Hook to migrate from old AppStateContext to new Zustand store
export const useMigratedAppState = () => {
  const store = useAppStore();
  
  // Map old context structure to new store structure
  return {
    // User state
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    setUser: store.setUser,
    logout: store.logout,
    
    // Field state
    fields: store.fields,
    selectedFieldId: store.selectedFieldId,
    setFields: store.setFields,
    addField: store.addField,
    updateField: store.updateField,
    deleteField: store.deleteField,
    selectField: store.selectField,
    
    // IoT Sensors
    sensors: store.sensors,
    sensorData: store.sensorData,
    setSensors: store.setSensors,
    addSensor: store.addSensor,
    updateSensor: store.updateSensor,
    addSensorReading: store.addSensorReading,
    
    // Government Records
    governmentRecords: store.governmentRecords,
    setGovernmentRecords: store.setGovernmentRecords,
    addGovernmentRecord: store.addGovernmentRecord,
    updateGovernmentRecord: store.updateGovernmentRecord,
    
    // Forecasts (migrated from array to object structure)
    forecasts: store.forecasts,
    setForecasts: store.setForecasts,
    addForecast: store.addForecast,
    updateForecast: store.updateForecast,
    removeForecast: store.removeForecast,
    
    // Vegetation Analysis
    vegetationData: store.vegetationData,
    setVegetationData: store.setVegetationData,
    addVegetationAnalysis: store.addVegetationAnalysis,
    
    // UI State
    isLoading: store.isLoading,
    error: store.error,
    notifications: store.notifications,
    setLoading: store.setLoading,
    setError: store.setError,
    clearError: store.clearError,
    addNotification: store.addNotification,
    markNotificationRead: store.markNotificationRead,
    removeNotification: store.removeNotification,
    clearAllNotifications: store.clearAllNotifications,
    
    // Integration Status
    integrationStatus: store.integrationStatus,
    updateIntegrationStatus: store.updateIntegrationStatus,
    
    // UI Preferences
    sidebarCollapsed: store.sidebarCollapsed,
    activeTab: store.activeTab,
    theme: store.theme,
    setSidebarCollapsed: store.setSidebarCollapsed,
    setActiveTab: store.setActiveTab,
    setTheme: store.setTheme,
  };
};

// Utility to migrate old forecast array to new object structure
export const migrateForecastsToNewStructure = (oldForecasts: any[]) => {
  const newForecasts: Record<string, any[]> = {};
  
  oldForecasts.forEach(forecast => {
    const fieldId = forecast.fieldId || 'default';
    if (!newForecasts[fieldId]) {
      newForecasts[fieldId] = [];
    }
    newForecasts[fieldId].push(forecast);
  });
  
  return newForecasts;
};

// Utility to migrate old sensor data Map to new structure
export const migrateSensorData = (oldSensorData: Map<string, any[]>) => {
  const newSensorData = new Map<string, any[]>();
  
  oldSensorData.forEach((readings, sensorId) => {
    newSensorData.set(sensorId, readings);
  });
  
  return newSensorData;
};

// Hook for backward compatibility with old component patterns
export const useLegacyComponentState = () => {
  const store = useAppStore();
  
  return {
    // Legacy state access
    state: {
      user: store.user,
      isAuthenticated: store.isAuthenticated,
      fields: store.fields,
      selectedFieldId: store.selectedFieldId,
      sensors: store.sensors,
      sensorData: store.sensorData,
      governmentRecords: store.governmentRecords,
      forecasts: store.forecasts,
      vegetationData: store.vegetationData,
      isLoading: store.isLoading,
      error: store.error,
      notifications: store.notifications,
      integrationStatus: store.integrationStatus,
    },
    
    // Legacy dispatch function (maps to store actions)
    dispatch: (action: any) => {
      switch (action.type) {
        case 'SET_USER':
          store.setUser(action.payload);
          break;
        case 'LOGOUT':
          store.logout();
          break;
        case 'ADD_FIELD':
          store.addField(action.payload);
          break;
        case 'UPDATE_FIELD':
          store.updateField(action.payload.id, action.payload);
          break;
        case 'DELETE_FIELD':
          store.deleteField(action.payload);
          break;
        case 'SELECT_FIELD':
          store.selectField(action.payload);
          break;
        case 'SET_FIELDS':
          store.setFields(action.payload);
          break;
        case 'ADD_SENSOR':
          store.addSensor(action.payload);
          break;
        case 'UPDATE_SENSOR_DATA':
          store.addSensorReading(action.payload.sensorId, action.payload.data);
          break;
        case 'SET_SENSORS':
          store.setSensors(action.payload);
          break;
        case 'ADD_GOVERNMENT_RECORD':
          store.addGovernmentRecord(action.payload);
          break;
        case 'UPDATE_GOVERNMENT_RECORD':
          store.updateGovernmentRecord(action.payload.id, action.payload);
          break;
        case 'SET_GOVERNMENT_RECORDS':
          store.setGovernmentRecords(action.payload);
          break;
        case 'ADD_FORECAST':
          // Migrate old forecast structure
          const fieldId = action.payload.fieldId || 'default';
          store.addForecast(fieldId, action.payload);
          break;
        case 'SET_FORECASTS':
          // Migrate old forecasts array to new structure
          const migratedForecasts = migrateForecastsToNewStructure(action.payload);
          Object.entries(migratedForecasts).forEach(([fieldId, forecasts]) => {
            store.setForecasts(fieldId, forecasts);
          });
          break;
        case 'ADD_VEGETATION_ANALYSIS':
          store.addVegetationAnalysis(action.payload);
          break;
        case 'SET_VEGETATION_DATA':
          store.setVegetationData(action.payload);
          break;
        case 'SET_LOADING':
          store.setLoading(action.payload);
          break;
        case 'SET_ERROR':
          store.setError(action.payload);
          break;
        case 'ADD_NOTIFICATION':
          store.addNotification(action.payload);
          break;
        case 'MARK_NOTIFICATION_READ':
          store.markNotificationRead(action.payload);
          break;
        case 'UPDATE_INTEGRATION_STATUS':
          store.updateIntegrationStatus(action.payload);
          break;
        default:
          console.warn('Unknown action type:', action.type);
      }
    },
  };
};

// Error boundary wrapper for migration
export const withMigrationErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => {
    try {
      return <Component {...props} />;
    } catch (error) {
      const appError = ErrorHandler.handleApiError(error);
      useAppStore.getState().setError(ErrorHandler.toStoreError(appError));
      
      // Return fallback UI
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <h3 className="text-red-800 font-medium">Component Error</h3>
          <p className="text-red-600 text-sm mt-1">
            This component encountered an error during migration. Please refresh the page.
          </p>
        </div>
      );
    }
  };
};

// Migration status checker
export const checkMigrationStatus = () => {
  const store = useAppStore.getState();
  
  return {
    hasUser: !!store.user,
    hasFields: store.fields.length > 0,
    hasSensors: store.sensors.length > 0,
    hasForecasts: Object.keys(store.forecasts).length > 0,
    hasVegetationData: store.vegetationData.length > 0,
    hasNotifications: store.notifications.length > 0,
    isFullyMigrated: !!(
      store.user &&
      store.fields.length > 0 &&
      Object.keys(store.forecasts).length > 0
    ),
  };
};

// Data migration utility
export const migrateDataToNewStore = (oldData: any) => {
  const store = useAppStore.getState();
  
  try {
    // Migrate user data
    if (oldData.user) {
      store.setUser(oldData.user);
    }
    
    // Migrate fields
    if (oldData.fields && Array.isArray(oldData.fields)) {
      store.setFields(oldData.fields);
    }
    
    // Migrate sensors
    if (oldData.sensors && Array.isArray(oldData.sensors)) {
      store.setSensors(oldData.sensors);
    }
    
    // Migrate sensor data
    if (oldData.sensorData && oldData.sensorData instanceof Map) {
      const migratedSensorData = migrateSensorData(oldData.sensorData);
      // Note: This would need to be implemented in the store
      console.log('Sensor data migrated:', migratedSensorData);
    }
    
    // Migrate government records
    if (oldData.governmentRecords && Array.isArray(oldData.governmentRecords)) {
      store.setGovernmentRecords(oldData.governmentRecords);
    }
    
    // Migrate forecasts
    if (oldData.forecasts && Array.isArray(oldData.forecasts)) {
      const migratedForecasts = migrateForecastsToNewStructure(oldData.forecasts);
      Object.entries(migratedForecasts).forEach(([fieldId, forecasts]) => {
        store.setForecasts(fieldId, forecasts);
      });
    }
    
    // Migrate vegetation data
    if (oldData.vegetationData && Array.isArray(oldData.vegetationData)) {
      store.setVegetationData(oldData.vegetationData);
    }
    
    // Migrate notifications
    if (oldData.notifications && Array.isArray(oldData.notifications)) {
      oldData.notifications.forEach((notification: any) => {
        store.addNotification(notification);
      });
    }
    
    // Migrate integration status
    if (oldData.integrationStatus) {
      store.updateIntegrationStatus(oldData.integrationStatus);
    }
    
    console.log('Data migration completed successfully');
    return true;
  } catch (error) {
    console.error('Data migration failed:', error);
    return false;
  }
};
