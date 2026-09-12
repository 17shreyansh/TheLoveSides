import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
import { emailService } from './src/services/email.service.js';

async function run() {
  try {
    console.log('Sending test email via SMTP...');
    const result = await emailService.sendEmail({
      to: process.env.SMTP_USER || 'support@thelovesides.com',
      subject: 'Test Email via SMTP from TheLoveSides API',
      text: 'This is a test email to verify that the Nodemailer SMTP integration works successfully.',
      html: '<h1>Success!</h1><p>The SMTP email integration is working perfectly.</p>'
    });
    console.log('Test email sent successfully via SMTP!', result);
  } catch (error) {
    console.error('Failed to send test email via SMTP:', error);
  }
}
run();
