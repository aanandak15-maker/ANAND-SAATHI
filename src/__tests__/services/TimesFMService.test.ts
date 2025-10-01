/**
 * Unit Tests for TimesFM Service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { timesFMService } from '@/services/integrations/TimesFMService';

describe('TimesFMService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('forecastYield', () => {
    it('should generate yield forecast successfully', async () => {
      const request = {
        fieldId: 'field123',
        cropType: 'rice',
        historicalData: [12, 13, 14, 15, 14, 13],
        horizon: 30,
      };

      const result = await timesFMService.forecastYield(request);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.predictions).toHaveLength(30);
      expect(result.data?.confidenceScore).toBeGreaterThan(0);
      expect(result.data?.confidenceScore).toBeLessThanOrEqual(1);
    });

    it('should return expected yield value', async () => {
      const request = {
        fieldId: 'field123',
        cropType: 'wheat',
        historicalData: [10, 11, 12],
        horizon: 10,
      };

      const result = await timesFMService.forecastYield(request);

      expect(result.data?.expectedYield).toBeGreaterThan(0);
      expect(result.data?.yieldUnit).toBe('quintals/acre');
    });
  });

  describe('forecastMarket', () => {
    it('should generate market forecast successfully', async () => {
      const result = await timesFMService.forecastMarket('rice', [2000, 2100, 2200], 30);

      expect(result.success).toBe(true);
      expect(result.data?.predictions).toHaveLength(30);
      expect(result.data?.commodity).toBe('rice');
    });

    it('should provide price confidence intervals', async () => {
      const result = await timesFMService.forecastMarket('wheat', [2000], 5);

      expect(result.data?.prices).toHaveLength(5);
      result.data?.prices.forEach(price => {
        expect(price.predicted).toBeGreaterThan(0);
        expect(price.low).toBeLessThan(price.predicted);
        expect(price.high).toBeGreaterThan(price.predicted);
      });
    });
  });

  describe('forecastWeather', () => {
    it('should generate weather forecast successfully', async () => {
      const location = { lat: 30.9, lng: 75.8 };
      const result = await timesFMService.forecastWeather(location, 14);

      expect(result.success).toBe(true);
      expect(result.data?.predictions).toHaveLength(14);
      expect(result.data?.parameters.temperature).toHaveLength(14);
    });
  });

  describe('getComprehensiveForecast', () => {
    it('should generate all three forecast types', async () => {
      const result = await timesFMService.getComprehensiveForecast(
        'field123',
        'rice',
        { yield: [12, 13, 14], prices: [2000, 2100] }
      );

      expect(result.success).toBe(true);
      expect(result.data?.yield).toBeDefined();
      expect(result.data?.market).toBeDefined();
      expect(result.data?.weather).toBeDefined();
    });
  });
});
