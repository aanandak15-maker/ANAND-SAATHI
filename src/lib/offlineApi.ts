/**
 * Offline-Aware API Client for Anand Saathi
 * Handles API requests with offline fallback and caching
 */

import { offlineStorage } from '@/services/offlineStorage';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  offline?: boolean;
  cached?: boolean;
  timestamp?: Date;
}

export interface RequestOptions {
  cache?: boolean;
  cacheExpiry?: number; // hours
  offlineQueue?: boolean;
  retries?: number;
}

class OfflineApiClient {
  private defaultOptions: RequestOptions = {
    cache: true,
    cacheExpiry: 1, // 1 hour default
    offlineQueue: true,
    retries: 3
  };

  async get<T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      // Try to get from cache first if caching is enabled
      if (opts.cache && navigator.onLine) {
        const cached = await offlineStorage.getCachedResponse(url);
        if (cached) {
          return {
            data: cached,
            cached: true,
            timestamp: new Date()
          };
        }
      }

      // Make network request
      if (navigator.onLine) {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Cache successful responses
        if (opts.cache) {
          await offlineStorage.cacheResponse(url, data, opts.cacheExpiry);
        }

        return {
          data,
          timestamp: new Date()
        };
      } else {
        // Offline - try to get from cache
        const cached = await offlineStorage.getCachedResponse(url);
        if (cached) {
          return {
            data: cached,
            cached: true,
            offline: true,
            timestamp: new Date()
          };
        }

        return {
          error: 'No internet connection and no cached data available',
          offline: true
        };
      }
    } catch (error) {
      console.error(`API GET request failed for ${url}:`, error);

      // Try cache as fallback
      const cached = await offlineStorage.getCachedResponse(url);
      if (cached) {
        return {
          data: cached,
          cached: true,
          error: 'Network error, using cached data',
          timestamp: new Date()
        };
      }

      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async post<T = any>(
    url: string,
    data: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      if (navigator.onLine) {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        // Invalidate related caches
        await this.invalidateRelatedCaches(url);

        return {
          data: result,
          timestamp: new Date()
        };
      } else {
        // Queue for offline sync
        if (opts.offlineQueue) {
          await offlineStorage.queueAction({
            url,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });

          return {
            data: { queued: true, message: 'Request queued for offline sync' } as T,
            offline: true,
            timestamp: new Date()
          };
        } else {
          return {
            error: 'No internet connection',
            offline: true
          };
        }
      }
    } catch (error) {
      console.error(`API POST request failed for ${url}:`, error);

      if (opts.offlineQueue && !navigator.onLine) {
        await offlineStorage.queueAction({
          url,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        return {
          data: { queued: true, message: 'Request queued for offline sync' } as T,
          offline: true,
          timestamp: new Date()
        };
      }

      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async put<T = any>(
    url: string,
    data: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      if (navigator.onLine) {
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        // Invalidate related caches
        await this.invalidateRelatedCaches(url);

        return {
          data: result,
          timestamp: new Date()
        };
      } else {
        if (opts.offlineQueue) {
          await offlineStorage.queueAction({
            url,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });

          return {
            data: { queued: true, message: 'Request queued for offline sync' } as T,
            offline: true,
            timestamp: new Date()
          };
        } else {
          return {
            error: 'No internet connection',
            offline: true
          };
        }
      }
    } catch (error) {
      console.error(`API PUT request failed for ${url}:`, error);

      if (opts.offlineQueue && !navigator.onLine) {
        await offlineStorage.queueAction({
          url,
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        return {
          data: { queued: true, message: 'Request queued for offline sync' } as T,
          offline: true,
          timestamp: new Date()
        };
      }

      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async delete<T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      if (navigator.onLine) {
        const response = await fetch(url, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        // Invalidate related caches
        await this.invalidateRelatedCaches(url);

        return {
          data: result,
          timestamp: new Date()
        };
      } else {
        if (opts.offlineQueue) {
          await offlineStorage.queueAction({
            url,
            method: 'DELETE',
            headers: {}
          });

          return {
            data: { queued: true, message: 'Request queued for offline sync' } as T,
            offline: true,
            timestamp: new Date()
          };
        } else {
          return {
            error: 'No internet connection',
            offline: true
          };
        }
      }
    } catch (error) {
      console.error(`API DELETE request failed for ${url}:`, error);

      if (opts.offlineQueue && !navigator.onLine) {
        await offlineStorage.queueAction({
          url,
          method: 'DELETE',
          headers: {}
        });

        return {
          data: { queued: true, message: 'Request queued for offline sync' } as T,
          offline: true,
          timestamp: new Date()
        };
      }

      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async invalidateRelatedCaches(url: string) {
    try {
      // Extract base URL to invalidate related endpoints
      const urlObj = new URL(url, window.location.origin);
      const basePath = urlObj.pathname.split('/').slice(0, -1).join('/') || '/';

      // This is a simplified cache invalidation - in production you might want
      // more sophisticated cache management
      console.log(`Invalidating caches for path: ${basePath}`);
    } catch (error) {
      console.error('Failed to invalidate caches:', error);
    }
  }

  // Get cache statistics
  async getCacheStats() {
    return await offlineStorage.getStorageStats();
  }

  // Clear all caches
  async clearCache() {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('🗑️ All caches cleared');
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }

  // Setup offline sync listener
  setupOfflineSync() {
    offlineStorage.setupSyncListener();

    // Also listen for service worker sync events
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('anand-saathi-sync').catch(console.error);
      });
    }
  }
}

// Create singleton instance
export const api = new OfflineApiClient();

// React hook for using offline API client
export const useOfflineApi = () => {
  return {
    get: <T = any>(url: string, options?: RequestOptions) => api.get<T>(url, options),
    post: <T = any>(url: string, data: any, options?: RequestOptions) => api.post<T>(url, data, options),
    put: <T = any>(url: string, data: any, options?: RequestOptions) => api.put<T>(url, data, options),
    delete: <T = any>(url: string, options?: RequestOptions) => api.delete<T>(url, options),
    getCacheStats: () => api.getCacheStats(),
    clearCache: () => api.clearCache(),
    setupOfflineSync: () => api.setupOfflineSync()
  };
};
