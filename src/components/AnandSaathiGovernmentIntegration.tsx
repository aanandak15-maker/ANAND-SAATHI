/**
 * Anand Saathi Government Integration
 * Comprehensive Punjab government services integration
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  FileText, 
  AlertTriangle, 
  Phone, 
  Mail, 
  Globe, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  Users,
  DollarSign,
  Shield,
  Award,
  Download,
  MapPin,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Share2,
  Bookmark,
  Star,
  Heart,
  ThumbsUp,
  MessageCircle,
  Send,
  Archive,
  Flag,
  Info,
  Bell,
  Settings,
  User,
  Home,
  Navigation,
  Target,
  Zap,
  Activity,
  Database,
  Cloud,
  Wifi,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Headphones,
  Mic,
  Camera,
  Video,
  Image,
  File,
  Folder,
  Trash2,
  Edit,
  Save,
  Copy,
  Paste,
  Cut,
  Undo,
  Redo,
  Plus,
  Minus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  Move,
  Lock,
  Unlock,
  Key,
  EyeOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Stop,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Music,
  Radio,
  Tv,
  Gamepad2,
  Controller,
  Joystick,
  Mouse,
  Keyboard,
  Printer,
  Scanner,
  Fax,
  HardDrive,
  Cpu,
  MemoryStick,
  Usb,
  Bluetooth,
  WifiOff,
  Signal,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryHigh,
  BatteryFull,
  Plug,
  Power,
  PowerOff,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Thermometer,
  Droplets,
  Umbrella,
  Snowflake,
  Sunrise,
  Sunset,
  Compass,
  Map,
  Navigation2,
  Route,
  Flag2,
  MapPin2,
  Locate,
  LocateFixed,
  Navigation2 as Nav2,
  Route2,
  Flag3,
  MapPin3,
  Locate2,
  LocateFixed2
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { anandSaathiBackend, PunjabGovernmentScheme } from '@/lib/anandSaathiBackend';
import { toast } from 'sonner';

interface AnandSaathiGovernmentIntegrationProps {
  district?: string;
  cropType?: string;
  farmerCategory?: string;
}

interface GovernmentData {
  schemes: PunjabGovernmentScheme[];
  advisories: any[];
  pestAlerts: any[];
  isLoading: boolean;
  error: string | null;
}

export const AnandSaathiGovernmentIntegration: React.FC<AnandSaathiGovernmentIntegrationProps> = ({
  district = 'Ludhiana',
  cropType = 'Rice',
  farmerCategory = 'all'
}) => {
  const { t, language, isPunjabi, isHindi } = useTranslation();
  const [governmentData, setGovernmentData] = useState<GovernmentData>({
    schemes: [],
    advisories: [],
    pestAlerts: [],
    isLoading: true,
    error: null
  });

  const [selectedScheme, setSelectedScheme] = useState<PunjabGovernmentScheme | null>(null);
  const [activeTab, setActiveTab] = useState('schemes');

  // Load government data
  useEffect(() => {
    loadGovernmentData();
  }, [district, cropType, farmerCategory]);

  const loadGovernmentData = async () => {
    setGovernmentData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const [schemes, advisories, pestAlerts] = await Promise.all([
        anandSaathiBackend.getGovernmentSchemes(district, cropType),
        anandSaathiBackend.getCropAdvisories(district, cropType),
        anandSaathiBackend.getPestAlerts(district, cropType)
      ]);

      setGovernmentData({
        schemes,
        advisories,
        pestAlerts,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading government data:', error);
      setGovernmentData(prev => ({
        ...prev,
        isLoading: false,
        error: t('government.loadingError')
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'upcoming':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return <DollarSign className="h-4 w-4" />;
      case 'technical':
        return <FileText className="h-4 w-4" />;
      case 'insurance':
        return <Shield className="h-4 w-4" />;
      case 'subsidy':
        return <Users className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleApplyScheme = (scheme: PunjabGovernmentScheme) => {
    toast.success(t('government.applicationStarted'));
    // Here you would typically open the application form or redirect to the official website
    if (scheme.contactInfo.website) {
      window.open(scheme.contactInfo.website, '_blank');
    }
  };

  const handleViewDetails = (scheme: PunjabGovernmentScheme) => {
    setSelectedScheme(scheme);
  };

  if (governmentData.isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('government.loading')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (governmentData.error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{governmentData.error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t('government.title')}
          </CardTitle>
          <CardDescription>
            {t('government.subtitle')} - {district}, {cropType}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="schemes" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            {isPunjabi ? 'ਯੋਜਨਾਵਾਂ' : isHindi ? 'योजनाएं' : 'Schemes'} ({governmentData.schemes.length})
          </TabsTrigger>
          <TabsTrigger value="advisories" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {isPunjabi ? 'ਸਲਾਹ' : isHindi ? 'सलाह' : 'Advisories'} ({governmentData.advisories.length})
          </TabsTrigger>
          <TabsTrigger value="pestAlerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {isPunjabi ? 'ਕੀਟ ਚੇਤਾਵਨੀ' : isHindi ? 'कीट चेतावनी' : 'Pest Alerts'} ({governmentData.pestAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="pmKisan" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {isPunjabi ? 'ਪੀਐਮ ਕਿਸਾਨ' : isHindi ? 'पीएम किसान' : 'PM Kisan'}
          </TabsTrigger>
          <TabsTrigger value="subsidies" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            {isPunjabi ? 'ਸਬਸਿਡੀ' : isHindi ? 'सब्सिडी' : 'Subsidies'}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'विश्लेषण' : 'Analytics'}
          </TabsTrigger>
        </TabsList>

        {/* Government Schemes */}
        <TabsContent value="schemes" className="space-y-4">
          <div className="grid gap-4">
            {governmentData.schemes.map((scheme) => (
              <Card key={scheme.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getCategoryIcon(scheme.category)}
                        {isPunjabi ? scheme.localName : scheme.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {isPunjabi ? scheme.localDescription : scheme.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(scheme.status)}>
                        {getStatusIcon(scheme.status)}
                        <span className="ml-1">{t(`government.${scheme.status}`)}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Benefits */}
                  <div>
                    <h4 className="font-medium mb-2">{t('government.benefits')}</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {scheme.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Eligibility */}
                  <div>
                    <h4 className="font-medium mb-2">{t('government.eligibility')}</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {scheme.eligibility.map((criteria, index) => (
                        <li key={index}>{criteria}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Financial Information */}
                  {scheme.amount > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">
                          {formatCurrency(scheme.amount, scheme.currency)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Application Deadline */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      {t('government.applicationDeadline')}: {formatDate(scheme.applicationDeadline)}
                    </span>
                  </div>

                  {/* Contact Information */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">{t('government.contactInfo')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {scheme.contactInfo.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <a href={`tel:${scheme.contactInfo.phone}`} className="text-blue-600 hover:underline">
                            {scheme.contactInfo.phone}
                          </a>
                        </div>
                      )}
                      {scheme.contactInfo.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <a href={`mailto:${scheme.contactInfo.email}`} className="text-blue-600 hover:underline">
                            {scheme.contactInfo.email}
                          </a>
                        </div>
                      )}
                      {scheme.contactInfo.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <a 
                            href={scheme.contactInfo.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {t('government.visitWebsite')}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(scheme)}
                    >
                      {t('government.viewDetails')}
                    </Button>
                    {scheme.status === 'active' && (
                      <Button 
                        size="sm"
                        onClick={() => handleApplyScheme(scheme)}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {t('government.applyNow')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Crop Advisories */}
        <TabsContent value="advisories" className="space-y-4">
          <div className="grid gap-4">
            {governmentData.advisories.map((advisory) => (
              <Card key={advisory.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {isPunjabi ? advisory.localTitle : advisory.title}
                  </CardTitle>
                  <CardDescription>
                    {isPunjabi ? advisory.localContent : advisory.content}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant={advisory.priority === 'high' ? 'destructive' : 'secondary'}>
                      {advisory.priority} {t('government.priority')}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {t('government.validUntil')}: {formatDate(advisory.validUntil)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Pest Alerts */}
        <TabsContent value="pestAlerts" className="space-y-4">
          <div className="grid gap-4">
            {governmentData.pestAlerts.map((alert) => (
              <Card key={alert.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    {isPunjabi ? alert.localTitle : alert.title}
                  </CardTitle>
                  <CardDescription>
                    {isPunjabi ? alert.localContent : alert.content}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={alert.severity === 'high' ? 'destructive' : 'secondary'}
                      className="flex items-center gap-1"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {alert.severity} {t('alerts.severity')}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {t('government.validUntil')}: {formatDate(alert.validUntil)}
                    </div>
                  </div>

                  {alert.recommendedAction && (
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-1">
                        {t('government.recommendedAction')}
                      </h4>
                      <p className="text-sm text-yellow-700">
                        {isPunjabi ? alert.localRecommendedAction : alert.recommendedAction}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* PM Kisan */}
        <TabsContent value="pmKisan" className="space-y-4">
          <div className="grid gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Shield className="h-5 w-5" />
                  {isPunjabi ? 'ਪੀਐਮ ਕਿਸਾਨ ਸਮਨਿਵੇਸ਼ ਯੋਜਨਾ' : isHindi ? 'पीएम किसान समनिवेश योजना' : 'PM Kisan Samman Nidhi Yojana'}
                </CardTitle>
                <CardDescription className="text-green-700">
                  {isPunjabi ? 'ਛੋਟੇ ਅਤੇ ਸੀਮਾਂਤ ਕਿਸਾਨਾਂ ਲਈ ਆਮਦਨੀ ਸਹਾਇਤਾ' : isHindi ? 'छोटे और सीमांत किसानों के लिए आय सहायता' : 'Income support for small and marginal farmers'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{isPunjabi ? 'ਵਾਰਸ਼ਿਕ ਲਾਭ' : isHindi ? 'वार्षिक लाभ' : 'Annual Benefit'}</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">₹6,000</p>
                    <p className="text-sm text-gray-600">{isPunjabi ? '3 ਕਿਸਤਾਂ ਵਿੱਚ' : isHindi ? '3 किस्तों में' : 'In 3 installments'}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{isPunjabi ? 'ਯੋਗਤਾ' : isHindi ? 'योग्यता' : 'Eligibility'}</span>
                    </div>
                    <p className="text-sm text-gray-700">{isPunjabi ? '2 ਹੈਕਟੇਅਰ ਤੱਕ ਜ਼ਮੀਨ' : isHindi ? '2 हेक्टेयर तक जमीन' : 'Up to 2 hectares land'}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{isPunjabi ? 'ਸਥਿਤੀ' : isHindi ? 'स्थिति' : 'Status'}</span>
                    </div>
                    <p className="text-sm text-green-600">{isPunjabi ? 'ਸਰਗਰਮ' : isHindi ? 'सक्रिय' : 'Active'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    {isPunjabi ? 'ਆਵੇਦਨ ਕਰੋ' : isHindi ? 'आवेदन करें' : 'Apply Now'}
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {isPunjabi ? 'ਵਿਸਥਾਰ' : isHindi ? 'विस्तार' : 'Details'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subsidies */}
        <TabsContent value="subsidies" className="space-y-4">
          <div className="grid gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <DollarSign className="h-5 w-5" />
                  {isPunjabi ? 'ਕਿਸਾਨ ਸਬਸਿਡੀ ਯੋਜਨਾਵਾਂ' : isHindi ? 'किसान सब्सिडी योजनाएं' : 'Farmer Subsidy Schemes'}
                </CardTitle>
                <CardDescription className="text-blue-700">
                  {isPunjabi ? 'ਖੇਤੀ ਉਪਕਰਣ ਅਤੇ ਇਨਪੁੱਟ ਲਈ ਸਬਸਿਡੀ' : isHindi ? 'कृषि उपकरण और इनपुट के लिए सब्सिडी' : 'Subsidies for agricultural equipment and inputs'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <h4 className="font-medium mb-2">{isPunjabi ? 'ਟ੍ਰੈਕਟਰ ਸਬਸਿਡੀ' : isHindi ? 'ट्रैक्टर सब्सिडी' : 'Tractor Subsidy'}</h4>
                    <p className="text-2xl font-bold text-blue-600">50%</p>
                    <p className="text-sm text-gray-600">{isPunjabi ? 'ਅਧਿਕਤਮ ₹1,00,000' : isHindi ? 'अधिकतम ₹1,00,000' : 'Maximum ₹1,00,000'}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <h4 className="font-medium mb-2">{isPunjabi ? 'ਡ੍ਰਿਪ ਇਰੀਗੇਸ਼ਨ' : isHindi ? 'ड्रिप इरिगेशन' : 'Drip Irrigation'}</h4>
                    <p className="text-2xl font-bold text-blue-600">90%</p>
                    <p className="text-sm text-gray-600">{isPunjabi ? 'ਛੋਟੇ ਕਿਸਾਨਾਂ ਲਈ' : isHindi ? 'छोटे किसानों के लिए' : 'For small farmers'}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <h4 className="font-medium mb-2">{isPunjabi ? 'ਖਾਦ ਸਬਸਿਡੀ' : isHindi ? 'खाद सब्सिडी' : 'Fertilizer Subsidy'}</h4>
                    <p className="text-2xl font-bold text-blue-600">75%</p>
                    <p className="text-sm text-gray-600">{isPunjabi ? 'ਯੂਰੀਆ ਲਈ' : isHindi ? 'यूरिया के लिए' : 'For Urea'}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <h4 className="font-medium mb-2">{isPunjabi ? 'ਬੀਜ ਸਬਸਿਡੀ' : isHindi ? 'बीज सब्सिडी' : 'Seed Subsidy'}</h4>
                    <p className="text-2xl font-bold text-blue-600">50%</p>
                    <p className="text-sm text-gray-600">{isPunjabi ? 'ਗੁਣਵੱਤਾ ਬੀਜ' : isHindi ? 'गुणवत्ता बीज' : 'Quality seeds'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4">
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <BarChart3 className="h-5 w-5" />
                  {isPunjabi ? 'ਪੰਜਾਬ ਖੇਤੀ ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'पंजाब कृषि विश्लेषण' : 'Punjab Agriculture Analytics'}
                </CardTitle>
                <CardDescription className="text-purple-700">
                  {isPunjabi ? 'ਖੇਤੀ ਡੇਟਾ ਅਤੇ ਰੁਝਾਨਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'कृषि डेटा और रुझानों का विश्लेषण' : 'Analysis of agricultural data and trends'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{isPunjabi ? 'ਕੁੱਲ ਖੇਤੀ ਖੇਤਰ' : isHindi ? 'कुल कृषि क्षेत्र' : 'Total Agricultural Area'}</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">4.2M</p>
                    <p className="text-sm text-gray-600">{isPunjabi ? 'ਹੈਕਟੇਅਰ' : isHindi ? 'हेक्टेयर' : 'Hectares'}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{isPunjabi ? 'ਕਿਸਾਨ ਪਰਿਵਾਰ' : isHindi ? 'किसान परिवार' : 'Farmer Families'}</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">1.2M</p>
                    <p className="text-sm text-gray-600">{isPunjabi ? 'ਪਰਿਵਾਰ' : isHindi ? 'परिवार' : 'Families'}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">{isPunjabi ? 'ਸਾਲਾਨਾ ਉਤਪਾਦਨ' : isHindi ? 'वार्षिक उत्पादन' : 'Annual Production'}</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">₹2.8T</p>
                    <p className="text-sm text-gray-600">{isPunjabi ? 'ਮੁੱਲ' : isHindi ? 'मूल्य' : 'Value'}</p>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <h4 className="font-medium mb-3">{isPunjabi ? 'ਮੁੱਖ ਫਸਲਾਂ' : isHindi ? 'मुख्य फसलें' : 'Major Crops'}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="font-medium text-green-800">{isPunjabi ? 'ਚੌਲ' : isHindi ? 'चावल' : 'Rice'}</p>
                      <p className="text-sm text-green-600">35%</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="font-medium text-yellow-800">{isPunjabi ? 'ਗੇਹੂੰ' : isHindi ? 'गेहूं' : 'Wheat'}</p>
                      <p className="text-sm text-yellow-600">28%</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="font-medium text-orange-800">{isPunjabi ? 'ਕਣਕ' : isHindi ? 'कपास' : 'Cotton'}</p>
                      <p className="text-sm text-orange-600">15%</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-800">{isPunjabi ? 'ਅਨਾਜ' : isHindi ? 'अन्य' : 'Others'}</p>
                      <p className="text-sm text-blue-600">22%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Scheme Details Modal */}
      {selectedScheme && (
        <Card className="fixed inset-4 z-50 overflow-auto bg-white shadow-2xl">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  {getCategoryIcon(selectedScheme.category)}
                  {isPunjabi ? selectedScheme.localName : selectedScheme.name}
                </CardTitle>
                <CardDescription className="mt-1">
                  {isPunjabi ? selectedScheme.localDescription : selectedScheme.description}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedScheme(null)}
              >
                {t('common.close')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Detailed information would go here */}
            <div className="text-center py-8">
              <p className="text-gray-600">{t('government.detailedViewComingSoon')}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnandSaathiGovernmentIntegration;

