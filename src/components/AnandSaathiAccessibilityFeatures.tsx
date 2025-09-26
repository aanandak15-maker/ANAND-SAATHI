/**
 * Anand Saathi Accessibility Features
 * Enhanced user experience for all users including those with disabilities
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  EyeOff, 
  Type, 
  Contrast, 
  ZoomIn, 
  ZoomOut,
  Palette,
  Hand,
  Brain,
  RotateCcw,
  Check,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Keyboard,
  Mouse,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Settings,
  HelpCircle,
  Info,
  Shield,
  Lock,
  Unlock,
  User,
  Users,
  Globe,
  Languages,
  Sun,
  Moon,
  Cloud,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  Heart,
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
  Hand as HandIcon,
  Point,
  Wave,
  Clap,
  Download,
  Upload,
  RefreshCw,
  Save,
  Trash2,
  Edit,
  Copy,
  Share,
  ExternalLink,
  Maximize,
  Minimize,
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
  ThumbsUp as ThumbsUpIcon,
  ThumbsDown as ThumbsDownIcon
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

interface AccessibilitySettings {
  // Visual Settings
  fontSize: number;
  contrast: 'normal' | 'high' | 'low';
  colorBlind: boolean;
  colorScheme: 'light' | 'dark' | 'auto';
  zoom: number;
  
  // Interaction Settings
  largeButtons: boolean;
  simplifiedUI: boolean;
  reducedMotion: boolean;
  tactileFeedback: boolean;
  keyboardNavigation: boolean;
  
  // Audio Settings
  screenReader: boolean;
  audioDescriptions: boolean;
  soundEffects: boolean;
  voiceCommands: boolean;
  
  // Language Settings
  primaryLanguage: 'punjabi' | 'hindi' | 'english';
  textToSpeech: boolean;
  speechRate: number;
  voiceGender: 'male' | 'female' | 'neutral';
  
  // Cognitive Settings
  readingAssistance: boolean;
  simplifiedText: boolean;
  visualCues: boolean;
  stepByStep: boolean;
  
  // Motor Settings
  clickDelay: number;
  dragThreshold: number;
  scrollSpeed: number;
  gestureRecognition: boolean;
}

interface AccessibilityPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  settings: Partial<AccessibilitySettings>;
  targetUsers: string[];
}

const AnandSaathiAccessibilityFeatures: React.FC = () => {
  const { t, isPunjabi, isHindi } = useTranslation();
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 16,
    contrast: 'normal',
    colorBlind: false,
    colorScheme: 'light',
    zoom: 100,
    largeButtons: true,
    simplifiedUI: true,
    reducedMotion: false,
    tactileFeedback: true,
    keyboardNavigation: true,
    screenReader: false,
    audioDescriptions: false,
    soundEffects: true,
    voiceCommands: false,
    primaryLanguage: isPunjabi ? 'punjabi' : isHindi ? 'hindi' : 'english',
    textToSpeech: false,
    speechRate: 1.0,
    voiceGender: 'female',
    readingAssistance: false,
    simplifiedText: true,
    visualCues: true,
    stepByStep: false,
    clickDelay: 0,
    dragThreshold: 5,
    scrollSpeed: 1,
    gestureRecognition: false
  });

  const [activeTab, setActiveTab] = useState('visual');
  const [isApplied, setIsApplied] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Accessibility presets for different user needs
  const presets: AccessibilityPreset[] = [
    {
      id: 'elderly',
      name: isPunjabi ? 'ਬਜ਼ੁਰਗਾਂ ਲਈ' : isHindi ? 'बुजुर्गों के लिए' : 'For Elderly',
      description: isPunjabi 
        ? 'ਬਜ਼ੁਰਗ ਕਿਸਾਨਾਂ ਲਈ ਆਸਾਨ ਇਸਤੇਮਾਲ'
        : isHindi 
        ? 'बुजुर्ग किसानों के लिए आसान उपयोग'
        : 'Easy to use for elderly farmers',
      icon: <User className="h-5 w-5" />,
      targetUsers: ['elderly', 'low-tech'],
      settings: {
        fontSize: 20,
        largeButtons: true,
        simplifiedUI: true,
        contrast: 'high',
        soundEffects: true,
        visualCues: true
      }
    },
    {
      id: 'low-vision',
      name: isPunjabi ? 'ਕਮਜ਼ੋਰ ਨਜ਼ਰ' : isHindi ? 'कमजोर नजर' : 'Low Vision',
      description: isPunjabi 
        ? 'ਕਮਜ਼ੋਰ ਨਜ਼ਰ ਵਾਲੇ ਲਈ ਵਿਸ਼ੇਸ਼ ਸਹਾਇਤਾ'
        : isHindi 
        ? 'कमजोर नजर वालों के लिए विशेष सहायता'
        : 'Special assistance for low vision users',
      icon: <Eye className="h-5 w-5" />,
      targetUsers: ['low-vision', 'blind'],
      settings: {
        fontSize: 24,
        contrast: 'high',
        zoom: 150,
        screenReader: true,
        audioDescriptions: true,
        textToSpeech: true
      }
    },
    {
      id: 'hearing',
      name: isPunjabi ? 'ਸੁਣਨ ਵਿੱਚ ਮੁਸ਼ਕਿਲ' : isHindi ? 'सुनने में मुश्किल' : 'Hearing Impaired',
      description: isPunjabi 
        ? 'ਸੁਣਨ ਵਿੱਚ ਮੁਸ਼ਕਿਲ ਵਾਲੇ ਲਈ ਵਿਜ਼ੂਅਲ ਸਹਾਇਤਾ'
        : isHindi 
        ? 'सुनने में मुश्किल वालों के लिए विजुअल सहायता'
        : 'Visual assistance for hearing impaired',
      icon: <VolumeX className="h-5 w-5" />,
      targetUsers: ['hearing-impaired', 'deaf'],
      settings: {
        visualCues: true,
        soundEffects: false,
        screenReader: false,
        textToSpeech: false,
        audioDescriptions: false
      }
    },
    {
      id: 'motor',
      name: isPunjabi ? 'ਮੋਟਰ ਮੁਸ਼ਕਿਲ' : isHindi ? 'मोटर मुश्किल' : 'Motor Difficulties',
      description: isPunjabi 
        ? 'ਹੱਥਾਂ ਦੀ ਮੁਸ਼ਕਿਲ ਵਾਲੇ ਲਈ ਸਹਾਇਤਾ'
        : isHindi 
        ? 'हाथों की मुश्किल वालों के लिए सहायता'
        : 'Assistance for motor difficulties',
      icon: <Hand className="h-5 w-5" />,
      targetUsers: ['motor-impaired', 'tremor'],
      settings: {
        largeButtons: true,
        clickDelay: 500,
        dragThreshold: 10,
        gestureRecognition: true,
        keyboardNavigation: true
      }
    },
    {
      id: 'cognitive',
      name: isPunjabi ? 'ਸੋਚਣ ਵਿੱਚ ਮੁਸ਼ਕਿਲ' : isHindi ? 'सोचने में मुश्किल' : 'Cognitive Support',
      description: isPunjabi 
        ? 'ਸੋਚਣ ਵਿੱਚ ਮੁਸ਼ਕਿਲ ਵਾਲੇ ਲਈ ਸਹਾਇਤਾ'
        : isHindi 
        ? 'सोचने में मुश्किल वालों के लिए सहायता'
        : 'Support for cognitive difficulties',
      icon: <Brain className="h-5 w-5" />,
      targetUsers: ['cognitive-impairment', 'learning-disability'],
      settings: {
        simplifiedUI: true,
        simplifiedText: true,
        stepByStep: true,
        visualCues: true,
        readingAssistance: true
      }
    },
    {
      id: 'beginner',
      name: isPunjabi ? 'ਸ਼ੁਰੂਆਤੀ' : isHindi ? 'शुरुआती' : 'Beginner',
      description: isPunjabi 
        ? 'ਨਵੇਂ ਉਪਭੋਗਤਾਵਾਂ ਲਈ ਆਸਾਨ ਸ਼ੁਰੂਆਤ'
        : isHindi 
        ? 'नए उपयोगकर्ताओं के लिए आसान शुरुआत'
        : 'Easy start for new users',
      icon: <HelpCircle className="h-5 w-5" />,
      targetUsers: ['beginner', 'first-time'],
      settings: {
        simplifiedUI: true,
        stepByStep: true,
        visualCues: true,
        soundEffects: true,
        readingAssistance: true
      }
    }
  ];

  // Apply settings to the document
  const applySettings = () => {
    const root = document.documentElement;
    
    // Font size
    root.style.fontSize = `${settings.fontSize}px`;
    
    // Contrast
    root.classList.remove('high-contrast', 'low-contrast');
    if (settings.contrast === 'high') {
      root.classList.add('high-contrast');
    } else if (settings.contrast === 'low') {
      root.classList.add('low-contrast');
    }
    
    // Color scheme
    root.classList.remove('light', 'dark');
    root.classList.add(settings.colorScheme);
    
    // Zoom
    root.style.zoom = `${settings.zoom}%`;
    
    // Large buttons
    if (settings.largeButtons) {
      root.classList.add('large-buttons');
    } else {
      root.classList.remove('large-buttons');
    }
    
    // Simplified UI
    if (settings.simplifiedUI) {
      root.classList.add('simplified-ui');
    } else {
      root.classList.remove('simplified-ui');
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Visual cues
    if (settings.visualCues) {
      root.classList.add('visual-cues');
    } else {
      root.classList.remove('visual-cues');
    }
    
    setIsApplied(true);
    toast.success(
      isPunjabi 
        ? 'ਸੈਟਿੰਗਜ਼ ਲਾਗੂ ਕੀਤੀਆਂ ਗਈਆਂ!' 
        : isHindi 
        ? 'सेटिंग्स लागू की गईं!' 
        : 'Settings applied successfully!'
    );
  };

  // Reset to default settings
  const resetSettings = () => {
    setSettings({
      fontSize: 16,
      contrast: 'normal',
      colorBlind: false,
      colorScheme: 'light',
      zoom: 100,
      largeButtons: true,
      simplifiedUI: true,
      reducedMotion: false,
      tactileFeedback: true,
      keyboardNavigation: true,
      screenReader: false,
      audioDescriptions: false,
      soundEffects: true,
      voiceCommands: false,
      primaryLanguage: isPunjabi ? 'punjabi' : isHindi ? 'hindi' : 'english',
      textToSpeech: false,
      speechRate: 1.0,
      voiceGender: 'female',
      readingAssistance: false,
      simplifiedText: true,
      visualCues: true,
      stepByStep: false,
      clickDelay: 0,
      dragThreshold: 5,
      scrollSpeed: 1,
      gestureRecognition: false
    });
    setIsApplied(false);
    toast.info(
      isPunjabi 
        ? 'ਸੈਟਿੰਗਜ਼ ਰੀਸੈਟ ਕੀਤੀਆਂ ਗਈਆਂ!' 
        : isHindi 
        ? 'सेटिंग्स रीसेट की गईं!' 
        : 'Settings reset to default!'
    );
  };

  // Apply preset
  const applyPreset = (preset: AccessibilityPreset) => {
    setSettings(prev => ({ ...prev, ...preset.settings }));
    setIsApplied(false);
    toast.success(
      isPunjabi 
        ? `${preset.name} ਪ੍ਰੀਸੈਟ ਲਾਗੂ ਕੀਤਾ ਗਿਆ!` 
        : isHindi 
        ? `${preset.name} प्रीसेट लागू किया गया!` 
        : `${preset.name} preset applied!`
    );
  };

  // Update setting
  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setIsApplied(false);
  };

  // Preview mode toggle
  const togglePreview = () => {
    setPreviewMode(!previewMode);
    if (!previewMode) {
      applySettings();
    } else {
      // Reset to original settings
      const root = document.documentElement;
      root.style.fontSize = '16px';
      root.style.zoom = '100%';
      root.classList.remove('high-contrast', 'low-contrast', 'light', 'dark', 'large-buttons', 'simplified-ui', 'reduced-motion', 'visual-cues');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-500" />
            {isPunjabi ? 'ਪਹੁੰਚਯੋਗਤਾ ਸਹੂਲਤਾਂ' : isHindi ? 'पहुंचयोग्यता सुविधाएं' : 'Accessibility Features'}
          </CardTitle>
          <CardDescription>
            {isPunjabi 
              ? 'ਸਾਰੇ ਉਪਭੋਗਤਾਵਾਂ ਲਈ ਵਿਸ਼ੇਸ਼ ਸਹਾਇਤਾ ਅਤੇ ਸਹੂਲਤਾਂ'
              : isHindi 
              ? 'सभी उपयोगकर्ताओं के लिए विशेष सहायता और सुविधाएं'
              : 'Special assistance and features for all users'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              onClick={applySettings}
              disabled={isApplied}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              {isPunjabi ? 'ਸੈਟਿੰਗਜ਼ ਲਾਗੂ ਕਰੋ' : isHindi ? 'सेटिंग्स लागू करें' : 'Apply Settings'}
            </Button>
            
            <Button 
              onClick={togglePreview}
              variant={previewMode ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {previewMode 
                ? (isPunjabi ? 'ਪੂਰਵਦਰਸ਼ਨ ਬੰਦ ਕਰੋ' : isHindi ? 'पूर्वावलोकन बंद करें' : 'Exit Preview')
                : (isPunjabi ? 'ਪੂਰਵਦਰਸ਼ਨ' : isHindi ? 'पूर्वावलोकन' : 'Preview')
              }
            </Button>
            
            <Button 
              onClick={resetSettings}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {isPunjabi ? 'ਰੀਸੈਟ' : isHindi ? 'रीसेट' : 'Reset'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            {isPunjabi ? 'ਤੇਜ਼ ਪ੍ਰੀਸੈਟ' : isHindi ? 'तेज़ प्रीसेट' : 'Quick Presets'}
          </CardTitle>
          <CardDescription>
            {isPunjabi 
              ? 'ਵੱਖ-ਵੱਖ ਉਪਭੋਗਤਾ ਲਈ ਤਿਆਰ ਕੀਤੇ ਗਏ ਪ੍ਰੀਸੈਟ'
              : isHindi 
              ? 'विभिन्न उपयोगकर्ताओं के लिए तैयार किए गए प्रीसेट'
              : 'Pre-configured presets for different users'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets.map((preset) => (
              <Card key={preset.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {preset.icon}
                      <div>
                        <h4 className="font-semibold">{preset.name}</h4>
                        <p className="text-sm text-muted-foreground">{preset.description}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => applyPreset(preset)}
                      size="sm"
                      className="w-full"
                    >
                      {isPunjabi ? 'ਲਾਗੂ ਕਰੋ' : isHindi ? 'लागू करें' : 'Apply'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Settings */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="visual" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {isPunjabi ? 'ਦ੍ਰਿਸ਼' : isHindi ? 'दृश्य' : 'Visual'}
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            {isPunjabi ? 'ਆਡੀਓ' : isHindi ? 'ऑडियो' : 'Audio'}
          </TabsTrigger>
          <TabsTrigger value="interaction" className="flex items-center gap-2">
            <Hand className="h-4 w-4" />
            {isPunjabi ? 'ਇੰਟਰਐਕਸ਼ਨ' : isHindi ? 'इंटरैक्शन' : 'Interaction'}
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            {isPunjabi ? 'ਭਾਸ਼ਾ' : isHindi ? 'भाषा' : 'Language'}
          </TabsTrigger>
          <TabsTrigger value="cognitive" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            {isPunjabi ? 'ਸੋਚ' : isHindi ? 'सोच' : 'Cognitive'}
          </TabsTrigger>
        </TabsList>

        {/* Visual Settings */}
        <TabsContent value="visual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {isPunjabi ? 'ਦ੍ਰਿਸ਼ ਸੈਟਿੰਗਜ਼' : isHindi ? 'दृश्य सेटिंग्स' : 'Visual Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    {isPunjabi ? 'ਫੌਂਟ ਸਾਈਜ਼' : isHindi ? 'फॉन्ट साइज़' : 'Font Size'}
                  </label>
                  <div className="space-y-2">
                    <Slider
                      value={[settings.fontSize]}
                      onValueChange={(value) => updateSetting('fontSize', value[0])}
                      min={12}
                      max={32}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>12px</span>
                      <span className="font-medium">{settings.fontSize}px</span>
                      <span>32px</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    {isPunjabi ? 'ਕੰਟ੍ਰਾਸਟ' : isHindi ? 'कंट्रास्ट' : 'Contrast'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['normal', 'high', 'low'] as const).map((contrast) => (
                      <Button
                        key={contrast}
                        variant={settings.contrast === contrast ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSetting('contrast', contrast)}
                        className="flex items-center gap-2"
                      >
                        <Contrast className="h-4 w-4" />
                        {contrast === 'normal' 
                          ? (isPunjabi ? 'ਸਾਧਾਰਣ' : isHindi ? 'सामान्य' : 'Normal')
                          : contrast === 'high'
                          ? (isPunjabi ? 'ਉੱਚ' : isHindi ? 'उच्च' : 'High')
                          : (isPunjabi ? 'ਘੱਟ' : isHindi ? 'कम' : 'Low')
                        }
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    {isPunjabi ? 'ਰੰਗ ਸਕੀਮ' : isHindi ? 'रंग स्कीम' : 'Color Scheme'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['light', 'dark', 'auto'] as const).map((scheme) => (
                      <Button
                        key={scheme}
                        variant={settings.colorScheme === scheme ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSetting('colorScheme', scheme)}
                        className="flex items-center gap-2"
                      >
                        {scheme === 'light' ? <Sun className="h-4 w-4" /> :
                         scheme === 'dark' ? <Moon className="h-4 w-4" /> :
                         <Cloud className="h-4 w-4" />}
                        {scheme === 'light' 
                          ? (isPunjabi ? 'ਹਲਕਾ' : isHindi ? 'हल्का' : 'Light')
                          : scheme === 'dark'
                          ? (isPunjabi ? 'ਗੂੜ੍ਹਾ' : isHindi ? 'गहरा' : 'Dark')
                          : (isPunjabi ? 'ਆਟੋ' : isHindi ? 'ऑटो' : 'Auto')
                        }
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    {isPunjabi ? 'ਜ਼ੂਮ ਪੱਧਰ' : isHindi ? 'ज़ूम स्तर' : 'Zoom Level'}
                  </label>
                  <div className="space-y-2">
                    <Slider
                      value={[settings.zoom]}
                      onValueChange={(value) => updateSetting('zoom', value[0])}
                      min={75}
                      max={200}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>75%</span>
                      <span className="font-medium">{settings.zoom}%</span>
                      <span>200%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {isPunjabi ? 'ਰੰਗ ਅੰਨ੍ਹਾਪਣ ਸਹਾਇਤਾ' : isHindi ? 'रंग अंधापन सहायता' : 'Color Blind Support'}
                    </label>
                    <Switch
                      checked={settings.colorBlind}
                      onCheckedChange={(checked) => updateSetting('colorBlind', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audio Settings */}
        <TabsContent value="audio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                {isPunjabi ? 'ਆਡੀਓ ਸੈਟਿੰਗਜ਼' : isHindi ? 'ऑडियो सेटिंग्स' : 'Audio Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {isPunjabi ? 'ਸਕ੍ਰੀਨ ਰੀਡਰ' : isHindi ? 'स्क्रीन रीडर' : 'Screen Reader'}
                    </label>
                    <Switch
                      checked={settings.screenReader}
                      onCheckedChange={(checked) => updateSetting('screenReader', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {isPunjabi ? 'ਟੈਕਸਟ-ਟੂ-ਸਪੀਚ' : isHindi ? 'टेक्स्ट-टू-स्पीच' : 'Text-to-Speech'}
                    </label>
                    <Switch
                      checked={settings.textToSpeech}
                      onCheckedChange={(checked) => updateSetting('textToSpeech', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {isPunjabi ? 'ਆਡੀਓ ਵਰਣਨ' : isHindi ? 'ऑडियो वर्णन' : 'Audio Descriptions'}
                    </label>
                    <Switch
                      checked={settings.audioDescriptions}
                      onCheckedChange={(checked) => updateSetting('audioDescriptions', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {isPunjabi ? 'ਆਵਾਜ਼ ਕਮਾਂਡ' : isHindi ? 'आवाज़ कमांड' : 'Voice Commands'}
                    </label>
                    <Switch
                      checked={settings.voiceCommands}
                      onCheckedChange={(checked) => updateSetting('voiceCommands', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {isPunjabi ? 'ਆਵਾਜ਼ ਦੀ ਰਫਤਾਰ' : isHindi ? 'आवाज़ की रफ्तार' : 'Speech Rate'}
                    </label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[settings.speechRate]}
                        onValueChange={(value) => updateSetting('speechRate', value[0])}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        className="w-32"
                      />
                      <span className="text-sm font-medium">{settings.speechRate}x</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    {isPunjabi ? 'ਆਵਾਜ਼ ਦਾ ਲਿੰਗ' : isHindi ? 'आवाज़ का लिंग' : 'Voice Gender'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['male', 'female', 'neutral'] as const).map((gender) => (
                      <Button
                        key={gender}
                        variant={settings.voiceGender === gender ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSetting('voiceGender', gender)}
                      >
                        {gender === 'male' 
                          ? (isPunjabi ? 'ਪੁਰਸ਼' : isHindi ? 'पुरुष' : 'Male')
                          : gender === 'female'
                          ? (isPunjabi ? 'ਮਹਿਲਾ' : isHindi ? 'महिला' : 'Female')
                          : (isPunjabi ? 'ਨਿਰਪੱਖ' : isHindi ? 'निरपेक्ष' : 'Neutral')
                        }
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interaction Settings */}
        <TabsContent value="interaction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hand className="h-5 w-5" />
                {isPunjabi ? 'ਇੰਟਰਐਕਸ਼ਨ ਸੈਟਿੰਗਜ਼' : isHindi ? 'इंटरैक्शन सेटिंग्स' : 'Interaction Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {isPunjabi ? 'ਵੱਡੇ ਬਟਨ' : isHindi ? 'बड़े बटन' : 'Large Buttons'}
                    </label>
                    <Switch
                      checked={settings.largeButtons}
                      onCheckedChange={(checked) => updateSetting('largeButtons', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {isPunjabi ? 'ਸਰਲ UI' : isHindi ? 'सरल UI' : 'Simplified UI'}
                    </label>
                    <Switch
                      checked={settings.simplifiedUI}
                      onCheckedChange={(checked) => updateSetting('simplifiedUI', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {isPunjabi ? 'ਕੀਬੋਰਡ ਨੈਵੀਗੇਸ਼ਨ' : isHindi ? 'कीबोर्ड नेविगेशन' : 'Keyboard Navigation'}
                    </label>
                    <Switch
                      checked={settings.keyboardNavigation}
                      onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {isPunjabi ? 'ਛੂਹ ਫੀਡਬੈਕ' : isHindi ? 'छूने का फीडबैक' : 'Tactile Feedback'}
                    </label>
                    <Switch
                      checked={settings.tactileFeedback}
                      onCheckedChange={(checked) => updateSetting('tactileFeedback', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {isPunjabi ? 'ਘੱਟ ਮੋਸ਼ਨ' : isHindi ? 'कम मोशन' : 'Reduced Motion'}
                    </label>
                    <Switch
                      checked={settings.reducedMotion}
                      onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    {isPunjabi ? 'ਕਲਿਕ ਦੇਰੀ' : isHindi ? 'क्लिक देरी' : 'Click Delay (ms)'}
                  </label>
                  <div className="space-y-2">
                    <Slider
                      value={[settings.clickDelay]}
                      onValueChange={(value) => updateSetting('clickDelay', value[0])}
                      min={0}
                      max={1000}
                      step={50}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0ms</span>
                      <span className="font-medium">{settings.clickDelay}ms</span>
                      <span>1000ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Settings */}
        <TabsContent value="language" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                {isPunjabi ? 'ਭਾਸ਼ਾ ਸੈਟਿੰਗਜ਼' : isHindi ? 'भाषा सेटिंग्स' : 'Language Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    {isPunjabi ? 'ਮੁੱਖ ਭਾਸ਼ਾ' : isHindi ? 'मुख्य भाषा' : 'Primary Language'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['punjabi', 'hindi', 'english'] as const).map((lang) => (
                      <Button
                        key={lang}
                        variant={settings.primaryLanguage === lang ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateSetting('primaryLanguage', lang)}
                      >
                        {lang === 'punjabi' 
                          ? 'ਪੰਜਾਬੀ'
                          : lang === 'hindi'
                          ? 'हिंदी'
                          : 'English'
                        }
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {isPunjabi ? 'ਸਰਲ ਟੈਕਸਟ' : isHindi ? 'सरल टेक्स्ट' : 'Simplified Text'}
                    </label>
                    <Switch
                      checked={settings.simplifiedText}
                      onCheckedChange={(checked) => updateSetting('simplifiedText', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {isPunjabi ? 'ਪੜ੍ਹਨ ਸਹਾਇਤਾ' : isHindi ? 'पढ़ने की सहायता' : 'Reading Assistance'}
                    </label>
                    <Switch
                      checked={settings.readingAssistance}
                      onCheckedChange={(checked) => updateSetting('readingAssistance', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cognitive Settings */}
        <TabsContent value="cognitive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                {isPunjabi ? 'ਸੋਚ ਸੈਟਿੰਗਜ਼' : isHindi ? 'सोच सेटिंग्स' : 'Cognitive Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {isPunjabi ? 'ਦ੍ਰਿਸ਼ ਸੰਕੇਤ' : isHindi ? 'दृश्य संकेत' : 'Visual Cues'}
                    </label>
                    <Switch
                      checked={settings.visualCues}
                      onCheckedChange={(checked) => updateSetting('visualCues', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {isPunjabi ? 'ਕਦਮ-ਦਰ-ਕਦਮ' : isHindi ? 'कदम-दर-कदम' : 'Step-by-Step'}
                    </label>
                    <Switch
                      checked={settings.stepByStep}
                      onCheckedChange={(checked) => updateSetting('stepByStep', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {isPunjabi ? 'ਆਵਾਜ਼ ਪ੍ਰਭਾਵ' : isHindi ? 'आवाज़ प्रभाव' : 'Sound Effects'}
                    </label>
                    <Switch
                      checked={settings.soundEffects}
                      onCheckedChange={(checked) => updateSetting('soundEffects', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {isPunjabi ? 'ਜੈਸਚਰ ਪਛਾਣ' : isHindi ? 'जेस्चर पहचान' : 'Gesture Recognition'}
                    </label>
                    <Switch
                      checked={settings.gestureRecognition}
                      onCheckedChange={(checked) => updateSetting('gestureRecognition', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status */}
      {isApplied && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            {isPunjabi 
              ? 'ਸੈਟਿੰਗਜ਼ ਸਫਲਤਾਪੂਰਵਕ ਲਾਗੂ ਕੀਤੀਆਂ ਗਈਆਂ ਹਨ।'
              : isHindi 
              ? 'सेटिंग्स सफलतापूर्वक लागू की गई हैं।'
              : 'Settings have been successfully applied.'
            }
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AnandSaathiAccessibilityFeatures;

