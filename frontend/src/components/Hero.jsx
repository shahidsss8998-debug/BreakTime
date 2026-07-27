import { Link } from 'react-router-dom';
import { Utensils, Truck } from 'lucide-react';

export default function Hero() {
  return (
    <section id="home">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge"><Utensils size={16} style={{ display: 'inline', marginRight: '6px' }}/> Est. in Your Neighbourhood</div>
          <h1 className="hero-title">
            Delicious Food,<br />
            Delivered <span>Fast</span>
          </h1>
          <p className="hero-sub">
            From crispy burgers to steaming momos — freshly made, hygienically packed, and delivered to your doorstep.
          </p>
          <div className="hero-delivery">
            <Truck size={16} className="hero-delivery-icon" />
            <span className="hero-delivery-text">
              <span>Delivery Available</span>
              <span className="hero-delivery-divider">|</span>
              <span>Open 4PM – 10PM Daily</span>
            </span>
          </div>
          <div className="hero-btns">
            <Link to="/menu" className="btn-gold">Browse Menu</Link>
            <a
              href="https://wa.me/916380697419?text=Hello%20Break%20Time!%20%F0%9F%8D%94%E2%9C%A8%0A%0AI'd%20like%20to%20place%20an%20order!%20Please%20share%20today's%20specials%20or%20take%20my%20order.%20%F0%9F%93%9D%F0%9F%8D%95%0A%0AThank%20you!%20%F0%9F%99%8C"
              className="btn-outline"
              target="_blank"
              rel="noreferrer"
            >
              Order on WhatsApp
            </a>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80"
            alt="Delicious burger"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
