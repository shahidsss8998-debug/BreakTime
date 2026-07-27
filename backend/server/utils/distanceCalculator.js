/**
 * Distance Calculator Utility
 *
 * Calculates the distance between two geographic coordinates
 * using the Haversine formula. Returns distance in meters.
 *
 * No external APIs or paid services required.
 *
 * Reference: https://en.wikipedia.org/wiki/Haversine_formula
 */

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate the distance between two lat/lng points using the Haversine formula.
 *
 * @param {number} lat1 - Latitude of point 1 (in degrees)
 * @param {number} lon1 - Longitude of point 1 (in degrees)
 * @param {number} lat2 - Latitude of point 2 (in degrees)
 * @param {number} lon2 - Longitude of point 2 (in degrees)
 * @returns {number} Distance in meters (rounded to nearest integer)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const EARTH_RADIUS = 6371000; // Earth's radius in meters

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS * c);
}

module.exports = { calculateDistance };
