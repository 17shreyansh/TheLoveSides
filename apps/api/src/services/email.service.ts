import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST || 'smtp.hostinger.com',
      port: env.SMTP_PORT || 465,
      secure: (env.SMTP_PORT === 465), // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER || '',
        pass: env.SMTP_PASSWORD || '',
      },
    });
  }

  /**
   * Sends an email using SMTP
   */
  async sendEmail({
    to,
    subject,
    text,
    html,
  }: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
  }) {
    const toArray = Array.isArray(to) ? to : [to];

    try {
      const info = await this.transporter.sendMail({
        from: `TheLoveSides Support <${env.SMTP_FROM || env.SMTP_USER || ''}>`,
        to: toArray.join(', '),
        subject,
        text: text || '',
        html: html || '',
      });

      return info;
    } catch (error) {
      console.error('Failed to send email via SMTP:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
