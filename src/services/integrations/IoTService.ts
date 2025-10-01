/**
 * IoT Data Ingestion Service
 * Manages IoT sensor connections and real-time data streaming
 */

import { BaseService, ApiResponse } from '../BaseService';

export interface SensorDevice {
  id: string;
  deviceId: string;
  fieldId: string;
  sensorType: 'soil_moisture' | 'temperature' | 'humidity' | 'ph' | 'npk' | 'light';
  status: 'active' | 'inactive' | 'error';
  batteryLevel?: number;
  lastReading?: SensorReading;
  lastCommunication?: Date;
}

export interface SensorReading {
  sensorId: string;
  value: number;
  unit: string;
  timestamp: Date;
  metadata?: {
    temperature?: number;
    humidity?: number;
    batteryLevel?: number;
    signalStrength?: number;
  };
}

export interface SensorConfig {
  readingInterval: number; // in seconds
  alertThresholds: {
    min?: number;
    max?: number;
  };
  calibration?: {
    offset: number;
    multiplier: number;
  };
}

export class IoTService extends BaseService {
  private ws: WebSocket | null = null;
  private mqttClient: any = null; // MQTT client for IoT
  private eventHandlers: Map<string, Set<(data: SensorReading) => void>> = new Map();

  constructor() {
    super(process.env.VITE_IOT_API_URL || 'https://api.iot.example.com');
  }

  /**
   * Initialize WebSocket connection for real-time sensor data
   */
  async initializeWebSocket(userId: string): Promise<void> {
    const wsUrl = process.env.VITE_IOT_WS_URL || 'wss://ws.iot.example.com';
    
    this.ws = new WebSocket(`${wsUrl}?userId=${userId}`);

    this.ws.onopen = () => {
      console.log('IoT WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const reading: SensorReading = JSON.parse(event.data);
        this.handleSensorReading(reading);
      } catch (error) {
        console.error('Error parsing sensor data:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('IoT WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.initializeWebSocket(userId), 5000);
    };
  }

  /**
   * Initialize MQTT broker connection
   */
  async initializeMQTT(userId: string): Promise<void> {
    // Placeholder for MQTT implementation
    // TODO: Implement actual MQTT client (mqtt.js)
    console.log('MQTT initialization pending implementation');
  }

  /**
   * Subscribe to sensor readings
   */
  subscribeSensor(sensorId: string, callback: (data: SensorReading) => void): void {
    if (!this.eventHandlers.has(sensorId)) {
      this.eventHandlers.set(sensorId, new Set());
    }
    this.eventHandlers.get(sensorId)?.add(callback);
  }

  /**
   * Unsubscribe from sensor readings
   */
  unsubscribeSensor(sensorId: string, callback: (data: SensorReading) => void): void {
    this.eventHandlers.get(sensorId)?.delete(callback);
  }

  /**
   * Handle incoming sensor reading
   */
  private handleSensorReading(reading: SensorReading): void {
    const handlers = this.eventHandlers.get(reading.sensorId);
    if (handlers) {
      handlers.forEach((callback) => callback(reading));
    }
  }

  /**
   * Register a new IoT sensor device
   */
  async registerSensor(sensor: Omit<SensorDevice, 'id'>): Promise<ApiResponse<SensorDevice>> {
    return this.post<SensorDevice>('/sensors/register', sensor);
  }

  /**
   * Get all sensors for a field
   */
  async getSensors(fieldId: string): Promise<ApiResponse<SensorDevice[]>> {
    return this.get<SensorDevice[]>(`/fields/${fieldId}/sensors`);
  }

  /**
   * Get sensor configuration
   */
  async getSensorConfig(sensorId: string): Promise<ApiResponse<SensorConfig>> {
    return this.get<SensorConfig>(`/sensors/${sensorId}/config`);
  }

  /**
   * Update sensor configuration
   */
  async updateSensorConfig(
    sensorId: string,
    config: Partial<SensorConfig>
  ): Promise<ApiResponse<SensorConfig>> {
    return this.put<SensorConfig>(`/sensors/${sensorId}/config`, config);
  }

  /**
   * Get historical sensor readings
   */
  async getSensorHistory(
    sensorId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ApiResponse<SensorReading[]>> {
    return this.get<SensorReading[]>(
      `/sensors/${sensorId}/history?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
    );
  }

  /**
   * Send command to IoT device
   */
  async sendCommand(
    sensorId: string,
    command: string,
    parameters?: any
  ): Promise<ApiResponse<{ status: string }>> {
    return this.post(`/sensors/${sensorId}/command`, {
      command,
      parameters,
    });
  }

  /**
   * Disconnect IoT connections
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    // TODO: Disconnect MQTT client
    this.eventHandlers.clear();
  }
}

export const iotService = new IoTService();
