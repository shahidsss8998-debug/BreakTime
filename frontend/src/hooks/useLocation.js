/**
 * useLocation Hook
 *
 * Custom React hook that wraps the Browser Geolocation API
 * and integrates with the backend delivery charge calculator.
 *
 * Flow:
 *   1. User clicks "Use Current Location"
 *   2. Browser requests permission
 *   3. On success → sends coordinates to backend
 *   4. Backend returns distance + delivery charge
 *   5. Hook exposes all data for the checkout UI
 *
 * The frontend NEVER determines delivery charges.
 */
import { useState, useCallback } from 'react';
import { checkDeliveryCharge } from '../services/deliveryService';

export function useLocation() {
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [coordinates, setCoordinates] = useState(null); // { latitude, longitude, accuracy }
  const [deliveryInfo, setDeliveryInfo] = useState(null); // { distance, deliveryCharge }

  /**
   * Trigger browser geolocation and then call the backend
   * to calculate delivery distance and charge.
   */
  const detectLocation = useCallback(async () => {
    // Reset previous state
    setLocationError('');
    setDeliveryInfo(null);

    // Check if Geolocation API is available
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);

    try {
      // Wrap the callback-based API in a Promise
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 15000,
          enableHighAccuracy: true,
          maximumAge: 0,
        });
      });

      const { latitude, longitude, accuracy } = position.coords;
      setCoordinates({ latitude, longitude, accuracy });

      // Call backend to calculate distance and delivery charge
      const result = await checkDeliveryCharge(latitude, longitude);

      if (result) {
        setDeliveryInfo(result);
      } else {
        setLocationError('Unable to calculate delivery charges.');
      }
    } catch (error) {
      // Handle geolocation errors
      if (error.code === 1) {
        // PERMISSION_DENIED
        setLocationError('Location permission denied. Please enter your delivery address manually.');
      } else if (error.code === 2) {
        // POSITION_UNAVAILABLE
        setLocationError('Unable to detect your location. Please try again.');
      } else if (error.code === 3) {
        // TIMEOUT
        setLocationError('Location request timed out. Please try again.');
      } else {
        setLocationError('Unable to detect your location. Please try again.');
      }
      setCoordinates(null);
    } finally {
      setLocating(false);
    }
  }, []);

  /**
   * Reset all location state (used when user wants to re-detect
   * or switch to manual address entry).
   */
  const resetLocation = useCallback(() => {
    setLocating(false);
    setLocationError('');
    setCoordinates(null);
    setDeliveryInfo(null);
  }, []);

  return {
    locating,
    locationError,
    coordinates,
    deliveryInfo,
    detectLocation,
    resetLocation,
  };
}
