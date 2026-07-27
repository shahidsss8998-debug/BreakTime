/**
 * Delivery Routes
 *
 * Defines the API endpoint for delivery distance/charge checks.
 * Mounted at /api/check-delivery in server.js.
 *
 *   POST /  →  Check delivery distance and calculate charge
 */
const express = require('express');
const router = express.Router();
const { checkDelivery } = require('../controllers/deliveryController');

// POST /api/check-delivery — Calculate delivery distance & charge
router.post('/', checkDelivery);

module.exports = router;
