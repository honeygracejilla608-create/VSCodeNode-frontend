import nodemailer from "nodemailer";
import { Resend } from "resend";

// Initialize Resend (primary email service)
const resend = new Resend(process.env.RESEND_API_KEY || 're_B7G5RhGw_Q5zuGUT49TBtgSo3C23Z2cea');

// Fallback to nodemailer SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.replit.com",
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: false,
  auth: {
    user: "replit",
    pass: process.env.SMTP_PASS
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface APIKeyEmailOptions extends EmailOptions {
  apiKey: string;
  expiresIn: number; // seconds
  userName?: string;
}

export async function sendMail({ to, subject, text, html }: EmailOptions): Promise<void> {
  try {
    // Try Resend first (better deliverability)
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: '"Todo API" <noreply@yourdomain.com>',
        to,
        subject,
        text,
        html,
      });
      console.log(`✅ Email sent via Resend to ${to}`);
    } else {
      // Fallback to nodemailer
      await transporter.sendMail({
        from: '"Todo API" <todo@replit.com>',
        to,
        subject,
        text,
        html,
      });
      console.log(`📧 Email sent via SMTP to ${to}`);
    }
  } catch (error) {
    console.error("❌ Failed to send email:", error);

    // If Resend fails, try SMTP as fallback
    if (process.env.RESEND_API_KEY) {
      try {
        console.log("🔄 Trying SMTP fallback...");
        await transporter.sendMail({
          from: '"Todo API" <todo@replit.com>',
          to,
          subject,
          text,
          html,
        });
        console.log(`📧 Email sent via SMTP fallback to ${to}`);
      } catch (smtpError) {
        console.error("❌ SMTP fallback also failed:", smtpError);
      }
    }

    // Don't throw - we don't want email failures to break the API
  }
}

export async function sendWelcomeEmail(email: string, userName?: string): Promise<void> {
  const welcomeHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Todo API!</h1>
          </div>
          <div class="content">
            <h2>Hello${userName ? ` ${userName}` : ''}!</h2>
            <p>Thank you for joining Todo API. You can now create, manage, and organize your todos with our powerful API.</p>
            <div style="text-align: center;">
              <a href="https://your-app-url.com/dashboard" class="button">Get Started</a>
            </div>
            <p>Need help? Check out our API documentation or contact support.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">This email was sent automatically when you signed up.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendMail({
    to: email,
    subject: 'Welcome to Todo API!',
    html: welcomeHtml,
    text: `Welcome${userName ? ` ${userName}` : ''}!\n\nThank you for joining Todo API. You can now create, manage, and organize your todos with our powerful API.\n\nGet started: https://your-app-url.com/dashboard`
  });
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

  const resetHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .warning { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>

            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>

            <div class="warning">
              <strong>Security Notice:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password will remain unchanged until you click the link</li>
              </ul>
            </div>

            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetLink}</p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendMail({
    to: email,
    subject: 'Reset Your Password - Todo API',
    html: resetHtml,
    text: `Reset your password: ${resetLink}\n\nThis link expires in 1 hour.`
  });
}

export async function sendAPIKeyEmail({ to, subject, html, text, apiKey, expiresIn, userName }: APIKeyEmailOptions & { userName?: string }): Promise<void> {
  const expiresHours = Math.floor(expiresIn / 3600);

  const apiKeyHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .api-key { background: #f0f4f8; border: 2px dashed #667eea; padding: 20px; border-radius: 8px; font-family: monospace; font-size: 16px; word-break: break-all; margin: 20px 0; text-align: center; }
          .warning { background: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .code { background: #f4f4f4; padding: 15px; border-radius: 5px; font-family: monospace; overflow-x: auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Your API Key</h1>
          </div>
          <div class="content">
            <h2>Hello${userName ? ` ${userName}` : ''}!</h2>
            <p>You've been issued an API key for accessing our Todo API services:</p>

            <div class="api-key">
              <strong>${apiKey}</strong>
            </div>

            <div class="warning">
              <strong>⚠️ Important Security Information:</strong>
              <ul>
                <li>This key is valid for <strong>${expiresHours} hours</strong></li>
                <li>Keep it secure and never share it with unauthorized users</li>
                <li>Use it in your API requests with: <code>Authorization: Bearer ${apiKey}</code></li>
                <li>If compromised, revoke it immediately and generate a new one</li>
              </ul>
            </div>

            <h3>Usage Examples</h3>
            <p><strong>Creating a todo:</strong></p>
            <div class="code">
POST /api/todos<br>
Authorization: Bearer ${apiKey}<br>
Content-Type: application/json<br>
<br>
{<br>
  "title": "My Todo",<br>
  "description": "Todo description"<br>
}
            </div>

            <h3>Next Steps</h3>
            <p>
              1. Store this key securely in your application<br>
              2. Test the API endpoints<br>
              3. Monitor your API usage<br>
              4. Contact support if you encounter any issues
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              This is an automated message from Todo API.
              If you need assistance, contact our support team.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendMail({
    to,
    subject: subject || 'Your API Key - Todo API',
    html: apiKeyHtml,
    text: `Your API Key: ${apiKey}\n\nValid for ${expiresHours} hours.\n\nUse in Authorization header: Bearer ${apiKey}`
  });
}
