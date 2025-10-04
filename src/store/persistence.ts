// Enhanced persistence layer for the Zustand store
import { StateStorage } from 'zustand/middleware';
import { AppState } from './types';

// Custom storage implementation with error handling and data validation
export class EnhancedStorage implements StateStorage {
  private storage: Storage;
  private key: string;
  private version: string = '1.0.0';

  constructor(storage: Storage, key: string) {
    this.storage = storage;
    this.key = key;
  }

  getItem(name: string): string | null {
    try {
      const item = this.storage.getItem(name);
      if (!item) return null;

      const parsed = JSON.parse(item);
      
      // Check version compatibility
      if (parsed.version !== this.version) {
        console.warn(`Storage version mismatch. Expected ${this.version}, got ${parsed.version}`);
        return this.migrateData(parsed);
      }

      return item;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  }

  setItem(name: string, value: string): void {
    try {
      const parsed = JSON.parse(value);
      const enhancedValue = {
        ...parsed,
        version: this.version,
        timestamp: new Date().toISOString(),
      };

      this.storage.setItem(name, JSON.stringify(enhancedValue));
    } catch (error) {
      console.error('Error writing to storage:', error);
    }
  }

  removeItem(name: string): void {
    try {
      this.storage.removeItem(name);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  }

  private migrateData(data: any): string | null {
    // Handle data migration between versions
    if (!data.version) {
      // Migrate from version 0 (no version) to 1.0.0
      return this.migrateFromV0(data);
    }

    return null;
  }

  private migrateFromV0(data: any): string {
    // Migrate old data structure to new format
    const migrated = {
      ...data,
      version: this.version,
      timestamp: new Date().toISOString(),
      // Add any necessary data transformations here
    };

    return JSON.stringify(migrated);
  }
}

// Storage factory
export const createStorage = (type: 'local' | 'session' = 'local', key: string = 'anand-saathi-store') => {
  const storage = type === 'local' ? localStorage : sessionStorage;
  return new EnhancedStorage(storage, key);
};

// Data validation utilities
export const validateStoredData = (data: any): boolean => {
  try {
    // Check required fields
    const requiredFields = ['user', 'fields', 'forecasts', 'isLoading', 'error'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        console.warn(`Missing required field: ${field}`);
        return false;
      }
    }

    // Validate data types
    if (typeof data.isLoading !== 'boolean') {
      console.warn('Invalid isLoading type');
      return false;
    }

    if (!Array.isArray(data.fields)) {
      console.warn('Invalid fields type');
      return false;
    }

    if (typeof data.forecasts !== 'object' || data.forecasts === null) {
      console.warn('Invalid forecasts type');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Data validation error:', error);
    return false;
  }
};

// Data compression utilities
export const compressData = (data: AppState): string => {
  try {
    // Remove unnecessary data for compression
    const compressed = {
      user: data.user,
      fields: data.fields,
      selectedFieldId: data.selectedFieldId,
      forecasts: data.forecasts,
      isLoading: data.isLoading,
      error: data.error,
      notifications: data.notifications,
      integrationStatus: data.integrationStatus,
      sidebarCollapsed: data.sidebarCollapsed,
      activeTab: data.activeTab,
      theme: data.theme,
    };

    return JSON.stringify(compressed);
  } catch (error) {
    console.error('Data compression error:', error);
    return JSON.stringify(data);
  }
};

// Data encryption utilities (basic implementation)
export const encryptData = (data: string, key: string): string => {
  try {
    // Simple XOR encryption (not secure for production)
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
  } catch (error) {
    console.error('Data encryption error:', error);
    return data;
  }
};

export const decryptData = (encryptedData: string, key: string): string => {
  try {
    const data = atob(encryptedData);
    let decrypted = '';
    for (let i = 0; i < data.length; i++) {
      decrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return decrypted;
  } catch (error) {
    console.error('Data decryption error:', error);
    return encryptedData;
  }
};

// Storage quota management
export const getStorageQuota = async (): Promise<{ used: number; available: number; total: number }> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: (estimate.quota || 0) - (estimate.usage || 0),
        total: estimate.quota || 0,
      };
    } catch (error) {
      console.error('Error getting storage quota:', error);
    }
  }

  return { used: 0, available: 0, total: 0 };
};

// Cleanup utilities
export const cleanupOldData = (maxAge: number = 7 * 24 * 60 * 60 * 1000): void => {
  try {
    const now = Date.now();
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('anand-saathi-')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.timestamp) {
            const age = now - new Date(data.timestamp).getTime();
            if (age > maxAge) {
              localStorage.removeItem(key);
              console.log(`Cleaned up old data: ${key}`);
            }
          }
        } catch (error) {
          // Remove corrupted data
          localStorage.removeItem(key);
          console.log(`Removed corrupted data: ${key}`);
        }
      }
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};

// Export storage instances
export const localStorage = createStorage('local', 'anand-saathi-store');
export const sessionStorage = createStorage('session', 'anand-saathi-session');
