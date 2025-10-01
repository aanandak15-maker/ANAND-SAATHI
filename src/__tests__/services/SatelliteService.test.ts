/**
 * Unit Tests for Satellite Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { satelliteService } from '@/services/integrations/SatelliteService';

describe('SatelliteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeField', () => {
    it('should analyze field and return vegetation indices', async () => {
      const fieldId = 'field123';
      const boundary: [number, number][] = [
        [75.8573, 30.9010],
        [75.8580, 30.9010],
        [75.8580, 30.9020],
        [75.8573, 30.9020],
      ];

      const result = await satelliteService.analyzeField(fieldId, boundary);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.indices).toBeDefined();
      expect(result.data?.indices.ndvi).toBeGreaterThanOrEqual(-1);
      expect(result.data?.indices.ndvi).toBeLessThanOrEqual(1);
    });

    it('should include health status in analysis', async () => {
      const result = await satelliteService.analyzeField('field123', [[75.8573, 30.9010]]);

      expect(result.data?.healthStatus).toBeDefined();
      expect(['excellent', 'good', 'moderate', 'poor', 'critical']).toContain(
        result.data?.healthStatus
      );
    });

    it('should provide recommendations', async () => {
      const result = await satelliteService.analyzeField('field123', [[75.8573, 30.9010]]);

      expect(result.data?.recommendations).toBeDefined();
      expect(Array.isArray(result.data?.recommendations)).toBe(true);
    });
  });

  describe('calculateIndices', () => {
    it('should calculate vegetation indices from satellite image', async () => {
      const imageId = 'IMG123';
      const boundary: [number, number][] = [[75.8573, 30.9010]];

      const result = await satelliteService.calculateIndices(imageId, boundary);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.ndvi).toBeDefined();
      expect(result.data?.ndmi).toBeDefined();
      expect(result.data?.msavi2).toBeDefined();
    });
  });

  describe('getHistoricalTrends', () => {
    it('should retrieve historical vegetation trends', async () => {
      const fieldId = 'field123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = await satelliteService.getHistoricalTrends(fieldId, startDate, endDate);

      expect(result.success).toBe(true);
      expect(result.data?.dates).toBeDefined();
      expect(result.data?.ndvi).toBeDefined();
      expect(result.data?.dates.length).toBeGreaterThan(0);
    });
  });

  describe('getProviders', () => {
    it('should return list of satellite providers', () => {
      const providers = satelliteService.getProviders();

      expect(Array.isArray(providers)).toBe(true);
      expect(providers.length).toBeGreaterThan(0);
      expect(providers[0]).toHaveProperty('id');
      expect(providers[0]).toHaveProperty('name');
      expect(providers[0]).toHaveProperty('resolution');
    });
  });
});
