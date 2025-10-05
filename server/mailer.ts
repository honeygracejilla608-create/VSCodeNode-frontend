import nodemailer from "nodemailer";

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
  text: string;
}

export async function sendMail({ to, subject, text }: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: '"Todo API" <todo@replit.com>',
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    // Don't throw - we don't want email failures to break the API
  }
}
