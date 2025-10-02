/**
 * Analytics Service for Anand Saathi
 * Tracks usage patterns, farmer behavior, and feature engagement
 */

import { UAParser } from 'ua-parser-js';

export interface AnalyticsEvent {
  id: string;
  eventType: 'feature_usage' | 'navigation' | 'error' | 'completion' | 'feedback' | 'session';
  userId?: string;
  sessionId: string;
  fieldId?: string;
  feature: string;
  action: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  duration?: number; // for session events
  userAgent?: string;
  deviceInfo?: {
    browser: string;
    os: string;
    device: string;
    screenResolution: string;
  };
  location?: {
    state: string;
    district: string;
    coordinates?: [number, number];
  };
}

export interface FarmerBehavior {
  userId: string;
  totalSessions: number;
  avgSessionDuration: number;
  mostUsedFeatures: Array<{ feature: string; usageCount: number; avgDuration: number }>;
  preferredLanguage: string;
  deviceType: string;
  location: string;
  cropPreferences: string[];
  lastActive: Date;
  engagementScore: number; // 0-100 based on usage patterns
  featureAdoption: Record<string, boolean>; // which features they've tried
}

export interface UsageAnalytics {
  totalUsers: number;
  activeUsers: number;
  avgSessionDuration: number;
  topFeatures: Array<{ feature: string; usage: number }>;
  userRetention: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  errorRate: number;
  completionRate: number;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private sessionStart: Date;
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly batchSize = 10;
  private readonly flushIntervalMs = 30000; // 30 seconds

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = new Date();
    this.setupEventListeners();
    this.startPeriodicFlush();
    this.trackSessionStart();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners() {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent({
          eventType: 'session',
          feature: 'page_visibility',
          action: 'hidden',
          metadata: { duration: Date.now() - this.sessionStart.getTime() }
        });
      } else {
        this.trackEvent({
          eventType: 'session',
          feature: 'page_visibility',
          action: 'visible'
        });
      }
    });

    // Track feature usage via data attributes
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const featureElement = target.closest('[data-feature]') as HTMLElement;

      if (featureElement) {
        const feature = featureElement.getAttribute('data-feature') || 'unknown';
        const action = featureElement.getAttribute('data-action') || 'click';

        this.trackEvent({
          eventType: 'feature_usage',
          feature,
          action,
          metadata: {
            element: target.tagName.toLowerCase(),
            text: target.textContent?.slice(0, 50) || ''
          }
        });
      }
    });

    // Track form submissions and completions
    document.addEventListener('submit', (e) => {
      const form = e.target as HTMLFormElement;
      const feature = form.getAttribute('data-feature') || 'form';

      this.trackEvent({
        eventType: 'completion',
        feature,
        action: 'submit',
        metadata: { formName: form.name || 'unnamed' }
      });
    });

    // Track errors
    window.addEventListener('error', (e) => {
      this.trackEvent({
        eventType: 'error',
        feature: 'javascript_error',
        action: 'uncaught',
        metadata: {
          message: e.message,
          filename: e.filename,
          lineno: e.lineno,
          colno: e.colno
        }
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      this.trackEvent({
        eventType: 'error',
        feature: 'promise_rejection',
        action: 'unhandled',
        metadata: { reason: e.reason?.toString() || 'Unknown' }
      });
    });
  }

  trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId' | 'deviceInfo' | 'userAgent'>) {
    const fullEvent: AnalyticsEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      sessionId: this.sessionId,
      deviceInfo: this.getDeviceInfo(),
      userAgent: navigator.userAgent
    };

    this.events.push(fullEvent);
    this.eventQueue.push(fullEvent);

    // Flush if batch size reached
    if (this.eventQueue.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  private getDeviceInfo() {
    const parser = new UAParser(navigator.userAgent);
    const result = parser.getResult();

    return {
      browser: `${result.browser.name} ${result.browser.version}`,
      os: `${result.os.name} ${result.os.version}`,
      device: result.device.type || 'desktop',
      screenResolution: `${screen.width}x${screen.height}`
    };
  }

  private startPeriodicFlush() {
    this.flushInterval = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flushEvents();
      }
    }, this.flushIntervalMs);
  }

  private async flushEvents() {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    if (navigator.onLine) {
      try {
        // Send to analytics endpoint
        const response = await fetch('/api/analytics/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: eventsToSend })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        console.log(`✅ Sent ${eventsToSend.length} analytics events`);
      } catch (error) {
        console.error('❌ Failed to send analytics events:', error);

        // Store locally for retry
        this.storeLocally(eventsToSend);
      }
    } else {
      // Store locally when offline
      this.storeLocally(eventsToSend);
    }
  }

  private storeLocally(events: AnalyticsEvent[]) {
    try {
      const stored = localStorage.getItem('anand_saathi_analytics') || '[]';
      const existingEvents = JSON.parse(stored);
      const allEvents = [...existingEvents, ...events];

      // Keep only last 1000 events locally
      const limitedEvents = allEvents.slice(-1000);

      localStorage.setItem('anand_saathi_analytics', JSON.stringify(limitedEvents));
    } catch (error) {
      console.error('Failed to store analytics locally:', error);
    }
  }

  trackSessionStart() {
    this.trackEvent({
      eventType: 'session',
      feature: 'session_start',
      action: 'start',
      metadata: {
        referrer: document.referrer,
        url: window.location.href
      }
    });
  }

  trackSessionEnd() {
    const duration = Date.now() - this.sessionStart.getTime();

    this.trackEvent({
      eventType: 'session',
      feature: 'session_end',
      action: 'end',
      duration,
      metadata: {
        totalEvents: this.events.length,
        uniqueFeatures: new Set(this.events.map(e => e.feature)).size
      }
    });
  }

  getFarmerBehavior(userId: string): FarmerBehavior | null {
    try {
      const stored = localStorage.getItem('anand_saathi_analytics') || '[]';
      const events = JSON.parse(stored);

      const userEvents = events.filter((e: AnalyticsEvent) => e.userId === userId);
      if (userEvents.length === 0) return null;

      // Analyze feature usage
      const featureUsage = userEvents
        .filter((e: AnalyticsEvent) => e.eventType === 'feature_usage')
        .reduce((acc: Record<string, { count: number; totalDuration: number }>, e: AnalyticsEvent) => {
          if (!acc[e.feature]) {
            acc[e.feature] = { count: 0, totalDuration: 0 };
          }
          acc[e.feature].count++;
          if (e.duration) {
            acc[e.feature].totalDuration += e.duration;
          }
          return acc;
        }, {});

      const mostUsedFeatures = Object.entries(featureUsage)
        .map(([feature, data]: [string, any]) => ({
          feature,
          usageCount: data.count,
          avgDuration: data.totalDuration / data.count
        }))
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 10);

      // Calculate engagement score (0-100)
      const uniqueFeatures = new Set(userEvents.map((e: AnalyticsEvent) => e.feature)).size;
      const totalInteractions = userEvents.length;
      const engagementScore = Math.min(100, (uniqueFeatures * 10) + (totalInteractions * 0.5));

      return {
        userId,
        totalSessions: new Set(userEvents.map((e: AnalyticsEvent) => e.sessionId)).size,
        avgSessionDuration: this.calculateAvgSessionDuration(userEvents),
        mostUsedFeatures,
        preferredLanguage: this.detectPreferredLanguage(userEvents),
        deviceType: this.detectDeviceType(userEvents),
        location: 'Punjab', // Would come from user profile or geolocation
        cropPreferences: this.detectCropPreferences(userEvents),
        lastActive: new Date(Math.max(...userEvents.map((e: AnalyticsEvent) => e.timestamp))),
        engagementScore,
        featureAdoption: this.getFeatureAdoption(userEvents)
      };
    } catch (error) {
      console.error('Error analyzing farmer behavior:', error);
      return null;
    }
  }

  getUsageAnalytics(): UsageAnalytics {
    try {
      const stored = localStorage.getItem('anand_saathi_analytics') || '[]';
      const events = JSON.parse(stored);

      const now = Date.now();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

      const recentEvents = events.filter((e: AnalyticsEvent) =>
        new Date(e.timestamp).getTime() > oneDayAgo
      );

      const weeklyEvents = events.filter((e: AnalyticsEvent) =>
        new Date(e.timestamp).getTime() > oneWeekAgo
      );

      const monthlyEvents = events.filter((e: AnalyticsEvent) =>
        new Date(e.timestamp).getTime() > oneMonthAgo
      );

      // Calculate feature usage
      const featureUsage: Record<string, number> = events
        .filter((e: AnalyticsEvent) => e.eventType === 'feature_usage')
        .reduce((acc: Record<string, number>, e: AnalyticsEvent) => {
          acc[e.feature] = (acc[e.feature] || 0) + 1;
          return acc;
        }, {});

      const topFeatures = Object.entries(featureUsage)
        .map(([feature, usage]: [string, number]) => ({ feature, usage }))
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 10);

      return {
        totalUsers: new Set(events.map((e: AnalyticsEvent) => e.userId).filter(Boolean)).size,
        activeUsers: new Set(recentEvents.map((e: AnalyticsEvent) => e.userId).filter(Boolean)).size,
        avgSessionDuration: this.calculateAvgSessionDuration(events),
        topFeatures,
        userRetention: {
          daily: this.calculateRetentionRate(events, oneDayAgo),
          weekly: this.calculateRetentionRate(events, oneWeekAgo),
          monthly: this.calculateRetentionRate(events, oneMonthAgo)
        },
        errorRate: this.calculateErrorRate(events),
        completionRate: this.calculateCompletionRate(events)
      };
    } catch (error) {
      console.error('Error calculating usage analytics:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        avgSessionDuration: 0,
        topFeatures: [],
        userRetention: { daily: 0, weekly: 0, monthly: 0 },
        errorRate: 0,
        completionRate: 0
      };
    }
  }

  private calculateAvgSessionDuration(events: AnalyticsEvent[]): number {
    const sessions = new Map<string, { start: Date; end?: Date }>();

    events.forEach(event => {
      if (event.eventType === 'session') {
        if (event.action === 'start') {
          sessions.set(event.sessionId, { start: event.timestamp });
        } else if (event.action === 'end' && event.duration) {
          const session = sessions.get(event.sessionId);
          if (session) {
            session.end = new Date(session.start.getTime() + event.duration);
          }
        }
      }
    });

    const durations = Array.from(sessions.values())
      .filter(s => s.end)
      .map(s => s.end!.getTime() - s.start.getTime());

    return durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  }

  private calculateRetentionRate(events: AnalyticsEvent[], since: number): number {
    const activeUsers = new Set(
      events
        .filter(e => new Date(e.timestamp).getTime() > since)
        .map(e => e.userId)
        .filter(Boolean)
    );

    const totalUsers = new Set(
      events.map(e => e.userId).filter(Boolean)
    );

    return totalUsers.size > 0 ? (activeUsers.size / totalUsers.size) * 100 : 0;
  }

  private calculateErrorRate(events: AnalyticsEvent[]): number {
    const errorEvents = events.filter(e => e.eventType === 'error').length;
    const totalEvents = events.length;
    return totalEvents > 0 ? (errorEvents / totalEvents) * 100 : 0;
  }

  private calculateCompletionRate(events: AnalyticsEvent[]): number {
    const completionEvents = events.filter(e => e.eventType === 'completion').length;
    const totalFeatureEvents = events.filter(e => e.eventType === 'feature_usage').length;
    return totalFeatureEvents > 0 ? (completionEvents / totalFeatureEvents) * 100 : 0;
  }

  private detectPreferredLanguage(events: AnalyticsEvent[]): string {
    // This would analyze language preferences from user interactions
    // For now, default to English
    return 'en';
  }

  private detectDeviceType(events: AnalyticsEvent[]): string {
    const deviceInfos = events
      .map(e => e.deviceInfo)
      .filter(Boolean) as Array<{ device: string }>;

    const deviceTypes = deviceInfos.map(d => d.device);
    const mostCommon = deviceTypes.reduce((acc, device) => {
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(mostCommon).sort(([,a], [,b]) => b - a)[0]?.[0] || 'desktop';
  }

  private detectCropPreferences(events: AnalyticsEvent[]): string[] {
    // Analyze field data and crop-related events
    return ['rice', 'wheat']; // Would be more sophisticated in real implementation
  }

  private getFeatureAdoption(events: AnalyticsEvent[]): Record<string, boolean> {
    const features = new Set(events.map(e => e.feature));
    const adoption: Record<string, boolean> = {};

    features.forEach(feature => {
      adoption[feature] = events.some(e => e.feature === feature);
    });

    return adoption;
  }

  // Clean up on unmount
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.trackSessionEnd();
    this.flushEvents();
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();

// React hook for using analytics
export const useAnalytics = () => {
  return {
    trackEvent: (event: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId' | 'deviceInfo' | 'userAgent'>) => {
      analytics.trackEvent(event);
    },
    getFarmerBehavior: (userId: string) => analytics.getFarmerBehavior(userId),
    getUsageAnalytics: () => analytics.getUsageAnalytics()
  };
};
