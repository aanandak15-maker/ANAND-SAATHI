import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Mic, 
  MicOff,
  Image as ImageIcon,
  Phone,
  Video,
  CheckCircle,
  CheckCircle2,
  Clock,
  MoreVertical,
  Smile,
  Paperclip,
  Star,
  ThumbsUp,
  Heart,
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Camera,
  FileText,
  MapPin,
  Calendar,
  AlertCircle,
  Bot,
  User,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { ragService, RAGRequest } from '@/lib/ragService';

interface WhatsAppMessage {
  id: string;
  type: 'text' | 'voice' | 'image' | 'document' | 'location' | 'quick_reply';
  content: string;
  timestamp: Date;
  from: 'farmer' | 'expert';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isTyping?: boolean;
  reactions?: string[];
  quickReplies?: string[];
  imageUrl?: string;
  voiceDuration?: number;
  isPlaying?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

const EnhancedWhatsApp: React.FC = () => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([
    {
      id: '1',
      type: 'text',
      content: 'नमस्ते! मैं आपका कृषि सलाहकार हूं। आप मुझसे अपने खेत के बारे में कुछ भी पूछ सकते हैं।',
      timestamp: new Date(Date.now() - 600000),
      from: 'expert',
      status: 'read',
      reactions: ['👍']
    },
    {
      id: '2',
      type: 'text',
      content: 'नमस्ते सर! मेरी गेहूं की फसल में पीले पत्ते आ रहे हैं। क्या करूं?',
      timestamp: new Date(Date.now() - 300000),
      from: 'farmer',
      status: 'read'
    },
    {
      id: '3',
      type: 'text',
      content: 'यह नाइट्रोजन की कमी लग रही है। क्या आपने यूरिया का छिड़काव किया है?',
      timestamp: new Date(Date.now() - 240000),
      from: 'expert',
      status: 'read',
      quickReplies: ['हां, किया है', 'नहीं, अभी नहीं', 'कितना डालना चाहिए?']
    },
    {
      id: '4',
      type: 'text',
      content: 'नहीं सर, अभी तक नहीं किया। कब और कितना डालना चाहिए?',
      timestamp: new Date(Date.now() - 180000),
      from: 'farmer',
      status: 'read'
    },
    {
      id: '5',
      type: 'text',
      content: 'अभी 2 दिन में 50 किलो प्रति एकड़ यूरिया डालें। बारिश से पहले कर लें। मैं आपको लिंक भेज रहा हूँ।',
      timestamp: new Date(Date.now() - 120000),
      from: 'expert',
      status: 'read',
      quickReplies: ['धन्यवाद सर!', 'और कुछ सुझाव?', 'कहाँ से खरीदूं?']
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [expertTyping, setExpertTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, expertTyping]);

  // Simulate expert typing with RAG-powered responses
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].from === 'farmer') {
      setExpertTyping(true);
      const lastMessage = messages[messages.length - 1];
      
      const timer = setTimeout(async () => {
        setExpertTyping(false);
        
        try {
          // Use RAG system for intelligent expert response
          const ragRequest: RAGRequest = {
            query: lastMessage.content,
            language: 'hi',
            context: 'whatsapp_expert'
          };

          const ragResponse = await ragService.generateResponse(ragRequest);
          
          const expertResponse: WhatsAppMessage = {
            id: Date.now().toString(),
            type: 'text',
            content: ragResponse.answer,
            timestamp: new Date(),
            from: 'expert',
            status: 'sent',
            quickReplies: ['धन्यवाद सर!', 'और सुझाव?', 'कहाँ से खरीदूं?', 'समझ गया']
          };
          
          setMessages(prev => [...prev, expertResponse]);
        } catch (error) {
          console.error('RAG Expert Response Error:', error);
          
          // Fallback response
          const expertResponse: WhatsAppMessage = {
            id: Date.now().toString(),
            type: 'text',
            content: 'मैं आपकी समस्या समझ गया हूं। कृपया थोड़ा इंतजार करें, मैं आपको सही सुझाव दूंगा।',
            timestamp: new Date(),
            from: 'expert',
            status: 'sent',
            quickReplies: ['ठीक है सर', 'जल्दी बताइए', 'और जानकारी चाहिए']
          };
          setMessages(prev => [...prev, expertResponse]);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: WhatsAppMessage = {
      id: Date.now().toString(),
      type: 'text',
      content: newMessage,
      timestamp: new Date(),
      from: 'farmer',
      status: 'sending'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate sending
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'sent' } : msg
      ));
    }, 1000);
  };

  const startVoiceMessage = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    // Simulate recording
    setTimeout(() => {
      stopVoiceMessage();
    }, 5000);
  };

  const stopVoiceMessage = () => {
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }

    const voiceMessage: WhatsAppMessage = {
      id: Date.now().toString(),
      type: 'voice',
      content: `Voice message (${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')})`,
      timestamp: new Date(),
      from: 'farmer',
      status: 'sent',
      voiceDuration: recordingTime
    };

    setMessages(prev => [...prev, voiceMessage]);
    setRecordingTime(0);
  };

  const sendQuickReply = (reply: string) => {
    const message: WhatsAppMessage = {
      id: Date.now().toString(),
      type: 'quick_reply',
      content: reply,
      timestamp: new Date(),
      from: 'farmer',
      status: 'sending'
    };

    setMessages(prev => [...prev, message]);

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'sent' } : msg
      ));
    }, 1000);
  };

  const addReaction = (messageId: string, reaction: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        if (reactions.includes(reaction)) {
          return { ...msg, reactions: reactions.filter(r => r !== reaction) };
        } else {
          return { ...msg, reactions: [...reactions, reaction] };
        }
      }
      return msg;
    }));
  };

  const sendImage = () => {
    // Simulate image selection
    const imageMessage: WhatsAppMessage = {
      id: Date.now().toString(),
      type: 'image',
      content: 'Field photo',
      timestamp: new Date(),
      from: 'farmer',
      status: 'sent',
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300&h=200&fit=crop'
    };

    setMessages(prev => [...prev, imageMessage]);
    toast.success('Image sent successfully!');
  };

  const sendLocation = () => {
    const locationMessage: WhatsAppMessage = {
      id: Date.now().toString(),
      type: 'location',
      content: 'My field location',
      timestamp: new Date(),
      from: 'farmer',
      status: 'sent'
    };

    setMessages(prev => [...prev, locationMessage]);
    toast.success('Location shared!');
  };

  const quickActions: QuickAction[] = [
    {
      id: 'camera',
      label: 'Photo',
      icon: <Camera size={16} />,
      action: sendImage,
      color: 'bg-blue-500'
    },
    {
      id: 'location',
      label: 'Location',
      icon: <MapPin size={16} />,
      action: sendLocation,
      color: 'bg-green-500'
    },
    {
      id: 'document',
      label: 'Document',
      icon: <FileText size={16} />,
      action: () => toast.info('Document feature coming soon!'),
      color: 'bg-purple-500'
    },
    {
      id: 'call',
      label: 'Call',
      icon: <Phone size={16} />,
      action: () => toast.info('Call feature coming soon!'),
      color: 'bg-red-500'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending': return <Loader2 size={12} className="text-muted-foreground animate-spin" />;
      case 'sent': return <CheckCircle size={12} className="text-muted-foreground" />;
      case 'delivered': return <CheckCircle2 size={12} className="text-muted-foreground" />;
      case 'read': return <CheckCircle2 size={12} className="text-blue-500" />;
      default: return null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto bg-background">
      {/* Enhanced WhatsApp Header */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Bot className="text-green-600" size={24} />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
            </div>
            <div className="flex-1">
              <CardTitle className="text-white text-lg">एग्री सलाहकार</CardTitle>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <p className="text-green-100 text-sm">
                  {isOnline ? 'ऑनलाइन' : 'ऑफलाइन'} • कृषि विशेषज्ञ
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-green-600">
                <Video size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-green-600">
                <Phone size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-green-600">
                <MoreVertical size={20} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Messages */}
      <Card className="mt-2 shadow-lg">
        <CardContent className="p-0">
          <ScrollArea className="h-96 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.from === 'farmer' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs ${message.from === 'farmer' ? 'order-2' : 'order-1'}`}>
                    {message.from === 'expert' && (
                      <div className="flex items-center gap-2 mb-1">
                        <Bot size={12} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">एग्री सलाहकार</span>
                      </div>
                    )}
                    
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.from === 'farmer'
                          ? 'bg-green-500 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-900 rounded-bl-md'
                      }`}
                    >
                      {message.type === 'voice' && (
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`${message.from === 'farmer' ? 'text-white hover:bg-green-600' : 'text-gray-600 hover:bg-gray-200'}`}
                          >
                            <Play size={16} />
                          </Button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="flex space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-1 h-4 rounded-full ${
                                      message.from === 'farmer' ? 'bg-white' : 'bg-gray-400'
                                    }`}
                                    style={{ height: `${Math.random() * 16 + 8}px` }}
                                  ></div>
                                ))}
                              </div>
                              <span className="text-xs opacity-70">
                                {formatTime(message.voiceDuration || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {message.type === 'image' && (
                        <div className="space-y-2">
                          <img
                            src={message.imageUrl}
                            alt="Field photo"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <p className="text-sm">{message.content}</p>
                        </div>
                      )}

                      {message.type === 'location' && (
                        <div className="space-y-2">
                          <div className="w-full h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                            <MapPin size={24} className="text-gray-500" />
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      )}

                      {(message.type === 'text' || message.type === 'quick_reply') && (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      )}

                      {/* Quick Replies */}
                      {message.quickReplies && message.from === 'expert' && (
                        <div className="mt-3 space-y-2">
                          {message.quickReplies.map((reply, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant="outline"
                              className="w-full text-xs justify-start"
                              onClick={() => sendQuickReply(reply)}
                            >
                              {reply}
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Reactions */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {message.reactions.map((reaction, index) => (
                            <span key={index} className="text-lg">{reaction}</span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString('hi-IN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        <div className="flex items-center gap-1">
                          {message.from === 'farmer' && getStatusIcon(message.status)}
                          {message.from === 'expert' && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => addReaction(message.id, '👍')}
                              >
                                👍
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => addReaction(message.id, '❤️')}
                              >
                                ❤️
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {expertTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Bot size={12} className="text-muted-foreground" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Enhanced Input Area */}
      <Card className="mt-2 shadow-lg">
        <CardContent className="p-3">
          {/* Quick Actions */}
          <div className="flex gap-2 mb-3">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                size="sm"
                variant="outline"
                className={`${action.color} text-white border-0 hover:opacity-80`}
                onClick={action.action}
              >
                {action.icon}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={isRecording ? stopVoiceMessage : startVoiceMessage}
              className={isRecording ? "bg-red-100 text-red-600 animate-pulse" : ""}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </Button>
            
            <div className="flex-1 relative">
              <Input
                placeholder="यहाँ टाइप करें..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
              >
                <Smile size={16} />
              </Button>
            </div>
            
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Send size={20} />
            </Button>
          </div>
          
          {isRecording && (
            <div className="flex items-center justify-center gap-2 mt-2 p-2 bg-red-50 rounded-lg">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-600 font-medium">
                रिकॉर्डिंग... {formatTime(recordingTime)} (बोलना बंद करें)
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={stopVoiceMessage}
                className="text-red-600 border-red-300"
              >
                Stop
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Trust Indicators */}
      <Card className="mt-2 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">सरकारी प्रमाणित कृषि सलाहकार</p>
                <p className="text-xs text-blue-600">Verified by Ministry of Agriculture</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Star size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">10,000+ किसानों ने भरोसा किया</p>
                <p className="text-xs text-green-600">4.8/5 average rating</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <AlertCircle size={16} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-800">24/7 उपलब्ध</p>
                <p className="text-xs text-purple-600">Instant response guaranteed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedWhatsApp;
