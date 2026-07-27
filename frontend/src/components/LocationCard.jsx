import { MapPin, Navigation, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export default function LocationCard({
  locating,
  locationError,
  coordinates,
  deliveryInfo,
  onDetectLocation,
  onResetLocation,
}) {
  return (
    <div className="checkout-location-card">
      {/* Success State — Location detected and delivery info received */}
      {coordinates && deliveryInfo ? (
        <div className="checkout-location-success">
          <div className="checkout-location-info-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={15} style={{ color: 'var(--success)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: '600' }}>
                Location Detected ({deliveryInfo.distance}m away)
              </span>
            </div>
            <button
              type="button"
              className="checkout-location-reset-btn"
              onClick={onResetLocation}
              title="Change location"
            >
              <RefreshCw size={12} /> Change
            </button>
          </div>
          <div className="checkout-location-badge-row">
            <span className="checkout-location-badge">
              Delivery Fee: <strong style={{ color: deliveryInfo.deliveryCharge === 0 ? 'var(--success)' : 'var(--primary)' }}>
                {deliveryInfo.deliveryCharge === 0 ? 'FREE (₹0)' : `₹${deliveryInfo.deliveryCharge}`}
              </strong>
            </span>
          </div>
        </div>
      ) : (
        /* Default / Error / Loading State — Sleek compact button */
        <div className="checkout-location-actions">
          <button
            type="button"
            className="checkout-location-btn"
            onClick={onDetectLocation}
            disabled={locating}
          >
            {locating ? (
              <>
                <span className="checkout-location-spinner"></span>
                Detecting current location...
              </>
            ) : (
              <>
                <Navigation size={15} />
                📍 Use Current Location
              </>
            )}
          </button>

          <span className="checkout-location-or">OR enter your address manually below</span>

          {/* Error message */}
          {locationError && (
            <div className="checkout-location-error">
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span>{locationError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

