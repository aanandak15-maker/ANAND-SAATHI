/**
 * Anand Saathi Real-time Metrics Dashboard
 * Live monitoring dashboard for agricultural operations
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Droplets,
  Leaf,
  Bug,
  BarChart3,
  Thermometer,
  Wind,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Snowflake,
  Eye,
  Zap,
  Shield,
  Target,
  Clock,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Download,
  Upload,
  Wifi,
  WifiOff,
  Signal,
  Battery,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Heart,
  Star,
  Globe,
  MapPin,
  Calendar,
  Users,
  Database,
  Server,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Router,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  MessageSquare,
  Mail,
  Send,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  ExternalLink,
  Maximize,
  Minimize,
  RotateCcw,
  Save,
  Trash2,
  Edit,
  Copy,
  Share,
  Lock,
  Unlock,
  Key,
  User,
  UserCheck,
  UserX,
  UserPlus,
  Users2,
  UserCog,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  X,
  Plus,
  Minus as MinusIcon,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Layout,
  Sidebar,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  Split,
  Columns,
  Rows,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Diamond,
  Star as StarIcon,
  Heart as HeartIcon,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,
  Surprised,
  Confused,
  Wink,
  Tongue,
  Kiss,
  Hug,
  Hand,
  Point,
  Wave,
  Clap,
  ThumbsUp as ThumbsUpIcon,
  ThumbsDown as ThumbsDownIcon
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  status: 'normal' | 'warning' | 'critical';
  lastUpdate: Date;
  category: 'environment' | 'crop' | 'equipment' | 'market' | 'system';
  icon: React.ReactNode;
  description: string;
  threshold: {
    min: number;
    max: number;
    optimal: number;
  };
}

interface SystemStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  uptime: number;
  lastCheck: Date;
  responseTime: number;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
  actions: string[];
}

interface DeviceStatus {
  id: string;
  name: string;
  type: 'sensor' | 'camera' | 'irrigation' | 'weather' | 'gateway';
  status: 'online' | 'offline' | 'maintenance';
  battery: number;
  signal: number;
  lastData: Date;
  location: string;
  metrics: {
    temperature?: number;
    humidity?: number;
    pressure?: number;
    light?: number;
    soilMoisture?: number;
    ph?: number;
    nutrients?: { nitrogen: number; phosphorus: number; potassium: number };
  };
}

const AnandSaathiRealTimeMetrics: React.FC = () => {
  const { t, isPunjabi, isHindi } = useTranslation();
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize real-time data
  useEffect(() => {
    initializeData();
    
    if (isLive) {
      startRealTimeUpdates();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLive, isPunjabi, isHindi]);

  const initializeData = () => {
    // Initialize metrics
    setMetrics([
      {
        id: 'temperature',
        name: isPunjabi ? 'ਤਾਪਮਾਨ' : isHindi ? 'तापमान' : 'Temperature',
        value: 28.5,
        unit: '°C',
        trend: 'up',
        change: 2.3,
        status: 'normal',
        lastUpdate: new Date(),
        category: 'environment',
        icon: <Thermometer className="h-4 w-4" />,
        description: isPunjabi ? 'ਵਰਤਮਾਨ ਤਾਪਮਾਨ' : isHindi ? 'वर्तमान तापमान' : 'Current temperature',
        threshold: { min: 15, max: 40, optimal: 25 }
      },
      {
        id: 'humidity',
        name: isPunjabi ? 'ਨਮੀ' : isHindi ? 'नमी' : 'Humidity',
        value: 65,
        unit: '%',
        trend: 'down',
        change: -5.2,
        status: 'normal',
        lastUpdate: new Date(),
        category: 'environment',
        icon: <Droplets className="h-4 w-4" />,
        description: isPunjabi ? 'ਹਵਾ ਵਿੱਚ ਨਮੀ' : isHindi ? 'हवा में नमी' : 'Air humidity',
        threshold: { min: 30, max: 90, optimal: 60 }
      },
      {
        id: 'soil_moisture',
        name: isPunjabi ? 'ਮਿੱਟੀ ਦੀ ਨਮੀ' : isHindi ? 'मिट्टी की नमी' : 'Soil Moisture',
        value: 45,
        unit: '%',
        trend: 'stable',
        change: 0.1,
        status: 'warning',
        lastUpdate: new Date(),
        category: 'crop',
        icon: <Leaf className="h-4 w-4" />,
        description: isPunjabi ? 'ਮਿੱਟੀ ਵਿੱਚ ਪਾਣੀ ਦਾ ਪੱਧਰ' : isHindi ? 'मिट्टी में पानी का स्तर' : 'Soil water level',
        threshold: { min: 20, max: 80, optimal: 50 }
      },
      {
        id: 'crop_health',
        name: isPunjabi ? 'ਫਸਲ ਸਿਹਤ' : isHindi ? 'फसल स्वास्थ्य' : 'Crop Health',
        value: 85,
        unit: '%',
        trend: 'up',
        change: 3.2,
        status: 'normal',
        lastUpdate: new Date(),
        category: 'crop',
        icon: <Heart className="h-4 w-4" />,
        description: isPunjabi ? 'ਫਸਲ ਦੀ ਸਿਹਤ ਦਾ ਸਕੋਰ' : isHindi ? 'फसल के स्वास्थ्य का स्कोर' : 'Crop health score',
        threshold: { min: 0, max: 100, optimal: 80 }
      },
      {
        id: 'pest_risk',
        name: isPunjabi ? 'ਕੀਟ ਖਤਰਾ' : isHindi ? 'कीट खतरा' : 'Pest Risk',
        value: 25,
        unit: '%',
        trend: 'down',
        change: -8.5,
        status: 'normal',
        lastUpdate: new Date(),
        category: 'crop',
        icon: <Bug className="h-4 w-4" />,
        description: isPunjabi ? 'ਕੀਟ ਹਮਲੇ ਦਾ ਖਤਰਾ' : isHindi ? 'कीट हमले का खतरा' : 'Pest attack risk',
        threshold: { min: 0, max: 100, optimal: 20 }
      },
      {
        id: 'market_price',
        name: isPunjabi ? 'ਬਾਜ਼ਾਰ ਕੀਮਤ' : isHindi ? 'बाजार कीमत' : 'Market Price',
        value: 2800,
        unit: '₹/q',
        trend: 'up',
        change: 150,
        status: 'normal',
        lastUpdate: new Date(),
        category: 'market',
        icon: <TrendingUp className="h-4 w-4" />,
        description: isPunjabi ? 'ਚੌਲਾਂ ਦੀ ਮੌਜੂਦਾ ਕੀਮਤ' : isHindi ? 'चावल की मौजूदा कीमत' : 'Current rice price',
        threshold: { min: 2000, max: 4000, optimal: 3000 }
      }
    ]);

    // Initialize system status
    setSystemStatus([
      {
        id: 'main-server',
        name: isPunjabi ? 'ਮੁੱਖ ਸਰਵਰ' : isHindi ? 'मुख्य सर्वर' : 'Main Server',
        status: 'online',
        uptime: 99.9,
        lastCheck: new Date(),
        responseTime: 45,
        cpu: 35,
        memory: 68,
        disk: 45,
        network: 92
      },
      {
        id: 'database',
        name: isPunjabi ? 'ਡੇਟਾਬੇਸ' : isHindi ? 'डेटाबेस' : 'Database',
        status: 'online',
        uptime: 99.8,
        lastCheck: new Date(),
        responseTime: 12,
        cpu: 25,
        memory: 45,
        disk: 78,
        network: 95
      },
      {
        id: 'iot-gateway',
        name: isPunjabi ? 'IoT ਗੇਟਵੇ' : isHindi ? 'IoT गेटवे' : 'IoT Gateway',
        status: 'online',
        uptime: 98.5,
        lastCheck: new Date(),
        responseTime: 78,
        cpu: 55,
        memory: 72,
        disk: 32,
        network: 88
      }
    ]);

    // Initialize alerts
    setAlerts([
      {
        id: 'alert-1',
        type: 'warning',
        title: isPunjabi ? 'ਮਿੱਟੀ ਦੀ ਨਮੀ ਘੱਟ' : isHindi ? 'मिट्टी की नमी कम' : 'Low Soil Moisture',
        message: isPunjabi 
          ? 'ਮਿੱਟੀ ਦੀ ਨਮੀ 45% ਹੈ, ਜੋ ਆਦਰਸ਼ ਪੱਧਰ ਤੋਂ ਘੱਟ ਹੈ।'
          : isHindi 
          ? 'मिट्टी की नमी 45% है, जो आदर्श स्तर से कम है।'
          : 'Soil moisture is 45%, which is below optimal level.',
        timestamp: new Date(Date.now() - 300000),
        source: 'soil-sensor-1',
        severity: 'medium',
        acknowledged: false,
        actions: [
          isPunjabi ? 'ਸਿੰਚਾਈ ਸ਼ੁਰੂ ਕਰੋ' : isHindi ? 'सिंचाई शुरू करें' : 'Start irrigation',
          isPunjabi ? 'ਮਾਨੀਟਰਿੰਗ ਜਾਰੀ ਰੱਖੋ' : isHindi ? 'मॉनिटरिंग जारी रखें' : 'Continue monitoring'
        ]
      },
      {
        id: 'alert-2',
        type: 'info',
        title: isPunjabi ? 'ਸਿਸਟਮ ਅਪਡੇਟ' : isHindi ? 'सिस्टम अपडेट' : 'System Update',
        message: isPunjabi 
          ? 'ਸਿਸਟਮ ਸਫਲਤਾਪੂਰਵਕ ਅਪਡੇਟ ਹੋ ਗਿਆ ਹੈ।'
          : isHindi 
          ? 'सिस्टम सफलतापूर्वक अपडेट हो गया है।'
          : 'System has been successfully updated.',
        timestamp: new Date(Date.now() - 1800000),
        source: 'system',
        severity: 'low',
        acknowledged: true,
        actions: []
      }
    ]);

    // Initialize devices
    setDevices([
      {
        id: 'sensor-1',
        name: isPunjabi ? 'ਤਾਪਮਾਨ ਸੈਂਸਰ' : isHindi ? 'तापमान सेंसर' : 'Temperature Sensor',
        type: 'sensor',
        status: 'online',
        battery: 85,
        signal: 92,
        lastData: new Date(),
        location: isPunjabi ? 'ਖੇਤ A' : isHindi ? 'खेत A' : 'Field A',
        metrics: {
          temperature: 28.5,
          humidity: 65,
          pressure: 1013.25
        }
      },
      {
        id: 'camera-1',
        name: isPunjabi ? 'ਸੁਰੱਖਿਆ ਕੈਮਰਾ' : isHindi ? 'सुरक्षा कैमरा' : 'Security Camera',
        type: 'camera',
        status: 'online',
        battery: 100,
        signal: 88,
        lastData: new Date(),
        location: isPunjabi ? 'ਖੇਤ ਦਾ ਦਰਵਾਜ਼ਾ' : isHindi ? 'खेत का दरवाजा' : 'Field Gate',
        metrics: {}
      },
      {
        id: 'irrigation-1',
        name: isPunjabi ? 'ਸਿੰਚਾਈ ਸਿਸਟਮ' : isHindi ? 'सिंचाई सिस्टम' : 'Irrigation System',
        type: 'irrigation',
        status: 'online',
        battery: 95,
        signal: 95,
        lastData: new Date(),
        location: isPunjabi ? 'ਖੇਤ B' : isHindi ? 'खेत B' : 'Field B',
        metrics: {
          soilMoisture: 45,
          ph: 6.8,
          nutrients: { nitrogen: 75, phosphorus: 60, potassium: 80 }
        }
      }
    ]);
  };

  const startRealTimeUpdates = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      updateMetrics();
      setLastUpdate(new Date());
    }, 5000); // Update every 5 seconds
  };

  const updateMetrics = () => {
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      value: metric.value + (Math.random() - 0.5) * 2,
      lastUpdate: new Date(),
      change: (Math.random() - 0.5) * 10
    })));

    setSystemStatus(prev => prev.map(system => ({
      ...system,
      lastCheck: new Date(),
      cpu: Math.max(0, Math.min(100, system.cpu + (Math.random() - 0.5) * 10)),
      memory: Math.max(0, Math.min(100, system.memory + (Math.random() - 0.5) * 5)),
      responseTime: Math.max(10, system.responseTime + (Math.random() - 0.5) * 20)
    })));

    setDevices(prev => prev.map(device => ({
      ...device,
      lastData: new Date(),
      battery: Math.max(0, Math.min(100, device.battery - Math.random() * 0.1)),
      signal: Math.max(0, Math.min(100, device.signal + (Math.random() - 0.5) * 5))
    })));
  };

  const toggleLiveUpdates = () => {
    setIsLive(!isLive);
    if (!isLive) {
      startRealTimeUpdates();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
    toast.success(isPunjabi ? 'ਚੇਤਾਵਨੀ ਸਵੀਕਾਰ ਕੀਤੀ ਗਈ' : isHindi ? 'चेतावनी स्वीकार की गई' : 'Alert acknowledged');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'offline': return 'text-red-600';
      case 'maintenance': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'maintenance': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <HelpCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-500" />
            {isPunjabi ? 'ਰੀਅਲ-ਟਾਈਮ ਮੈਟ੍ਰਿਕਸ' : isHindi ? 'रियल-टाइम मेट्रिक्स' : 'Real-time Metrics'}
          </CardTitle>
          <CardDescription>
            {isPunjabi 
              ? 'ਖੇਤੀ ਕਾਰਜਾਂ ਦੀ ਲਾਈਵ ਮਾਨੀਟਰਿੰਗ ਅਤੇ ਵਿਸ਼ਲੇਸ਼ਣ'
              : isHindi 
              ? 'कृषि कार्यों की लाइव मॉनिटरिंग और विश्लेषण'
              : 'Live monitoring and analysis of agricultural operations'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                onClick={toggleLiveUpdates}
                variant={isLive ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                {isLive ? (
                  <>
                    <Pause className="h-4 w-4" />
                    {isPunjabi ? 'ਲਾਈਵ ਰੋਕੋ' : isHindi ? 'लाइव रोकें' : 'Stop Live'}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    {isPunjabi ? 'ਲਾਈਵ ਸ਼ੁਰੂ ਕਰੋ' : isHindi ? 'लाइव शुरू करें' : 'Start Live'}
                  </>
                )}
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {isPunjabi ? 'ਆਖਰੀ ਅਪਡੇਟ:' : isHindi ? 'अंतिम अपडेट:' : 'Last Update:'} {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={isLive ? "default" : "secondary"} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                {isLive ? (isPunjabi ? 'ਲਾਈਵ' : isHindi ? 'लाइव' : 'Live') : (isPunjabi ? 'ਬੰਦ' : isHindi ? 'बंद' : 'Offline')}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {isPunjabi ? 'ਓਵਰਵਿਊ' : isHindi ? 'ओवरव्यू' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="environment" className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            {isPunjabi ? 'ਮਾਹੌਲ' : isHindi ? 'माहौल' : 'Environment'}
          </TabsTrigger>
          <TabsTrigger value="crops" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            {isPunjabi ? 'ਫਸਲਾਂ' : isHindi ? 'फसलें' : 'Crops'}
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            {isPunjabi ? 'ਡਿਵਾਈਸ' : isHindi ? 'डिवाइस' : 'Devices'}
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {isPunjabi ? 'ਚੇਤਾਵਨੀਆਂ' : isHindi ? 'चेतावनियां' : 'Alerts'}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {metric.icon}
                      <CardTitle className="text-sm">{metric.name}</CardTitle>
                    </div>
                    {getTrendIcon(metric.trend)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-bold ${getMetricStatusColor(metric.status)}`}>
                        {metric.value.toFixed(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">{metric.unit}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={metric.change > 0 ? 'text-green-600' : 'text-red-600'}>
                        {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                      </span>
                      <span className="text-muted-foreground">
                        {isPunjabi ? 'ਪਿਛਲੇ 5 ਮਿੰਟ' : isHindi ? 'पिछले 5 मिनट' : 'Last 5 min'}
                      </span>
                    </div>
                    <Progress 
                      value={(metric.value / metric.threshold.max) * 100} 
                      className="h-1"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Environment Tab */}
        <TabsContent value="environment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  {isPunjabi ? 'ਮੌਸਮ ਸਥਿਤੀ' : isHindi ? 'मौसम स्थिति' : 'Weather Conditions'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <Sun className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                      <div className="text-lg font-semibold">32°C</div>
                      <div className="text-xs text-muted-foreground">
                        {isPunjabi ? 'ਤਾਪਮਾਨ' : isHindi ? 'तापमान' : 'Temperature'}
                      </div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <Droplets className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                      <div className="text-lg font-semibold">65%</div>
                      <div className="text-xs text-muted-foreground">
                        {isPunjabi ? 'ਨਮੀ' : isHindi ? 'नमी' : 'Humidity'}
                      </div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <Wind className="h-6 w-6 text-gray-500 mx-auto mb-1" />
                      <div className="text-lg font-semibold">12 km/h</div>
                      <div className="text-xs text-muted-foreground">
                        {isPunjabi ? 'ਹਵਾ' : isHindi ? 'हवा' : 'Wind'}
                      </div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <Cloud className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                      <div className="text-lg font-semibold">25%</div>
                      <div className="text-xs text-muted-foreground">
                        {isPunjabi ? 'ਬੱਦਲ' : isHindi ? 'बादल' : 'Clouds'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  {isPunjabi ? 'ਮਿੱਟੀ ਸਥਿਤੀ' : isHindi ? 'मिट्टी स्थिति' : 'Soil Conditions'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        {isPunjabi ? 'ਮਿੱਟੀ ਦੀ ਨਮੀ' : isHindi ? 'मिट्टी की नमी' : 'Soil Moisture'}
                      </span>
                      <span className="text-sm font-semibold">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">pH Level</span>
                      <span className="text-sm font-semibold">6.8</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 border rounded">
                      <div className="text-sm font-semibold">N</div>
                      <div className="text-xs text-muted-foreground">75%</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className="text-sm font-semibold">P</div>
                      <div className="text-xs text-muted-foreground">60%</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className="text-sm font-semibold">K</div>
                      <div className="text-xs text-muted-foreground">80%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Crops Tab */}
        <TabsContent value="crops" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                {isPunjabi ? 'ਫਸਲ ਸਿਹਤ' : isHindi ? 'फसल स्वास्थ्य' : 'Crop Health'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
                    <div className="text-sm text-muted-foreground">
                      {isPunjabi ? 'ਕੁੱਲ ਫਸਲ ਸਿਹਤ' : isHindi ? 'कुल फसल स्वास्थ्य' : 'Overall Crop Health'}
                    </div>
                    <Progress value={85} className="h-2 mt-2" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {isPunjabi ? 'ਕੀਟ ਖਤਰਾ' : isHindi ? 'कीट खतरा' : 'Pest Risk'}
                    </span>
                    <span className="text-sm font-semibold text-green-600">25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {isPunjabi ? 'ਰੋਗ ਖਤਰਾ' : isHindi ? 'रोग खतरा' : 'Disease Risk'}
                    </span>
                    <span className="text-sm font-semibold text-yellow-600">35%</span>
                  </div>
                  <Progress value={35} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {isPunjabi ? 'ਪੋਸ਼ਣ ਪੱਧਰ' : isHindi ? 'पोषण स्तर' : 'Nutrition Level'}
                    </span>
                    <span className="text-sm font-semibold text-blue-600">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => (
              <Card key={device.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{device.name}</CardTitle>
                    {getStatusIcon(device.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {isPunjabi ? 'ਸਥਿਤੀ:' : isHindi ? 'स्थिति:' : 'Status:'}
                      </span>
                      <Badge variant="outline" className={getStatusColor(device.status)}>
                        {device.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {isPunjabi ? 'ਬੈਟਰੀ:' : isHindi ? 'बैटरी:' : 'Battery:'}
                      </span>
                      <span className="font-semibold">{device.battery.toFixed(0)}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {isPunjabi ? 'ਸਿਗਨਲ:' : isHindi ? 'सिग्नल:' : 'Signal:'}
                      </span>
                      <span className="font-semibold">{device.signal.toFixed(0)}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {isPunjabi ? 'ਸਥਾਨ:' : isHindi ? 'स्थान:' : 'Location:'}
                      </span>
                      <span className="font-semibold">{device.location}</span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {isPunjabi ? 'ਆਖਰੀ ਡੇਟਾ:' : isHindi ? 'अंतिम डेटा:' : 'Last Data:'} {device.lastData.toLocaleTimeString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {isPunjabi ? 'ਸਿਸਟਮ ਚੇਤਾਵਨੀਆਂ' : isHindi ? 'सिस्टम चेतावनियां' : 'System Alerts'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Alert key={alert.id} className={getAlertTypeColor(alert.type)}>
                    <div className="flex items-center gap-2">
                      {alert.type === 'info' && <Info className="h-4 w-4" />}
                      {alert.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                      {alert.type === 'error' && <XCircle className="h-4 w-4" />}
                      {alert.type === 'success' && <CheckCircle className="h-4 w-4" />}
                    </div>
                    <AlertTitle>{alert.title}</AlertTitle>
                    <AlertDescription>
                      <div className="space-y-2">
                        <p>{alert.message}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            {alert.timestamp.toLocaleString()}
                          </div>
                          {!alert.acknowledged && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              {isPunjabi ? 'ਸਵੀਕਾਰ ਕਰੋ' : isHindi ? 'स्वीकार करें' : 'Acknowledge'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnandSaathiRealTimeMetrics;

