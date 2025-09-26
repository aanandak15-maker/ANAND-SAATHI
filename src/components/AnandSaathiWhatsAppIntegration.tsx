/**
 * Anand Saathi WhatsApp Integration
 * Simple WhatsApp integration for agricultural communication and alerts
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Users, 
  Bell, 
  Share2,
  Download,
  Upload,
  Settings,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface AnandSaathiWhatsAppIntegrationProps {
  farmId?: string;
}

interface WhatsAppContact {
  id: string;
  name: string;
  phone: string;
  role: 'farmer' | 'expert' | 'vendor' | 'government';
  lastMessage: string;
  timestamp: string;
  unread: number;
}

interface WhatsAppMessage {
  id: string;
  type: 'sent' | 'received';
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

const AnandSaathiWhatsAppIntegration: React.FC<AnandSaathiWhatsAppIntegrationProps> = ({ farmId }) => {
  const { t, isPunjabi, isHindi } = useTranslation();
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  // Sample WhatsApp contacts
  const contacts: WhatsAppContact[] = [
    {
      id: '1',
      name: isPunjabi ? 'ਡਾ. ਸਿੰਘ - ਖੇਤੀ ਮਾਹਿਰ' : isHindi ? 'डॉ. सिंह - कृषि विशेषज्ञ' : 'Dr. Singh - Agriculture Expert',
      phone: '+91 98765 43210',
      role: 'expert',
      lastMessage: isPunjabi ? 'ਤੁਹਾਡੇ ਖੇਤ ਦੀ ਸਿਹਤ ਚੰਗੀ ਹੈ' : isHindi ? 'आपके खेत की सेहत अच्छी है' : 'Your field health is good',
      timestamp: '2 min ago',
      unread: 0
    },
    {
      id: '2',
      name: isPunjabi ? 'ਪੰਜਾਬ ਖੇਤੀ ਸੇਵਾਵਾਂ' : isHindi ? 'पंजाब खेती सेवाएं' : 'Punjab Agriculture Services',
      phone: '+91 98765 43211',
      role: 'government',
      lastMessage: isPunjabi ? 'ਨਵੀਂ ਯੋਜਨਾ ਲਈ ਰਜਿਸਟਰ ਕਰੋ' : isHindi ? 'नई योजना के लिए रजिस्टर करें' : 'Register for new scheme',
      timestamp: '1 hour ago',
      unread: 2
    },
    {
      id: '3',
      name: isPunjabi ? 'ਰਾਮ ਸਿੰਘ - ਖੇਤੀ ਸਾਥੀ' : isHindi ? 'राम सिंह - कृषि साथी' : 'Ram Singh - Fellow Farmer',
      phone: '+91 98765 43212',
      role: 'farmer',
      lastMessage: isPunjabi ? 'ਕੀ ਤੁਸੀਂ ਨਵੀਂ ਖਾਦ ਦੀ ਵਰਤੋਂ ਕੀਤੀ?' : isHindi ? 'क्या आपने नई खाद का उपयोग किया?' : 'Did you use the new fertilizer?',
      timestamp: '3 hours ago',
      unread: 1
    }
  ];

  // Sample messages for selected contact
  const messages: WhatsAppMessage[] = [
    {
      id: '1',
      type: 'received',
      content: isPunjabi ? 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਤੁਹਾਡੇ ਖੇਤ ਦੀ ਸਿਹਤ ਕਿਵੇਂ ਹੈ?' : isHindi ? 'नमस्ते! आपके खेत की सेहत कैसी है?' : 'Hello! How is your field health?',
      timestamp: '10:30 AM',
      status: 'read'
    },
    {
      id: '2',
      type: 'sent',
      content: isPunjabi ? 'ਚੰਗੀ ਹੈ, ਧੰਨਵਾਦ! NDVI 0.8 ਹੈ' : isHindi ? 'अच्छी है, धन्यवाद! NDVI 0.8 है' : 'Good, thanks! NDVI is 0.8',
      timestamp: '10:32 AM',
      status: 'read'
    },
    {
      id: '3',
      type: 'received',
      content: isPunjabi ? 'ਬਹੁਤ ਵਧੀਆ! ਕੀ ਤੁਸੀਂ ਸਿੰਚਾਈ ਕੀਤੀ?' : isHindi ? 'बहुत अच्छा! क्या आपने सिंचाई की?' : 'Excellent! Did you irrigate?',
      timestamp: '10:35 AM',
      status: 'read'
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'expert': return 'bg-blue-100 text-blue-800';
      case 'government': return 'bg-green-100 text-green-800';
      case 'farmer': return 'bg-yellow-100 text-yellow-800';
      case 'vendor': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'expert': return '👨‍⚕️';
      case 'government': return '🏛️';
      case 'farmer': return '👨‍🌾';
      case 'vendor': return '🏪';
      default: return '👤';
    }
  };

  const sendMessage = () => {
    if (messageText.trim()) {
      // Simulate sending message
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

  const shareFieldData = () => {
    const fieldData = {
      health: '85%',
      ndvi: '0.8',
      moisture: '65%',
      lastUpdate: new Date().toLocaleString()
    };
    
    const message = isPunjabi 
      ? `ਮੇਰੇ ਖੇਤ ਦਾ ਡੇਟਾ:\nਸਿਹਤ: ${fieldData.health}\nNDVI: ${fieldData.ndvi}\nਨਮੀ: ${fieldData.moisture}\nਆਖਰੀ ਅਪਡੇਟ: ${fieldData.lastUpdate}`
      : isHindi 
      ? `मेरे खेत का डेटा:\nस्वास्थ्य: ${fieldData.health}\nNDVI: ${fieldData.ndvi}\nनमी: ${fieldData.moisture}\nआखिरी अपडेट: ${fieldData.lastUpdate}`
      : `My field data:\nHealth: ${fieldData.health}\nNDVI: ${fieldData.ndvi}\nMoisture: ${fieldData.moisture}\nLast Update: ${fieldData.lastUpdate}`;
    
    setMessageText(message);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            {isPunjabi ? 'ਅਨੰਦ ਸਾਥੀ WhatsApp ਇੰਟੀਗ੍ਰੇਸ਼ਨ' : isHindi ? 'अनंद साथी WhatsApp इंटीग्रेशन' : 'Anand Saathi WhatsApp Integration'}
          </CardTitle>
          <CardDescription>
            {isPunjabi 
              ? 'ਖੇਤੀ ਸੰਚਾਰ ਅਤੇ ਸੂਚਨਾਵਾਂ ਲਈ WhatsApp ਇੰਟੀਗ੍ਰੇਸ਼ਨ'
              : isHindi 
              ? 'कृषि संचार और सूचनाओं के लिए WhatsApp इंटीग्रेशन'
              : 'WhatsApp integration for agricultural communication and alerts'
            }
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="chats" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chats">
            <MessageCircle className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਚੈਟਸ' : isHindi ? 'चैट्स' : 'Chats'}
          </TabsTrigger>
          <TabsTrigger value="contacts">
            <Users className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਸੰਪਰਕ' : isHindi ? 'संपर्क' : 'Contacts'}
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <Bell className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਅਲਰਟਸ' : isHindi ? 'अलर्ट्स' : 'Alerts'}
          </TabsTrigger>
          <TabsTrigger value="share">
            <Share2 className="h-4 w-4 mr-1" />
            {isPunjabi ? 'ਸਾਂਝਾ' : isHindi ? 'साझा' : 'Share'}
          </TabsTrigger>
        </TabsList>

        {/* Chats Tab */}
        <TabsContent value="chats" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Contacts List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">
                  {isPunjabi ? 'ਸੰਪਰਕ' : isHindi ? 'संपर्क' : 'Contacts'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`p-3 cursor-pointer hover:bg-gray-50 border-l-4 ${
                        selectedContact === contact.id ? 'border-l-blue-500 bg-blue-50' : 'border-l-transparent'
                      }`}
                      onClick={() => setSelectedContact(contact.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getRoleIcon(contact.role)}</div>
                          <div>
                            <h4 className="font-medium text-sm">{contact.name}</h4>
                            <p className="text-xs text-muted-foreground">{contact.lastMessage}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{contact.timestamp}</p>
                          {contact.unread > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {contact.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat Messages */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedContact ? contacts.find(c => c.id === selectedContact)?.name : (isPunjabi ? 'ਚੈਟ ਚੁਣੋ' : isHindi ? 'चैट चुनें' : 'Select a chat')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedContact ? (
                  <div className="space-y-4">
                    {/* Messages */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg ${
                              message.type === 'sent'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder={isPunjabi ? 'ਮੈਸੇਜ ਲਿਖੋ...' : isHindi ? 'मैसेज लिखें...' : 'Type a message...'}
                        className="flex-1 px-3 py-2 border rounded-md"
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <Button onClick={sendMessage} disabled={!messageText.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{isPunjabi ? 'ਚੈਟ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਸੰਪਰਕ ਚੁਣੋ' : isHindi ? 'चैट शुरू करने के लिए संपर्क चुनें' : 'Select a contact to start chatting'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <Card key={contact.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">{getRoleIcon(contact.role)}</div>
                    <div>
                      <h3 className="font-medium">{contact.name}</h3>
                      <p className="text-sm text-muted-foreground">{contact.phone}</p>
                    </div>
                  </div>
                  
                  <Badge className={getRoleColor(contact.role)}>
                    {contact.role === 'expert' ? (isPunjabi ? 'ਮਾਹਿਰ' : isHindi ? 'विशेषज्ञ' : 'Expert') :
                     contact.role === 'government' ? (isPunjabi ? 'ਸਰਕਾਰ' : isHindi ? 'सरकार' : 'Government') :
                     contact.role === 'farmer' ? (isPunjabi ? 'ਕਿਸਾਨ' : isHindi ? 'किसान' : 'Farmer') :
                     (isPunjabi ? 'ਵਿਕਰੇਤਾ' : isHindi ? 'विक्रेता' : 'Vendor')}
                  </Badge>
                  
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="flex-1">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {isPunjabi ? 'ਮੈਸੇਜ' : isHindi ? 'मैसेज' : 'Message'}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4" />
                    </Button>
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
                {isPunjabi ? 'WhatsApp ਅਲਰਟਸ' : isHindi ? 'WhatsApp अलर्ट्स' : 'WhatsApp Alerts'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h3 className="font-medium text-green-800">
                        {isPunjabi ? 'ਖੇਤ ਸਿਹਤ ਅਲਰਟ' : isHindi ? 'खेत स्वास्थ्य अलर्ट' : 'Field Health Alert'}
                      </h3>
                    </div>
                    <p className="text-sm text-green-700 mb-3">
                      {isPunjabi ? 'NDVI 0.8 ਤੋਂ ਘੱਟ ਹੈ - ਸਿੰਚਾਈ ਦੀ ਜ਼ਰੂਰਤ' : isHindi ? 'NDVI 0.8 से कम है - सिंचाई की जरूरत' : 'NDVI below 0.8 - irrigation needed'}
                    </p>
                    <Button size="sm" variant="outline" className="border-green-300 text-green-700">
                      <Send className="h-4 w-4 mr-1" />
                      {isPunjabi ? 'WhatsApp \'ਤੇ ਭੇਜੋ' : isHindi ? 'WhatsApp पर भेजें' : 'Send on WhatsApp'}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <h3 className="font-medium text-yellow-800">
                        {isPunjabi ? 'ਮੌਸਮ ਚੇਤਾਵਨੀ' : isHindi ? 'मौसम चेतावनी' : 'Weather Warning'}
                      </h3>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      {isPunjabi ? 'ਕੱਲ੍ਹ ਤੋਂ ਬਾਰਿਸ਼ ਦੀ ਸੰਭਾਵਨਾ' : isHindi ? 'कल से बारिश की संभावना' : 'Rain expected from tomorrow'}
                    </p>
                    <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700">
                      <Send className="h-4 w-4 mr-1" />
                      {isPunjabi ? 'WhatsApp \'ਤੇ ਭੇਜੋ' : isHindi ? 'WhatsApp पर भेजें' : 'Send on WhatsApp'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Share Tab */}
        <TabsContent value="share" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                {isPunjabi ? 'ਖੇਤ ਡੇਟਾ ਸਾਂਝਾ ਕਰੋ' : isHindi ? 'खेत डेटा साझा करें' : 'Share Field Data'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-3">
                      {isPunjabi ? 'ਤਾਜ਼ਾ ਖੇਤ ਡੇਟਾ' : isHindi ? 'ताज़ा खेत डेटा' : 'Latest Field Data'}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>{isPunjabi ? 'ਸਿਹਤ:' : isHindi ? 'स्वास्थ्य:' : 'Health:'}</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>NDVI:</span>
                        <span className="font-medium">0.8</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{isPunjabi ? 'ਨਮੀ:' : isHindi ? 'नमी:' : 'Moisture:'}</span>
                        <span className="font-medium">65%</span>
                      </div>
                    </div>
                    <Button 
                      onClick={shareFieldData}
                      className="w-full mt-3"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      {isPunjabi ? 'WhatsApp \'ਤੇ ਸਾਂਝਾ ਕਰੋ' : isHindi ? 'WhatsApp पर साझा करें' : 'Share on WhatsApp'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-3">
                      {isPunjabi ? 'ਖੇਤ ਚਿੱਤਰ' : isHindi ? 'खेत चित्र' : 'Field Images'}
                    </h3>
                    <div className="aspect-video bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      {isPunjabi ? 'ਚਿੱਤਰ ਸਾਂਝਾ ਕਰੋ' : isHindi ? 'चित्र साझा करें' : 'Share Images'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnandSaathiWhatsAppIntegration;