/**
 * Anand Saathi Unified Voice Assistant
 * Advanced voice assistant integrating features from VoiceAssistant.tsx and EnhancedVoiceAssistant.tsx
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  MessageCircle,
  Bot,
  User,
  Send,
  Languages,
  Headphones,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

interface AnandSaathiUnifiedVoiceAssistantProps {
  farmId?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  audioUrl?: string;
  language: string;
}

interface AudioGuide {
  id: string;
  title: string;
  titleHindi: string;
  titlePunjabi: string;
  category: "health" | "farming" | "marketplace" | "navigation";
  duration: string;
  description: string;
  descriptionHindi: string;
  descriptionPunjabi: string;
  priority: "high" | "medium" | "low";
  audioUrl?: string;
}

const AnandSaathiUnifiedVoiceAssistant: React.FC<AnandSaathiUnifiedVoiceAssistantProps> = ({ farmId }) => {
  const { t, isPunjabi, isHindi, language } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState("normal");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: isPunjabi 
        ? 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਖੇਤੀ ਸਹਾਇਕ ਹਾਂ। ਤੁਸੀਂ ਕਿਸੇ ਵੀ ਸਵਾਲ ਪੁੱਛ ਸਕਦੇ ਹੋ।'
        : isHindi 
        ? 'नमस्ते! मैं आपका कृषि सहायक हूं। आप कोई भी सवाल पूछ सकते हैं।'
        : 'Hello! I am your agricultural assistant. You can ask me any questions.',
      sender: 'assistant',
      timestamp: new Date(),
      language: currentLanguage
    }
  ]);
  const [inputText, setInputText] = useState('');

  const languages = [
    { code: "hi", name: "हिन्दी (Hindi)", flag: "🇮🇳" },
    { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)", flag: "🇮🇳" },
    { code: "en", name: "English", flag: "🇺🇸" }
  ];

  // Audio guides for different farming topics
  const audioGuides: AudioGuide[] = [
    {
      id: '1',
      title: 'Field Health Assessment',
      titleHindi: 'खेत स्वास्थ्य मूल्यांकन',
      titlePunjabi: 'ਖੇਤ ਸਿਹਤ ਮੁਲਾਂਕਣ',
      category: 'health',
      duration: '5:30',
      description: 'Learn how to assess your field health using various indicators',
      descriptionHindi: 'विभिन्न संकेतकों का उपयोग करके अपने खेत के स्वास्थ्य का आकलन करना सीखें',
      descriptionPunjabi: 'ਵੱਖ-ਵੱਖ ਸੂਚਕਾਂ ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਆਪਣੇ ਖੇਤ ਦੀ ਸਿਹਤ ਦਾ ਮੁਲਾਂਕਣ ਕਰਨਾ ਸਿੱਖੋ',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Fertilizer Application',
      titleHindi: 'खाद का उपयोग',
      titlePunjabi: 'ਖਾਦ ਦੀ ਵਰਤੋਂ',
      category: 'farming',
      duration: '7:15',
      description: 'Proper fertilizer application techniques for better yields',
      descriptionHindi: 'बेहतर उपज के लिए उचित खाद उपयोग तकनीक',
      descriptionPunjabi: 'ਬਿਹਤਰ ਉਪਜ ਲਈ ਉਚਿਤ ਖਾਦ ਵਰਤੋਂ ਤਕਨੀਕ',
      priority: 'high'
    },
    {
      id: '3',
      title: 'Market Price Analysis',
      titleHindi: 'बाजार मूल्य विश्लेषण',
      titlePunjabi: 'ਮਾਰਕੀਟ ਕੀਮਤ ਵਿਸ਼ਲੇਸ਼ਣ',
      category: 'marketplace',
      duration: '4:45',
      description: 'Understanding market trends and pricing strategies',
      descriptionHindi: 'बाजार के रुझान और मूल्य निर्धारण रणनीतियों को समझना',
      descriptionPunjabi: 'ਮਾਰਕੀਟ ਰੁਝਾਨ ਅਤੇ ਕੀਮਤ ਨਿਰਧਾਰਣ ਰਣਨੀਤੀਆਂ ਨੂੰ ਸਮਝਣਾ',
      priority: 'medium'
    }
  ];

  const quickQuestions = [
    {
      question: isPunjabi ? 'ਮੇਰੇ ਖੇਤ ਦੀ ਸਿਹਤ ਕਿਵੇਂ ਹੈ?' : isHindi ? 'मेरे खेत की सेहत कैसी है?' : 'How is my field health?',
      answer: isPunjabi ? 'ਤੁਹਾਡੇ ਖੇਤ ਦੀ ਸਿਹਤ 85% ਹੈ। NDVI ਸੂਚਕ 0.8 ਹੈ, ਜੋ ਚੰਗਾ ਹੈ।' : isHindi ? 'आपके खेत की सेहत 85% है। NDVI सूचक 0.8 है, जो अच्छा है।' : 'Your field health is 85%. NDVI index is 0.8, which is good.'
    },
    {
      question: isPunjabi ? 'ਕੀ ਮੈਨੂੰ ਸਿੰਚਾਈ ਕਰਨੀ ਚਾਹੀਦੀ ਹੈ?' : isHindi ? 'क्या मुझे सिंचाई करनी चाहिए?' : 'Should I irrigate?',
      answer: isPunjabi ? 'ਹਾਂ, ਮਿੱਟੀ ਦੀ ਨਮੀ 30% ਹੈ। ਸਿੰਚਾਈ ਕਰਨ ਦੀ ਸਿਫਾਰਸ਼ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।' : isHindi ? 'हां, मिट्टी की नमी 30% है। सिंचाई करने की सिफारिश की जाती है।' : 'Yes, soil moisture is 30%. Irrigation is recommended.'
    },
    {
      question: isPunjabi ? 'ਕਿਹੜਾ ਖਾਦ ਪਾਉਣਾ ਚਾਹੀਦਾ ਹੈ?' : isHindi ? 'कौन सा खाद डालना चाहिए?' : 'What fertilizer should I use?',
      answer: isPunjabi ? 'NPK 19:19:19 ਖਾਦ ਦੀ ਸਿਫਾਰਸ਼ ਕੀਤੀ ਜਾਂਦੀ ਹੈ। 50 ਕਿਲੋ ਪ੍ਰਤੀ ਏਕੜ।' : isHindi ? 'NPK 19:19:19 खाद की सिफारिश की जाती है। 50 किलो प्रति एकड़।' : 'NPK 19:19:19 fertilizer is recommended. 50 kg per acre.'
    }
  ];

  const startListening = () => {
    setIsListening(true);
    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false);
      const randomQuestion = quickQuestions[Math.floor(Math.random() * quickQuestions.length)];
      addMessage(randomQuestion.question, 'user');
      setTimeout(() => {
        addMessage(randomQuestion.answer, 'assistant');
      }, 1000);
    }, 2000);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const addMessage = (text: string, sender: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = () => {
    if (inputText.trim()) {
      addMessage(inputText, 'user');
      setInputText('');
      
      // Simulate AI response
      setTimeout(() => {
        const response = isPunjabi 
          ? 'ਮੈਂ ਤੁਹਾਡੇ ਸਵਾਲ ਦਾ ਜਵਾਬ ਦੇਵਾਂਗਾ। ਕਿਰਪਾ ਕਰਕੇ ਥੋੜ੍ਹਾ ਇੰਤਜ਼ਾਰ ਕਰੋ।'
          : isHindi 
          ? 'मैं आपके सवाल का जवाब दूंगा। कृपया थोड़ा इंतजार करें।'
          : 'I will answer your question. Please wait a moment.';
        addMessage(response, 'assistant');
      }, 1000);
    }
  };

  const speakMessage = (text: string) => {
    setIsSpeaking(true);
    // Simulate text-to-speech
    setTimeout(() => {
      setIsSpeaking(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            {isPunjabi ? 'ਅਨੰਦ ਸਾਥੀ ਵੌਇਸ ਅਸਿਸਟੈਂਟ' : isHindi ? 'अनंद साथी वॉइस असिस्टेंट' : 'Anand Saathi Voice Assistant'}
          </CardTitle>
          <CardDescription>
            {isPunjabi 
              ? 'ਤੁਹਾਡਾ AI ਖੇਤੀ ਸਹਾਇਕ - ਪੰਜਾਬੀ, ਹਿੰਦੀ, ਅਤੇ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਬੋਲੋ'
              : isHindi 
              ? 'आपका AI कृषि सहायक - पंजाबी, हिंदी, और अंग्रेजी में बोलें'
              : 'Your AI agricultural assistant - speak in Punjabi, Hindi, or English'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Headphones className="h-4 w-4" />
                <Button
                  size="sm"
                  variant={audioEnabled ? "default" : "outline"}
                  onClick={() => setAudioEnabled(!audioEnabled)}
                >
                  {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <Select value={voiceSpeed} onValueChange={setVoiceSpeed}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="fast">Fast</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat">
            <MessageCircle className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਚੈਟ' : isHindi ? 'चैट' : 'Chat'}
          </TabsTrigger>
          <TabsTrigger value="voice">
            <Mic className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਵੌਇਸ' : isHindi ? 'वॉइस' : 'Voice'}
          </TabsTrigger>
          <TabsTrigger value="guides">
            <Play className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਗਾਈਡ' : isHindi ? 'गाइड' : 'Guides'}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਸੈਟਿੰਗ' : isHindi ? 'सेटिंग' : 'Settings'}
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          {/* Messages */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.sender === 'assistant' && <Bot className="h-4 w-4 mt-0.5" />}
                        {message.sender === 'user' && <User className="h-4 w-4 mt-0.5" />}
                        <div>
                          <p className="text-sm">{message.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      
                      {message.sender === 'assistant' && audioEnabled && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2 h-6 px-2"
                          onClick={() => speakMessage(message.text)}
                          disabled={isSpeaking}
                        >
                          {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isPunjabi ? 'ਆਪਣਾ ਸਵਾਲ ਲਿਖੋ...' : isHindi ? 'अपना सवाल लिखें...' : 'Type your question...'}
                  className="flex-1 px-3 py-2 border rounded-md"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage} disabled={!inputText.trim() || isProcessing}>
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voice Tab */}
        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-4">
                <Button
                  size="lg"
                  variant={isListening ? "destructive" : "default"}
                  onClick={isListening ? stopListening : startListening}
                  className="rounded-full w-16 h-16"
                >
                  {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {isListening 
                      ? (isPunjabi ? 'ਸੁਣ ਰਿਹਾ ਹਾਂ...' : isHindi ? 'सुन रहा हूं...' : 'Listening...')
                      : (isPunjabi ? 'ਬੋਲਣ ਲਈ ਕਲਿੱਕ ਕਰੋ' : isHindi ? 'बोलने के लिए क्लिक करें' : 'Click to speak')
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audio Guides Tab */}
        <TabsContent value="guides" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isPunjabi ? 'ਆਡੀਓ ਗਾਈਡ' : isHindi ? 'ऑडियो गाइड' : 'Audio Guides'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {audioGuides.map((guide) => (
                  <Card key={guide.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium">
                          {currentLanguage === 'pa' ? guide.titlePunjabi : 
                           currentLanguage === 'hi' ? guide.titleHindi : guide.title}
                        </h3>
                        <Badge variant={guide.priority === 'high' ? 'destructive' : guide.priority === 'medium' ? 'default' : 'secondary'}>
                          {guide.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {currentLanguage === 'pa' ? guide.descriptionPunjabi : 
                         currentLanguage === 'hi' ? guide.descriptionHindi : guide.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {guide.duration}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentlyPlaying(guide.id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const guideText = currentLanguage === 'pa' ? guide.descriptionPunjabi : 
                                               currentLanguage === 'hi' ? guide.descriptionHindi : guide.description;
                              speakMessage(guideText);
                            }}
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isPunjabi ? 'ਵੌਇਸ ਸੈਟਿੰਗ' : isHindi ? 'वॉइस सेटिंग' : 'Voice Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    {isPunjabi ? 'ਭਾਸ਼ਾ' : isHindi ? 'भाषा' : 'Language'}
                  </label>
                  <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">
                    {isPunjabi ? 'ਵੌਇਸ ਸਪੀਡ' : isHindi ? 'वॉइस स्पीड' : 'Voice Speed'}
                  </label>
                  <Select value={voiceSpeed} onValueChange={setVoiceSpeed}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">
                    {isPunjabi ? 'ਆਡੀਓ ਚਾਲੂ ਕਰੋ' : isHindi ? 'ऑडियो चालू करें' : 'Enable Audio'}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {isPunjabi ? 'ਵੌਇਸ ਰਿਪਲਾਈ ਲਈ ਆਡੀਓ ਚਾਲੂ ਕਰੋ' : isHindi ? 'वॉइस रिप्लाई के लिए ऑडियो चालू करें' : 'Enable audio for voice replies'}
                  </p>
                </div>
                <Button
                  variant={audioEnabled ? "default" : "outline"}
                  onClick={() => setAudioEnabled(!audioEnabled)}
                >
                  {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnandSaathiUnifiedVoiceAssistant;