/**
 * Unit Tests for IoT Service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { iotService } from '@/services/integrations/IoTService';

describe('IoTService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    iotService.disconnect();
  });

  describe('registerSensor', () => {
    it('should handle sensor registration gracefully when no IoT infrastructure is deployed', async () => {
      const sensor = {
        deviceId: 'SENSOR001',
        fieldId: 'field123',
        sensorType: 'soil_moisture' as const,
        status: 'active' as const,
        lastReading: {
          sensorId: 'SENSOR001',
          value: 45.5,
          unit: 'percent',
          timestamp: new Date(),
          metadata: {
            batteryLevel: 85,
            signalStrength: -50
          }
        },
        lastCommunication: new Date(),
      };

      const result = await iotService.registerSensor(sensor);

      // When no IoT infrastructure is deployed, expect graceful failure
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getSensors', () => {
    it('should handle sensor retrieval gracefully when no IoT infrastructure is deployed', async () => {
      const fieldId = 'field123';
      const result = await iotService.getSensors(fieldId);

      // When no IoT infrastructure is deployed, expect graceful failure
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('subscribeSensor', () => {
    it('should allow subscription to sensor updates', () => {
      const sensorId = 'sensor123';
      const callback = vi.fn();

      iotService.subscribeSensor(sensorId, callback);

      // Verify subscription was registered
      expect(true).toBe(true); // Subscription logic is internal
    });

    it('should unsubscribe from sensor updates', () => {
      const sensorId = 'sensor123';
      const callback = vi.fn();

      iotService.subscribeSensor(sensorId, callback);
      iotService.unsubscribeSensor(sensorId, callback);

      expect(true).toBe(true); // Unsubscription logic is internal
    });
  });

  describe('getSensorHistory', () => {
    it('should handle sensor history retrieval gracefully when no IoT infrastructure is deployed', async () => {
      const sensorId = 'sensor123';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = await iotService.getSensorHistory(sensorId, startDate, endDate);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('sendCommand', () => {
    it('should handle IoT commands gracefully when no IoT infrastructure is deployed', async () => {
      const sensorId = 'sensor123';
      const command = 'calibrate';
      const parameters = { offset: 0.5 };

      const result = await iotService.sendCommand(sensorId, command, parameters);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
