/**
 * Anand Saathi Crop Management
 * Comprehensive crop planning, monitoring, and management system
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Sprout,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  Droplets,
  Sun,
  Wind,
  Thermometer,
  Activity,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Leaf,
  Bug,
  Pill,
  DollarSign
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

interface CropPlan {
  id: string;
  crop_type: string;
  variety: string;
  planting_date: string;
  expected_harvest: string;
  area_acres: number;
  status: 'planned' | 'planted' | 'growing' | 'harvesting' | 'completed';
  progress: number;
  estimated_yield: number;
  actual_yield?: number;
  notes?: string;
}

interface CropActivity {
  id: string;
  crop_id: string;
  type: 'irrigation' | 'fertilizer' | 'pesticide' | 'weeding' | 'harvest' | 'other';
  date: string;
  description: string;
  cost?: number;
  status: 'scheduled' | 'completed' | 'overdue';
}

interface WeatherAlert {
  id: string;
  crop_id: string;
  type: 'rain' | 'drought' | 'frost' | 'heat' | 'wind';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  date: string;
  resolved: boolean;
}

const AnandSaathiCropManagement: React.FC = () => {
  const { t, isPunjabi, isHindi } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [cropPlans, setCropPlans] = useState<CropPlan[]>([
    {
      id: '1',
      crop_type: 'Rice',
      variety: 'Basmati 1121',
      planting_date: '2024-06-15',
      expected_harvest: '2024-10-15',
      area_acres: 5.2,
      status: 'growing',
      progress: 65,
      estimated_yield: 2.4,
      notes: 'Good growth observed, irrigation needed'
    },
    {
      id: '2',
      crop_type: 'Wheat',
      variety: 'HD-3086',
      planting_date: '2024-11-01',
      expected_harvest: '2024-04-15',
      area_acres: 6.5,
      status: 'planned',
      progress: 0,
      estimated_yield: 3.2,
      notes: 'Winter crop planning'
    }
  ]);

  const [activities, setActivities] = useState<CropActivity[]>([
    {
      id: '1',
      crop_id: '1',
      type: 'irrigation',
      date: '2024-09-15',
      description: 'Regular irrigation cycle',
      cost: 500,
      status: 'scheduled'
    },
    {
      id: '2',
      crop_id: '1',
      type: 'fertilizer',
      date: '2024-09-10',
      description: 'Nitrogen application',
      cost: 1200,
      status: 'completed'
    }
  ]);

  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([
    {
      id: '1',
      crop_id: '1',
      type: 'rain',
      severity: 'medium',
      message: 'Heavy rainfall expected next week',
      date: '2024-09-20',
      resolved: false
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'growing': return 'bg-blue-500';
      case 'planted': return 'bg-yellow-500';
      case 'planned': return 'bg-gray-500';
      case 'harvesting': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'irrigation': return <Droplets className="h-4 w-4" />;
      case 'fertilizer': return <Leaf className="h-4 w-4" />;
      case 'pesticide': return <Bug className="h-4 w-4" />;
      case 'weeding': return <Sprout className="h-4 w-4" />;
      case 'harvest': return <Target className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const handleAddCrop = () => {
    // Implementation for adding new crop
    toast.success(isPunjabi ? 'ਨਵੀਂ ਫਸਲ ਜੋੜਨ ਲਈ ਅੱਗੇ ਵਧ ਰਹੇ ਹਾਂ' : isHindi ? 'नई फसल जोड़ने के लिए आगे बढ़ रहे हैं' : 'Adding new crop functionality coming soon');
  };

  const handleActivityComplete = (activityId: string) => {
    setActivities(prev => prev.map(activity =>
      activity.id === activityId
        ? { ...activity, status: 'completed' }
        : activity
    ));
    toast.success(isPunjabi ? 'ਗਤੀਵਿਧੀ ਪੂਰੀ ਹੋ ਗਈ' : isHindi ? 'गतिविधि पूरी हो गई' : 'Activity completed');
  };

  const handleResolveAlert = (alertId: string) => {
    setWeatherAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? { ...alert, resolved: true }
        : alert
    ));
    toast.success(isPunjabi ? 'ਅਲਰਟ ਹੱਲ ਹੋ ਗਿਆ' : isHindi ? 'अलर्ट हल हो गया' : 'Alert resolved');
  };

  const totalArea = cropPlans.reduce((sum, crop) => sum + crop.area_acres, 0);
  const activeCrops = cropPlans.filter(crop => crop.status !== 'completed').length;
  const completedActivities = activities.filter(activity => activity.status === 'completed').length;
  const pendingAlerts = weatherAlerts.filter(alert => !alert.resolved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-primary" />
            {isPunjabi ? 'ਅਨੰਦ ਸਾਥੀ ਫਸਲ ਪ੍ਰਬੰਧਨ' : isHindi ? 'अनंद साथी फसल प्रबंधन' : 'Anand Saathi Crop Management'}
          </CardTitle>
          <CardDescription>
            {isPunjabi ? 'ਆਪਣੀਆਂ ਫਸਲਾਂ ਦੀ ਯੋਜਨਾ ਬਣਾਓ, ਨਿਗਰਾਨੀ ਕਰੋ ਅਤੇ ਪ੍ਰਬੰਧਨ ਕਰੋ' : isHindi ? 'अपनी फसलों की योजना बनाएं, निगरानी करें और प्रबंधन करें' : 'Plan, monitor, and manage your crops comprehensively'}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{activeCrops}</div>
            <div className="text-sm text-muted-foreground">
              {isPunjabi ? 'ਸਰਗਰਮ ਫਸਲਾਂ' : isHindi ? 'सक्रिय फसलें' : 'Active Crops'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalArea.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">
              {isPunjabi ? 'ਕੁਲ ਖੇਤਰ (ਏਕੜ)' : isHindi ? 'कुल क्षेत्र (एकड़)' : 'Total Area (acres)'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{completedActivities}</div>
            <div className="text-sm text-muted-foreground">
              {isPunjabi ? 'ਪੂਰੀਆਂ ਗਤੀਵਿਧੀਆਂ' : isHindi ? 'पूर्ण गतिविधियां' : 'Completed Activities'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{pendingAlerts}</div>
            <div className="text-sm text-muted-foreground">
              {isPunjabi ? 'ਲੰਬਿਤ ਅਲਰਟਸ' : isHindi ? 'लंबित अलर्ट्स' : 'Pending Alerts'}
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
          <TabsTrigger value="crops">
            <Sprout className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਫਸਲਾਂ' : isHindi ? 'फसलें' : 'Crops'}
          </TabsTrigger>
          <TabsTrigger value="activities">
            <Activity className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਗਤੀਵਿਧੀਆਂ' : isHindi ? 'गतिविधियां' : 'Activities'}
          </TabsTrigger>
          <TabsTrigger value="weather">
            <Sun className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਮੌਸਮ' : isHindi ? 'मौसम' : 'Weather'}
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
            {cropPlans.map((crop) => (
              <Card key={crop.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(crop.status)}`}></div>
                      <CardTitle className="text-lg">{crop.crop_type} - {crop.variety}</CardTitle>
                    </div>
                    <Badge variant="outline">{crop.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{isPunjabi ? 'ਪ੍ਰਗਤੀ' : isHindi ? 'प्रगति' : 'Progress'}</span>
                        <span>{crop.progress}%</span>
                      </div>
                      <Progress value={crop.progress} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          {isPunjabi ? 'ਖੇਤਰ:' : isHindi ? 'क्षेत्र:' : 'Area:'}
                        </span>
                        <p className="font-medium">{crop.area_acres} {isPunjabi ? 'ਏਕੜ' : isHindi ? 'एकड़' : 'acres'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {isPunjabi ? 'ਅਨੁਮਾਨਿਤ ਉਤਪਾਦਨ:' : isHindi ? 'अनुमानित उत्पादन:' : 'Est. Yield:'}
                        </span>
                        <p className="font-medium">{crop.estimated_yield}T</p>
                      </div>
                    </div>
                    {crop.notes && (
                      <p className="text-xs text-muted-foreground italic">{crop.notes}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Crops Tab */}
        <TabsContent value="crops" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {isPunjabi ? 'ਫਸਲ ਯੋਜਨਾਵਾਂ' : isHindi ? 'फसल योजनाएं' : 'Crop Plans'}
            </h3>
            <Button onClick={handleAddCrop}>
              <Plus className="h-4 w-4 mr-2" />
              {isPunjabi ? 'ਨਵੀਂ ਫਸਲ ਜੋੜੋ' : isHindi ? 'नई फसल जोड़ें' : 'Add New Crop'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cropPlans.map((crop) => (
              <Card key={crop.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{crop.crop_type}</CardTitle>
                    <Badge variant={crop.status === 'completed' ? 'default' : 'secondary'}>
                      {crop.status}
                    </Badge>
                  </div>
                  <CardDescription>{crop.variety}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਖੇਤਰ' : isHindi ? 'क्षेत्र' : 'Area'}
                      </span>
                      <span className="font-medium">{crop.area_acres} {isPunjabi ? 'ਏਕੜ' : isHindi ? 'एकड़' : 'acres'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਅਨੁਮਾਨਿਤ ਉਤਪਾਦਨ' : isHindi ? 'अनुमानित उत्पादन' : 'Est. Yield'}
                      </span>
                      <span className="font-medium">{crop.estimated_yield}T</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਬੀਜਣ ਦੀ ਮਿਤੀ' : isHindi ? 'बुआई की तारीख' : 'Planting Date'}
                      </span>
                      <span className="font-medium">{new Date(crop.planting_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {isPunjabi ? 'ਵਾਢੀ ਦੀ ਮਿਤੀ' : isHindi ? 'कटाई की तारीख' : 'Harvest Date'}
                      </span>
                      <span className="font-medium">{new Date(crop.expected_harvest).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {isPunjabi ? 'ਫਸਲ ਗਤੀਵਿਧੀਆਂ' : isHindi ? 'फसल गतिविधियां' : 'Crop Activities'}
            </h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {isPunjabi ? 'ਗਤੀਵਿਧੀ ਜੋੜੋ' : isHindi ? 'गतिविधि जोड़ें' : 'Add Activity'}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((activity) => (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getActivityIcon(activity.type)}
                      <CardTitle className="text-sm">{activity.type}</CardTitle>
                    </div>
                    <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                      {activity.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">{activity.description}</p>
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>{new Date(activity.date).toLocaleDateString()}</span>
                    {activity.cost && (
                      <span className="font-medium">₹{activity.cost}</span>
                    )}
                  </div>
                  {activity.status === 'scheduled' && (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleActivityComplete(activity.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isPunjabi ? 'ਪੂਰਾ ਕਰੋ' : isHindi ? 'पूरा करें' : 'Complete'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Weather Alerts Tab */}
        <TabsContent value="weather" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {isPunjabi ? 'ਮੌਸਮ ਅਲਰਟਸ' : isHindi ? 'मौसम अलर्ट्स' : 'Weather Alerts'}
            </h3>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              {isPunjabi ? 'ਤਾਜ਼ਾ ਕਰੋ' : isHindi ? 'ताजा करें' : 'Refresh'}
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {weatherAlerts.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${getAlertColor(alert.severity)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">
                            {isPunjabi ? 'ਮੌਸਮ ਅਲਰਟ' : isHindi ? 'मौसम अलर्ट' : 'Weather Alert'}
                          </h4>
                          <Badge variant="destructive">
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {!alert.resolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolveAlert(alert.id)}
                      >
                        {isPunjabi ? 'ਹੱਲ ਕਰੋ' : isHindi ? 'हल करें' : 'Resolve'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{isPunjabi ? 'ਫਸਲ ਵੰਡ' : isHindi ? 'फसल वितरण' : 'Crop Distribution'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cropPlans.reduce((acc, crop) => {
                    const existing = acc.find(item => item.type === crop.crop_type);
                    if (existing) {
                      existing.area += crop.area_acres;
                    } else {
                      acc.push({ type: crop.crop_type, area: crop.area_acres });
                    }
                    return acc;
                  }, [] as Array<{type: string, area: number}>).map((item) => (
                    <div key={item.type} className="flex justify-between">
                      <span>{item.type}</span>
                      <span>{item.area.toFixed(1)} {isPunjabi ? 'ਏਕੜ' : isHindi ? 'एकड़' : 'acres'}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{isPunjabi ? 'ਸਥਿਤੀ ਵੰਡ' : isHindi ? 'स्थिति वितरण' : 'Status Distribution'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['planned', 'planted', 'growing', 'harvesting', 'completed'].map((status) => {
                    const count = cropPlans.filter(crop => crop.status === status).length;
                    return (
                      <div key={status} className="flex justify-between">
                        <span className="capitalize">{status}</span>
                        <span>{count}</span>
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
              {isPunjabi ? 'ਫਸਲ ਰਿਪੋਰਟ' : isHindi ? 'फसल रिपोर्ट' : 'Crop Report'}
            </Button>
            <Button variant="outline" className="h-24 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              {isPunjabi ? 'ਗਤੀਵਿਧੀ ਰਿਪੋਰਟ' : isHindi ? 'गतिविधि रिपोर्ट' : 'Activity Report'}
            </Button>
            <Button variant="outline" className="h-24 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              {isPunjabi ? 'ਉਤਪਾਦਨ ਰਿਪੋਰਟ' : isHindi ? 'उत्पादन रिपोर्ट' : 'Production Report'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnandSaathiCropManagement;
