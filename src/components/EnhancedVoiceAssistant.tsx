import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Send,
  Bot,
  User,
  Languages,
  Headphones,
  MessageCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { audioService } from "@/lib/audioService";
import { ragService, RAGRequest } from "@/lib/ragService";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  audioUrl?: string;
  language: string;
}

interface EnhancedVoiceAssistantProps {
  context?: "dashboard" | "health" | "map" | "indices" | "marketplace" | "voice" | "accessibility";
}

const EnhancedVoiceAssistant = ({ context = "dashboard" }: EnhancedVoiceAssistantProps) => {
  const [isListening, setIsListening] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("hi"); // Hindi default
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "assistant",
      content: "नमस्ते! मैं आपका सॉयल साथी हूं। आप मुझसे अपने खेत के बारे में कुछ भी पूछ सकते हैं।",
      timestamp: new Date(),
      language: "hi"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const languages = [
    { code: "hi", name: "हिन्दी (Hindi)", flag: "🇮🇳" },
    { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)", flag: "🇮🇳" },
    { code: "en", name: "English", flag: "🇺🇸" }
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = currentLanguage === "hi" ? "hi-IN" : currentLanguage === "pa" ? "pa-IN" : "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log("Voice command:", transcript);
        handleUserMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        toast.error("Voice recognition failed. Please try again.");
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [currentLanguage]);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
      toast.success("Listening... Speak now!");
    } else {
      toast.error("Voice recognition not supported in this browser");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleUserMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date(),
      language: currentLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Generate AI response based on context and message
      const response = await generateAIResponse(message, currentLanguage);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response,
        timestamp: new Date(),
        language: currentLanguage
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      toast.error("Failed to generate response");
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAIResponse = async (userMessage: string, language: string): Promise<string> => {
    try {
      // First check for quick responses
      const quickResponse = ragService.getQuickResponse(userMessage, language);
      if (quickResponse) {
        return quickResponse;
      }

      // Use RAG system for intelligent responses
      const ragRequest: RAGRequest = {
        query: userMessage,
        language: language,
        context: 'voice_assistant'
      };

      const ragResponse = await ragService.generateResponse(ragRequest);
      
      // Add confidence indicator for high-confidence responses
      if (ragResponse.confidence > 0.7) {
        return `${ragResponse.answer}\n\n💡 यह सलाह ${Math.round(ragResponse.confidence * 100)}% विश्वसनीय है।`;
      }
      
      return ragResponse.answer;
    } catch (error) {
      console.error('RAG Response Error:', error);
      
      // Fallback to simple responses
      const fallbackResponses = {
        hi: "मुझे खेद है, मैं इस समय आपके प्रश्न का उत्तर नहीं दे सकता। कृपया अपने स्थानीय कृषि विभाग से संपर्क करें।",
        pa: "ਮੈਨੂੰ ਅਫ਼ਸੋਸ ਹੈ, ਮੈਂ ਇਸ ਸਮੇਂ ਤੁਹਾਡੇ ਸਵਾਲ ਦਾ ਜਵਾਬ ਨਹੀਂ ਦੇ ਸਕਦਾ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਸਥਾਨਕ ਖੇਤੀ ਵਿਭਾਗ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
        en: "I apologize, I cannot answer your question at this time. Please contact your local agriculture department."
      };
      
      return fallbackResponses[language as keyof typeof fallbackResponses] || fallbackResponses.en;
    }
  };

  const generateAudioForMessage = async (message: ChatMessage) => {
    if (message.type !== "assistant" || message.audioUrl) return;

    setIsGeneratingAudio(true);
    try {
      const result = await audioService.textToSpeech(message.content, message.language);
      if (result.success && result.audioUrl) {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, audioUrl: result.audioUrl } : msg
        ));
      }
    } catch (error) {
      console.error("Error generating audio:", error);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      handleUserMessage(inputText);
      setInputText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            Enhanced Voice Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              <span className="text-sm">Language:</span>
              <select 
                value={currentLanguage} 
                onChange={(e) => setCurrentLanguage(e.target.value)}
                className="px-2 py-1 border rounded text-sm"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-full border rounded-lg p-4 mb-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.type === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                    {message.type === "assistant" && (
                      <div className="mt-2 flex items-center gap-2">
                        {message.audioUrl ? (
                          <audio controls className="w-full h-8">
                            <source src={message.audioUrl} type="audio/mpeg" />
                          </audio>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateAudioForMessage(message)}
                            disabled={isGeneratingAudio}
                          >
                            {isGeneratingAudio ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Volume2 className="h-3 w-3" />
                            )}
                            Generate Audio
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                currentLanguage === "hi" 
                  ? "अपना संदेश टाइप करें..." 
                  : currentLanguage === "pa"
                  ? "ਆਪਣਾ ਸੁਨੇਹਾ ਟਾਈਪ ਕਰੋ..."
                  : "Type your message..."
              }
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isProcessing}
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button
              onClick={isListening ? stopListening : startListening}
              variant={isListening ? "destructive" : "outline"}
              disabled={isProcessing}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {currentLanguage === "hi" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUserMessage("मेरे खेत का स्वास्थ्य कैसा है?")}
                  disabled={isProcessing}
                >
                  मेरे खेत का स्वास्थ्य कैसा है?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUserMessage("क्या मुझे सिंचाई करनी चाहिए?")}
                  disabled={isProcessing}
                >
                  क्या मुझे सिंचाई करनी चाहिए?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUserMessage("कौन सा खाद डालना चाहिए?")}
                  disabled={isProcessing}
                >
                  कौन सा खाद डालना चाहिए?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUserMessage("मेरी फसल कैसी दिख रही है?")}
                  disabled={isProcessing}
                >
                  मेरी फसल कैसी दिख रही है?
                </Button>
              </>
            ) : currentLanguage === "pa" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUserMessage("ਮੇਰੇ ਖੇਤ ਦੀ ਸਿਹਤ ਕਿਵੇਂ ਹੈ?")}
                  disabled={isProcessing}
                >
                  ਮੇਰੇ ਖੇਤ ਦੀ ਸਿਹਤ ਕਿਵੇਂ ਹੈ?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUserMessage("ਕੀ ਮੈਨੂੰ ਸਿੰਚਾਈ ਕਰਨੀ ਚਾਹੀਦੀ ਹੈ?")}
                  disabled={isProcessing}
                >
                  ਕੀ ਮੈਨੂੰ ਸਿੰਚਾਈ ਕਰਨੀ ਚਾਹੀਦੀ ਹੈ?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUserMessage("ਕਿਹੜਾ ਖਾਦ ਪਾਉਣਾ ਚਾਹੀਦਾ ਹੈ?")}
                  disabled={isProcessing}
                >
                  ਕਿਹੜਾ ਖਾਦ ਪਾਉਣਾ ਚਾਹੀਦਾ ਹੈ?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUserMessage("ਮੇਰੀ ਫਸਲ ਕਿਵੇਂ ਦਿਖ ਰਹੀ ਹੈ?")}
                  disabled={isProcessing}
                >
                  ਮੇਰੀ ਫਸਲ ਕਿਵੇਂ ਦਿਖ ਰਹੀ ਹੈ?
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUserMessage("How is my field health?")}
                  disabled={isProcessing}
                >
                  How is my field health?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUserMessage("Should I irrigate?")}
                  disabled={isProcessing}
                >
                  Should I irrigate?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUserMessage("What fertilizer should I use?")}
                  disabled={isProcessing}
                >
                  What fertilizer should I use?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUserMessage("How does my crop look?")}
                  disabled={isProcessing}
                >
                  How does my crop look?
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedVoiceAssistant;
