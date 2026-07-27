/**
 * Order Validation Middleware
 *
 * Validates and sanitizes all incoming order data before
 * it reaches the controller. Returns 400 with descriptive
 * error messages if validation fails.
 */
const validator = require('validator');

/**
 * Sanitize a string — trim whitespace and escape HTML entities
 * @param {*} value
 * @returns {string}
 */
function sanitize(value) {
  if (typeof value !== 'string') return '';
  return validator.escape(validator.trim(value));
}

/**
 * Express middleware to validate the order request body.
 * Expected body shape matches the existing Firestore schema.
 */
function validateOrder(req, res, next) {
  const errors = [];
  const { customerId, customerName, customerEmail, items, total, deliveryDetails } = req.body;

  // ── Required fields ──
  if (!customerId || typeof customerId !== 'string') {
    errors.push('customerId is required and must be a string.');
  }

  if (!customerName || typeof customerName !== 'string' || customerName.trim().length === 0) {
    errors.push('customerName is required.');
  }

  // ── Customer email validation (graceful fallback if empty) ──
  if (!customerEmail || typeof customerEmail !== 'string' || !validator.isEmail(customerEmail)) {
    req.body.customerEmail = 'customer@raihancafe.com';
  }

  // ── Items validation ──
  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('items must be a non-empty array.');
  } else {
    items.forEach((item, index) => {
      if (!item.name || typeof item.name !== 'string') {
        errors.push(`items[${index}].name is required.`);
      }
      if (typeof item.price !== 'number' || item.price < 0) {
        errors.push(`items[${index}].price must be a non-negative number.`);
      }
      if (typeof item.quantity !== 'number' || item.quantity < 1 || !Number.isInteger(item.quantity)) {
        errors.push(`items[${index}].quantity must be a positive integer.`);
      }
    });
  }

  // ── Total validation ──
  if (typeof total !== 'number' || total < 0) {
    errors.push('total must be a non-negative number.');
  }

  // ── Delivery details validation ──
  if (!deliveryDetails || typeof deliveryDetails !== 'object') {
    errors.push('deliveryDetails is required and must be an object.');
  } else {
    if (!deliveryDetails.place || typeof deliveryDetails.place !== 'string' || deliveryDetails.place.trim().length === 0) {
      errors.push('deliveryDetails.place (delivery address) is required.');
    }
    if (!deliveryDetails.phone || typeof deliveryDetails.phone !== 'string' || deliveryDetails.phone.trim().length === 0) {
      errors.push('deliveryDetails.phone is required.');
    }
  }

  // ── Return errors or sanitize & proceed ──
  if (errors.length > 0) {
    console.warn('❌ Order validation failed:', errors);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Sanitize string fields in-place for downstream use
  req.body.customerName = sanitize(customerName);
  req.body.customerEmail = validator.trim(customerEmail).toLowerCase();
  if (deliveryDetails) {
    req.body.deliveryDetails.place = sanitize(deliveryDetails.place);
    req.body.deliveryDetails.phone = sanitize(deliveryDetails.phone);
    if (deliveryDetails.notes) {
      req.body.deliveryDetails.notes = sanitize(deliveryDetails.notes);
    }
    if (deliveryDetails.date) {
      req.body.deliveryDetails.date = sanitize(deliveryDetails.date);
    }
    if (deliveryDetails.time) {
      req.body.deliveryDetails.time = sanitize(deliveryDetails.time);
    }
  }

  next();
}

module.exports = validateOrder;
