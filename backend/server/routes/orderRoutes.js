/**
 * Order Routes
 *
 * Defines the API endpoints for order management.
 * Currently exposes:
 *   POST /  →  Create a new order (with validation middleware)
 */
const express = require('express');
const router = express.Router();
const {
  createOrder,
  hideCustomerOrder,
  clearPastCustomerOrders,
  hideAdminOrder,
  clearAdminHistory,
} = require('../controllers/orderController');
const validateOrder = require('../middleware/validateOrder');

// POST /api/orders — Create a new order with email notification
router.post('/', validateOrder, createOrder);

// POST /api/orders/hide-customer-order
router.post('/hide-customer-order', hideCustomerOrder);

// POST /api/orders/clear-past-customer-orders
router.post('/clear-past-customer-orders', clearPastCustomerOrders);

// POST /api/orders/hide-admin-order
router.post('/hide-admin-order', hideAdminOrder);

// POST /api/orders/clear-admin-history
router.post('/clear-admin-history', clearAdminHistory);

module.exports = router;
