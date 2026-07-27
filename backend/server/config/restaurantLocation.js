/**
 * Restaurant Location Configuration
 *
 * Central config for the restaurant's physical location.
 * Used by the delivery charge calculator to determine
 * distance-based delivery fees.
 *
 * Business Rules:
 *   - Within 200m of restaurant → FREE delivery (₹0)
 *   - Beyond 200m → ₹20 delivery charge
 *
 * Coordinates: Break Time Cafe, Krishnagiri
 * Google Maps: https://www.google.com/maps/place/12°56'09.5"N+78°43'26.2"E
 */

const RESTAURANT_CONFIG = {
  name: 'Break Time Cafe',
  latitude: 12.935987577644791,
  longitude: 78.72394455585405,
  freeDeliveryRadius: 200, // meters
  deliveryCharge: 20,       // ₹20 for orders beyond freeDeliveryRadius
};

module.exports = RESTAURANT_CONFIG;
