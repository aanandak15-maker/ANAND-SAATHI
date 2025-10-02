/**
 * Offline Storage Service for Anand Saathi
 * IndexedDB-based offline data storage and synchronization
 */

export interface OfflineAction {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  body?: string;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

export interface OfflineFieldData {
  id: string;
  fieldId: string;
  data: any;
  timestamp: Date;
  synced: boolean;
}

export interface OfflineCache {
  key: string;
  data: any;
  timestamp: Date;
  expiry?: Date;
  version: number;
}

class OfflineStorageService {
  private dbName = 'AnandSaathiOffline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private syncInProgress = false;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized');
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };
    });
  }

  private createObjectStores(db: IDBDatabase) {
    // Actions store for offline API calls
    if (!db.objectStoreNames.contains('actions')) {
      const actionsStore = db.createObjectStore('actions', { keyPath: 'id' });
      actionsStore.createIndex('timestamp', 'timestamp');
      actionsStore.createIndex('retryCount', 'retryCount');
    }

    // Field data store for offline field information
    if (!db.objectStoreNames.contains('fieldData')) {
      const fieldDataStore = db.createObjectStore('fieldData', { keyPath: 'id' });
      fieldDataStore.createIndex('fieldId', 'fieldId');
      fieldDataStore.createIndex('timestamp', 'timestamp');
      fieldDataStore.createIndex('synced', 'synced');
    }

    // Cache store for API responses
    if (!db.objectStoreNames.contains('cache')) {
      const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
      cacheStore.createIndex('timestamp', 'timestamp');
    }
  }

  // Store field data for offline access
  async storeFieldData(fieldId: string, data: any): Promise<void> {
    try {
      const db = await this.init();
      const transaction = db.transaction(['fieldData'], 'readwrite');
      const store = transaction.objectStore('fieldData');

      const offlineData: OfflineFieldData = {
        id: `field_${fieldId}_${Date.now()}`,
        fieldId,
        data,
        timestamp: new Date(),
        synced: false
      };

      return new Promise((resolve, reject) => {
        const request = store.add(offlineData);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Failed to store field data offline:', error);
      throw error;
    }
  }

  // Retrieve field data from offline storage
  async getFieldData(fieldId: string): Promise<any | null> {
    try {
      const db = await this.init();
      const transaction = db.transaction(['fieldData'], 'readonly');
      const store = transaction.objectStore('fieldData');
      const index = store.index('fieldId');

      return new Promise((resolve, reject) => {
        const request = index.openCursor(IDBKeyRange.only(fieldId), 'prev');

        request.onerror = () => reject(request.error);

        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            resolve(cursor.value.data);
          } else {
            resolve(null);
          }
        };
      });
    } catch (error) {
      console.error('Failed to retrieve field data from offline storage:', error);
      return null;
    }
  }

  // Queue API action for offline sync
  async queueAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount' | 'maxRetries'>): Promise<void> {
    try {
      const db = await this.init();
      const transaction = db.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');

      const offlineAction: OfflineAction = {
        ...action,
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 3
      };

      return new Promise((resolve, reject) => {
        const request = store.add(offlineAction);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Failed to queue offline action:', error);
      throw error;
    }
  }

  // Sync offline actions when connection is restored
  async syncOfflineActions(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) return;

    this.syncInProgress = true;

    try {
      const db = await this.init();
      const transaction = db.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      const index = store.index('retryCount');

      const request = index.openCursor(IDBKeyRange.upperBound(3), 'next');

      request.onsuccess = async (event) => {
        const cursor = (event.target as any).result;

        if (cursor) {
          const action: OfflineAction = cursor.value;

          try {
            await this.executeAction(action);

            // Remove successfully synced action
            cursor.delete();

            console.log(`✅ Synced offline action: ${action.method} ${action.url}`);
          } catch (error) {
            console.error(`❌ Failed to sync action ${action.id}:`, error);

            // Increment retry count
            action.retryCount++;
            cursor.update(action);

            if (action.retryCount >= action.maxRetries) {
              console.error(`🗑️ Discarding action ${action.id} after ${action.maxRetries} retries`);
              cursor.delete();
            }
          }

          cursor.continue();
        } else {
          console.log('✅ Offline sync completed');
        }
      };

      request.onerror = () => {
        console.error('❌ Offline sync failed');
      };
    } catch (error) {
      console.error('❌ Error during offline sync:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async executeAction(action: OfflineAction): Promise<void> {
    const response = await fetch(action.url, {
      method: action.method,
      headers: action.headers,
      body: action.body
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  // Cache API responses for offline access
  async cacheResponse(key: string, data: any, expiryHours?: number): Promise<void> {
    try {
      const db = await this.init();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');

      const cacheData: OfflineCache = {
        key,
        data,
        timestamp: new Date(),
        expiry: expiryHours ? new Date(Date.now() + expiryHours * 60 * 60 * 1000) : undefined,
        version: 1
      };

      return new Promise((resolve, reject) => {
        const request = store.put(cacheData);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Failed to cache response:', error);
      throw error;
    }
  }

  // Retrieve cached response
  async getCachedResponse(key: string): Promise<any | null> {
    try {
      const db = await this.init();
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');

      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onerror = () => reject(request.error);

        request.onsuccess = () => {
          const result = request.result;

          if (result) {
            // Check if expired
            if (result.expiry && new Date() > result.expiry) {
              console.log(`🗑️ Cache expired for key: ${key}`);
              resolve(null);
              return;
            }

            resolve(result.data);
          } else {
            resolve(null);
          }
        };
      });
    } catch (error) {
      console.error('Failed to retrieve cached response:', error);
      return null;
    }
  }

  // Get storage statistics
  async getStorageStats(): Promise<{
    actions: number;
    fieldData: number;
    cache: number;
    totalSize: string;
  }> {
    try {
      const db = await this.init();

      const getCount = (storeName: string): Promise<number> => {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.count();

          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
        });
      };

      const [actions, fieldData, cache] = await Promise.all([
        getCount('actions'),
        getCount('fieldData'),
        getCount('cache')
      ]);

      // Estimate storage size (rough calculation)
      const estimatedSize = (actions + fieldData + cache) * 1000; // ~1KB per entry

      return {
        actions,
        fieldData,
        cache,
        totalSize: this.formatBytes(estimatedSize)
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return { actions: 0, fieldData: 0, cache: 0, totalSize: '0 B' };
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Setup sync listener for when connection is restored
  setupSyncListener() {
    window.addEventListener('online', () => {
      console.log('🌐 Connection restored, starting sync...');
      this.syncOfflineActions();
    });

    // Initial sync if already online
    if (navigator.onLine) {
      setTimeout(() => this.syncOfflineActions(), 1000);
    }
  }

  // Clean up old data
  async cleanup(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const db = await this.init();
      const cutoffDate = new Date(Date.now() - maxAge);

      // Clean old actions
      const actionTransaction = db.transaction(['actions'], 'readwrite');
      const actionStore = actionTransaction.objectStore('actions');
      const actionIndex = actionStore.index('timestamp');

      const actionRequest = actionIndex.openCursor(IDBKeyRange.upperBound(cutoffDate));

      actionRequest.onsuccess = (event) => {
        const cursor = (event.target as any).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      // Clean old field data
      const fieldTransaction = db.transaction(['fieldData'], 'readwrite');
      const fieldStore = fieldTransaction.objectStore('fieldData');
      const fieldIndex = fieldStore.index('timestamp');

      const fieldRequest = fieldIndex.openCursor(IDBKeyRange.upperBound(cutoffDate));

      fieldRequest.onsuccess = (event) => {
        const cursor = (event.target as any).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      console.log('🧹 Cleaned up old offline data');
    } catch (error) {
      console.error('Failed to cleanup offline data:', error);
    }
  }
}

// Create singleton instance
export const offlineStorage = new OfflineStorageService();

// React hook for using offline storage
export const useOfflineStorage = () => {
  return {
    storeFieldData: (fieldId: string, data: any) => offlineStorage.storeFieldData(fieldId, data),
    getFieldData: (fieldId: string) => offlineStorage.getFieldData(fieldId),
    queueAction: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount' | 'maxRetries'>) =>
      offlineStorage.queueAction(action),
    getStorageStats: () => offlineStorage.getStorageStats(),
    setupSyncListener: () => offlineStorage.setupSyncListener(),
    cleanup: (maxAge?: number) => offlineStorage.cleanup(maxAge)
  };
};
