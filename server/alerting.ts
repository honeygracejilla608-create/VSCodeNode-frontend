import { monitoring } from "./monitoring";

// External alerting integrations
export class AlertManager {
  private pagerDutyRoutingKey?: string;
  private slackWebhookUrl?: string;

  constructor() {
    this.pagerDutyRoutingKey = process.env.PAGERDUTY_ROUTING_KEY;
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  }

  async sendPagerDutyAlert(type: string, severity: string, message: string, details: any): Promise<void> {
    if (!this.pagerDutyRoutingKey) {
      console.log('PagerDuty not configured, skipping...');
      return;
    }

    const payload = {
      routing_key: this.pagerDutyRoutingKey,
      event_action: 'trigger',
      dedup_key: `todo-api-${type}-${Date.now()}`,
      payload: {
        summary: message,
        severity: severity.toLowerCase(),
        source: 'todo-api',
        component: 'api-server',
        group: 'backend',
        class: 'api-monitoring',
        custom_details: details
      }
    };

    try {
      const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('✅ PagerDuty alert sent successfully');
      } else {
        console.error('❌ PagerDuty alert failed:', response.status);
      }
    } catch (error) {
      console.error('❌ PagerDuty alert error:', error);
    }
  }

  async sendSlackAlert(type: string, severity: string, message: string, details: any): Promise<void> {
    if (!this.slackWebhookUrl) {
      console.log('Slack not configured, skipping...');
      return;
    }

    const color = this.getSlackColor(severity);
    const payload = {
      attachments: [{
        color,
        title: `🚨 ${type} Alert`,
        text: message,
        fields: [
          {
            title: 'Severity',
            value: severity,
            short: true
          },
          {
            title: 'Service',
            value: 'Todo API',
            short: true
          },
          {
            title: 'Time',
            value: new Date().toISOString(),
            short: false
          }
        ],
        footer: 'Todo API Monitoring',
        ts: Math.floor(Date.now() / 1000)
      }]
    };

    // Add details if provided
    if (details && Object.keys(details).length > 0) {
      payload.attachments[0].fields.push({
        title: 'Details',
        value: JSON.stringify(details, null, 2),
        short: false
      });
    }

    try {
      const response = await fetch(this.slackWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('✅ Slack alert sent successfully');
      } else {
        console.error('❌ Slack alert failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Slack alert error:', error);
    }
  }

  private getSlackColor(severity: string): string {
    switch (severity.toUpperCase()) {
      case 'CRITICAL': return 'danger';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'good';
      case 'LOW': return '#808080';
      default: return 'good';
    }
  }

  async sendAllAlerts(type: string, severity: string, message: string, details: any): Promise<void> {
    console.log(`📤 Sending alerts: ${type} - ${severity} - ${message}`);

    // Send to all configured services
    await Promise.all([
      this.sendPagerDutyAlert(type, severity, message, details),
      this.sendSlackAlert(type, severity, message, details)
    ]);
  }
}

// Global instance
export const alertManager = new AlertManager();

// Enhanced monitoring with external alerts
monitoring['sendExternalAlert'] = async (type: string, data: any) => {
  const severity = monitoring.getSeverity(type);
  const message = monitoring.getAlertMessage(type, data);

  await alertManager.sendAllAlerts(type, severity, message, data);
};
