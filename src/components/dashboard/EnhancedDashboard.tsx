import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Map, 
  Activity, 
  Cloud, 
  Droplets, 
  Thermometer, 
  Sun,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { BaseComponent, LoadingSpinner, ErrorDisplay, EmptyState } from '@/components/common/BaseComponent';
import { ForecastCard, ForecastGrid, ForecastSummary } from '@/components/forecasting/ForecastCard';
import { useAppStore, useFields, useForecasts, useSensors, useIntegrationStatus } from '@/store';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalFields: number;
  activeSensors: number;
  forecastsGenerated: number;
  alertsActive: number;
  weatherCondition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  temperature: number;
  humidity: number;
  soilMoisture: number;
}

export const EnhancedDashboard: React.FC = () => {
  const {
    selectedFieldId,
    isLoading,
    error,
    setError,
    clearError,
    setLoading,
    updateIntegrationStatus,
  } = useAppStore();
  
  const fields = useFields();
  const sensors = useSensors();
  const integrationStatus = useIntegrationStatus();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [selectedFieldId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      clearError();
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculate stats
      const totalFields = fields.length;
      const activeSensors = sensors.filter(s => s.status === 'active').length;
      const forecastsGenerated = Object.values(useAppStore.getState().forecasts)
        .flat().length;
      const alertsActive = useAppStore.getState().notifications
        .filter(n => !n.read && n.type === 'warning').length;
      
      setStats({
        totalFields,
        activeSensors,
        forecastsGenerated,
        alertsActive,
        weatherCondition: 'sunny',
        temperature: 28,
        humidity: 65,
        soilMoisture: 45,
      });
      
      // Update integration status
      updateIntegrationStatus({
        iot: activeSensors > 0 ? 'connected' : 'disconnected',
        timesfm: 'connected',
        satellite: 'connected',
        government: 'disconnected',
      });
      
    } catch (error) {
      setError({
        id: crypto.randomUUID(),
        code: 'DASHBOARD_LOAD_ERROR',
        message: 'Failed to load dashboard data',
        timestamp: new Date(),
        resolved: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'cloudy': return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'rainy': return <Droplets className="h-6 w-6 text-blue-500" />;
      case 'stormy': return <AlertTriangle className="h-6 w-6 text-red-500" />;
      default: return <Sun className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getIntegrationStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected': return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorDisplay 
          error={error.message} 
          onRetry={handleRefresh}
          title="Dashboard Error"
        />
      </div>
    );
  }

  if (!stats) {
    return (
      <EmptyState
        title="No Data Available"
        description="Unable to load dashboard data. Please try refreshing."
        icon={<BarChart3 className="h-12 w-12 text-muted-foreground" />}
        action={
          <Button onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your fields and get AI-powered insights
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fields</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFields}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalFields > 0 ? 'Active fields' : 'No fields added yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sensors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSensors}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSensors > 0 ? 'Sensors online' : 'No sensors connected'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forecasts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.forecastsGenerated}</div>
            <p className="text-xs text-muted-foreground">
              AI predictions generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.alertsActive}</div>
            <p className="text-xs text-muted-foreground">
              {stats.alertsActive > 0 ? 'Alerts require attention' : 'All clear'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weather and Environment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getWeatherIcon(stats.weatherCondition)}
              <span>Current Weather</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{stats.temperature}°C</span>
              <Badge variant="outline" className="capitalize">
                {stats.weatherCondition}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span>Humidity: {stats.humidity}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-orange-500" />
                <span>Soil: {stats.soilMoisture}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(integrationStatus).map(([service, status]) => (
              <div key={service} className="flex items-center justify-between">
                <span className="capitalize text-sm">{service}</span>
                <div className="flex items-center space-x-2">
                  {getIntegrationStatusIcon(status)}
                  <Badge 
                    variant={status === 'connected' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <Map className="mr-2 h-4 w-4" />
              View Fields
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              Check Sensors
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              Generate Forecast
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="fields">Fields</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your fields</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Field 1: Soil moisture optimal</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Field 2: Irrigation needed</p>
                      <p className="text-xs text-muted-foreground">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">New forecast generated</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Current system status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Services</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Models</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">External APIs</span>
                    <Badge variant="secondary">Degraded</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          {selectedFieldId ? (
            <div className="space-y-4">
              <ForecastSummary fieldId={selectedFieldId} />
              <ForecastGrid 
                fieldId={selectedFieldId}
                forecasts={useForecasts(selectedFieldId)}
              />
            </div>
          ) : (
            <EmptyState
              title="No Field Selected"
              description="Select a field to view forecasts"
              icon={<BarChart3 className="h-12 w-12 text-muted-foreground" />}
            />
          )}
        </TabsContent>

        <TabsContent value="fields" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Fields</CardTitle>
              <CardDescription>Manage your agricultural fields</CardDescription>
            </CardHeader>
            <CardContent>
              {fields.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fields.map((field) => (
                    <Card key={field.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">{field.name}</CardTitle>
                        <CardDescription>{field.cropType}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <p>Area: {field.area} hectares</p>
                          <p>Status: <Badge variant="outline">{field.status}</Badge></p>
                          <p>Location: {field.location.address}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Fields Added"
                  description="Add your first field to get started"
                  icon={<Map className="h-12 w-12 text-muted-foreground" />}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IoT Sensors</CardTitle>
              <CardDescription>Monitor your field sensors</CardDescription>
            </CardHeader>
            <CardContent>
              {sensors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sensors.map((sensor) => (
                    <Card key={sensor.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{sensor.name}</CardTitle>
                        <CardDescription className="capitalize">{sensor.type.replace('_', ' ')}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <p>Status: <Badge variant={sensor.status === 'active' ? 'default' : 'secondary'}>{sensor.status}</Badge></p>
                          <p>Last Reading: {new Date(sensor.lastReading).toLocaleString()}</p>
                          <p>Readings: {sensor.readings.length}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Sensors Connected"
                  description="Connect IoT sensors to monitor your fields"
                  icon={<Activity className="h-12 w-12 text-muted-foreground" />}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
