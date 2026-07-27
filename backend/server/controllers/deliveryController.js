/**
 * Delivery Controller
 *
 * Handles the POST /api/check-delivery endpoint.
 * Validates customer coordinates, calculates distance from
 * the restaurant using the Haversine formula, and returns
 * the delivery charge.
 *
 * Business Rules:
 *   - Within 200m → ₹0 (FREE)
 *   - Beyond 200m → ₹20
 *
 * Security: The frontend NEVER determines the delivery charge.
 * This controller is the single source of truth.
 */
const { calculateDistance } = require('../utils/distanceCalculator');
const RESTAURANT = require('../config/restaurantLocation');

/**
 * Check delivery distance and calculate charge
 * POST /api/check-delivery
 *
 * Request body: { latitude: number, longitude: number }
 * Response:     { distance: number, deliveryCharge: number }
 */
async function checkDelivery(req, res) {
  try {
    const { latitude, longitude } = req.body;

    // ── 1. Validate coordinates ──
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'latitude and longitude are required.',
      });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        success: false,
        message: 'latitude and longitude must be valid numbers.',
      });
    }

    // Latitude must be between -90 and 90, Longitude between -180 and 180
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates are out of valid range.',
      });
    }

    // ── 2. Calculate distance from restaurant ──
    const distance = calculateDistance(
      RESTAURANT.latitude,
      RESTAURANT.longitude,
      lat,
      lon
    );

    // ── 3. Determine delivery charge ──
    const deliveryCharge = distance <= RESTAURANT.freeDeliveryRadius
      ? 0
      : RESTAURANT.deliveryCharge;

    console.log(`📍 Delivery check: ${distance}m from restaurant → ₹${deliveryCharge}`);

    // ── 4. Return result ──
    return res.status(200).json({
      success: true,
      distance,
      deliveryCharge,
    });
  } catch (error) {
    console.error('❌ Error in checkDelivery:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to calculate delivery charges.',
    });
  }
}

module.exports = { checkDelivery };
