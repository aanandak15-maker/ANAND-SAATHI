/**
 * Real-time Dashboard Component
 * Live AI prediction updates with visual indicators
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  RefreshCw,
  Bell,
  Zap,
  Droplets,
  Thermometer,
  Leaf,
  DollarSign
} from 'lucide-react';
import { useRealTimeService, PredictionUpdate } from '@/services/realTimeService';
import { toast } from 'sonner';

interface RealTimeDashboardProps {
  fieldId: string;
  onPredictionUpdate?: (update: PredictionUpdate) => void;
}

interface PredictionSummary {
  type: string;
  current: any;
  previous: any;
  change: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdate: Date;
  confidence: number;
}

export const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({
  fieldId,
  onPredictionUpdate
}) => {
  const { subscribe, unsubscribe, getStatus, requestPrediction } = useRealTimeService();
  const [predictions, setPredictions] = useState<PredictionSummary[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Connect to real-time service
    const connectService = async () => {
      try {
        await subscribe(fieldId, handlePredictionUpdate);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect to real-time service:', error);
        setIsConnected(false);
      }
    };

    connectService();

    return () => {
      unsubscribe(fieldId);
    };
  }, [fieldId]);

  const handlePredictionUpdate = (update: PredictionUpdate) => {
    setLastUpdate(new Date());

    // Update predictions state
    setPredictions(prev => {
      const existingIndex = prev.findIndex(p => p.type === update.predictionType);

      const newPrediction: PredictionSummary = {
        type: update.predictionType,
        current: update.value,
        previous: existingIndex >= 0 ? prev[existingIndex].current : update.value,
        change: update.change,
        trend: update.change > 1 ? 'up' : update.change < -1 ? 'down' : 'stable',
        lastUpdate: update.timestamp,
        confidence: update.confidence
      };

      if (existingIndex >= 0) {
        // Update existing prediction
        const updated = [...prev];
        updated[existingIndex] = newPrediction;
        return updated;
      } else {
        // Add new prediction type
        return [newPrediction, ...prev.slice(0, 4)]; // Keep only last 5 predictions
      }
    });

    // Show toast notification for significant changes
    if (Math.abs(update.change) > 5) {
      const trendIcon = update.change > 0 ? '↗️' : '↘️';
      toast.success(
        `${getPredictionIcon(update.predictionType)} ${update.predictionType.toUpperCase()}: ${trendIcon} ${Math.abs(update.change)}%`
      );
    }

    // Call external handler if provided
    if (onPredictionUpdate) {
      onPredictionUpdate(update);
    }
  };

  const getPredictionIcon = (type: string) => {
    switch (type) {
      case 'yield': return '🌾';
      case 'weather': return '🌤️';
      case 'pest': return '🐛';
      case 'market': return '💰';
      case 'soil': return '🌱';
      default: return '📊';
    }
  };

  const getPredictionColor = (type: string) => {
    switch (type) {
      case 'yield': return 'text-green-600';
      case 'weather': return 'text-blue-600';
      case 'pest': return 'text-red-600';
      case 'market': return 'text-purple-600';
      case 'soil': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const formatValue = (value: any, type: string) => {
    if (typeof value === 'number') {
      if (type === 'yield') return `${value.toFixed(1)} tons/ha`;
      if (type === 'market') return `₹${value.toFixed(0)}`;
      return value.toFixed(1);
    }
    return value;
  };

  const refreshPredictions = () => {
    // Request fresh predictions for all types
    ['yield', 'weather', 'pest', 'market', 'soil'].forEach(type => {
      requestPrediction(fieldId, type as PredictionUpdate['predictionType']);
    });
  };

  const connectionStatus = getStatus();

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live AI Predictions
            <Badge variant={isConnected ? "default" : "destructive"} className="ml-2">
              {isConnected ? (
                <><Wifi className="h-3 w-3 mr-1" />Connected</>
              ) : (
                <><WifiOff className="h-3 w-3 mr-1" />Disconnected</>
              )}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={refreshPredictions}
            disabled={!isConnected}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          Real-time updates from AI forecasting models
          {lastUpdate && (
            <span className="ml-2 text-xs">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {predictions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Waiting for live predictions...</p>
            <Button
              size="sm"
              variant="outline"
              onClick={refreshPredictions}
              className="mt-2"
            >
              Request Predictions
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {predictions.map((prediction, index) => (
              <Alert key={index} className={`border-l-4 ${getPredictionColor(prediction.type)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getPredictionIcon(prediction.type)}</span>
                    <div>
                      <div className="font-medium capitalize">
                        {prediction.type} Prediction
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Confidence: {Math.round(prediction.confidence * 100)}%
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {formatValue(prediction.current, prediction.type)}
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      prediction.trend === 'up' ? 'text-green-600' :
                      prediction.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {prediction.trend === 'up' ? <TrendingUp className="h-3 w-3" /> :
                       prediction.trend === 'down' ? <TrendingDown className="h-3 w-3" /> :
                       <Activity className="h-3 w-3" />}
                      {Math.abs(prediction.change)}%
                    </div>
                  </div>
                </div>

                {/* Progress bar for confidence */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Confidence</span>
                    <span>{Math.round(prediction.confidence * 100)}%</span>
                  </div>
                  <Progress value={prediction.confidence * 100} className="h-2" />
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Connection status indicator */}
        {!isConnected && (
          <Alert className="mt-4">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              Real-time updates are unavailable. Showing cached data.
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.reload()}
                className="ml-2"
              >
                Retry Connection
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeDashboard;
