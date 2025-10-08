import { Request, Response } from "express";

// Metrics storage (in production, use Redis or a database)
interface MetricsData {
  totalRequests: number;
  errorCount: number;
  authErrors: number;
  lastErrorRateCheck: number;
  alertsTriggered: string[];
  expiredKeys: string[];
}

class MonitoringService {
  private metrics: MetricsData = {
    totalRequests: 0,
    errorCount: 0,
    authErrors: 0,
    lastErrorRateCheck: Date.now(),
    alertsTriggered: [],
    expiredKeys: []
  };

  private alertCooldowns: Map<string, number> = new Map();

  // Configuration
  private readonly ERROR_RATE_THRESHOLD = 0.005; // 0.5%
  private readonly ERROR_RATE_WINDOW = 5 * 60 * 1000; // 5 minutes
  private readonly AUTH_SPIKE_THRESHOLD = 0.10; // 10% increase
  private readonly ALERT_COOLDOWN = 15 * 60 * 1000; // 15 minutes

  recordRequest(): void {
    this.metrics.totalRequests++;
  }

  recordError(statusCode?: number): void {
    this.metrics.errorCount++;

    if (statusCode === 401 || statusCode === 403) {
      this.metrics.authErrors++;
    }
  }

  recordExpiredKey(keyId: string): void {
    if (!this.metrics.expiredKeys.includes(keyId)) {
      this.metrics.expiredKeys.push(keyId);

      // Trigger immediate alert for expired key
      this.triggerAlert('EXPIRED_KEY', {
        keyId,
        timestamp: new Date().toISOString(),
        severity: 'HIGH',
        message: `API key ${keyId} has expired and is still being used`
      });
    }
  }

  checkErrorRate(): { rate: number; shouldAlert: boolean } {
    const now = Date.now();
    const timeDiff = now - this.metrics.lastErrorRateCheck;

    if (timeDiff >= this.ERROR_RATE_WINDOW) {
      const errorRate = this.metrics.errorCount / this.metrics.totalRequests;

      const shouldAlert = errorRate > this.ERROR_RATE_THRESHOLD;

      if (shouldAlert) {
        this.triggerAlert('HIGH_ERROR_RATE', {
          errorRate: (errorRate * 100).toFixed(2) + '%',
          timeWindow: `${this.ERROR_RATE_WINDOW / 60000} minutes`,
          totalRequests: this.metrics.totalRequests,
          errorCount: this.metrics.errorCount,
          timestamp: new Date().toISOString()
        });
      }

      // Reset counters
      this.metrics.lastErrorRateCheck = now;
      this.metrics.errorCount = 0;
      this.metrics.totalRequests = 0;

      return { rate: errorRate, shouldAlert };
    }

    return { rate: 0, shouldAlert: false };
  }

  checkAuthSpike(previousAuthErrors: number, timeWindowMs: number): { increase: number; shouldAlert: boolean } {
    const currentAuthErrors = this.metrics.authErrors;
    const increase = previousAuthErrors > 0 ? (currentAuthErrors - previousAuthErrors) / previousAuthErrors : 0;

    const shouldAlert = increase >= this.AUTH_SPIKE_THRESHOLD;

    if (shouldAlert) {
      this.triggerAlert('AUTH_SPIKE', {
        increase: (increase * 100).toFixed(1) + '%',
        previousErrors: previousAuthErrors,
        currentErrors: currentAuthErrors,
        timeWindow: `${timeWindowMs / (24 * 60 * 60 * 1000)} days`,
        timestamp: new Date().toISOString()
      });
    }

    return { increase, shouldAlert };
  }

  private triggerAlert(type: string, data: any): void {
    const alertKey = `${type}_${Date.now()}`;
    const lastAlert = this.alertCooldowns.get(type);

    // Check cooldown
    if (lastAlert && Date.now() - lastAlert < this.ALERT_COOLDOWN) {
      console.log(`Alert ${type} on cooldown, skipping...`);
      return;
    }

    // Record alert
    this.alertCooldowns.set(type, Date.now());
    this.metrics.alertsTriggered.push(JSON.stringify({ type, ...data }));

    // Log alert
    console.error(`🚨 ALERT TRIGGERED: ${type}`, data);

    // In production, send to PagerDuty/Slack
    this.sendExternalAlert(type, data);
  }

  private sendExternalAlert(type: string, data: any): void {
    // Placeholder for external alerting
    // In production, integrate with PagerDuty, Slack, etc.

    const alertPayload = {
      type,
      severity: this.getSeverity(type),
      message: this.getAlertMessage(type, data),
      data,
      timestamp: new Date().toISOString(),
      service: 'todo-api'
    };

    console.log('📤 External Alert Payload:', JSON.stringify(alertPayload, null, 2));

    // TODO: Implement actual integrations
    // - Slack webhooks
    // - Discord webhooks
    // - Email alerts
  }

  getSeverity(type: string): string {
    switch (type.toUpperCase()) {
      case 'EXPIRED_KEY': return 'HIGH';
      case 'HIGH_ERROR_RATE': return 'CRITICAL';
      case 'AUTH_SPIKE': return 'HIGH';
      default: return 'MEDIUM';
    }
  }

  getAlertMessage(type: string, data: any): string {
    switch (type) {
      case 'EXPIRED_KEY':
        return `🚨 SECURITY ALERT: Expired API key ${data.keyId} is being used`;
      case 'HIGH_ERROR_RATE':
        return `🚨 SYSTEM ALERT: Error rate ${data.errorRate} in ${data.timeWindow}`;
      case 'AUTH_SPIKE':
        return `🚨 SECURITY ALERT: Authentication failures increased by ${data.increase}`;
      default:
        return `🚨 ALERT: ${type}`;
    }
  }

  getMetrics(): MetricsData & { errorRate: number; recentAlerts: any[] } {
    const errorRate = this.checkErrorRate().rate;

    return {
      ...this.metrics,
      errorRate,
      recentAlerts: this.metrics.alertsTriggered.slice(-10).map(alert => JSON.parse(alert))
    };
  }

  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      errorCount: 0,
      authErrors: 0,
      lastErrorRateCheck: Date.now(),
      alertsTriggered: [],
      expiredKeys: []
    };
    this.alertCooldowns.clear();
  }
}

// Global instance
export const monitoring = new MonitoringService();
