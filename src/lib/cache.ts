// Simple caching system for API responses and analysis results

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 100; // Maximum number of entries

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Generate cache key for field analysis
  generateFieldAnalysisKey(boundary: any, cropType: string): string {
    const coords = boundary.coordinates[0];
    const centerLat = coords.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / coords.length;
    const centerLng = coords.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / coords.length;
    
    // Round coordinates to reduce cache misses for similar fields
    const roundedLat = Math.round(centerLat * 1000) / 1000;
    const roundedLng = Math.round(centerLng * 1000) / 1000;
    
    return `field_analysis_${roundedLat}_${roundedLng}_${cropType}`;
  }

  // Generate cache key for satellite images
  generateSatelliteImageKey(boundary: any): string {
    const coords = boundary.coordinates[0];
    const centerLat = coords.reduce((sum: number, coord: number[]) => sum + coord[1], 0) / coords.length;
    const centerLng = coords.reduce((sum: number, coord: number[]) => sum + coord[0], 0) / coords.length;
    
    const roundedLat = Math.round(centerLat * 1000) / 1000;
    const roundedLng = Math.round(centerLng * 1000) / 1000;
    
    return `satellite_image_${roundedLat}_${roundedLng}`;
  }
}

// Export singleton instance
export const cache = new SimpleCache();

// Cache TTL constants
export const CACHE_TTL = {
  FIELD_ANALYSIS: 30 * 60 * 1000, // 30 minutes
  SATELLITE_IMAGE: 60 * 60 * 1000, // 1 hour
  WEATHER_DATA: 10 * 60 * 1000, // 10 minutes
  RECOMMENDATIONS: 15 * 60 * 1000, // 15 minutes
} as const;
