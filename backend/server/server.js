/**
 * Break Time Cafe — Express Backend Server
 *
 * Entry point for order creation & email notifications.
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const orderRoutes = require('./routes/orderRoutes');
const { verifyMailConnection } = require('./config/mailConfig');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL?.replace(/\/$/, ''),
  'https://breaktime0.netlify.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`⚠️  Blocked CORS request from: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Break Time Cafe API',
    timestamp: new Date().toISOString(),
  });
});

// Email Diagnostic — checks if SMTP credentials are configured and can connect
app.get('/api/health/email', async (req, res) => {
  const { transporter } = require('./config/mailConfig');
  const emailUser = (process.env.EMAIL_USER || '').trim();
  const emailPass = (process.env.EMAIL_PASS || '').trim();
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim();

  const diagnostics = {
    EMAIL_USER_set: !!emailUser,
    EMAIL_USER_value: emailUser ? `${emailUser.slice(0, 4)}***${emailUser.slice(-10)}` : 'NOT SET',
    EMAIL_PASS_set: !!emailPass,
    EMAIL_PASS_length: emailPass.length,
    ADMIN_EMAIL_set: !!adminEmail,
    ADMIN_EMAIL_value: adminEmail ? `${adminEmail.slice(0, 4)}***${adminEmail.slice(-10)}` : 'NOT SET',
  };

  try {
    await transporter.verify();
    diagnostics.smtp_connection = 'SUCCESS';
    diagnostics.smtp_ready = true;
  } catch (error) {
    diagnostics.smtp_connection = 'FAILED';
    diagnostics.smtp_error = error.message;
    diagnostics.smtp_ready = false;
  }

  res.status(200).json(diagnostics);
});

// Send a real test email — use this once to confirm emails arrive
app.get('/api/health/email-test', async (req, res) => {
  const { sendOrderNotification } = require('./services/emailService');

  const testOrderData = {
    orderNumber: 'BT-TEST01',
    orderId: 'test-diagnostic-001',
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    customerPhone: '0000000000',
    items: [{ id: '1', name: 'Test Item', price: 100, quantity: 1, img: '' }],
    subtotal: 100,
    deliveryFee: 0,
    total: 100,
    deliveryAddress: 'Test Address',
    deliveryDetails: { place: 'Test Address', phone: '0000000000', deliveryZone: 'test', deliveryFee: 0 },
    status: 'placed',
    createdAt: new Date(),
  };

  const result = await sendOrderNotification(testOrderData);
  res.status(200).json({
    message: result.success ? 'Test email sent successfully!' : 'Email sending failed',
    ...result,
  });
});

// API Routes
app.use('/api/orders', orderRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('💥 Unhandled Error:', err.message);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS: Origin not allowed',
    });
  }
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

app.listen(PORT, async () => {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  🍔  Break Time Cafe — Backend Server');
  console.log('═══════════════════════════════════════════');
  console.log(`  🌐  Port:        ${PORT}`);
  console.log(`  📡  Health:      http://localhost:${PORT}/api/health`);
  console.log(`  📬  Orders API:  http://localhost:${PORT}/api/orders`);
  console.log('═══════════════════════════════════════════');
  console.log('');

  await verifyMailConnection();
});

module.exports = app;
