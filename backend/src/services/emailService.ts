import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter: nodemailer.Transporter | null = null;

const getTransporter = async (): Promise<nodemailer.Transporter> => {
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
  } else {
    // Fallback: log to console, or create an ephemeral test account in development
    console.log('No SMTP config found in environment. Creating fallback Ethereal SMTP transporter...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`Ethereal virtual email inbox initialized. User: ${testAccount.user}`);
    } catch (err) {
      console.warn('Failed to construct virtual Ethereal account. Falling back to stdout logs.');
      // Stub transporter that logs to console
      transporter = {
        sendMail: async (options: any) => {
          console.log('\n--- [Mock Email Dispatch] ---');
          console.log(`To: ${options.to}`);
          console.log(`Subject: ${options.subject}`);
          console.log(`Body:\n${options.text || options.html}`);
          console.log('------------------------------\n');
          return { messageId: 'mock-id-' + Date.now() };
        }
      } as unknown as nodemailer.Transporter;
    }
  }

  return transporter;
};

export const sendNotificationEmail = async (to: string, subject: string, messageText: string, htmlContent?: string) => {
  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: process.env.SMTP_FROM || '"LifeSync Support" <support@lifesync.io>',
      to,
      subject,
      text: messageText,
      html: htmlContent || `<div style="font-family: sans-serif; padding: 20px; color: #333;"><h3>LifeSync Notification</h3><p>${messageText}</p></div>`
    });

    console.log(`Email dispatched successfully. Message ID: ${info.messageId}`);
  } catch (err) {
    console.error('Failed to dispatch notification email:', err);
  }
};
