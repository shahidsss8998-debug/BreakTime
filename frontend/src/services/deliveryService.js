/**
 * Delivery Service
 *
 * Handles communication with the backend delivery charge API.
 * The frontend NEVER calculates delivery charges — the backend
 * is the single source of truth.
 */

// Backend API URL — same pattern used by orderService.js
const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const BACKEND_URL = rawBackendUrl.replace(/\/$/, '');

/**
 * Check delivery distance and charge by sending customer coordinates
 * to the backend API.
 *
 * @param {number} latitude - Customer's latitude
 * @param {number} longitude - Customer's longitude
 * @returns {Promise<{distance: number, deliveryCharge: number} | null>}
 *          Returns delivery info or null on failure
 */
export async function checkDeliveryCharge(latitude, longitude) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/check-delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[deliveryService] Backend error:', data.message);
      return null;
    }

    return {
      distance: data.distance,
      deliveryCharge: data.deliveryCharge,
    };
  } catch (error) {
    console.error('[deliveryService] Failed to check delivery charge:', error.message);
    return null;
  }
}
