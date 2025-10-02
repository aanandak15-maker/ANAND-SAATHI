import { Capacitor } from '@capacitor/core';
import { PushNotifications, PushNotificationSchema } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface PushMessage {
  title: string;
  body: string;
  data?: any;
  sound?: string;
  actionTypeId?: string;
  channelId?: string;
}

export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  sound: string;
  importance: number;
  visibility: number;
  vibration: boolean;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private isRegistered = false;
  private token: string | null = null;
  private notificationChannels: NotificationChannel[] = [
    {
      id: 'weather_alerts',
      name: 'Weather Alerts - मौसम अलर्ट',
      description: 'Critical weather alerts for farming',
      sound: 'weather_alert.wav',
      importance: 5,
      visibility: 1,
      vibration: true
    },
    {
      id: 'price_alerts',
      name: 'Price Alerts - मूल्य अलर्ट',
      description: 'Agricultural commodity price updates',
      sound: 'price_alert.wav',
      importance: 4,
      visibility: 1,
      vibration: false
    },
    {
      id: 'ai_recommendations',
      name: 'AI Recommendations - AI सुझाव',
      description: 'Smart farming recommendations',
      sound: 'ai_alert.wav',
      importance: 3,
      visibility: 1,
      vibration: false
    },
    {
      id: 'field_health',
      name: 'Field Health - खेत स्वास्थ्य',
      description: 'Satellite field monitoring alerts',
      sound: 'field_alert.wav',
      importance: 4,
      visibility: 1,
      vibration: true
    },
    {
      id: 'government_schemes',
      name: 'Government Schemes - सरकारी योजनाएं',
      description: 'New subsidy and scheme announcements',
      sound: 'gov_alert.wav',
      importance: 3,
      visibility: 1,
      vibration: false
    }
  ];

  private constructor() {}

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications only available on native platforms');
      return false;
    }

    try {
      // Create notification channels
      await this.createNotificationChannels();

      // Request permissions
      const permissions = await PushNotifications.requestPermissions();

      if (permissions.receive === 'granted') {
        await this.register();
        return true;
      } else {
        console.warn('Push notification permissions denied');
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  /**
   * Register for push notifications
   */
  private async register(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Register listeners first
      PushNotifications.addListener('registration', async (token) => {
        console.log('Push notification token:', token.value);
        this.token = token.value;
        this.isRegistered = true;
        await this.saveTokenToServer(token.value);
        resolve();
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error);
        reject(error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
        this.handleNotificationReceived(notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        console.log('Push notification action performed:', action);
        this.handleNotificationAction(action);
      });

      // Register with FCM/APNs
      PushNotifications.register().catch(reject);
    });
  }

  /**
   * Create notification channels for Android
   */
  private async createNotificationChannels(): Promise<void> {
    if (!Capacitor.getPlatform() === 'android') return;

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');

      for (const channel of this.notificationChannels) {
        await LocalNotifications.createChannel(channel);
      }

      console.log('Notification channels created');
    } catch (error) {
      console.error('Failed to create notification channels:', error);
    }
  }

  /**
   * Handle incoming push notifications
   */
  private handleNotificationReceived(notification: PushNotificationSchema): void {
    // Store notification for app display
    this.storeNotificationLocally(notification);

    // Show in-app notification if needed
    this.showInAppNotification(notification);

    // Send to analytics
    this.trackNotificationReceived(notification);
  }

  /**
   * Handle notification actions (user taps)
   */
  private handleNotificationAction(action: any): void {
    const { actionId, notification } = action;

    // Navigate based on action
    switch (actionId) {
      case 'view_weather':
        window.location.href = '/weather';
        break;
      case 'view_prices':
        window.location.href = '/prices';
        break;
      case 'view_field':
        window.location.href = `/field/${notification.data?.fieldId || ''}`;
        break;
      case 'view_schemes':
        window.location.href = '/schemes';
        break;
      default:
        console.log('Unknown notification action:', actionId);
    }

    this.trackNotificationAction(notification, actionId);
  }

  /**
   * Send weather alert notification
   */
  async sendWeatherAlert(
    farmerId: string,
    weatherData: {
      type: 'rain' | 'storm' | 'heat' | 'frost';
      severity: 'low' | 'medium' | 'high';
      message: string;
      hindiMessage: string;
    }
  ): Promise<boolean> {
    const title = this.getWeatherAlertTitle(weatherData);
    const body = weatherData.hindiMessage;

    return this.sendTargetedNotification(farmerId, {
      title,
      body,
      data: {
        type: 'weather_alert',
        weatherData
      },
      sound: 'weather_alert.wav',
      channelId: 'weather_alerts'
    });
  }

  /**
   * Send price alert notification
   */
  async sendPriceAlert(
    farmerId: string,
    priceData: {
      commodity: string;
      price: number;
      changePercent: number;
      market: string;
    }
  ): Promise<boolean> {
    const title = 'मूल्य बदलाव अलर्ट';
    const body = `${priceData.commodity} का मूल्य ₹${priceData.price} (${priceData.changePercent > 0 ? '+' : ''}${priceData.changePercent}%)`;

    return this.sendTargetedNotification(farmerId, {
      title,
      body,
      data: {
        type: 'price_alert',
        priceData
      },
      sound: 'price_alert.wav',
      channelId: 'price_alerts'
    });
  }

  /**
   * Send AI recommendation notification
   */
  async sendAIRecommendation(
    farmerId: string,
    recommendation: {
      type: 'irrigation' | 'fertilizer' | 'pest_control' | 'harvest';
      title: string;
      message: string;
      hindiMessage: string;
      priority: 'low' | 'medium' | 'high';
      fieldId?: string;
    }
  ): Promise<boolean> {
    return this.sendTargetedNotification(farmerId, {
      title: recommendation.title,
      body: recommendation.hindiMessage,
      data: {
        type: 'ai_recommendation',
        recommendation
      },
      sound: 'ai_alert.wav',
      channelId: 'ai_recommendations'
    });
  }

  /**
   * Send field health alert
   */
  async sendFieldHealthAlert(
    farmerId: string,
    fieldData: {
      fieldId: string;
      healthScore: number;
      issues: string[];
      hindiMessage: string;
    }
  ): Promise<boolean> {
    const title = 'खेत स्वास्थ्य अलर्ट';
    const body = fieldData.hindiMessage;

    return this.sendTargetedNotification(farmerId, {
      title,
      body,
      data: {
        type: 'field_health',
        fieldData
      },
      sound: 'field_alert.wav',
      channelId: 'field_health'
    });
  }

  /**
   * Send government scheme notification
   */
  async sendGovernmentSchemeAlert(
    farmerId: string,
    schemeData: {
      schemeName: string;
      description: string;
      eligibility: string;
      deadline?: string;
    }
  ): Promise<boolean> {
    const title = 'सरकारी योजना अलर्ट';
    const body = schemeData.description;

    return this.sendTargetedNotification(farmerId, {
      title,
      body,
      data: {
        type: 'government_scheme',
        schemeData
      },
      sound: 'gov_alert.wav',
      channelId: 'government_schemes'
    });
  }

  /**
   * Send targeted notification to specific farmer
   */
  private async sendTargetedNotification(farmerId: string, message: PushMessage): Promise<boolean> {
    try {
      // In production, this would send via FCM/APNs server
      // For now, use local notifications as fallback
      const localNotificationId = Date.now();

      await LocalNotifications.schedule({
        notifications: [{
          id: localNotificationId,
          title: message.title,
          body: message.body,
          data: { ...message.data, farmerId }
        }]
      });

      // Log notification for analytics
      await this.logNotification(farmerId, message);

      return true;
    } catch (error) {
      console.error('Failed to send targeted notification:', error);
      return false;
    }
  }

  /**
   * Show in-app notification banner
   */
  private showInAppNotification(notification: PushNotificationSchema): void {
    // Create in-app notification banner
    const banner = document.createElement('div');
    banner.className = 'notification-banner success';
    banner.innerHTML = `
      <div class="notification-content">
        <strong>${notification.title}</strong>
        <p>${notification.body}</p>
      </div>
      <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;

    document.body.appendChild(banner);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      banner.remove();
    }, 5000);
  }

  /**
   * Store notification locally for history
   */
  private async storeNotificationLocally(notification: PushNotificationSchema): Promise<void> {
    try {
      const notifications = JSON.parse(localStorage.getItem('anand_saathi_notifications') || '[]');
      notifications.unshift({
        ...notification,
        receivedAt: new Date().toISOString(),
        read: false
      });

      // Keep last 100 notifications
      if (notifications.length > 100) {
        notifications.splice(100);
      }

      localStorage.setItem('anand_saathi_notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to store notification locally:', error);
    }
  }

  /**
   * Get stored notifications for app display
   */
  async getStoredNotifications(): Promise<any[]> {
    try {
      return JSON.parse(localStorage.getItem('anand_saathi_notifications') || '[]');
    } catch (error) {
      console.error('Failed to get stored notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getStoredNotifications();
      const index = notifications.findIndex(n => n.id === notificationId);

      if (index > -1) {
        notifications[index].read = true;
        localStorage.setItem('anand_saathi_notifications', JSON.stringify(notifications));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  /**
   * Save FCM token to server for push delivery
   */
  private async saveTokenToServer(token: string): Promise<void> {
    try {
      // Get current farmer ID from local storage/session
      const farmerId = localStorage.getItem('current_farmer_id') || 'anonymous';

      await fetch('/api/notifications/register-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          farmerId,
          token,
          platform: Capacitor.getPlatform(),
          appVersion: '1.0.0'
        })
      });
    } catch (error) {
      console.error('Failed to save token to server:', error);
    }
  }

  /**
   * Analytics tracking
   */
  private async logNotification(farmerId: string, message: PushMessage): Promise<void> {
    try {
      // Log to analytics service
      fetch('/api/analytics/notification-sent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId,
          notificationType: message.data?.type,
          channelId: message.channelId,
          timestamp: new Date().toISOString()
        })
      }).catch(() => {}); // Fire and forget
    } catch (error) {
      // Silent fail for analytics
    }
  }

  private trackNotificationReceived(notification: PushNotificationSchema): void {
    fetch('/api/analytics/notification-received', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationId: notification.id,
        title: notification.title,
        data: notification.data
      })
    }).catch(() => {});
  }

  private trackNotificationAction(notification: any, actionId: string): void {
    fetch('/api/analytics/notification-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationId: notification.id,
        actionId,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {});
  }

  /**
   * Helper methods
   */
  private getWeatherAlertTitle(weatherData: any): string {
    switch (weatherData.type) {
      case 'rain': return 'बारिश का अलर्ट';
      case 'storm': return 'तूफान का अलर्ट';
      case 'heat': return 'गर्मी का अलर्ट';
      case 'frost': return 'पाला का अलर्ट';
      default: return 'मौसम अलर्ट';
    }
  }

  /**
   * Check if notifications are supported
   */
  static isSupported(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Get registration status
   */
  getRegistrationStatus(): { registered: boolean, token: string | null } {
    return {
      registered: this.isRegistered,
      token: this.token
    };
  }
}

export const pushNotificationService = PushNotificationService.getInstance();
