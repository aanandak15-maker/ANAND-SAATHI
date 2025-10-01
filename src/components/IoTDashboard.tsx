/**
 * IoT Dashboard - Real-time Sensor Monitoring
 * Live sensor data with WebSocket integration
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppState } from '@/contexts/AppStateContext';
import { iotService } from '@/services/integrations/IoTService';
import { toast } from 'sonner';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Activity, Droplets, Thermometer, Wifi, WifiOff, Plus } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export const IoTDashboard: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { isPunjabi, isHindi } = useTranslation();
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize IoT connection
  useEffect(() => {
    if (state.user && state.integrationStatus.iot !== 'connected') {
      connectIoT();
    }

    return () => {
      iotService.disconnect();
    };
  }, [state.user]);

  const connectIoT = async () => {
    setIsConnecting(true);
    try {
      await iotService.initializeWebSocket(state.user?.id || 'demo-user');
      
      dispatch({
        type: 'UPDATE_INTEGRATION_STATUS',
        payload: { iot: 'connected' },
      });
      
      toast.success(isPunjabi ? 'IoT ਕਨੈਕਟ ਹੋ ਗਿਆ!' : isHindi ? 'IoT कनेक्ट हो गया!' : 'IoT connected!');
    } catch (error) {
      console.error('IoT connection error:', error);
      dispatch({
        type: 'UPDATE_INTEGRATION_STATUS',
        payload: { iot: 'error' },
      });
      toast.error(isPunjabi ? 'IoT ਕਨੈਕਸ਼ਨ ਅਸਫਲ' : isHindi ? 'IoT कनेक्शन असफल' : 'IoT connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  // Subscribe to sensor updates
  useEffect(() => {
    state.sensors.forEach(sensor => {
      iotService.subscribeSensor(sensor.id, (reading) => {
        dispatch({
          type: 'UPDATE_SENSOR_DATA',
          payload: {
            sensorId: sensor.id,
            data: {
              id: sensor.id,
              fieldId: sensor.fieldId,
              type: sensor.type,
              value: reading.value,
              unit: reading.unit,
              timestamp: reading.timestamp,
              status: sensor.status,
            },
          },
        });
      });
    });
  }, [state.sensors]);

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'soil_moisture': return <Droplets className="h-5 w-5 text-blue-600" />;
      case 'temperature': return <Thermometer className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-green-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">{isPunjabi ? 'ਸਰਗਰਮ' : isHindi ? 'सक्रिय' : 'Active'}</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-700">{isPunjabi ? 'ਅਸਰਗਰਮ' : isHindi ? 'निष्क्रिय' : 'Inactive'}</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-700">{isPunjabi ? 'ਗਲਤੀ' : isHindi ? 'त्रुटि' : 'Error'}</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            {isPunjabi ? 'IoT ਡੈਸ਼ਬੋਰਡ' : isHindi ? 'IoT डैशबोर्ड' : 'IoT Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isPunjabi ? 'ਰੀਅਲ-ਟਾਈਮ ਸੈਂਸਰ ਮਾਨੀਟਰਿੰਗ' : isHindi ? 'रीयल-टाइम सेंसर मॉनिटरिंग' : 'Real-time sensor monitoring'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {state.integrationStatus.iot === 'connected' ? (
            <Badge className="bg-green-100 text-green-700 flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              {isPunjabi ? 'ਕਨੈਕਟ' : isHindi ? 'कनेक्टेड' : 'Connected'}
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-700 flex items-center gap-2">
              <WifiOff className="h-4 w-4" />
              {isPunjabi ? 'ਡਿਸਕਨੈਕਟ' : isHindi ? 'डिसकनेक्ट' : 'Disconnected'}
            </Badge>
          )}
          <Button onClick={connectIoT} disabled={isConnecting} size="sm">
            {isPunjabi ? 'ਦੁਬਾਰਾ ਕਨੈਕਟ' : isHindi ? 'पुनः कनेक्ट' : 'Reconnect'}
          </Button>
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.sensors.map(sensor => {
          const sensorHistory = state.sensorData.get(sensor.id) || [];
          const latestReading = sensorHistory[sensorHistory.length - 1];

          return (
            <Card key={sensor.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {getSensorIcon(sensor.type)}
                    {sensor.type.replace('_', ' ').toUpperCase()}
                  </CardTitle>
                  {getStatusBadge(sensor.status)}
                </div>
              </CardHeader>
              <CardContent>
                {latestReading ? (
                  <>
                    <div className="text-3xl font-bold">
                      {latestReading.value.toFixed(1)}
                      <span className="text-lg text-muted-foreground ml-1">{latestReading.unit}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(latestReading.timestamp).toLocaleTimeString()}
                    </p>
                    
                    {/* Mini chart */}
                    {sensorHistory.length > 1 && (
                      <div className="mt-3">
                        <ResponsiveContainer width="100%" height={60}>
                          <LineChart data={sensorHistory.slice(-10).map((d, i) => ({ index: i, value: d.value }))}>
                            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {isPunjabi ? 'ਕੋਈ ਡੇਟਾ ਨਹੀਂ' : isHindi ? 'कोई डेटा नहीं' : 'No data'}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
        
        {/* Add Sensor Card */}
        <Card className="border-dashed border-2 hover:border-primary cursor-pointer transition-colors">
          <CardContent className="flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center">
              <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium">
                {isPunjabi ? 'ਸੈਂਸਰ ਜੋੜੋ' : isHindi ? 'सेंसर जोड़ें' : 'Add Sensor'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IoTDashboard;
