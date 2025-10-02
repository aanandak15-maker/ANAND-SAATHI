import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

export interface VoiceCommand {
  command: string;
  hindiEquivalent: string;
  action: string;
  parameters?: any;
  confidence: number;
}

export interface VoiceResponse {
  success: boolean;
  action?: string;
  parameters?: any;
  message?: string;
  hindiMessage?: string;
  error?: string;
}

export interface TextToSpeechOptions {
  text: string;
  hindiText?: string;
  lang?: 'hi-IN' | 'pa-IN' | 'en-IN';
  rate?: number;
  pitch?: number;
  volume?: number;
}

export class VoiceService {
  private static instance: VoiceService;
  private isListening = false;
  private speechSynthesis: SpeechSynthesis;
  private recognition: any;
  private commandListeners: ((command: VoiceCommand) => void)[] = [];

  // Common farming voice commands
  private commandLibrary = {
    hi: {
      'मौसम बताओ': { action: 'show_weather', description: 'वर्तमान मौसम की जानकारी दिखाएं' },
      'मौसम': { action: 'show_weather', description: 'वर्तमान मौसम की जानकारी दिखाएं' },
      'तापमान': { action: 'show_weather', description: 'वर्तमान तापमान दिखाएं' },
      'बारिश': { action: 'show_rain_forecast', description: 'बारिश का पूर्वानुमान दिखाएं' },

      'मूल्य': { action: 'show_prices', description: 'फसल मूल्य दिखाएं' },
      'दाम': { action: 'show_prices', description: 'फसल मूल्य दिखाएं' },
      'कीमत': { action: 'show_prices', description: 'फसल मूल्य दिखाएं' },
      'धान': { action: 'show_rice_price', description: 'धान की कीमत दिखाएं' },
      'गेहूं': { action: 'show_wheat_price', description: 'गेहूं की कीमत दिखाएं' },

      'खेत': { action: 'show_field', description: 'खेत की जानकारी दिखाएं' },
      'खेत स्वास्थ्य': { action: 'show_field_health', description: 'खेत स्वास्थ्य विश्लेषण दिखाएं' },
      'सैटेलाइट': { action: 'show_satellite', description: 'सैटेलाइट इमेज दिखाएं' },

      'सिंचाई': { action: 'show_irrigation', description: 'सिंचाई कार्यक्रम दिखाएं' },
      'पानी': { action: 'show_irrigation', description: 'सिंचाई कार्यक्रम दिखाएं' },
      'कब पानी': { action: 'irrigation_schedule', description: 'अगली सिंचाई कब करनी है' },

      'उपज': { action: 'show_yield', description: 'उपज रिकॉर्ड दिखाएं' },
      'कटाई': { action: 'show_harvest', description: 'कटाई की सिफारिश दिखाएं' },
      'कब काटें': { action: 'harvest_timing', description: 'फसल कब काटनी है' },

      'कीटनाशक': { action: 'show_pesticides', description: 'कीटनाशक सिफारिश दिखाएं' },
      'खाद': { action: 'show_fertilizer', description: 'खाद की सिफारिश दिखाएं' },
      'बीज': { action: 'show_seeds', description: 'बीज की सिफारिश दिखाएं' },

      'योजनाएं': { action: 'show_schemes', description: 'सरकारी योजनाएं दिखाएं' },
      'सब्सिडी': { action: 'show_subsidies', description: 'सब्सिडी जानकारी दिखाएं' },

      'सहायता': { action: 'show_help', description: 'सहायता मेनू दिखाएं' },
      'मदद': { action: 'show_help', description: 'सहायता मेनू दिखाएं' },
      'क्या करूं': { action: 'show_help', description: 'सहायता मेनू दिखाएं' }
    },
    pa: {
      'ਮੌਸਮ ਦੱਸੋ': { action: 'show_weather', description: 'ਮੌਜੂਦਾ ਮੌਸਮ ਦੀ ਜਾਣਕਾਰੀ ਦਿਖਾਓ' },
      'ਮੌਸਮ': { action: 'show_weather', description: 'ਮੌਜੂਦਾ ਮੌਸਮ ਦੀ ਜਾਣਕਾਰੀ ਦਿਖਾਓ' },
      'ਤਾਪਨ': { action: 'show_weather', description: 'ਮੌਜੂਦਾ ਤਾਪਨ ਦਿਖਾਓ' },

      'ਮੁੱਲ': { action: 'show_prices', description: 'ਫਸਲ ਮੁੱਲ ਦਿਖਾਓ' },
      'ਕੀਮਤ': { action: 'show_prices', description: 'ਫਸਲ ਕੀਮਤ ਦਿਖਾਓ' },

      'ਖੇਤ': { action: 'show_field', description: 'ਖੇਤ ਦੀ ਜਾਣਕਾਰੀ ਦਿਖਾਓ' },
      'ਖੇਤ ਸਿਹਤ': { action: 'show_field_health', description: 'ਖੇਤ ਸਿਹਤ ਵਿਸ਼ਲੇਸ਼ਣ ਦਿਖਾਓ' },

      'ਸਿੰਚਾਈ': { action: 'show_irrigation', description: 'ਸਿੰਚਾਈ ਪ੍ਰੋਗਰਾਮ ਦਿਖਾਓ' },
      'ਪਾਣੀ': { action: 'show_irrigation', description: 'ਸਿੰਚਾਈ ਪ੍ਰੋਗਰਾਮ ਦਿਖਾਓ' },

      'ਉਪਜ': { action: 'show_yield', description: 'ਉਪਜ ਰਿਕਾਰਡ ਦਿਖਾਓ' },
      'ਕਟਾਈ': { action: 'show_harvest', description: 'ਕਟਾਈ ਦੀ ਸਿਫ਼ਾਰਿਸ਼ ਦਿਖਾਓ' },

      'ਮਦਦ': { action: 'show_help', description: 'ਮਦਦ ਮੇਨੂੰ ਦਿਖਾਓ' },
      'ਸਹਾਇਤਾ': { action: 'show_help', description: 'ਸਹਾਇਤਾ ਮੇਨੂੰ ਦਿਖਾਓ' }
    }
  };

  private constructor() {
    this.speechSynthesis = window.speechSynthesis;
    this.initializeSpeechRecognition();
  }

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  /**
   * Initialize speech recognition
   */
  private async initializeSpeechRecognition(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      // Web Speech API fallback
      this.initializeWebSpeechRecognition();
    } else {
      // Capacitor Speech Recognition
      this.initializeCapacitorSpeechRecognition();
    }
  }

  /**
   * Initialize web speech recognition for browsers
   */
  private initializeWebSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();

      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'hi-IN'; // Hindi (India) as default

      this.recognition.onstart = () => {
        this.isListening = true;
        console.log('🎤 Voice recognition started');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        console.log('🎤 Voice recognition ended');
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        console.log(`🎤 Heard: "${transcript}" (confidence: ${confidence})`);

        this.processVoiceCommand(transcript, confidence);
      };

      this.recognition.onerror = (event: any) => {
        console.error('🎤 Speech recognition error:', event.error);
        this.speak('क्षमा करें, आवाज नहीं समझ सका। कृपया फिर से प्रयास करें।', 'hi-IN');
      };
    } else {
      console.warn('Web Speech API not supported in this browser');
    }
  }

  /**
   * Initialize Capacitor speech recognition for mobile
   */
  private async initializeCapacitorSpeechRecognition(): Promise<void> {
    try {
      // Check if speech recognition is available
      const { available } = await SpeechRecognition.available();
      if (!available) {
        console.warn('Speech recognition not available on this device');
        return;
      }

      console.log('🎤 Capacitor speech recognition initialized');
    } catch (error) {
      console.error('Failed to initialize Capacitor speech recognition:', error);
    }
  }

  /**
   * Start listening for voice commands
   */
  async startListening(language: 'hi' | 'pa' = 'hi'): Promise<VoiceResponse> {
    return new Promise((resolve) => {
      if (!this.recognition && Capacitor.isNativePlatform()) {
        this.startCapacitorListening(language).then(resolve);
        return;
      }

      if (!this.recognition) {
        resolve({
          success: false,
          error: 'Voice recognition not supported'
        });
        return;
      }

      if (this.isListening) {
        this.stopListening();
      }

      // Update language
      if (language === 'pa') {
        this.recognition.lang = 'pa-IN';
        this.speak('ਬੋਲੋ ਜੀ, ਮੈਂ ਸੁਣ ਰਿਹਾ ਹਾਂ', 'pa-IN'); // "Speak, I'm listening"
      } else {
        this.recognition.lang = 'hi-IN';
        this.speak('बोलें, मैं सुन रहा हूं', 'hi-IN'); // "Speak, I'm listening"
      }

      // Add temporary result handler
      const originalOnResult = this.recognition.onresult;
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;

        // Restore original handler
        this.recognition.onresult = originalOnResult;

        // Process command
        const result = this.processVoiceCommand(transcript, confidence);
        resolve({
          success: true,
          action: result.action,
          parameters: result.parameters,
          message: transcript,
          hindiMessage: result.hindiEquivalent || transcript
        });
      };

      this.recognition.start();
    });
  }

  /**
   * Start listening with Capacitor
   */
  private async startCapacitorListening(language: 'hi' | 'pa'): Promise<VoiceResponse> {
    try {
      const lang = language === 'pa' ? 'pa-IN' : 'hi-IN';

      await SpeechRecognition.start({
        language: lang,
        maxResults: 5,
        prompt: language === 'pa' ? 'ਬੋਲੋ ਜੀ' : 'बोलें',
        popup: false,
        partialResults: false
      });

      return new Promise((resolve) => {
        SpeechRecognition.addListener('recognitionResult', (result) => {
          const transcript = result.matches[0];
          const commandResult = this.processVoiceCommand(transcript, 0.8);

          SpeechRecognition.stop();
          SpeechRecognition.removeAllListeners();

          resolve({
            success: true,
            action: commandResult.action,
            parameters: commandResult.parameters,
            message: transcript,
            hindiMessage: commandResult.hindiEquivalent || transcript
          });
        });

        SpeechRecognition.addListener('recognitionError', (error) => {
          console.error('Capacitor speech recognition error:', error);
          SpeechRecognition.stop();
          SpeechRecognition.removeAllListeners();

          this.speak(language === 'pa' ? 'ਗਲਤੀ ਹੋ ਗਈ, ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ' : 'गलती हुई, फिर से कोशिश करें', lang);
          resolve({
            success: false,
            error: error.message
          });
        });

        // Auto-stop after 10 seconds
        setTimeout(() => {
          SpeechRecognition.stop();
          SpeechRecognition.removeAllListeners();
          resolve({
            success: false,
            error: 'Voice command timeout'
          });
        }, 10000);
      });

    } catch (error) {
      console.error('Capacitor speech recognition failed:', error);
      return {
        success: false,
        error: 'Speech recognition failed to start'
      };
    }
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (this.recognition && !Capacitor.isNativePlatform()) {
      this.recognition.stop();
    } else if (Capacitor.isNativePlatform()) {
      SpeechRecognition.stop().catch(() => {});
    }
    this.isListening = false;
  }

  /**
   * Speak text using speech synthesis
   */
  async speak(text: string, lang: 'hi-IN' | 'pa-IN' | 'en-IN' = 'hi-IN', options?: Partial<TextToSpeechOptions>): Promise<void> {
    return new Promise((resolve) => {
      if (!this.speechSynthesis) {
        console.warn('Speech synthesis not supported');
        resolve();
        return;
      }

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options?.lang || lang;
      utterance.rate = options?.rate || 0.8; // Slightly slower for clarity
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = options?.volume || 0.8;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        resolve();
      };

      this.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Speak in both Hindi and Punjabi
   */
  async speakBilingual(hindiText: string, punjabiText: string): Promise<void> {
    await this.speak(hindiText, 'hi-IN');
    await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause
    await this.speak(punjabiText, 'pa-IN');
  }

  /**
   * Process voice command and return action
   */
  private processVoiceCommand(transcript: string, confidence: number): VoiceCommand {
    if (confidence < 0.6) {
      return {
        command: transcript,
        hindiEquivalent: transcript,
        action: 'low_confidence',
        confidence
      };
    }

    // Clean up transcript
    const cleanCommand = transcript.toLowerCase().trim();

    // Try Hindi commands first
    for (const [command, info] of Object.entries(this.commandLibrary.hi)) {
      if (cleanCommand.includes(command.toLowerCase()) || command.toLowerCase().includes(cleanCommand)) {
        return {
          command: transcript,
          hindiEquivalent: command,
          action: (info as any).action,
          confidence
        };
      }
    }

    // Try Punjabi commands
    for (const [command, info] of Object.entries(this.commandLibrary.pa)) {
      if (cleanCommand.includes(command.toLowerCase()) || command.toLowerCase().includes(cleanCommand)) {
        return {
          command: transcript,
          hindiEquivalent: command,
          action: (info as any).action,
          confidence
        };
      }
    }

    // No match found
    return {
      command: transcript,
      hindiEquivalent: transcript,
      action: 'unknown_command',
      confidence
    };
  }

  /**
   * Execute voice command and return result
   */
  async executeVoiceCommand(command: VoiceCommand): Promise<VoiceResponse> {
    switch (command.action) {
      case 'show_weather':
        // Navigate to weather page would happen here
        await this.speak('मौसम की जानकारी दिखा रहा हूं', 'hi-IN');
        return {
          success: true,
          action: 'navigate',
          parameters: { route: '/weather' },
          message: 'मौसम दिखाएं'
        };

      case 'show_prices':
        await this.speak('फसल मूल्य दिखा रहा हूं', 'hi-IN');
        return {
          success: true,
          action: 'navigate',
          parameters: { route: '/prices' },
          message: 'मूल्य दिखाएं'
        };

      case 'show_field':
        await this.speak('आपके खेत की जानकारी दिखा रहा हूं', 'hi-IN');
        return {
          success: true,
          action: 'navigate',
          parameters: { route: '/field' },
          message: 'खेत दिखाएं'
        };

      case 'show_help':
        await this.speak('सहायता मेनू खोल रहा हूं', 'hi-IN');
        return {
          success: true,
          action: 'navigate',
          parameters: { route: '/help' },
          message: 'सहायता दिखाएं'
        };

      case 'low_confidence':
        await this.speak('क्षमा करें, आपका आदेश स्पष्ट नहीं था। कृपया फिर से बोलें।', 'hi-IN');
        return {
          success: false,
          error: 'Low confidence in voice recognition'
        };

      case 'unknown_command':
        await this.speak(`क्षमा करें, "${command.command}" कमांड समझ नहीं आया। सहायता के लिए "सहायता" बोलें।`, 'hi-IN');
        return {
          success: false,
          error: 'Unknown command'
        };

      default:
        await this.speak('यह कमांड अभी उपलब्ध नहीं है', 'hi-IN');
        return {
          success: false,
          error: 'Command not implemented'
        };
    }
  }

  /**
   * Get available voice commands for current language
   */
  getAvailableCommands(language: 'hi' | 'pa' = 'hi'): any {
    return this.commandLibrary[language];
  }

  /**
   * Add command listener
   */
  addCommandListener(callback: (command: VoiceCommand) => void): void {
    this.commandListeners.push(callback);
  }

  /**
   * Remove command listener
   */
  removeCommandListener(callback: (command: VoiceCommand) => void): void {
    const index = this.commandListeners.indexOf(callback);
    if (index > -1) {
      this.commandListeners.splice(index, 1);
    }
  }

  /**
   * Get voice recognition status
   */
  getStatus(): {
    listening: boolean;
    supported: boolean;
    available: boolean;
  } {
    return {
      listening: this.isListening,
      supported: Capacitor.isNativePlatform() ? true : !!this.recognition,
      available: Capacitor.isNativePlatform()
    };
  }

  /**
   * Announce app features vocally
   */
  async announceFeatures(): Promise<void> {
    const features = [
      'मौसम पूर्वानुमान',
      'फसल मूल्य सूचना',
      'खेत स्वास्थ्य विश्लेषण',
      'सिंचाई मार्गदर्शन',
      'सरकारी योजना पहुंच'
    ];

    for (const feature of features) {
      await this.speak(`${feature} उपलब्ध है`, 'hi-IN');
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    await this.speak('आप क्या जानना चाहेंगे?', 'hi-IN');
  }

  /**
   * Emergency voice commands
   */
  async emergencyCommands(): Promise<void> {
    const emergencyResponse = 'आपातकालीन नंबर डायल कर रहे हैं। कृपया धैर्य रखें।';

    // In real app, this would trigger emergency calls/SMS
    await this.speak(emergencyResponse, 'hi-IN');

    // Send emergency alert
    this.sendEmergencyAlert();
  }

  private sendEmergencyAlert(): void {
    // In real implementation, this would:
    // 1. Get farmer's emergency contacts
    // 2. Send SMS to relatives
    // 3. Call emergency services
    // 4. Send location to authorities

    console.log('🚨 Emergency alert triggered!');
    // Implementation would go here
  }
}

export const voiceService = VoiceService.getInstance();
