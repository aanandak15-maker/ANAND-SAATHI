/**
 * Anand Saathi Settings Component
 * User preferences and system configuration
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  User, 
  Globe, 
  Bell, 
  Shield, 
  Database,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Languages,
  Smartphone,
  Mail,
  MapPin,
  Calendar
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

interface UserSettings {
  profile: {
    name: string;
    email: string;
    phone: string;
    location: string;
    farmName: string;
  };
  preferences: {
    language: 'punjabi' | 'hindi' | 'english';
    theme: 'light' | 'dark' | 'auto';
    units: 'metric' | 'imperial';
    dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    whatsapp: boolean;
    weatherAlerts: boolean;
    marketAlerts: boolean;
    pestAlerts: boolean;
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
    locationTracking: boolean;
    marketingEmails: boolean;
  };
}

interface SettingsProps {
  onSettingsChange?: (settings: UserSettings) => void;
}

export const AnandSaathiSettings: React.FC<SettingsProps> = ({
  onSettingsChange
}) => {
  const { t, language, isPunjabi, isHindi, setLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      name: 'Anand Singh',
      email: 'anand@example.com',
      phone: '+91 98765 43210',
      location: 'Punjab, India',
      farmName: 'Anand Farm'
    },
    preferences: {
      language: 'punjabi',
      theme: 'light',
      units: 'metric',
      dateFormat: 'dd/mm/yyyy'
    },
    notifications: {
      email: true,
      sms: true,
      push: true,
      whatsapp: false,
      weatherAlerts: true,
      marketAlerts: true,
      pestAlerts: true
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      locationTracking: true,
      marketingEmails: false
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Load settings from localStorage or API
      const savedSettings = localStorage.getItem('anandSaathiSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error(isPunjabi ? 'ਸੈਟਿੰਗਸ ਲੋਡ ਕਰਨ ਵਿੱਚ ਗਲਤੀ' : isHindi ? 'सेटिंग्स लोड करने में त्रुटि' : 'Error loading settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('anandSaathiSettings', JSON.stringify(settings));
      
      // Update language if changed
      if (settings.preferences.language !== language) {
        setLanguage(settings.preferences.language);
      }

      if (onSettingsChange) {
        onSettingsChange(settings);
      }

      toast.success(isPunjabi ? 'ਸੈਟਿੰਗਸ ਸੇਵ ਹੋ ਗਈਆਂ' : isHindi ? 'सेटिंग्स सेव हो गईं' : 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(isPunjabi ? 'ਸੈਟਿੰਗਸ ਸੇਵ ਕਰਨ ਵਿੱਚ ਗਲਤੀ' : isHindi ? 'सेटिंग्स सेव करने में त्रुटि' : 'Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (section: keyof UserSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const resetSettings = () => {
    setSettings({
      profile: {
        name: 'Anand Singh',
        email: 'anand@example.com',
        phone: '+91 98765 43210',
        location: 'Punjab, India',
        farmName: 'Anand Farm'
      },
      preferences: {
        language: 'punjabi',
        theme: 'light',
        units: 'metric',
        dateFormat: 'dd/mm/yyyy'
      },
      notifications: {
        email: true,
        sms: true,
        push: true,
        whatsapp: false,
        weatherAlerts: true,
        marketAlerts: true,
        pestAlerts: true
      },
      privacy: {
        dataSharing: false,
        analytics: true,
        locationTracking: true,
        marketingEmails: false
      }
    });
    toast.success(isPunjabi ? 'ਸੈਟਿੰਗਸ ਰੀਸੈਟ ਹੋ ਗਈਆਂ' : isHindi ? 'सेटिंग्स रीसेट हो गईं' : 'Settings reset successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Settings className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isPunjabi ? 'ਸੈਟਿੰਗਸ' : isHindi ? 'सेटिंग्स' : 'Settings'}
              </h1>
              <p className="text-gray-600">
                {isPunjabi ? 'ਆਪਣੀਆਂ ਪਸੰਦਾਂ ਅਤੇ ਸਿਸਟਮ ਸੈਟਿੰਗਸ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ' : isHindi ? 'अपनी पसंद और सिस्टम सेटिंग्स का प्रबंधन करें' : 'Manage your preferences and system settings'}
              </p>
            </div>
          </div>

          {/* Save/Reset Buttons */}
          <div className="flex gap-4 mb-6">
            <Button onClick={saveSettings} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {isSaving 
                ? (isPunjabi ? 'ਸੇਵ ਹੋ ਰਿਹਾ ਹੈ...' : isHindi ? 'सेव हो रहा है...' : 'Saving...')
                : (isPunjabi ? 'ਸੇਵ ਕਰੋ' : isHindi ? 'सेव करें' : 'Save Settings')
              }
            </Button>
            <Button onClick={resetSettings} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              {isPunjabi ? 'ਰੀਸੈਟ ਕਰੋ' : isHindi ? 'रीसेट करें' : 'Reset'}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              {isPunjabi ? 'ਪ੍ਰੋਫਾਈਲ' : isHindi ? 'प्रोफाइल' : 'Profile'}
            </TabsTrigger>
            <TabsTrigger value="preferences">
              {isPunjabi ? 'ਪਸੰਦਾਂ' : isHindi ? 'पसंद' : 'Preferences'}
            </TabsTrigger>
            <TabsTrigger value="notifications">
              {isPunjabi ? 'ਸੂਚਨਾਵਾਂ' : isHindi ? 'सूचनाएं' : 'Notifications'}
            </TabsTrigger>
            <TabsTrigger value="privacy">
              {isPunjabi ? 'ਗੁਪਤਤਾ' : isHindi ? 'गोपनीयता' : 'Privacy'}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  {isPunjabi ? 'ਵਰਤੋਂਕਾਰ ਪ੍ਰੋਫਾਈਲ' : isHindi ? 'उपयोगकर्ता प्रोफाइल' : 'User Profile'}
                </CardTitle>
                <CardDescription>
                  {isPunjabi ? 'ਆਪਣੀ ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਅਪਡੇਟ ਕਰੋ' : isHindi ? 'अपनी निजी जानकारी अपडेट करें' : 'Update your personal information'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">{isPunjabi ? 'ਨਾਮ' : isHindi ? 'नाम' : 'Name'}</Label>
                    <Input
                      id="name"
                      value={settings.profile.name}
                      onChange={(e) => handleInputChange('profile', 'name', e.target.value)}
                      placeholder={isPunjabi ? 'ਆਪਣਾ ਨਾਮ ਦਰਜ ਕਰੋ' : isHindi ? 'अपना नाम दर्ज करें' : 'Enter your name'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{isPunjabi ? 'ਈਮੇਲ' : isHindi ? 'ईमेल' : 'Email'}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
                      placeholder={isPunjabi ? 'ਆਪਣਾ ਈਮੇਲ ਦਰਜ ਕਰੋ' : isHindi ? 'अपना ईमेल दर्ज करें' : 'Enter your email'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{isPunjabi ? 'ਫੋਨ ਨੰਬਰ' : isHindi ? 'फोन नंबर' : 'Phone Number'}</Label>
                    <Input
                      id="phone"
                      value={settings.profile.phone}
                      onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
                      placeholder={isPunjabi ? 'ਆਪਣਾ ਫੋਨ ਨੰਬਰ ਦਰਜ ਕਰੋ' : isHindi ? 'अपना फोन नंबर दर्ज करें' : 'Enter your phone number'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">{isPunjabi ? 'ਸਥਾਨ' : isHindi ? 'स्थान' : 'Location'}</Label>
                    <Input
                      id="location"
                      value={settings.profile.location}
                      onChange={(e) => handleInputChange('profile', 'location', e.target.value)}
                      placeholder={isPunjabi ? 'ਆਪਣਾ ਸਥਾਨ ਦਰਜ ਕਰੋ' : isHindi ? 'अपना स्थान दर्ज करें' : 'Enter your location'}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="farmName">{isPunjabi ? 'ਫਾਰਮ ਦਾ ਨਾਮ' : isHindi ? 'फार्म का नाम' : 'Farm Name'}</Label>
                    <Input
                      id="farmName"
                      value={settings.profile.farmName}
                      onChange={(e) => handleInputChange('profile', 'farmName', e.target.value)}
                      placeholder={isPunjabi ? 'ਆਪਣੇ ਫਾਰਮ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ' : isHindi ? 'अपने फार्म का नाम दर्ज करें' : 'Enter your farm name'}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-green-600" />
                  {isPunjabi ? 'ਭਾਸ਼ਾ ਅਤੇ ਪਸੰਦਾਂ' : isHindi ? 'भाषा और पसंद' : 'Language & Preferences'}
                </CardTitle>
                <CardDescription>
                  {isPunjabi ? 'ਆਪਣੀ ਭਾਸ਼ਾ ਅਤੇ ਡਿਸਪਲੇ ਪਸੰਦਾਂ ਸੈੱਟ ਕਰੋ' : isHindi ? 'अपनी भाषा और डिस्प्ले पसंद सेट करें' : 'Set your language and display preferences'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="language">{isPunjabi ? 'ਭਾਸ਼ਾ' : isHindi ? 'भाषा' : 'Language'}</Label>
                    <Select 
                      value={settings.preferences.language} 
                      onValueChange={(value) => handleInputChange('preferences', 'language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="punjabi">ਪੰਜਾਬੀ (Punjabi)</SelectItem>
                        <SelectItem value="hindi">हिन्दी (Hindi)</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="theme">{isPunjabi ? 'ਥੀਮ' : isHindi ? 'थीम' : 'Theme'}</Label>
                    <Select 
                      value={settings.preferences.theme} 
                      onValueChange={(value) => handleInputChange('preferences', 'theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">{isPunjabi ? 'ਹਲਕਾ' : isHindi ? 'हल्का' : 'Light'}</SelectItem>
                        <SelectItem value="dark">{isPunjabi ? 'ਗੂੜ੍ਹਾ' : isHindi ? 'गहरा' : 'Dark'}</SelectItem>
                        <SelectItem value="auto">{isPunjabi ? 'ਆਟੋ' : isHindi ? 'ऑटो' : 'Auto'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="units">{isPunjabi ? 'ਮਾਪ ਦੀਆਂ ਇਕਾਈਆਂ' : isHindi ? 'माप की इकाइयां' : 'Measurement Units'}</Label>
                    <Select 
                      value={settings.preferences.units} 
                      onValueChange={(value) => handleInputChange('preferences', 'units', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metric">{isPunjabi ? 'ਮੈਟ੍ਰਿਕ' : isHindi ? 'मेट्रिक' : 'Metric'}</SelectItem>
                        <SelectItem value="imperial">{isPunjabi ? 'ਇੰਪੀਰੀਅਲ' : isHindi ? 'इंपीरियल' : 'Imperial'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dateFormat">{isPunjabi ? 'ਤਾਰੀਖ ਫਾਰਮੈਟ' : isHindi ? 'तारीख फॉर्मेट' : 'Date Format'}</Label>
                    <Select 
                      value={settings.preferences.dateFormat} 
                      onValueChange={(value) => handleInputChange('preferences', 'dateFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-yellow-600" />
                  {isPunjabi ? 'ਸੂਚਨਾ ਪਸੰਦਾਂ' : isHindi ? 'सूचना पसंद' : 'Notification Preferences'}
                </CardTitle>
                <CardDescription>
                  {isPunjabi ? 'ਕਿਹੜੀਆਂ ਸੂਚਨਾਵਾਂ ਪ੍ਰਾਪਤ ਕਰਨੀਆਂ ਹਨ' : isHindi ? 'कौन सी सूचनाएं प्राप्त करनी हैं' : 'Choose which notifications to receive'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{isPunjabi ? 'ਈਮੇਲ ਸੂਚਨਾਵਾਂ' : isHindi ? 'ईमेल सूचनाएं' : 'Email Notifications'}</Label>
                      <p className="text-sm text-gray-600">
                        {isPunjabi ? 'ਈਮੇਲ ਰਾਹੀਂ ਸੂਚਨਾਵਾਂ ਪ੍ਰਾਪਤ ਕਰੋ' : isHindi ? 'ईमेल के माध्यम से सूचनाएं प्राप्त करें' : 'Receive notifications via email'}
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) => handleInputChange('notifications', 'email', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{isPunjabi ? 'SMS ਸੂਚਨਾਵਾਂ' : isHindi ? 'SMS सूचनाएं' : 'SMS Notifications'}</Label>
                      <p className="text-sm text-gray-600">
                        {isPunjabi ? 'SMS ਰਾਹੀਂ ਸੂਚਨਾਵਾਂ ਪ੍ਰਾਪਤ ਕਰੋ' : isHindi ? 'SMS के माध्यम से सूचनाएं प्राप्त करें' : 'Receive notifications via SMS'}
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.sms}
                      onCheckedChange={(checked) => handleInputChange('notifications', 'sms', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{isPunjabi ? 'ਪੁਸ਼ ਸੂਚਨਾਵਾਂ' : isHindi ? 'पुश सूचनाएं' : 'Push Notifications'}</Label>
                      <p className="text-sm text-gray-600">
                        {isPunjabi ? 'ਬ੍ਰਾਊਜ਼ਰ ਪੁਸ਼ ਸੂਚਨਾਵਾਂ ਪ੍ਰਾਪਤ ਕਰੋ' : isHindi ? 'ब्राउज़र पुश सूचनाएं प्राप्त करें' : 'Receive browser push notifications'}
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) => handleInputChange('notifications', 'push', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{isPunjabi ? 'WhatsApp ਸੂਚਨਾਵਾਂ' : isHindi ? 'WhatsApp सूचनाएं' : 'WhatsApp Notifications'}</Label>
                      <p className="text-sm text-gray-600">
                        {isPunjabi ? 'WhatsApp ਰਾਹੀਂ ਸੂਚਨਾਵਾਂ ਪ੍ਰਾਪਤ ਕਰੋ' : isHindi ? 'WhatsApp के माध्यम से सूचनाएं प्राप्त करें' : 'Receive notifications via WhatsApp'}
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.whatsapp}
                      onCheckedChange={(checked) => handleInputChange('notifications', 'whatsapp', checked)}
                    />
                  </div>

                  <hr />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{isPunjabi ? 'ਮੌਸਮ ਚੇਤਾਵਨੀਆਂ' : isHindi ? 'मौसम चेतावनियां' : 'Weather Alerts'}</Label>
                      <p className="text-sm text-gray-600">
                        {isPunjabi ? 'ਮੌਸਮ ਸੰਬੰਧੀ ਚੇਤਾਵਨੀਆਂ ਪ੍ਰਾਪਤ ਕਰੋ' : isHindi ? 'मौसम संबंधी चेतावनियां प्राप्त करें' : 'Receive weather-related alerts'}
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.weatherAlerts}
                      onCheckedChange={(checked) => handleInputChange('notifications', 'weatherAlerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{isPunjabi ? 'ਮਾਰਕੀਟ ਚੇਤਾਵਨੀਆਂ' : isHindi ? 'मार्केट चेतावनियां' : 'Market Alerts'}</Label>
                      <p className="text-sm text-gray-600">
                        {isPunjabi ? 'ਮਾਰਕੀਟ ਮੁੱਲ ਚੇਤਾਵਨੀਆਂ ਪ੍ਰਾਪਤ ਕਰੋ' : isHindi ? 'मार्केट मूल्य चेतावनियां प्राप्त करें' : 'Receive market price alerts'}
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.marketAlerts}
                      onCheckedChange={(checked) => handleInputChange('notifications', 'marketAlerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{isPunjabi ? 'ਕੀੜੇ-ਮਕੌੜੇ ਚੇਤਾਵਨੀਆਂ' : isHindi ? 'कीट-रोग चेतावनियां' : 'Pest Alerts'}</Label>
                      <p className="text-sm text-gray-600">
                        {isPunjabi ? 'ਕੀੜੇ-ਮਕੌੜੇ ਚੇਤਾਵਨੀਆਂ ਪ੍ਰਾਪਤ ਕਰੋ' : isHindi ? 'कीट-रोग चेतावनियां प्राप्त करें' : 'Receive pest and disease alerts'}
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.pestAlerts}
                      onCheckedChange={(checked) => handleInputChange('notifications', 'pestAlerts', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  {isPunjabi ? 'ਗੁਪਤਤਾ ਅਤੇ ਸੁਰੱਖਿਆ' : isHindi ? 'गोपनीयता और सुरक्षा' : 'Privacy & Security'}
                </CardTitle>
                <CardDescription>
                  {isPunjabi ? 'ਆਪਣੀ ਗੁਪਤਤਾ ਅਤੇ ਡੇਟਾ ਸੁਰੱਖਿਆ ਨੂੰ ਕੰਟਰੋਲ ਕਰੋ' : isHindi ? 'अपनी गोपनीयता और डेटा सुरक्षा को नियंत्रित करें' : 'Control your privacy and data security'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{isPunjabi ? 'ਡੇਟਾ ਸਾਂਝਾ ਕਰਨਾ' : isHindi ? 'डेटा साझा करना' : 'Data Sharing'}</Label>
                      <p className="text-sm text-gray-600">
                        {isPunjabi ? 'ਆਪਣਾ ਡੇਟਾ ਤੀਜੇ ਪੱਖਾਂ ਨਾਲ ਸਾਂਝਾ ਕਰਨ ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ' : isHindi ? 'अपना डेटा तीसरे पक्षों के साथ साझा करने की अनुमति दें' : 'Allow sharing your data with third parties'}
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.dataSharing}
                      onCheckedChange={(checked) => handleInputChange('privacy', 'dataSharing', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ' : isHindi ? 'विश्लेषण' : 'Analytics'}</Label>
                      <p className="text-sm text-gray-600">
                        {isPunjabi ? 'ਵਿਸ਼ਲੇਸ਼ਣ ਲਈ ਡੇਟਾ ਇਕੱਠਾ ਕਰਨ ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ' : isHindi ? 'विश्लेषण के लिए डेटा एकत्र करने की अनुमति दें' : 'Allow data collection for analytics'}
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.analytics}
                      onCheckedChange={(checked) => handleInputChange('privacy', 'analytics', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{isPunjabi ? 'ਸਥਾਨ ਟ੍ਰੈਕਿੰਗ' : isHindi ? 'स्थान ट्रैकिंग' : 'Location Tracking'}</Label>
                      <p className="text-sm text-gray-600">
                        {isPunjabi ? 'ਸਥਾਨ-ਅਧਾਰਿਤ ਸੇਵਾਵਾਂ ਲਈ ਸਥਾਨ ਟ੍ਰੈਕ ਕਰਨ ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ' : isHindi ? 'स्थान-आधारित सेवाओं के लिए स्थान ट्रैक करने की अनुमति दें' : 'Allow location tracking for location-based services'}
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.locationTracking}
                      onCheckedChange={(checked) => handleInputChange('privacy', 'locationTracking', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{isPunjabi ? 'ਮਾਰਕੀਟਿੰਗ ਈਮੇਲ' : isHindi ? 'मार्केटिंग ईमेल' : 'Marketing Emails'}</Label>
                      <p className="text-sm text-gray-600">
                        {isPunjabi ? 'ਮਾਰਕੀਟਿੰਗ ਈਮੇਲ ਪ੍ਰਾਪਤ ਕਰਨ ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ' : isHindi ? 'मार्केटिंग ईमेल प्राप्त करने की अनुमति दें' : 'Allow receiving marketing emails'}
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.marketingEmails}
                      onCheckedChange={(checked) => handleInputChange('privacy', 'marketingEmails', checked)}
                    />
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {isPunjabi 
                      ? 'ਤੁਹਾਡਾ ਡੇਟਾ ਸੁਰੱਖਿਤ ਹੈ ਅਤੇ ਸਿਰਫ ਤੁਹਾਡੀ ਇਜਾਜ਼ਤ ਨਾਲ ਸਾਂਝਾ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।'
                      : isHindi 
                      ? 'आपका डेटा सुरक्षित है और केवल आपकी अनुमति से साझा किया जाता है।'
                      : 'Your data is secure and only shared with your permission.'
                    }
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnandSaathiSettings;
