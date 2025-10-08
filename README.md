# Todo API with JWT & API Key Authentication

A modern Todo API built with Node.js, Express, TypeScript, and PostgreSQL. Features JWT authentication, API key management, email integration, and a beautiful React frontend.

## Features

- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **API Key Management** - Generate, manage, and revoke API keys
- ✅ **Email Integration** - Welcome emails and notifications via Resend
- ✅ **PostgreSQL Database** - Robust data storage with Drizzle ORM
- ✅ **React Frontend** - Modern UI with Vite and Tailwind CSS
- ✅ **TypeScript** - Full type safety across the stack
- ✅ **AI Integration** - Google Generative AI for smart features

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens and API keys
- **Email**: Resend (with SMTP fallback)
- **Frontend**: React, Vite, Tailwind CSS
- **Deployment**: Firebase-ready

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Resend account (for email)

### Installation

```bash
# Clone and install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Database Setup

```sql
-- Create database
CREATE DATABASE todo_api;

-- The tables will be created automatically by Drizzle
```

### Development

```bash
# Start development server (backend + frontend)
npm run dev

# Or run separately:
# Backend: tsx server/index.ts
# Frontend: npm run build && serve dist
```

### Demo

```bash
# Run the API key demonstration
npm run demo

# Get help with demo options
npm run demo:help
```

## API Endpoints

### Authentication

#### Generate JWT Token (Development)

```http
POST /api/generate-token
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### API Keys

#### Generate API Key

```http
POST /api/keys
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "expiresInHours": 24
}
```

#### List API Keys

```http
GET /api/keys
Authorization: Bearer <jwt-token>
```

#### Revoke API Key

```http
DELETE /api/keys/:keyId
Authorization: Bearer <jwt-token>
```

#### Validate API Key

```http
POST /api/auth/validate-key
Content-Type: application/json

{
  "apiKey": "your-32-character-api-key"
}
```

### Tasks

#### Get All Tasks

```http
GET /api/tasks
Authorization: Bearer <jwt-token>
```

#### Create Task

```http
POST /api/tasks
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "My Todo",
  "description": "Task description",
  "completed": false
}
```

## API Key Authentication

API keys provide an alternative to JWT tokens for programmatic access:

### Using API Keys

```bash
# Include in Authorization header
curl -X GET "http://localhost:3001/api/tasks" \
  -H "Authorization: Bearer your-api-key-here"

# Or in query parameters
curl "http://localhost:3001/api/tasks?api_key=your-api-key-here"
```

### API Key Features

- **Secure Generation**: Cryptographically secure 32-character keys
- **Email Delivery**: Keys sent via professional HTML emails
- **Expiration**: Configurable expiration times
- **Revocation**: Ability to revoke compromised keys
- **Usage Tracking**: Monitor API key usage statistics
- **User Isolation**: Keys are scoped to individual users

## Email Integration

The API includes comprehensive email functionality:

### Welcome Emails

- Automatically sent when users register
- Beautiful HTML templates with branding
- Responsive design for all devices

### API Key Emails

- Professional formatting with security warnings
- Usage instructions and code examples
- Expiration notifications

### Password Reset Emails

- Secure token-based password reset
- Time-limited links with security warnings

### Configuration

```bash
# Required environment variables
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com

# Optional (SMTP fallback)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_PASS=your-smtp-password
```

## Development Workflow

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit with your values
nano .env
```

### 2. Database Migration

```bash
# Tables are created automatically by Drizzle
# No manual migration needed
```

### 3. Development Server

```bash
npm run dev
# Backend: http://localhost:3001
# Frontend: http://localhost:5173 (when built)
```

### 4. Testing

```bash
# Run API key demo
npm run demo

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```bash
├── server/                 # Backend API
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── auth.ts            # JWT authentication
│   ├── mailer.ts          # Email service
│   ├── api-keys.ts        # API key management
│   └── storage.ts         # Database operations
├── client/                # React frontend
├── shared/                # Shared types/schemas
├── demo-api-keys.js       # API demonstration
├── package.json
├── tsconfig.json
└── README.md
```

## Security

### Authentication Methods

1. **JWT Tokens**: Session-based authentication for users
2. **API Keys**: Long-term programmatic access
3. **Dual Auth**: Support both methods simultaneously

### Data Protection

- Passwords hashed with secure algorithms
- API keys stored as SHA-256 hashes
- JWT tokens with configurable expiration
- Input validation and sanitization

## Monitoring & Alerting

The API includes comprehensive monitoring and alerting capabilities:

### Automated Alerts

#### Error Rate Monitoring
- **Threshold**: >0.5% error rate for 5 minutes
- **Integration**: PagerDuty/Slack alerts
- **Auto-scaling**: Prevents alert spam with cooldowns

#### Authentication Spike Detection
- **Threshold**: 10% increase in 401/403 errors per day
- **Security**: Detects potential brute force attacks
- **Immediate**: Real-time monitoring and alerts

#### Expired API Key Alerts
- **Trigger**: When expired keys are used
- **Severity**: High-priority security alerts
- **Tracking**: Maintains list of compromised keys

### Monitoring Endpoints

#### Get Metrics (Admin Only)
```http
GET /api/monitoring/metrics
Authorization: Bearer <jwt-token>
```

Returns:
```json
{
  "totalRequests": 1250,
  "errorCount": 12,
  "authErrors": 3,
  "errorRate": 0.0096,
  "expiredKeys": ["key_123", "key_456"],
  "recentAlerts": [...]
}
```

#### Reset Metrics (Admin Only)
```http
POST /api/monitoring/reset
Authorization: Bearer <jwt-token>
```

#### Webhook Endpoint
```http
POST /api/monitoring/webhook
Content-Type: application/json

{
  "type": "custom_alert",
  "message": "Custom alert message",
  "data": { "custom": "data" }
}
```

### External Alerting

#### PagerDuty Integration
- **Events API**: Direct integration with PagerDuty
- **Severity Mapping**: Critical/High/Medium alerts
- **Deduplication**: Prevents alert spam

#### Slack Integration
- **Webhooks**: Real-time Slack notifications
- **Rich Messages**: Formatted alerts with severity colors
- **Channels**: Configurable alert channels

### Configuration

```bash
# Environment variables
PAGERDUTY_ROUTING_KEY=your_routing_key
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# Alert thresholds
ERROR_RATE_THRESHOLD=0.005  # 0.5%
AUTH_SPIKE_THRESHOLD=0.10   # 10%
ALERT_COOLDOWN=900000       # 15 minutes
```

### Security Monitoring

#### Real-time Tracking
- Request/response monitoring
- Error classification (4xx/5xx)
- Authentication failure tracking
- API key usage patterns

#### Alert Types

| Alert Type | Severity | Trigger | Action |
|------------|----------|---------|--------|
| `HIGH_ERROR_RATE` | Critical | >0.5% errors/5min | PagerDuty + Slack |
| `AUTH_SPIKE` | High | 10% auth increase/day | Security team alert |
| `EXPIRED_KEY` | High | Expired key usage | Immediate revocation |

### Metrics Dashboard

Access monitoring data programmatically:

```javascript
// Get current metrics
const metrics = await fetch('/api/monitoring/metrics', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Reset metrics (admin only)
await fetch('/api/monitoring/reset', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Deployment

### Firebase (Recommended)

```bash
# Install Firebase CLI
npm install -g firebase-tools
firebase login

# Initialize project
firebase init
firebase deploy
```

### Other Platforms

The app can be deployed to:

- Vercel
- Netlify
- Heroku
- DigitalOcean App Platform
- AWS/GCP/Azure

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- **Issues**: GitHub Issues
- **Email**: Contact through the application
- **Documentation**: API docs in `/api` routes

---

## Happy Coding! 🎉
