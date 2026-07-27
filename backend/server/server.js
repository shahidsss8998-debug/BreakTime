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
