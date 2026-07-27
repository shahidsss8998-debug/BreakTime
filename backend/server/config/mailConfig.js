/**
 * Nodemailer Transporter Configuration
 *
 * Creates and exports a reusable Nodemailer transporter
 * configured for Gmail SMTP using App Password authentication.
 *
 * Required env vars:
 *   EMAIL_USER  — Gmail address (e.g., breaktime7092@gmail.com)
 *   EMAIL_PASS  — Gmail App Password (16-char code from Google Account)
 */
const nodemailer = require('nodemailer');

// Create reusable transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    // Strip spaces from Gmail App Passwords (e.g., "owjm zmlt mkyz xnej" -> "owjmzmltmkyzxnej")
    pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '',
  },
});

/**
 * Verify the SMTP connection on startup.
 * Logs success or warning — does NOT crash the server on failure.
 */
async function verifyMailConnection() {
  try {
    await transporter.verify();
    console.log('✅ Mail transporter connected — ready to send emails');
  } catch (error) {
    console.warn('⚠️  Mail transporter verification failed:', error.message);
    console.warn('   Emails may not be sent. Check EMAIL_USER and EMAIL_PASS env vars.');
  }
}

module.exports = { transporter, verifyMailConnection };
