/**
 * Punjab Alerts Management Interface
 * Comprehensive alert management system for Punjab rice farmers
 * Handles SMS, WhatsApp, Push notifications, and email alerts
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bell, 
  BellOff, 
  Smartphone, 
  MessageSquare, 
  Mail, 
  Settings, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Volume2,
  VolumeX,
  Calendar,
  MapPin,
  Users,
  Shield,
  Droplets,
  Sun,
  Thermometer,
  Bug,
  Leaf,
  Zap,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  Download,
  Share2,
  RefreshCw,
  Phone,
  Globe,
  FileText,
  Award,
  DollarSign,
  Activity,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  AlertCircle,
  Info,
  CheckSquare,
  Square,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  Archive,
  Flag,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Hash as HashIcon,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  MapPin as MapPinIcon,
  Users as UsersIcon,
  Shield as ShieldIcon,
  Droplets as DropletsIcon,
  Sun as SunIcon,
  Thermometer as ThermometerIcon,
  Bug as BugIcon,
  Leaf as LeafIcon,
  Zap as ZapIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Edit as EditIcon,
  Trash2 as Trash2Icon,
  Plus as PlusIcon,
  Filter as FilterIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Share2 as Share2Icon,
  RefreshCw as RefreshCwIcon,
  Phone as PhoneIcon,
  Globe as GlobeIcon,
  FileText as FileTextIcon,
  Award as AwardIcon,
  DollarSign as DollarSignIcon,
  Activity as ActivityIcon,
  Target as TargetIcon,
  TrendingUp as TrendingUpIcon,
  BarChart3 as BarChart3Icon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  AlertCircle as AlertCircleIcon,
  Info as InfoIcon,
  CheckSquare as CheckSquareIcon,
  Square as SquareIcon,
  Star as StarIcon,
  Heart as HeartIcon,
  ThumbsUp as ThumbsUpIcon,
  ThumbsDown as ThumbsDownIcon,
  MessageCircle as MessageCircleIcon,
  Send as SendIcon,
  Archive as ArchiveIcon,
  Flag as FlagIcon,
  Bookmark as BookmarkIcon,
  Tag as TagIcon
} from 'lucide-react';
import PunjabNavigation from './PunjabNavigation';

interface AlertPreferences {
  channels: {
    sms: boolean;
    whatsapp: boolean;
    push: boolean;
    email: boolean;
  };
  categories: {
    phenology: boolean;
    pest: boolean;
    disease: boolean;
    weather: boolean;
    government: boolean;
    market: boolean;
    boundary: boolean;
    irrigation: boolean;
  };
  severity: {
    critical: boolean;
    high: boolean;
    medium: boolean;
    low: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: {
    immediate: boolean;
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
  };
  language: 'punjabi' | 'hindi' | 'english';
  timezone: string;
}

interface AlertHistory {
  id: string;
  title: string;
  message: string;
  localMessage: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  channel: 'sms' | 'whatsapp' | 'push' | 'email';
  status: 'sent' | 'delivered' | 'failed' | 'read';
  timestamp: string;
  fieldId: string;
  actionRequired: boolean;
  actionTaken: boolean;
  farmerResponse?: string;
}

interface AlertTemplate {
  id: string;
  name: string;
  category: string;
  title: string;
  message: string;
  localMessage: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  channels: string[];
  triggers: string[];
  isActive: boolean;
}

export default function PunjabAlerts() {
  const [alertPreferences, setAlertPreferences] = useState<AlertPreferences>({
    channels: {
      sms: true,
      whatsapp: true,
      push: true,
      email: false
    },
    categories: {
      phenology: true,
      pest: true,
      disease: true,
      weather: true,
      government: true,
      market: false,
      boundary: true,
      irrigation: true
    },
    severity: {
      critical: true,
      high: true,
      medium: true,
      low: false
    },
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '06:00'
    },
    frequency: {
      immediate: true,
      daily: false,
      weekly: false,
      monthly: false
    },
    language: 'punjabi',
    timezone: 'Asia/Kolkata'
  });

  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([
    {
      id: 'alert_001',
      title: 'Water Stress Detected',
      message: 'Your rice field is showing signs of water stress. Immediate irrigation recommended.',
      localMessage: 'ਤੁਹਾਡੇ ਚੌਲਾਂ ਦੇ ਖੇਤ ਵਿੱਚ ਪਾਣੀ ਦੀ ਕਮੀ ਦੇ ਲੱਛਣ ਦਿਖਾਈ ਦੇ ਰਹੇ ਹਨ। ਤੁਰੰਤ ਸਿੰਚਾਈ ਦੀ ਸਿਫਾਰਸ਼ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।',
      type: 'irrigation',
      severity: 'high',
      channel: 'whatsapp',
      status: 'delivered',
      timestamp: '2024-01-15T10:30:00Z',
      fieldId: 'field_001',
      actionRequired: true,
      actionTaken: false
    },
    {
      id: 'alert_002',
      title: 'Pest Alert: Brown Plant Hopper',
      message: 'Brown plant hopper activity detected in your area. Consider preventive measures.',
      localMessage: 'ਤੁਹਾਡੇ ਖੇਤਰ ਵਿੱਚ ਬ੍ਰਾਊਨ ਪਲਾਂਟ ਹੌਪਰ ਦੀ ਗਤਿਵਿਧੀ ਦੇਖੀ ਗਈ ਹੈ। ਨਿਵਾਰਕ ਉਪਾਅ ਕਰਨ ਦੀ ਸਿਫਾਰਸ਼ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।',
      type: 'pest',
      severity: 'medium',
      channel: 'sms',
      status: 'sent',
      timestamp: '2024-01-14T15:45:00Z',
      fieldId: 'field_001',
      actionRequired: true,
      actionTaken: true,
      farmerResponse: 'Applied neem oil spray as recommended'
    },
    {
      id: 'alert_003',
      title: 'Government Scheme: PM Kisan',
      message: 'PM Kisan installment of ₹2,000 has been credited to your account.',
      localMessage: 'ਪੀਐਮ ਕਿਸਾਨ ਦੀ ₹2,000 ਦੀ ਕਿਸਤ ਤੁਹਾਡੇ ਖਾਤੇ ਵਿੱਚ ਜਮ੍ਹਾ ਕਰ ਦਿੱਤੀ ਗਈ ਹੈ।',
      type: 'government',
      severity: 'low',
      channel: 'push',
      status: 'read',
      timestamp: '2024-01-13T09:00:00Z',
      fieldId: 'field_001',
      actionRequired: false,
      actionTaken: false
    }
  ]);

  const [alertTemplates, setAlertTemplates] = useState<AlertTemplate[]>([
    {
      id: 'template_001',
      name: 'Water Stress Alert',
      category: 'irrigation',
      title: 'Water Stress Detected',
      message: 'Your rice field is showing signs of water stress. Immediate irrigation recommended.',
      localMessage: 'ਤੁਹਾਡੇ ਚੌਲਾਂ ਦੇ ਖੇਤ ਵਿੱਚ ਪਾਣੀ ਦੀ ਕਮੀ ਦੇ ਲੱਛਣ ਦਿਖਾਈ ਦੇ ਰਹੇ ਹਨ। ਤੁਰੰਤ ਸਿੰਚਾਈ ਦੀ ਸਿਫਾਰਸ਼ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।',
      severity: 'high',
      channels: ['sms', 'whatsapp', 'push'],
      triggers: ['ndvi_threshold', 'soil_moisture'],
      isActive: true
    },
    {
      id: 'template_002',
      name: 'Pest Alert Template',
      category: 'pest',
      title: 'Pest Activity Detected',
      message: 'Pest activity detected in your area. Consider preventive measures.',
      localMessage: 'ਤੁਹਾਡੇ ਖੇਤਰ ਵਿੱਚ ਕੀੜੇ-ਮਕੌੜਿਆਂ ਦੀ ਗਤਿਵਿਧੀ ਦੇਖੀ ਗਈ ਹੈ। ਨਿਵਾਰਕ ਉਪਾਅ ਕਰਨ ਦੀ ਸਿਫਾਰਸ਼ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।',
      severity: 'medium',
      channels: ['sms', 'whatsapp'],
      triggers: ['pest_detection', 'weather_conditions'],
      isActive: true
    }
  ]);

  const [selectedTab, setSelectedTab] = useState('preferences');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredAlerts = alertHistory.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesChannel = filterChannel === 'all' || alert.channel === filterChannel;
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    
    return matchesSearch && matchesSeverity && matchesChannel && matchesStatus;
  });

  const updateAlertPreferences = (section: keyof AlertPreferences, key: string, value: any) => {
    setAlertPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const markAlertAsRead = (alertId: string) => {
    setAlertHistory(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'read' as const }
          : alert
      )
    );
  };

  const markActionTaken = (alertId: string) => {
    setAlertHistory(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, actionTaken: true }
          : alert
      )
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Info className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'sms': return <Smartphone className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'push': return <Bell className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Send className="h-4 w-4 text-blue-600" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'read': return <Eye className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <PunjabNavigation 
        currentPage="Alert Management - SMS, WhatsApp, Push notifications"
        showBackButton={true}
        showSupportButtons={true}
      />

      <div className="container mx-auto px-6 py-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="history">Alert History</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Alert Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notification Channels */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    Notification Channels
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to receive alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <Label>SMS</Label>
                    </div>
                    <Switch
                      checked={alertPreferences.channels.sms}
                      onCheckedChange={(checked) => updateAlertPreferences('channels', 'sms', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <Label>WhatsApp</Label>
                    </div>
                    <Switch
                      checked={alertPreferences.channels.whatsapp}
                      onCheckedChange={(checked) => updateAlertPreferences('channels', 'whatsapp', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <Label>Push Notifications</Label>
                    </div>
                    <Switch
                      checked={alertPreferences.channels.push}
                      onCheckedChange={(checked) => updateAlertPreferences('channels', 'push', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <Label>Email</Label>
                    </div>
                    <Switch
                      checked={alertPreferences.channels.email}
                      onCheckedChange={(checked) => updateAlertPreferences('channels', 'email', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Alert Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-green-600" />
                    Alert Categories
                  </CardTitle>
                  <CardDescription>
                    Select which types of alerts you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <Label>Phenology</Label>
                    </div>
                    <Switch
                      checked={alertPreferences.categories.phenology}
                      onCheckedChange={(checked) => updateAlertPreferences('categories', 'phenology', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bug className="h-4 w-4" />
                      <Label>Pest Alerts</Label>
                    </div>
                    <Switch
                      checked={alertPreferences.categories.pest}
                      onCheckedChange={(checked) => updateAlertPreferences('categories', 'pest', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4" />
                      <Label>Disease Alerts</Label>
                    </div>
                    <Switch
                      checked={alertPreferences.categories.disease}
                      onCheckedChange={(checked) => updateAlertPreferences('categories', 'disease', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      <Label>Weather Alerts</Label>
                    </div>
                    <Switch
                      checked={alertPreferences.categories.weather}
                      onCheckedChange={(checked) => updateAlertPreferences('categories', 'weather', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <Label>Government Schemes</Label>
                    </div>
                    <Switch
                      checked={alertPreferences.categories.government}
                      onCheckedChange={(checked) => updateAlertPreferences('categories', 'government', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <Label>Market Updates</Label>
                    </div>
                    <Switch
                      checked={alertPreferences.categories.market}
                      onCheckedChange={(checked) => updateAlertPreferences('categories', 'market', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <Label>Boundary Alerts</Label>
                    </div>
                    <Switch
                      checked={alertPreferences.categories.boundary}
                      onCheckedChange={(checked) => updateAlertPreferences('categories', 'boundary', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4" />
                      <Label>Irrigation Alerts</Label>
                    </div>
                    <Switch
                      checked={alertPreferences.categories.irrigation}
                      onCheckedChange={(checked) => updateAlertPreferences('categories', 'irrigation', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Severity Levels */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Severity Levels
                  </CardTitle>
                  <CardDescription>
                    Choose which severity levels to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <Label>Critical</Label>
                    </div>
                    <Switch
                      checked={alertPreferences.severity.critical}
                      onCheckedChange={(checked) => updateAlertPreferences('severity', 'critical', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <Label>High</Label>
                    </div>
                    <Switch
                      checked={alertPreferences.severity.high}
                      onCheckedChange={(checked) => updateAlertPreferences('severity', 'high', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-yellow-600" />
                      <Label>Medium</Label>
                    </div>
                    <Switch
                      checked={alertPreferences.severity.medium}
                      onCheckedChange={(checked) => updateAlertPreferences('severity', 'medium', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <Label>Low</Label>
                    </div>
                    <Switch
                      checked={alertPreferences.severity.low}
                      onCheckedChange={(checked) => updateAlertPreferences('severity', 'low', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Quiet Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    Quiet Hours
                  </CardTitle>
                  <CardDescription>
                    Set times when you don't want to receive alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable Quiet Hours</Label>
                    <Switch
                      checked={alertPreferences.quietHours.enabled}
                      onCheckedChange={(checked) => updateAlertPreferences('quietHours', 'enabled', checked)}
                    />
                  </div>
                  {alertPreferences.quietHours.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={alertPreferences.quietHours.start}
                          onChange={(e) => updateAlertPreferences('quietHours', 'start', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={alertPreferences.quietHours.end}
                          onChange={(e) => updateAlertPreferences('quietHours', 'end', e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Language & Timezone */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    Language & Timezone
                  </CardTitle>
                  <CardDescription>
                    Set your preferred language and timezone
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select
                      value={alertPreferences.language}
                      onValueChange={(value) => updateAlertPreferences('language', 'language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="punjabi">ਪੰਜਾਬੀ (Punjabi)</SelectItem>
                        <SelectItem value="hindi">हिंदी (Hindi)</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                      value={alertPreferences.timezone}
                      onValueChange={(value) => updateAlertPreferences('timezone', 'timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="Asia/Karachi">Asia/Karachi (PKT)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Frequency Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    Frequency Settings
                  </CardTitle>
                  <CardDescription>
                    How often do you want to receive alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Immediate</Label>
                    <Switch
                      checked={alertPreferences.frequency.immediate}
                      onCheckedChange={(checked) => updateAlertPreferences('frequency', 'immediate', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Daily Summary</Label>
                    <Switch
                      checked={alertPreferences.frequency.daily}
                      onCheckedChange={(checked) => updateAlertPreferences('frequency', 'daily', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Weekly Summary</Label>
                    <Switch
                      checked={alertPreferences.frequency.weekly}
                      onCheckedChange={(checked) => updateAlertPreferences('frequency', 'weekly', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Monthly Report</Label>
                    <Switch
                      checked={alertPreferences.frequency.monthly}
                      onCheckedChange={(checked) => updateAlertPreferences('frequency', 'monthly', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Save Preferences */}
            <div className="flex justify-end">
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </TabsContent>

          {/* Alert History */}
          <TabsContent value="history" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Search</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search alerts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severities</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Channel</Label>
                    <Select value={filterChannel} onValueChange={setFilterChannel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Channels</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="push">Push</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="read">Read</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alert List */}
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <Card key={alert.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(alert.severity)}
                          <h4 className="font-semibold">{alert.title}</h4>
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline">{alert.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                        <p className="text-sm text-gray-500">{alert.localMessage}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            {getChannelIcon(alert.channel)}
                            <span>{alert.channel}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(alert.status)}
                            <span>{alert.status}</span>
                          </div>
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                          {alert.actionRequired && (
                            <Badge variant="destructive">Action Required</Badge>
                          )}
                        </div>
                        {alert.farmerResponse && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                            <p className="text-sm text-green-800">
                              <strong>Your Response:</strong> {alert.farmerResponse}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {alert.actionRequired && !alert.actionTaken && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markActionTaken(alert.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Action Taken
                          </Button>
                        )}
                        {alert.status !== 'read' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAlertAsRead(alert.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Alert Templates */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Alert Templates</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alertTemplates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant={template.isActive ? 'default' : 'secondary'}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription>{template.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h5 className="font-medium">{template.title}</h5>
                      <p className="text-sm text-gray-600">{template.message}</p>
                      <p className="text-sm text-gray-500">{template.localMessage}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(template.severity)}>
                        {template.severity}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {template.channels.map((channel) => (
                          <div key={channel} className="flex items-center gap-1">
                            {getChannelIcon(channel)}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{alertHistory.length}</div>
                  <div className="text-xs text-gray-600">This month</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Delivery Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round((alertHistory.filter(a => a.status === 'delivered').length / alertHistory.length) * 100)}%
                  </div>
                  <div className="text-xs text-gray-600">Success rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Action Taken</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round((alertHistory.filter(a => a.actionTaken).length / alertHistory.filter(a => a.actionRequired).length) * 100)}%
                  </div>
                  <div className="text-xs text-gray-600">Response rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Avg Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.3h</div>
                  <div className="text-xs text-gray-600">To action</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Alert Trends</CardTitle>
                <CardDescription>Alert activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Alert trends chart would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
