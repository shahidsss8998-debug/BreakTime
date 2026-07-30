/**
 * Nodemailer Transporter Configuration
 *
 * Configured for Gmail SMTP with dual-port fallback (Port 587 STARTTLS primary,
 * Port 465 SSL fallback) and strict timeouts to prevent hanging on cloud hosts.
 *
 * Required env vars:
 *   EMAIL_USER  — Gmail address (e.g., breaktime7092@gmail.com)
 *   EMAIL_PASS  — Gmail App Password (16-char code from Google Account)
 */
const nodemailer = require('nodemailer');

const emailUser = (process.env.EMAIL_USER || '').trim().replace(/["']/g, '');
const emailPass = (process.env.EMAIL_PASS || '').replace(/["'\s]/g, '');

// Primary Transporter — Gmail SMTP Port 587 (STARTTLS)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // STARTTLS
  requireTLS: true,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  connectionTimeout: 8000,
  greetingTimeout: 5000,
  socketTimeout: 10000,
  tls: {
    rejectUnauthorized: false,
  },
});

// Fallback Transporter — Gmail SMTP Port 465 (SSL)
const fallbackTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  connectionTimeout: 8000,
  greetingTimeout: 5000,
  socketTimeout: 10000,
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Verify SMTP connection on startup.
 */
async function verifyMailConnection() {
  try {
    await transporter.verify();
    console.log('✅ Mail transporter connected via Port 587 (STARTTLS)');
  } catch (error) {
    console.warn('⚠️  Port 587 connection failed:', error.message);
    try {
      await fallbackTransporter.verify();
      console.log('✅ Mail transporter connected via Port 465 (SSL Fallback)');
    } catch (fallbackErr) {
      console.warn('⚠️  Port 465 fallback connection failed:', fallbackErr.message);
      console.warn('   Emails may not send. Please verify EMAIL_USER and EMAIL_PASS on Render.');
    }
  }
}

module.exports = { transporter, fallbackTransporter, verifyMailConnection };
