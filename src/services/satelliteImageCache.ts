/**
 * Smart Satellite Image Caching Service
 * Downloads and caches satellite images to save Google Maps API costs
 * Updates daily but never refreshes on user interaction
 */

interface CachedImage {
  id: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  imageUrl: string;
  localPath: string;
  cloudPath: string;
  downloadedAt: Date;
  lastUpdated: Date;
  area: number; // in acres
  zoom: number;
}

interface ImageCacheConfig {
  maxCacheSize: number; // Maximum number of cached images
  updateInterval: number; // Daily update interval in hours
  localStorageKey: string;
  cloudStorageEndpoint: string;
}

class SatelliteImageCacheService {
  private config: ImageCacheConfig;
  private cache: Map<string, CachedImage> = new Map();

  constructor() {
    this.config = {
      maxCacheSize: 100, // Store up to 100 images
      updateInterval: 24, // Update every 24 hours
      localStorageKey: 'anand_saathi_satellite_cache',
      cloudStorageEndpoint: '/api/satellite-images'
    };
    
    this.loadCacheFromStorage();
    this.startDailyUpdate();
  }

  /**
   * Get or download satellite image for the specified area
   */
  async getSatelliteImage(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }, zoom: number = 15): Promise<string> {
    const cacheKey = this.generateCacheKey(bounds, zoom);
    
    // Check if we have a cached image
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      console.log('Using cached satellite image:', cacheKey);
      return cached.imageUrl;
    }

    // Download new image
    console.log('Downloading new satellite image for area:', bounds);
    const imageUrl = await this.downloadSatelliteImage(bounds, zoom);
    
    // Cache the image
    await this.cacheImage(cacheKey, bounds, imageUrl, zoom);
    
    return imageUrl;
  }

  /**
   * Download satellite image from Google Maps Static API
   */
  private async downloadSatelliteImage(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }, zoom: number): Promise<string> {
    const centerLat = (bounds.north + bounds.south) / 2;
    const centerLng = (bounds.east + bounds.west) / 2;
    
    // Calculate image size based on area
    const area = this.calculateArea(bounds);
    const imageSize = this.calculateImageSize(area);
    
    const params = new URLSearchParams({
      center: `${centerLat},${centerLng}`,
      zoom: zoom.toString(),
      size: imageSize,
      maptype: 'satellite',
      format: 'png',
      key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
    });

    const imageUrl = `https://maps.googleapis.com/maps/api/staticmap?${params}`;
    
    try {
      // Download and save image locally
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const localUrl = await this.saveImageLocally(blob, bounds, zoom);
      
      // Upload to cloud storage
      await this.uploadToCloud(blob, bounds, zoom);
      
      return localUrl;
    } catch (error) {
      console.error('Error downloading satellite image:', error);
      throw new Error('Failed to download satellite image');
    }
  }

  /**
   * Save image locally using IndexedDB
   */
  private async saveImageLocally(blob: Blob, bounds: any, zoom: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png');
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(blob);
    });
  }

  /**
   * Upload image to cloud storage
   */
  private async uploadToCloud(blob: Blob, bounds: any, zoom: number): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('image', blob, `satellite_${Date.now()}.png`);
      formData.append('bounds', JSON.stringify(bounds));
      formData.append('zoom', zoom.toString());
      
      await fetch(this.config.cloudStorageEndpoint, {
        method: 'POST',
        body: formData
      });
      
      console.log('Image uploaded to cloud storage');
    } catch (error) {
      console.error('Error uploading to cloud:', error);
      // Don't throw error - local storage is sufficient
    }
  }

  /**
   * Cache the downloaded image
   */
  private async cacheImage(
    cacheKey: string,
    bounds: any,
    imageUrl: string,
    zoom: number
  ): Promise<void> {
    const cachedImage: CachedImage = {
      id: cacheKey,
      bounds,
      imageUrl,
      localPath: imageUrl,
      cloudPath: `${this.config.cloudStorageEndpoint}/${cacheKey}`,
      downloadedAt: new Date(),
      lastUpdated: new Date(),
      area: this.calculateArea(bounds),
      zoom
    };

    this.cache.set(cacheKey, cachedImage);
    await this.saveCacheToStorage();
    
    // Clean up old cache if needed
    this.cleanupOldCache();
  }

  /**
   * Check if cached image is still valid (not older than 24 hours)
   */
  private isCacheValid(cached: CachedImage): boolean {
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - cached.lastUpdated.getTime()) / (1000 * 60 * 60);
    return hoursSinceUpdate < this.config.updateInterval;
  }

  /**
   * Generate cache key for bounds and zoom
   */
  private generateCacheKey(bounds: any, zoom: number): string {
    const roundedBounds = {
      north: Math.round(bounds.north * 1000) / 1000,
      south: Math.round(bounds.south * 1000) / 1000,
      east: Math.round(bounds.east * 1000) / 1000,
      west: Math.round(bounds.west * 1000) / 1000
    };
    
    return `sat_${roundedBounds.north}_${roundedBounds.south}_${roundedBounds.east}_${roundedBounds.west}_z${zoom}`;
  }

  /**
   * Calculate area in acres
   */
  private calculateArea(bounds: any): number {
    const latDiff = bounds.north - bounds.south;
    const lngDiff = bounds.east - bounds.west;
    
    // Rough calculation - for more accuracy, use proper geographic calculations
    const areaInSquareDegrees = latDiff * lngDiff;
    const areaInAcres = areaInSquareDegrees * 111000 * 111000 * 0.000247105; // Convert to acres
    
    return Math.round(areaInAcres * 100) / 100;
  }

  /**
   * Calculate appropriate image size based on area
   */
  private calculateImageSize(area: number): string {
    if (area < 1) return '400x400';
    if (area < 5) return '600x600';
    if (area < 20) return '800x800';
    return '1024x1024';
  }

  /**
   * Load cache from localStorage
   */
  private loadCacheFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.config.localStorageKey);
      if (stored) {
        const cacheData = JSON.parse(stored);
        this.cache = new Map(cacheData);
        console.log('Loaded satellite image cache:', this.cache.size, 'images');
      }
    } catch (error) {
      console.error('Error loading cache from storage:', error);
    }
  }

  /**
   * Save cache to localStorage
   */
  private async saveCacheToStorage(): Promise<void> {
    try {
      const cacheArray = Array.from(this.cache.entries());
      localStorage.setItem(this.config.localStorageKey, JSON.stringify(cacheArray));
    } catch (error) {
      console.error('Error saving cache to storage:', error);
    }
  }

  /**
   * Clean up old cache entries
   */
  private cleanupOldCache(): void {
    if (this.cache.size <= this.config.maxCacheSize) return;

    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].lastUpdated.getTime() - b[1].lastUpdated.getTime());
    
    const toRemove = entries.slice(0, entries.length - this.config.maxCacheSize);
    toRemove.forEach(([key]) => {
      this.cache.delete(key);
    });
    
    console.log('Cleaned up old cache entries:', toRemove.length);
  }

  /**
   * Start daily update process
   */
  private startDailyUpdate(): void {
    setInterval(() => {
      this.updateStaleImages();
    }, this.config.updateInterval * 60 * 60 * 1000); // Convert hours to milliseconds
  }

  /**
   * Update stale images in background
   */
  private async updateStaleImages(): Promise<void> {
    console.log('Starting daily satellite image update...');
    
    for (const [key, cached] of this.cache.entries()) {
      if (!this.isCacheValid(cached)) {
        try {
          console.log('Updating stale image:', key);
          await this.downloadSatelliteImage(cached.bounds, cached.zoom);
          cached.lastUpdated = new Date();
        } catch (error) {
          console.error('Error updating stale image:', error);
        }
      }
    }
    
    await this.saveCacheToStorage();
    console.log('Daily satellite image update completed');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalImages: number;
    totalSize: number;
    oldestImage: Date | null;
    newestImage: Date | null;
  } {
    const entries = Array.from(this.cache.values());
    
    return {
      totalImages: entries.length,
      totalSize: entries.reduce((sum, img) => sum + img.area, 0),
      oldestImage: entries.length > 0 ? new Date(Math.min(...entries.map(e => e.downloadedAt.getTime()))) : null,
      newestImage: entries.length > 0 ? new Date(Math.max(...entries.map(e => e.downloadedAt.getTime()))) : null
    };
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(this.config.localStorageKey);
    console.log('Satellite image cache cleared');
  }
}

// Export singleton instance
export const satelliteImageCache = new SatelliteImageCacheService();
export default satelliteImageCache;
