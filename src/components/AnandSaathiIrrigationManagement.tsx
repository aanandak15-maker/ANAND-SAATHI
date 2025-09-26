/**
 * Anand Saathi Irrigation Management
 * Smart irrigation scheduling, monitoring, and water management system
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Droplets,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  Thermometer,
  Wind,
  Sun,
  Activity,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Gauge,
  Zap,
  Leaf
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

interface IrrigationSchedule {
  id: string;
  field_id: string;
  field_name: string;
  crop_type: string;
  irrigation_type: 'flood' | 'drip' | 'sprinkler' | 'manual';
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  start_time: string;
  duration_minutes: number;
  water_amount_liters: number;
  status: 'active' | 'paused' | 'completed' | 'overdue';
  next_due: string;
  last_completed?: string;
  efficiency_rating?: number;
}

interface WaterSource {
  id: string;
  name: string;
  type: 'well' | 'canal' | 'rainwater' | 'municipal' | 'river';
  capacity_liters: number;
  current_level_liters: number;
  quality_rating: 'excellent' | 'good' | 'fair' | 'poor';
  cost_per_liter?: number;
  availability: 'available' | 'limited' | 'unavailable';
}

interface SoilMoistureReading {
  id: string;
  field_id: string;
  moisture_level: number; // percentage
  timestamp: string;
  sensor_location: string;
  recommendation: string;
}

const AnandSaathiIrrigationManagement: React.FC = () => {
  const { t, isPunjabi, isHindi } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>([
    {
      id: '1',
      field_id: '1',
      field_name: 'North Rice Field',
      crop_type: 'Rice',
      irrigation_type: 'flood',
      frequency: 'daily',
      start_time: '06:00',
      duration_minutes: 60,
      water_amount_liters: 15000,
      status: 'active',
      next_due: '2024-09-24T06:00:00',
      last_completed: '2024-09-23T06:30:00',
      efficiency_rating: 85
    },
    {
      id: '2',
      field_id: '2',
      field_name: 'Wheat Field A',
      crop_type: 'Wheat',
      irrigation_type: 'drip',
      frequency: 'weekly',
      start_time: '07:00',
      duration_minutes: 120,
      water_amount_liters: 8000,
      status: 'active',
      next_due: '2024-09-27T07:00:00',
      last_completed: '2024-09-20T07:15:00',
      efficiency_rating: 92
    }
  ]);

  const [waterSources, setWaterSources] = useState<WaterSource[]>([
    {
      id: '1',
      name: 'Main Well',
      type: 'well',
      capacity_liters: 100000,
      current_level_liters: 75000,
      quality_rating: 'excellent',
      cost_per_liter: 0.05,
      availability: 'available'
    },
    {
      id: '2',
      name: 'Canal Water',
      type: 'canal',
      capacity_liters: 500000,
      current_level_liters: 450000,
      quality_rating: 'good',
      cost_per_liter: 0.02,
      availability: 'available'
    },
    {
      id: '3',
      name: 'Rainwater Tank',
      type: 'rainwater',
      capacity_liters: 50000,
      current_level_liters: 25000,
      quality_rating: 'excellent',
      availability: 'limited'
    }
  ]);

  const [moistureReadings, setMoistureReadings] = useState<SoilMoistureReading[]>([
    {
      id: '1',
      field_id: '1',
      moisture_level: 65,
      timestamp: '2024-09-23T10:00:00',
      sensor_location: 'North Section',
      recommendation: 'Irrigation needed in 2 days'
    },
    {
      id: '2',
      field_id: '2',
      moisture_level: 78,
      timestamp: '2024-09-23T10:00:00',
      sensor_location: 'Center Section',
      recommendation: 'Moisture level optimal'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getEfficiencyColor = (rating: number) => {
    if (rating >= 90) return 'text-green-600';
    if (rating >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWaterSourceIcon = (type: string) => {
    switch (type) {
      case 'well': return <Droplets className="h-4 w-4" />;
      case 'canal': return <Activity className="h-4 w-4" />;
      case 'rainwater': return <Sun className="h-4 w-4" />;
      case 'municipal': return <Settings className="h-4 w-4" />;
      case 'river': return <Wind className="h-4 w-4" />;
      default: return <Droplets className="h-4 w-4" />;
    }
  };

  const getMoistureStatus = (level: number) => {
    if (level >= 70) return { status: 'optimal', color: 'text-green-600' };
    if (level >= 50) return { status: 'moderate', color: 'text-yellow-600' };
    return { status: 'low', color: 'text-red-600' };
  };

  const handleScheduleStatus = (scheduleId: string, newStatus: string) => {
    setSchedules(prev => prev.map(schedule =>
      schedule.id === scheduleId
        ? { ...schedule, status: newStatus as any }
        : schedule
    ));
    toast.success(isPunjabi ? 'ਸ਼ਡਿਊਲ ਅੱਪਡੇਟ ਹੋ ਗਿਆ' : isHindi ? 'शेड्यूल अपडेट हो गया' : 'Schedule updated');
  };

  const handleAddSchedule = () => {
    toast.success(isPunjabi ? 'ਸਿੰਚਾਈ ਸ਼ਡਿਊਲ ਜੋੜਨ ਲਈ ਅੱਗੇ ਵਧ ਰਹੇ ਹਾਂ' : isHindi ? 'सिंचाई शेड्यूल जोड़ने के लिए आगे बढ़ रहे हैं' : 'Adding irrigation schedule functionality coming soon');
  };

  const totalWaterUsed = schedules.reduce((sum, schedule) => sum + schedule.water_amount_liters, 0);
  const activeSchedules = schedules.filter(schedule => schedule.status === 'active').length;
  const overdueSchedules = schedules.filter(schedule => schedule.status === 'overdue').length;
  const averageEfficiency = schedules.reduce((sum, schedule) => sum + (schedule.efficiency_rating || 0), 0) / schedules.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-6 w-6 text-primary" />
            {isPunjabi ? 'ਅਨੰਦ ਸਾਥੀ ਸਿੰਚਾਈ ਪ੍ਰਬੰਧਨ' : isHindi ? 'अनंद साथी सिंचाई प्रबंधन' : 'Anand Saathi Irrigation Management'}
          </CardTitle>
          <CardDescription>
            {isPunjabi ? 'ਸਮਾਰਟ ਸਿੰਚਾਈ ਸ਼ਡਿਊਲਿੰਗ, ਨਿਗਰਾਨੀ ਅਤੇ ਪਾਣੀ ਪ੍ਰਬੰਧਨ ਪ੍ਰਣਾਲੀ' : isHindi ? 'स्मार्ट सिंचाई शेड्यूलिंग, निगरानी और पानी प्रबंधन प्रणाली' : 'Smart irrigation scheduling, monitoring, and water management system'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{activeSchedules}</div>
            <div className="text-sm text-muted-foreground">
              {isPunjabi ? 'ਸਰਗਰਮ ਸ਼ਡਿਊਲਸ' : isHindi ? 'सक्रिय शेड्यूल्स' : 'Active Schedules'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{totalWaterUsed.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">
              {isPunjabi ? 'ਕੁਲ ਪਾਣੀ ਵਰਤਿਆ' : isHindi ? 'कुल पानी इस्तेमाल' : 'Total Water Used (L)'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{overdueSchedules}</div>
            <div className="text-sm text-muted-foreground">
              {isPunjabi ? 'ਬਕਾਇਆ ਸ਼ਡਿਊਲਸ' : isHindi ? 'बकाया शेड्यूल्स' : 'Overdue Schedules'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${getEfficiencyColor(averageEfficiency)}`}>
              {averageEfficiency.toFixed(0)}%
            </div>
            <div className="text-sm text-muted-foreground">
              {isPunjabi ? 'ਔਸਤ ਕੁਸ਼ਲਤਾ' : isHindi ? 'औसत दक्षता' : 'Avg. Efficiency'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਅਵਲੋਕਨ' : isHindi ? 'अवलोकन' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="schedules">
            <Calendar className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਸ਼ਡਿਊਲਸ' : isHindi ? 'शेड्यूल्स' : 'Schedules'}
          </TabsTrigger>
          <TabsTrigger value="sources">
            <Droplets className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਪਾਣੀ ਸਰੋਤ' : isHindi ? 'पानी स्रोत' : 'Water Sources'}
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <Gauge className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਨਿਗਰਾਨੀ' : isHindi ? 'निगरानी' : 'Monitoring'}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'विश्लेषण' : 'Analytics'}
          </TabsTrigger>
          <TabsTrigger value="reports">
            <Download className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਰਿਪੋਰਟਸ' : isHindi ? 'रिपोर्ट्स' : 'Reports'}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map((schedule) => (
              <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(schedule.status)}`}></div>
                      <CardTitle className="text-lg">{schedule.field_name}</CardTitle>
                    </div>
                    <Badge variant="outline">{schedule.irrigation_type}</Badge>
                  </div>
                  <CardDescription>{schedule.crop_type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਅਗਲਾ ਸਿੰਚਾਈ' : isHindi ? 'अगली सिंचाई' : 'Next Irrigation'}
                      </span>
                      <span className="font-medium">{new Date(schedule.next_due).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਪਾਣੀ ਦੀ ਮਾਤਰਾ' : isHindi ? 'पानी की मात्रा' : 'Water Amount'}
                      </span>
                      <span className="font-medium">{schedule.water_amount_liters.toLocaleString()}L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਕੁਸ਼ਲਤਾ' : isHindi ? 'दक्षता' : 'Efficiency'}
                      </span>
                      <span className={`font-medium ${getEfficiencyColor(schedule.efficiency_rating || 0)}`}>
                        {schedule.efficiency_rating}%
                      </span>
                    </div>
                    {schedule.last_completed && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {isPunjabi ? 'ਆਖਰੀ ਪੂਰਾ' : isHindi ? 'अंतिम पूरा' : 'Last Completed'}
                        </span>
                        <span className="font-medium">{new Date(schedule.last_completed).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant={schedule.status === 'active' ? 'destructive' : 'default'}
                        onClick={() => handleScheduleStatus(schedule.id, schedule.status === 'active' ? 'paused' : 'active')}
                      >
                        {schedule.status === 'active' ? (isPunjabi ? 'ਰੋਕੋ' : isHindi ? 'रोकें' : 'Pause') : (isPunjabi ? 'ਸ਼ੁਰੂ ਕਰੋ' : isHindi ? 'शुरू करें' : 'Start')}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {isPunjabi ? 'ਸਿੰਚਾਈ ਸ਼ਡਿਊਲਸ' : isHindi ? 'सिंचाई शेड्यूल्स' : 'Irrigation Schedules'}
            </h3>
            <Button onClick={handleAddSchedule}>
              <Plus className="h-4 w-4 mr-2" />
              {isPunjabi ? 'ਸ਼ਡਿਊਲ ਜੋੜੋ' : isHindi ? 'शेड्यूल जोड़ें' : 'Add Schedule'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedules.map((schedule) => (
              <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{schedule.field_name}</CardTitle>
                    <Badge variant="outline">{schedule.irrigation_type}</Badge>
                  </div>
                  <CardDescription>{schedule.crop_type} • {schedule.frequency}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਅਗਲਾ ਸਿੰਚਾਈ' : isHindi ? 'अगली सिंचाई' : 'Next Due'}
                      </span>
                      <span className="font-medium">{new Date(schedule.next_due).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਪਾਣੀ ਦੀ ਮਾਤਰਾ' : isHindi ? 'पानी की मात्रा' : 'Water Amount'}
                      </span>
                      <span className="font-medium">{schedule.water_amount_liters.toLocaleString()}L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਅਵਧੀ' : isHindi ? 'अवधि' : 'Duration'}
                      </span>
                      <span className="font-medium">{schedule.duration_minutes}min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਸਥਿਤੀ' : isHindi ? 'स्थिति' : 'Status'}
                      </span>
                      <span className="font-medium">{schedule.status}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Water Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {isPunjabi ? 'ਪਾਣੀ ਸਰੋਤ' : isHindi ? 'पानी स्रोत' : 'Water Sources'}
            </h3>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              {isPunjabi ? 'ਸਰੋਤ ਜੋੜੋ' : isHindi ? 'स्रोत जोड़ें' : 'Add Source'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {waterSources.map((source) => (
              <Card key={source.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getWaterSourceIcon(source.type)}
                      <CardTitle className="text-lg">{source.name}</CardTitle>
                    </div>
                    <Badge variant={source.availability === 'available' ? 'default' : 'secondary'}>
                      {source.availability}
                    </Badge>
                  </div>
                  <CardDescription>{source.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{isPunjabi ? 'ਵਰਤਮਾਨ ਪੱਧਰ' : isHindi ? 'वर्तमान स्तर' : 'Current Level'}</span>
                        <span>{source.current_level_liters.toLocaleString()}L</span>
                      </div>
                      <Progress
                        value={(source.current_level_liters / source.capacity_liters) * 100}
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{isPunjabi ? 'ਕੁਲ ਸਮਰੱਥਾ' : isHindi ? 'कुल क्षमता' : 'Capacity'}: {source.capacity_liters.toLocaleString()}L</span>
                        <span>{Math.round((source.current_level_liters / source.capacity_liters) * 100)}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਗੁਣਵੱਤਾ' : isHindi ? 'गुणवत्ता' : 'Quality'}
                      </span>
                      <span className="font-medium">{source.quality_rating}</span>
                    </div>
                    {source.cost_per_liter && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {isPunjabi ? 'ਲਾਗਤ ਪ੍ਰਤੀ ਲੀਟਰ' : isHindi ? 'लागत प्रति लीटर' : 'Cost/Liter'}
                        </span>
                        <span className="font-medium">₹{source.cost_per_liter}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {isPunjabi ? 'ਮਿੱਟੀ ਨਮੀ ਨਿਗਰਾਨੀ' : isHindi ? 'मिट्टी नमी निगरानी' : 'Soil Moisture Monitoring'}
            </h3>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              {isPunjabi ? 'ਤਾਜ਼ਾ ਕਰੋ' : isHindi ? 'ताजा करें' : 'Refresh'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {moistureReadings.map((reading) => {
              const moistureStatus = getMoistureStatus(reading.moisture_level);
              return (
                <Card key={reading.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{reading.sensor_location}</CardTitle>
                      <Badge variant="outline">{reading.field_id}</Badge>
                    </div>
                    <CardDescription>{new Date(reading.timestamp).toLocaleString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{isPunjabi ? 'ਨਮੀ ਪੱਧਰ' : isHindi ? 'नमी स्तर' : 'Moisture Level'}</span>
                          <span className="font-medium">{reading.moisture_level}%</span>
                        </div>
                        <Progress value={reading.moisture_level} className="h-2" />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {isPunjabi ? 'ਸਥਿਤੀ' : isHindi ? 'स्थिति' : 'Status'}
                        </span>
                        <span className={`font-medium ${moistureStatus.color}`}>
                          {moistureStatus.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{reading.recommendation}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{isPunjabi ? 'ਸਿੰਚਾਈ ਕੁਸ਼ਲਤਾ' : isHindi ? 'सिंचाई दक्षता' : 'Irrigation Efficiency'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="flex justify-between">
                      <span>{schedule.field_name}</span>
                      <span className={getEfficiencyColor(schedule.efficiency_rating || 0)}>
                        {schedule.efficiency_rating}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{isPunjabi ? 'ਪਾਣੀ ਵਰਤੋਂ' : isHindi ? 'पानी उपयोग' : 'Water Usage'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['flood', 'drip', 'sprinkler', 'manual'].map((type) => {
                    const usage = schedules.filter(s => s.irrigation_type === type).reduce((sum, s) => sum + s.water_amount_liters, 0);
                    return (
                      <div key={type} className="flex justify-between">
                        <span className="capitalize">{type}</span>
                        <span>{usage.toLocaleString()}L</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-24 flex-col">
              <Download className="h-6 w-6 mb-2" />
              {isPunjabi ? 'ਸਿੰਚਾਈ ਰਿਪੋਰਟ' : isHindi ? 'सिंचाई रिपोर्ट' : 'Irrigation Report'}
            </Button>
            <Button variant="outline" className="h-24 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              {isPunjabi ? 'ਪਾਣੀ ਵਰਤੋਂ ਰਿਪੋਰਟ' : isHindi ? 'पानी उपयोग रिपोर्ट' : 'Water Usage Report'}
            </Button>
            <Button variant="outline" className="h-24 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              {isPunjabi ? 'ਕੁਸ਼ਲਤਾ ਰਿਪੋਰਟ' : isHindi ? 'दक्षता रिपोर्ट' : 'Efficiency Report'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnandSaathiIrrigationManagement;
