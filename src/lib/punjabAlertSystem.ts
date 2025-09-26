/**
 * Punjab Multi-Channel Alert System
 * SMS, WhatsApp, Mobile App, and Email notifications for Punjab farmers
 * Integrates with Indian telecom providers and messaging services
 */

export interface AlertChannel {
  id: string;
  name: string;
  type: 'sms' | 'whatsapp' | 'push' | 'email' | 'voice';
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deliveryTime: 'immediate' | 'scheduled' | 'batch';
}

export interface AlertTemplate {
  id: string;
  name: string;
  category: 'phenology' | 'pest' | 'disease' | 'weather' | 'government' | 'market';
  priority: 'low' | 'medium' | 'high' | 'critical';
  channels: AlertChannel['type'][];
  template: {
    english: string;
    punjabi: string;
    hindi: string;
  };
  variables: string[];
  maxLength: number;
}

export interface AlertMessage {
  id: string;
  templateId: string;
  farmerId: string;
  fieldId: string;
  district: string;
  variety: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  channels: AlertChannel['type'][];
  content: {
    english: string;
    punjabi: string;
    hindi: string;
  };
  variables: Record<string, any>;
  scheduledFor: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  deliveryReports: DeliveryReport[];
  retryCount: number;
  maxRetries: number;
}

export interface DeliveryReport {
  channel: AlertChannel['type'];
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  timestamp: Date;
  error?: string;
  providerResponse?: any;
}

export interface FarmerProfile {
  id: string;
  name: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  language: 'punjabi' | 'hindi' | 'english';
  district: string;
  preferredChannels: AlertChannel['type'][];
  alertPreferences: {
    phenology: boolean;
    pest: boolean;
    disease: boolean;
    weather: boolean;
    government: boolean;
    market: boolean;
  };
  quietHours: {
    start: string; // HH:MM format
    end: string; // HH:MM format
    enabled: boolean;
  };
  timezone: string;
}

export interface AlertConfig {
  sms: {
    provider: 'textlocal' | 'msg91' | 'fast2sms' | 'kaleyra';
    apiKey: string;
    senderId: string;
    rateLimit: number; // messages per minute
  };
  whatsapp: {
    provider: 'whatsapp_business' | 'twilio' | 'meta';
    apiKey: string;
    phoneNumberId: string;
    businessAccountId: string;
    rateLimit: number; // messages per minute
  };
  push: {
    provider: 'firebase' | 'onesignal' | 'pusher';
    apiKey: string;
    appId: string;
    rateLimit: number; // notifications per minute
  };
  email: {
    provider: 'sendgrid' | 'mailgun' | 'ses';
    apiKey: string;
    fromEmail: string;
    rateLimit: number; // emails per minute
  };
  voice: {
    provider: 'twilio' | 'plivo' | 'exotel';
    apiKey: string;
    phoneNumber: string;
    rateLimit: number; // calls per minute
  };
}

export class PunjabAlertSystem {
  private config: AlertConfig;
  private templates: Map<string, AlertTemplate> = new Map();
  private messageQueue: AlertMessage[] = [];
  private isProcessing = false;

  constructor(config: AlertConfig) {
    this.config = config;
    this.initializeTemplates();
  }

  /**
   * Initialize alert templates for different scenarios
   */
  private initializeTemplates(): void {
    const templates: AlertTemplate[] = [
      {
        id: 'phenology_stage_change',
        name: 'Phenology Stage Change',
        category: 'phenology',
        priority: 'medium',
        channels: ['sms', 'whatsapp', 'push'],
        template: {
          english: 'Your {variety} rice in {district} has entered {stage} stage. Days remaining: {daysRemaining}. Action: {action}',
          punjabi: 'ਤੁਹਾਡੇ {district} ਵਿੱਚ {variety} ਚੌਲ {stage} ਪੜਾਅ ਵਿੱਚ ਪਹੁੰਚ ਗਏ ਹਨ। ਬਾਕੀ ਦਿਨ: {daysRemaining}। ਕਾਰਵਾਈ: {action}',
          hindi: 'आपके {district} में {variety} चावल {stage} चरण में पहुंच गए हैं। शेष दिन: {daysRemaining}। कार्य: {action}'
        },
        variables: ['variety', 'district', 'stage', 'daysRemaining', 'action'],
        maxLength: 160
      },
      {
        id: 'critical_irrigation',
        name: 'Critical Irrigation Alert',
        category: 'phenology',
        priority: 'critical',
        channels: ['sms', 'whatsapp', 'push', 'voice'],
        template: {
          english: 'URGENT: Water stress detected in {variety} rice field. Immediate irrigation required. Contact: {contact}',
          punjabi: 'ਜ਼ਰੂਰੀ: {variety} ਚੌਲ ਖੇਤ ਵਿੱਚ ਪਾਣੀ ਦਾ ਤਣਾਅ। ਤੁਰੰਤ ਸਿੰਚਾਈ ਜ਼ਰੂਰੀ। ਸੰਪਰਕ: {contact}',
          hindi: 'जरूरी: {variety} चावल खेत में पानी का तनाव। तुरंत सिंचाई आवश्यक। संपर्क: {contact}'
        },
        variables: ['variety', 'contact'],
        maxLength: 160
      },
      {
        id: 'pest_alert',
        name: 'Pest Alert',
        category: 'pest',
        priority: 'high',
        channels: ['sms', 'whatsapp', 'push'],
        template: {
          english: 'Pest alert: {pestName} detected in {district}. Severity: {severity}. Control: {controlMeasures}',
          punjabi: 'ਕੀਟ ਚੇਤਾਵਨੀ: {district} ਵਿੱਚ {pestName} ਦਾ ਪਤਾ ਲੱਗਾ। ਗੰਭੀਰਤਾ: {severity}। ਨਿਯੰਤਰਣ: {controlMeasures}',
          hindi: 'कीट चेतावनी: {district} में {pestName} का पता लगा। गंभीरता: {severity}। नियंत्रण: {controlMeasures}'
        },
        variables: ['pestName', 'district', 'severity', 'controlMeasures'],
        maxLength: 160
      },
      {
        id: 'weather_warning',
        name: 'Weather Warning',
        category: 'weather',
        priority: 'high',
        channels: ['sms', 'whatsapp', 'push'],
        template: {
          english: 'Weather alert: {condition} expected in {district}. Temperature: {temperature}°C. Take precautions.',
          punjabi: 'ਮੌਸਮ ਚੇਤਾਵਨੀ: {district} ਵਿੱਚ {condition} ਦੀ ਸੰਭਾਵਨਾ। ਤਾਪਮਾਨ: {temperature}°C। ਸਾਵਧਾਨੀ ਬਰਤੋ।',
          hindi: 'मौसम चेतावनी: {district} में {condition} की संभावना। तापमान: {temperature}°C। सावधानी बरतें।'
        },
        variables: ['condition', 'district', 'temperature'],
        maxLength: 160
      },
      {
        id: 'government_scheme',
        name: 'Government Scheme Alert',
        category: 'government',
        priority: 'medium',
        channels: ['sms', 'whatsapp', 'push'],
        template: {
          english: 'New scheme: {schemeName} available. Benefits: {benefits}. Last date: {lastDate}. Apply: {contact}',
          punjabi: 'ਨਵੀਂ ਯੋਜਨਾ: {schemeName} ਉਪਲਬਧ। ਲਾਭ: {benefits}। ਆਖਰੀ ਤਾਰੀਖ: {lastDate}। ਅਰਜ਼ੀ: {contact}',
          hindi: 'नई योजना: {schemeName} उपलब्ध। लाभ: {benefits}। अंतिम तिथि: {lastDate}। आवेदन: {contact}'
        },
        variables: ['schemeName', 'benefits', 'lastDate', 'contact'],
        maxLength: 160
      },
      {
        id: 'harvest_ready',
        name: 'Harvest Ready',
        category: 'phenology',
        priority: 'medium',
        channels: ['sms', 'whatsapp', 'push'],
        template: {
          english: 'Harvest time: Your {variety} rice is ready for harvest. Moisture: {moisture}%. Arrange equipment.',
          punjabi: 'ਕਟਾਈ ਦਾ ਸਮਾਂ: ਤੁਹਾਡੇ {variety} ਚੌਲ ਕਟਾਈ ਲਈ ਤਿਆਰ। ਨਮੀ: {moisture}%। ਸਾਮਾਨ ਦਾ ਪ੍ਰਬੰਧ ਕਰੋ।',
          hindi: 'कटाई का समय: आपके {variety} चावल कटाई के लिए तैयार। नमी: {moisture}%। सामान का प्रबंध करें।'
        },
        variables: ['variety', 'moisture'],
        maxLength: 160
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Send alert to farmer using multiple channels
   */
  async sendAlert(
    farmer: FarmerProfile,
    templateId: string,
    variables: Record<string, any>,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    scheduledFor?: Date
  ): Promise<AlertMessage> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Check if farmer has enabled this category
    const categoryKey = template.category as keyof FarmerProfile['alertPreferences'];
    if (!farmer.alertPreferences[categoryKey]) {
      throw new Error(`Farmer has disabled ${template.category} alerts`);
    }

    // Generate content for all languages
    const content = {
      english: this.generateContent(template.template.english, variables),
      punjabi: this.generateContent(template.template.punjabi, variables),
      hindi: this.generateContent(template.template.hindi, variables)
    };

    // Determine channels based on priority and farmer preferences
    const channels = this.determineChannels(template, priority, farmer);

    // Create alert message
    const alertMessage: AlertMessage = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId,
      farmerId: farmer.id,
      fieldId: variables.fieldId || 'unknown',
      district: farmer.district,
      variety: variables.variety || 'unknown',
      priority,
      channels,
      content,
      variables,
      scheduledFor: scheduledFor || new Date(),
      status: 'pending',
      deliveryReports: [],
      retryCount: 0,
      maxRetries: 3
    };

    // Add to queue
    this.messageQueue.push(alertMessage);

    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }

    return alertMessage;
  }

  /**
   * Generate content by replacing variables in template
   */
  private generateContent(template: string, variables: Record<string, any>): string {
    let content = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      content = content.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return content;
  }

  /**
   * Determine which channels to use based on priority and farmer preferences
   */
  private determineChannels(
    template: AlertTemplate,
    priority: string,
    farmer: FarmerProfile
  ): AlertChannel['type'][] {
    const channels: AlertChannel['type'][] = [];

    // Critical alerts use all available channels
    if (priority === 'critical') {
      channels.push('sms', 'whatsapp', 'push', 'voice');
    } else if (priority === 'high') {
      channels.push('sms', 'whatsapp', 'push');
    } else {
      channels.push('sms', 'whatsapp');
    }

    // Filter based on farmer preferences
    return channels.filter(channel => 
      farmer.preferredChannels.includes(channel) && 
      template.channels.includes(channel)
    );
  }

  /**
   * Process message queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && message.status === 'pending') {
        await this.sendMessage(message);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Send message through all specified channels
   */
  private async sendMessage(message: AlertMessage): Promise<void> {
    const farmer = await this.getFarmerProfile(message.farmerId);
    if (!farmer) {
      message.status = 'failed';
      return;
    }

    // Check quiet hours
    if (this.isQuietHours(farmer)) {
      // Reschedule for later
      message.scheduledFor = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours later
      this.messageQueue.push(message);
      return;
    }

    // Send through each channel
    for (const channel of message.channels) {
      try {
        await this.sendThroughChannel(message, farmer, channel);
      } catch (error) {
        console.error(`Failed to send through ${channel}:`, error);
        message.deliveryReports.push({
          channel,
          status: 'failed',
          timestamp: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Update message status
    const allDelivered = message.deliveryReports.every(report => report.status === 'delivered');
    const anySent = message.deliveryReports.some(report => report.status === 'sent' || report.status === 'delivered');
    
    if (allDelivered) {
      message.status = 'delivered';
    } else if (anySent) {
      message.status = 'sent';
    } else {
      message.status = 'failed';
    }

    message.sentAt = new Date();
  }

  /**
   * Send message through specific channel
   */
  private async sendThroughChannel(
    message: AlertMessage,
    farmer: FarmerProfile,
    channel: AlertChannel['type']
  ): Promise<void> {
    const content = this.getContentForLanguage(message.content, farmer.language);
    
    switch (channel) {
      case 'sms':
        await this.sendSMS(farmer.phone, content);
        break;
      case 'whatsapp':
        await this.sendWhatsApp(farmer.whatsappNumber || farmer.phone, content);
        break;
      case 'push':
        await this.sendPushNotification(farmer.id, content);
        break;
      case 'email':
        if (farmer.email) {
          await this.sendEmail(farmer.email, content);
        }
        break;
      case 'voice':
        await this.sendVoiceCall(farmer.phone, content);
        break;
    }

    message.deliveryReports.push({
      channel,
      status: 'sent',
      timestamp: new Date()
    });
  }

  /**
   * Send SMS using configured provider
   */
  private async sendSMS(phoneNumber: string, content: string): Promise<void> {
    const { provider, apiKey, senderId } = this.config.sms;
    
    switch (provider) {
      case 'textlocal':
        await this.sendSMSViaTextLocal(phoneNumber, content, apiKey, senderId);
        break;
      case 'msg91':
        await this.sendSMSViaMSG91(phoneNumber, content, apiKey, senderId);
        break;
      case 'fast2sms':
        await this.sendSMSViaFast2SMS(phoneNumber, content, apiKey, senderId);
        break;
      case 'kaleyra':
        await this.sendSMSViaKaleyra(phoneNumber, content, apiKey, senderId);
        break;
    }
  }

  /**
   * Send WhatsApp message
   */
  private async sendWhatsApp(phoneNumber: string, content: string): Promise<void> {
    const { provider, apiKey, phoneNumberId, businessAccountId } = this.config.whatsapp;
    
    switch (provider) {
      case 'whatsapp_business':
        await this.sendWhatsAppViaBusinessAPI(phoneNumber, content, apiKey, phoneNumberId, businessAccountId);
        break;
      case 'twilio':
        await this.sendWhatsAppViaTwilio(phoneNumber, content, apiKey);
        break;
      case 'meta':
        await this.sendWhatsAppViaMeta(phoneNumber, content, apiKey, phoneNumberId);
        break;
    }
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(farmerId: string, content: string): Promise<void> {
    const { provider, apiKey, appId } = this.config.push;
    
    switch (provider) {
      case 'firebase':
        await this.sendPushViaFirebase(farmerId, content, apiKey);
        break;
      case 'onesignal':
        await this.sendPushViaOneSignal(farmerId, content, apiKey, appId);
        break;
      case 'pusher':
        await this.sendPushViaPusher(farmerId, content, apiKey);
        break;
    }
  }

  /**
   * Send email
   */
  private async sendEmail(email: string, content: string): Promise<void> {
    const { provider, apiKey, fromEmail } = this.config.email;
    
    switch (provider) {
      case 'sendgrid':
        await this.sendEmailViaSendGrid(email, content, apiKey, fromEmail);
        break;
      case 'mailgun':
        await this.sendEmailViaMailgun(email, content, apiKey, fromEmail);
        break;
      case 'ses':
        await this.sendEmailViaSES(email, content, apiKey, fromEmail);
        break;
    }
  }

  /**
   * Send voice call
   */
  private async sendVoiceCall(phoneNumber: string, content: string): Promise<void> {
    const { provider, apiKey, phoneNumber: fromNumber } = this.config.voice;
    
    switch (provider) {
      case 'twilio':
        await this.sendVoiceViaTwilio(phoneNumber, content, apiKey, fromNumber);
        break;
      case 'plivo':
        await this.sendVoiceViaPlivo(phoneNumber, content, apiKey, fromNumber);
        break;
      case 'exotel':
        await this.sendVoiceViaExotel(phoneNumber, content, apiKey, fromNumber);
        break;
    }
  }

  /**
   * Check if current time is within farmer's quiet hours
   */
  private isQuietHours(farmer: FarmerProfile): boolean {
    if (!farmer.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      timeZone: farmer.timezone 
    });

    const startTime = farmer.quietHours.start;
    const endTime = farmer.quietHours.end;

    return currentTime >= startTime && currentTime <= endTime;
  }

  /**
   * Get content for farmer's preferred language
   */
  private getContentForLanguage(
    content: AlertMessage['content'],
    language: FarmerProfile['language']
  ): string {
    switch (language) {
      case 'punjabi':
        return content.punjabi;
      case 'hindi':
        return content.hindi;
      case 'english':
      default:
        return content.english;
    }
  }

  /**
   * Get farmer profile (placeholder - implement based on your data source)
   */
  private async getFarmerProfile(farmerId: string): Promise<FarmerProfile | null> {
    // Implement based on your data source (database, API, etc.)
    // This is a placeholder
    return null;
  }

  // SMS Provider Implementations
  private async sendSMSViaTextLocal(phoneNumber: string, content: string, apiKey: string, senderId: string): Promise<void> {
    // Implement TextLocal SMS API
  }

  private async sendSMSViaMSG91(phoneNumber: string, content: string, apiKey: string, senderId: string): Promise<void> {
    // Implement MSG91 SMS API
  }

  private async sendSMSViaFast2SMS(phoneNumber: string, content: string, apiKey: string, senderId: string): Promise<void> {
    // Implement Fast2SMS API
  }

  private async sendSMSViaKaleyra(phoneNumber: string, content: string, apiKey: string, senderId: string): Promise<void> {
    // Implement Kaleyra SMS API
  }

  // WhatsApp Provider Implementations
  private async sendWhatsAppViaBusinessAPI(phoneNumber: string, content: string, apiKey: string, phoneNumberId: string, businessAccountId: string): Promise<void> {
    // Implement WhatsApp Business API
  }

  private async sendWhatsAppViaTwilio(phoneNumber: string, content: string, apiKey: string): Promise<void> {
    // Implement Twilio WhatsApp API
  }

  private async sendWhatsAppViaMeta(phoneNumber: string, content: string, apiKey: string, phoneNumberId: string): Promise<void> {
    // Implement Meta WhatsApp API
  }

  // Push Notification Provider Implementations
  private async sendPushViaFirebase(farmerId: string, content: string, apiKey: string): Promise<void> {
    // Implement Firebase Cloud Messaging
  }

  private async sendPushViaOneSignal(farmerId: string, content: string, apiKey: string, appId: string): Promise<void> {
    // Implement OneSignal API
  }

  private async sendPushViaPusher(farmerId: string, content: string, apiKey: string): Promise<void> {
    // Implement Pusher API
  }

  // Email Provider Implementations
  private async sendEmailViaSendGrid(email: string, content: string, apiKey: string, fromEmail: string): Promise<void> {
    // Implement SendGrid API
  }

  private async sendEmailViaMailgun(email: string, content: string, apiKey: string, fromEmail: string): Promise<void> {
    // Implement Mailgun API
  }

  private async sendEmailViaSES(email: string, content: string, apiKey: string, fromEmail: string): Promise<void> {
    // Implement AWS SES API
  }

  // Voice Call Provider Implementations
  private async sendVoiceViaTwilio(phoneNumber: string, content: string, apiKey: string, fromNumber: string): Promise<void> {
    // Implement Twilio Voice API
  }

  private async sendVoiceViaPlivo(phoneNumber: string, content: string, apiKey: string, fromNumber: string): Promise<void> {
    // Implement Plivo Voice API
  }

  private async sendVoiceViaExotel(phoneNumber: string, content: string, apiKey: string, fromNumber: string): Promise<void> {
    // Implement Exotel Voice API
  }
}

// Default configuration
export const defaultAlertConfig: AlertConfig = {
  sms: {
    provider: 'textlocal',
    apiKey: import.meta.env.VITE_TEXTLOCAL_API_KEY || '',
    senderId: 'SOILSA',
    rateLimit: 30
  },
  whatsapp: {
    provider: 'whatsapp_business',
    apiKey: import.meta.env.VITE_WHATSAPP_API_KEY || '',
    phoneNumberId: import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || '',
    businessAccountId: import.meta.env.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    rateLimit: 20
  },
  push: {
    provider: 'firebase',
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    rateLimit: 100
  },
  email: {
    provider: 'sendgrid',
    apiKey: import.meta.env.VITE_SENDGRID_API_KEY || '',
    fromEmail: 'alerts@soilsaathi.com',
    rateLimit: 50
  },
  voice: {
    provider: 'twilio',
    apiKey: import.meta.env.VITE_TWILIO_API_KEY || '',
    phoneNumber: import.meta.env.VITE_TWILIO_PHONE_NUMBER || '',
    rateLimit: 10
  }
};

// Create singleton instance
export const punjabAlertSystem = new PunjabAlertSystem(defaultAlertConfig);

export default PunjabAlertSystem;
