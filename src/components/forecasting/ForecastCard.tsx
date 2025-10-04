import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, Minus, Calendar, Target } from 'lucide-react';
import { BaseComponent } from '@/components/common/BaseComponent';
import { ForecastData } from '@/store/types';
import { useForecasts, useAppStore } from '@/store';
import { cn } from '@/lib/utils';

interface ForecastCardProps {
  fieldId: string;
  forecastId: string;
  title?: string;
  onRefresh?: () => void;
  className?: string;
  showDetails?: boolean;
}

export const ForecastCard: React.FC<ForecastCardProps> = ({
  fieldId,
  forecastId,
  title,
  onRefresh,
  className,
  showDetails = true,
}) => {
  const forecasts = useForecasts(fieldId);
  const { isLoading, error } = useAppStore();
  const setError = useAppStore((state) => state.setError);
  const clearError = useAppStore((state) => state.clearError);

  const forecast = forecasts.find(f => f.id === forecastId);

  const handleRefresh = async () => {
    try {
      clearError();
      // Trigger refresh logic here
      onRefresh?.();
    } catch (error) {
      setError({
        id: crypto.randomUUID(),
        code: 'FORECAST_REFRESH_ERROR',
        message: 'Failed to refresh forecast data',
        timestamp: new Date(),
        resolved: false,
      });
    }
  };

  if (!forecast) {
    return (
      <BaseComponent
        className={className}
        loading={isLoading}
        error={error?.message || null}
        onRetry={handleRefresh}
        title={title || 'Forecast'}
        showCard
      >
        <div className="text-center text-muted-foreground">
          Forecast not found
        </div>
      </BaseComponent>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getTrendIcon = (value: number, previousValue?: number) => {
    if (!previousValue) return <Minus className="h-4 w-4" />;
    if (value > previousValue) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < previousValue) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const formatValue = (value: number | string, unit: string) => {
    if (typeof value === 'number') {
      return `${value.toFixed(1)} ${unit}`;
    }
    return `${value} ${unit}`;
  };

  return (
    <BaseComponent
      className={className}
      loading={isLoading}
      error={error?.message || null}
      onRetry={handleRefresh}
      showCard
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{title || forecast.title}</CardTitle>
              <CardDescription className="mt-1">
                {forecast.description}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                className={cn(
                  'text-xs font-medium',
                  getConfidenceColor(forecast.confidence)
                )}
              >
                {forecast.confidence}% confidence
              </Badge>
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Source and Type */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span className="capitalize">{forecast.type}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(forecast.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Predictions */}
          {forecast.predictions && forecast.predictions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Predictions</h4>
              <div className="space-y-2">
                {forecast.predictions.slice(0, showDetails ? undefined : 3).map((prediction, index) => {
                  const previousPrediction = index > 0 ? forecast.predictions[index - 1] : undefined;
                  const previousValue = previousPrediction?.value;
                  const currentValue = typeof prediction.value === 'number' ? prediction.value : 0;
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(currentValue, previousValue)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {formatValue(prediction.value, prediction.unit)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(prediction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {prediction.confidence}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {!showDetails && forecast.predictions.length > 3 && (
                <Button variant="ghost" size="sm" className="w-full">
                  Show {forecast.predictions.length - 3} more predictions
                </Button>
              )}
            </div>
          )}

          {/* Data Visualization Placeholder */}
          {forecast.data && showDetails && (
            <div className="mt-4 p-3 rounded-lg bg-muted/30">
              <h4 className="text-sm font-medium mb-2">Data Analysis</h4>
              <div className="text-xs text-muted-foreground">
                <pre className="whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(forecast.data, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Valid Until */}
          <div className="pt-2 border-t text-xs text-muted-foreground">
            Valid until: {new Date(forecast.validUntil).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </BaseComponent>
  );
};

// Forecast Grid Component
interface ForecastGridProps {
  fieldId: string;
  forecasts: ForecastData[];
  onRefresh?: (forecastId: string) => void;
  className?: string;
}

export const ForecastGrid: React.FC<ForecastGridProps> = ({
  fieldId,
  forecasts,
  onRefresh,
  className,
}) => {
  if (forecasts.length === 0) {
    return (
      <BaseComponent
        className={className}
        title="No Forecasts Available"
        description="No forecast data is available for this field yet."
        showCard
      >
        <div className="text-center text-muted-foreground py-8">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Forecasts will appear here once data is available</p>
        </div>
      </BaseComponent>
    );
  }

  return (
    <div className={cn('grid gap-4', className)}>
      {forecasts.map((forecast) => (
        <ForecastCard
          key={forecast.id}
          fieldId={fieldId}
          forecastId={forecast.id}
          title={forecast.title}
          onRefresh={() => onRefresh?.(forecast.id)}
          showDetails={false}
        />
      ))}
    </div>
  );
};

// Forecast Summary Component
interface ForecastSummaryProps {
  fieldId: string;
  className?: string;
}

export const ForecastSummary: React.FC<ForecastSummaryProps> = ({
  fieldId,
  className,
}) => {
  const forecasts = useForecasts(fieldId);
  const { isLoading, error } = useAppStore();

  const summary = React.useMemo(() => {
    const types = forecasts.reduce((acc, forecast) => {
      if (!acc[forecast.type]) {
        acc[forecast.type] = {
          count: 0,
          avgConfidence: 0,
          latest: null,
        };
      }
      acc[forecast.type].count++;
      acc[forecast.type].avgConfidence += forecast.confidence;
      if (!acc[forecast.type].latest || forecast.createdAt > acc[forecast.type].latest.createdAt) {
        acc[forecast.type].latest = forecast;
      }
      return acc;
    }, {} as Record<string, { count: number; avgConfidence: number; latest: ForecastData | null }>);

    Object.keys(types).forEach(type => {
      types[type].avgConfidence = Math.round(types[type].avgConfidence / types[type].count);
    });

    return types;
  }, [forecasts]);

  return (
    <BaseComponent
      className={className}
      loading={isLoading}
      error={error?.message || null}
      title="Forecast Summary"
      showCard
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(summary).map(([type, data]) => (
          <div key={type} className="p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium capitalize">{type}</h4>
              <Badge variant="outline">{data.count}</Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Avg Confidence: {data.avgConfidence}%</p>
              {data.latest && (
                <p>Latest: {new Date(data.latest.createdAt).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </BaseComponent>
  );
};
