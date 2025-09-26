/**
 * Anand Saathi Alerts Component
 * Simple alerts and notifications system
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X,
  RefreshCw
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { anandSaathiBackend } from '@/lib/anandSaathiBackend';

interface AlertData {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface AnandSaathiAlertsProps {
  farmId?: string;
}

const AnandSaathiAlerts: React.FC<AnandSaathiAlertsProps> = ({ farmId }) => {
  const { t, isPunjabi, isHindi } = useTranslation();
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sample alerts data
  const sampleAlerts: AlertData[] = [
    {
      id: '1',
      type: 'warning',
      title: isPunjabi ? 'ਮਿੱਟੀ ਨਮੀ ਘੱਟ' : isHindi ? 'मिट्टी नमी कम' : 'Low Soil Moisture',
      message: isPunjabi ? 'ਖੇਤ 1 ਵਿੱਚ ਮਿੱਟੀ ਨਮੀ 30% ਤੋਂ ਘੱਟ ਹੈ' : isHindi ? 'खेत 1 में मिट्टी नमी 30% से कम है' : 'Field 1 soil moisture is below 30%',
      timestamp: new Date().toISOString(),
      acknowledged: false
    },
    {
      id: '2',
      type: 'info',
      title: isPunjabi ? 'ਫਸਲ ਸਿਹਤ ਚੰਗੀ' : isHindi ? 'फसल स्वास्थ्य अच्छा' : 'Crop Health Good',
      message: isPunjabi ? 'NDVI ਸੂਚਕ 0.8 ਤੋਂ ਉੱਪਰ ਹੈ' : isHindi ? 'NDVI सूचक 0.8 से ऊपर है' : 'NDVI index is above 0.8',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      acknowledged: false
    },
    {
      id: '3',
      type: 'error',
      title: isPunjabi ? 'ਡਿਵਾਈਸ ਗਲਤ' : isHindi ? 'डिवाइस गलत' : 'Device Error',
      message: isPunjabi ? 'IoT ਸੈਂਸਰ 2 ਕੰਮ ਨਹੀਂ ਕਰ ਰਿਹਾ' : isHindi ? 'IoT सेंसर 2 काम नहीं कर रहा' : 'IoT sensor 2 is not working',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      acknowledged: true
    }
  ];

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      // For now, use sample data
      setAlerts(sampleAlerts);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-500 bg-red-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      case 'success': return 'border-green-500 bg-green-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const acknowledgedAlerts = alerts.filter(alert => alert.acknowledged);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {isPunjabi ? 'ਅਲਰਟਸ ਅਤੇ ਸੂਚਨਾਵਾਂ' : isHindi ? 'अलर्ट्स और सूचनाएं' : 'Alerts & Notifications'}
          </CardTitle>
          <CardDescription>
            {isPunjabi 
              ? 'ਖੇਤ ਅਤੇ ਫਸਲ ਸੰਬੰਧੀ ਅਲਰਟਸ'
              : isHindi 
              ? 'खेत और फसल संबंधी अलर्ट्स'
              : 'Field and crop related alerts'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">
                {unacknowledgedAlerts.length} {isPunjabi ? 'ਨਵੇਂ' : isHindi ? 'नए' : 'New'}
              </Badge>
              <Badge variant="secondary">
                {acknowledgedAlerts.length} {isPunjabi ? 'ਪੜ੍ਹੇ ਗਏ' : isHindi ? 'पढ़े गए' : 'Read'}
              </Badge>
            </div>
            <Button 
              onClick={loadAlerts} 
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Unacknowledged Alerts */}
          {unacknowledgedAlerts.length > 0 && (
            <div className="space-y-3 mb-6">
              <h3 className="font-medium text-sm">
                {isPunjabi ? 'ਨਵੇਂ ਅਲਰਟਸ' : isHindi ? 'नए अलर्ट्स' : 'New Alerts'}
              </h3>
              {unacknowledgedAlerts.map((alert) => (
                <Alert key={alert.id} className={getAlertColor(alert.type)}>
                  <div className="flex items-start gap-2">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <AlertDescription>
                        <div className="font-medium">{alert.title}</div>
                        <div className="text-sm mt-1">{alert.message}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </AlertDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Alert>
              ))}
            </div>
          )}

          {/* Acknowledged Alerts */}
          {acknowledgedAlerts.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm">
                {isPunjabi ? 'ਪੜ੍ਹੇ ਗਏ ਅਲਰਟਸ' : isHindi ? 'पढ़े गए अलर्ट्स' : 'Read Alerts'}
              </h3>
              {acknowledgedAlerts.map((alert) => (
                <Alert key={alert.id} className="opacity-60">
                  <div className="flex items-start gap-2">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <AlertDescription>
                        <div className="font-medium">{alert.title}</div>
                        <div className="text-sm mt-1">{alert.message}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </AlertDescription>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </Alert>
              ))}
            </div>
          )}

          {alerts.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{isPunjabi ? 'ਕੋਈ ਅਲਰਟ ਨਹੀਂ' : isHindi ? 'कोई अलर्ट नहीं' : 'No alerts'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnandSaathiAlerts;