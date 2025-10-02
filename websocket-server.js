/**
 * Real-time WebSocket Server for Anand Saathi
 * Handles live data streaming for agricultural monitoring
 */

import express from 'express';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure CORS for development
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || false
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Initialize Socket.IO with CORS
const io = new SocketIO(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL || false
      : ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Store connected clients and their subscriptions
const connectedClients = new Map();
const fieldSubscriptions = new Map(); // fieldId -> Set of socket IDs

// Generate realistic sensor data for demo purposes
function generateSensorData(fieldId) {
  const baseTemp = 25 + Math.random() * 10; // 25-35°C
  const baseHumidity = 60 + Math.random() * 30; // 60-90%
  const baseMoisture = 40 + Math.random() * 40; // 40-80%

  return {
    fieldId,
    timestamp: new Date(),
    sensors: {
      temperature: {
        value: Math.round(baseTemp * 10) / 10,
        unit: '°C',
        status: baseTemp > 30 ? 'high' : baseTemp < 20 ? 'low' : 'normal'
      },
      humidity: {
        value: Math.round(baseHumidity),
        unit: '%',
        status: baseHumidity < 50 ? 'low' : baseHumidity > 80 ? 'high' : 'normal'
      },
      soilMoisture: {
        value: Math.round(baseMoisture),
        unit: '%',
        status: baseMoisture < 30 ? 'low' : baseMoisture > 70 ? 'high' : 'normal'
      },
      ph: {
        value: Math.round((6.5 + Math.random() * 1.5) * 10) / 10,
        unit: 'pH',
        status: 'normal'
      }
    }
  };
}

// Generate AI predictions
function generatePredictionUpdate(fieldId) {
  const predictionTypes = ['yield', 'weather', 'pest', 'market', 'soil'];
  const type = predictionTypes[Math.floor(Math.random() * predictionTypes.length)];

  let value;
  let unit;
  let confidence;

  switch (type) {
    case 'yield':
      value = 15 + Math.random() * 10;
      unit = 'quintals/acre';
      confidence = 0.75 + Math.random() * 0.2;
      break;
    case 'weather':
      value = 25 + Math.random() * 10;
      unit = '°C';
      confidence = 0.85 + Math.random() * 0.1;
      break;
    case 'pest':
      value = Math.random() * 100;
      unit = 'risk_score';
      confidence = 0.65 + Math.random() * 0.25;
      break;
    case 'market':
      value = 2000 + Math.random() * 800;
      unit = '₹/quintal';
      confidence = 0.70 + Math.random() * 0.2;
      break;
    case 'soil':
      value = 6.5 + Math.random() * 1.5;
      unit = 'pH';
      confidence = 0.80 + Math.random() * 0.15;
      break;
    default:
      value = 0;
      unit = 'unknown';
      confidence = 0.7;
  }

  return {
    fieldId,
    predictionType: type,
    confidence: Math.round(confidence * 100) / 100,
    value,
    timestamp: new Date(),
    change: (Math.random() - 0.5) * 10, // -5% to +5% change
    unit,
    metadata: {
      modelVersion: 'v1.0',
      dataPoints: 100 + Math.floor(Math.random() * 200)
    }
  };
}

// Generate market price updates
function generateMarketUpdate() {
  const commodities = ['rice', 'wheat', 'sugarcane', 'cotton'];
  const commodity = commodities[Math.floor(Math.random() * commodities.length)];

  return {
    commodity,
    price: 2000 + Math.random() * 1000,
    change: (Math.random() - 0.5) * 200,
    changePercent: (Math.random() - 0.5) * 10,
    source: 'Agricultural Market Intelligence'
  };
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Store client connection
  connectedClients.set(socket.id, {
    id: socket.id,
    connectedAt: new Date(),
    subscriptions: new Set()
  });

  // Handle field subscription
  socket.on('subscribe_to_field', (fieldId) => {
    console.log(`Socket ${socket.id} subscribing to field ${fieldId}`);

    // Add to field subscriptions
    if (!fieldSubscriptions.has(fieldId)) {
      fieldSubscriptions.set(fieldId, new Set());
    }
    fieldSubscriptions.get(fieldId).add(socket.id);

    // Update client subscriptions
    connectedClients.get(socket.id).subscriptions.add(fieldId);

    // Send confirmation
    socket.emit('subscription_confirmed', { fieldId, status: 'subscribed' });
  });

  // Handle field unsubscription
  socket.on('unsubscribe_from_field', (fieldId) => {
    console.log(`Socket ${socket.id} unsubscribing from field ${fieldId}`);

    // Remove from field subscriptions
    fieldSubscriptions.get(fieldId).delete(socket.id);

    // Update client subscriptions
    connectedClients.get(socket.id).subscriptions.delete(fieldId);

    // Send confirmation
    socket.emit('subscription_confirmed', { fieldId, status: 'unsubscribed' });
  });

  // Handle real-time data requests
  socket.on('request_real_time_data', (data) => {
    const { fieldId, types = ['sensor', 'prediction', 'market'] } = data;

    if (fieldId) {
      console.log(`Sending real-time data for field ${fieldId} to socket ${socket.id}`);
    }

    // Send initial data burst
    if (types.includes('sensor') && fieldId) {
      const sensorData = generateSensorData(fieldId);
      socket.emit('sensor_data', sensorData);
    }

    if (types.includes('prediction') && fieldId) {
      const predictionData = generatePredictionUpdate(fieldId);
      socket.emit('prediction_update', predictionData);
    }

    if (types.includes('market')) {
      const marketData = generateMarketUpdate();
      socket.emit('market_update', marketData);
    }
  });

  // Handle ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date() });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);

    // Remove from all field subscriptions
    for (const [fieldId, subscribers] of fieldSubscriptions.entries()) {
      subscribers.delete(socket.id);
      if (subscribers.size === 0) {
        fieldSubscriptions.delete(fieldId);
      }
    }

    // Remove client record
    connectedClients.delete(socket.id);
  });
});

// Simulated data broadcasting (in production, this would be triggered by real events)
function startDataBroadcasting() {
  // Broadcast sensor data every 30 seconds
  setInterval(() => {
    for (const [fieldId, subscribers] of fieldSubscriptions.entries()) {
      if (subscribers.size > 0) {
        const sensorData = generateSensorData(fieldId);
        subscribers.forEach((socketId) => {
          const socket = io.sockets.sockets.get(socketId);
          if (socket) {
            socket.emit('sensor_data', sensorData);
          }
        });
      }
    }
  }, 30000);

  // Broadcast prediction updates every 2 minutes
  setInterval(() => {
    for (const [fieldId, subscribers] of fieldSubscriptions.entries()) {
      if (subscribers.size > 0) {
        const predictionData = generatePredictionUpdate(fieldId);
        subscribers.forEach((socketId) => {
          const socket = io.sockets.sockets.get(socketId);
          if (socket) {
            socket.emit('prediction_update', predictionData);
          }
        });
      }
    }
  }, 120000);

  // Broadcast market updates every 5 minutes
  setInterval(() => {
    const marketData = generateMarketUpdate();
    io.emit('market_update', marketData);
  }, 300000);

  console.log('Data broadcasting started');
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    connectedClients: connectedClients.size,
    activeSubscriptions: fieldSubscriptions.size,
    uptime: process.uptime()
  });
});

app.get('/api/clients', (req, res) => {
  const clients = Array.from(connectedClients.values()).map(client => ({
    id: client.id,
    connectedAt: client.connectedAt,
    subscriptions: Array.from(client.subscriptions)
  }));

  res.json({
    totalClients: clients.length,
    clients
  });
});

// Start server
const WS_PORT = process.env.WS_PORT || 8001;

server.listen(WS_PORT, () => {
  console.log(`🚀 Anand Saathi WebSocket Server running on port ${WS_PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Start data broadcasting after server starts
  setTimeout(startDataBroadcasting, 2000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { app, server, io };
