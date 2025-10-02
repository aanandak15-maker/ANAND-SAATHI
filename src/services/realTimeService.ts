/**
 * Real-time Service for Anand Saathi
 * WebSocket-based real-time data streaming for live AI predictions
 */

import { io, Socket } from 'socket.io-client';

export interface PredictionUpdate {
  fieldId: string;
  predictionType: 'yield' | 'weather' | 'pest' | 'market' | 'soil';
  confidence: number;
  value: any;
  timestamp: Date;
  change: number; // percentage change from previous prediction
  unit?: string;
  metadata?: Record<string, any>;
}

export interface RealTimeConfig {
  wsUrl?: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  enableOfflineQueue?: boolean;
}

class RealTimeService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private subscribers: Map<string, (update: PredictionUpdate) => void> = new Map();
  private isConnected = false;
  private config: RealTimeConfig;

  constructor(config: RealTimeConfig = {}) {
    this.config = {
      wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8001',
      reconnectAttempts: 5,
      reconnectInterval: 1000,
      enableOfflineQueue: true,
      ...config
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      console.log('Connecting to real-time service...', this.config.wsUrl);

      this.socket = io(this.config.wsUrl, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log('✅ Real-time service connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Real-time service disconnected:', reason);
        this.isConnected = false;

        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect
          this.scheduleReconnect();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Real-time connection error:', error);
        this.isConnected = false;

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        } else {
          reject(new Error('Failed to connect to real-time service'));
        }
      });

      // Handle prediction updates
      this.socket.on('prediction_update', (data: any) => {
        const update: PredictionUpdate = {
          ...data,
          timestamp: new Date(data.timestamp)
        };
        this.notifySubscribers(update.fieldId, update);
      });

      // Handle bulk updates
      this.socket.on('bulk_prediction_update', (updates: any[]) => {
        updates.forEach(updateData => {
          const update: PredictionUpdate = {
            ...updateData,
            timestamp: new Date(updateData.timestamp)
          };
          this.notifySubscribers(update.fieldId, update);
        });
      });

      // Handle connection status updates
      this.socket.on('connection_status', (status: { connected: boolean; message: string }) => {
        this.isConnected = status.connected;
        console.log('Connection status:', status.message);
      });
    });
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (!this.isConnected) {
        this.connect().catch(console.error);
      }
    }, delay);
  }

  subscribe(fieldId: string, callback: (update: PredictionUpdate) => void) {
    console.log(`Subscribing to updates for field: ${fieldId}`);
    this.subscribers.set(fieldId, callback);

    // Request current state for this field
    if (this.socket?.connected) {
      this.socket.emit('subscribe_to_field', { fieldId });
    }
  }

  unsubscribe(fieldId: string) {
    console.log(`Unsubscribing from updates for field: ${fieldId}`);
    this.subscribers.delete(fieldId);

    if (this.socket?.connected) {
      this.socket.emit('unsubscribe_from_field', { fieldId });
    }
  }

  private notifySubscribers(fieldId: string, update: PredictionUpdate) {
    const callback = this.subscribers.get(fieldId);
    if (callback) {
      try {
        callback(update);
      } catch (error) {
        console.error('Error in real-time subscriber callback:', error);
      }
    }
  }

  // Send prediction request to server
  requestPrediction(fieldId: string, predictionType: PredictionUpdate['predictionType']) {
    if (this.socket?.connected) {
      this.socket.emit('request_prediction', { fieldId, predictionType });
    } else {
      console.warn('Cannot request prediction: not connected to real-time service');
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.subscribers.clear();
    }
  }
}

// Create singleton instance
export const realTimeService = new RealTimeService();

// React hook for using real-time service
export const useRealTimeService = () => {
  return {
    connect: () => realTimeService.connect(),
    subscribe: (fieldId: string, callback: (update: PredictionUpdate) => void) =>
      realTimeService.subscribe(fieldId, callback),
    unsubscribe: (fieldId: string) => realTimeService.unsubscribe(fieldId),
    requestPrediction: (fieldId: string, type: PredictionUpdate['predictionType']) =>
      realTimeService.requestPrediction(fieldId, type),
    getStatus: () => realTimeService.getConnectionStatus(),
    disconnect: () => realTimeService.disconnect()
  };
};
