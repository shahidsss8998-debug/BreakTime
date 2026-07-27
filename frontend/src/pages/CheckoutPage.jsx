import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrderWithEmail } from '../services/orderService';
import Toast from '../components/Toast';
import { ShoppingBag, MapPin, Banknote, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  // Format current datetime for min attribute on datetime-local input
  const getMinDateTime = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzOffset).toISOString().slice(0, 16);
  };

  const minDateTimeStr = getMinDateTime();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    place: '',
    deliveryDateTime: minDateTimeStr,
    landmark: '',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  // Pre-fill from user profile if available
  useEffect(() => {
    if (userProfile || user) {
      setFormData(prev => ({
        ...prev,
        name: userProfile?.name || user?.displayName || prev.name,
        phone: userProfile?.phone || prev.phone,
        place: userProfile?.address || prev.place
      }));
    }
  }, [userProfile, user]);

  const subtotal = getCartTotal();
  const deliveryFee = 20;
  const total = subtotal + deliveryFee;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim() || !formData.place.trim() || !formData.deliveryDateTime) {
      setToast({ message: 'Please fill in Name, Phone, Address, and Delivery Date & Time.', type: 'error' });
      return;
    }

    if (cartItems.length === 0) {
      setToast({ message: 'Your cart is empty.', type: 'error' });
      return;
    }

    setSubmitting(true);

    try {
      // Parse & format selected delivery date & time
      const dt = new Date(formData.deliveryDateTime);
      const formattedDate = isNaN(dt.getTime())
        ? formData.deliveryDateTime.split('T')[0]
        : dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const formattedTime = isNaN(dt.getTime())
        ? formData.deliveryDateTime.split('T')[1]
        : dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

      const deliveryDetails = {
        place: `${formData.place.trim()}${formData.landmark ? `, Landmark: ${formData.landmark.trim()}` : ''}`,
        phone: formData.phone.trim(),
        date: formattedDate,
        time: formattedTime,
        deliveryDateTime: `${formattedDate} at ${formattedTime}`,
        notes: formData.notes.trim(),
        deliveryFee,
        deliveryCharge: deliveryFee,
      };

      const orderId = await placeOrderWithEmail(
        user ? user.uid : 'guest',
        formData.name.trim(),
        user?.email || userProfile?.email || '',
        cartItems,
        total,
        deliveryDetails
      );
      clearCart();
      navigate(`/order-confirmation/${orderId}`);
    } catch (error) {
      console.error('Error placing order:', error);
      setToast({ message: 'Failed to place order. Please try again.', type: 'error' });
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--text-muted)' }}>
          <ShoppingBag size={64} strokeWidth={1.5} />
        </div>
        <h2>Your cart is empty</h2>
        <p>Add some delicious items from our menu before checking out!</p>
        <Link to="/menu" className="checkout-btn-primary">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-page-header">
          <Link to="/cart" className="checkout-back-link">← Back to Cart</Link>
          <h1>Checkout</h1>
        </div>

        <div className="checkout-grid">
          {/* Left Column — Delivery Form */}
          <div className="checkout-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} /> Delivery Details
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="checkout-row">
                <div className="checkout-field">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>
              </div>

              <div className="checkout-field">
                <div className="checkout-address-header">
                  <label htmlFor="place">Delivery Address *</label>
                </div>
                <textarea
                  id="place"
                  name="place"
                  rows="3"
                  value={formData.place}
                  onChange={handleInputChange}
                  placeholder="Street, area, house/apartment number..."
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="deliveryDateTime">Preferred Delivery Date & Time *</label>
                <input
                  id="deliveryDateTime"
                  type="datetime-local"
                  name="deliveryDateTime"
                  min={minDateTimeStr}
                  value={formData.deliveryDateTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="landmark">Landmark (Optional)</label>
                <input
                  id="landmark"
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  placeholder="Near mosque, store, etc."
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="notes">Order Notes (Optional)</label>
                <input
                  id="notes"
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Extra spicy, no cutlery, call on arrival, etc."
                />
              </div>

              {/* Payment Method Badge */}
              <div style={{ background: 'var(--bg-section)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', margin: '20px 0 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                    <Banknote size={24} />
                  </span>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Cash on Delivery</strong>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>Pay with cash when your food arrives at your door.</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="checkout-place-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="auth-spinner"></span>
                ) : (
                  `Place Order • ₹${total}`
                )}
              </button>
            </form>
          </div>

          {/* Right Column — Order Summary */}
          <div className="checkout-card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={20} /> Order Summary ({cartItems.length})
            </h3>

            <div className="checkout-items-list">
              {cartItems.map(item => (
                <div key={item.id} className="checkout-item">
                  <div className="checkout-item-info">
                    {item.img && <img src={item.img} alt={item.name} className="checkout-item-img" />}
                    <div>
                      <span className="checkout-item-name">{item.name}</span>
                      <span className="checkout-item-qty">Qty: {item.quantity} × ₹{item.price}</span>
                    </div>
                  </div>
                  <span className="checkout-item-price">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="checkout-totals">
              <div className="checkout-total-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="checkout-total-row">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '2px 0 10px 0', fontStyle: 'italic' }}>
                💡 Free delivery within 200m of Rahain Cafe; ₹20 standard fee applies elsewhere.
              </p>
              <div className="checkout-total-row checkout-total-final">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
            <p className="checkout-secure-text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Lock size={14} /> 100% Safe & Secure Checkout
            </p>
          </div>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />
    </div>
  );
}
