import { Truck, Zap, Package, MessageCircle, Phone, Clock, Bike } from 'lucide-react';

export default function Delivery() {
  return (
    <section id="delivery">
      <div className="container">
        <div className="delivery-grid">
          <div>
            <div className="delivery-badge"><Truck size={16} style={{ display: 'inline', marginRight: '6px' }}/> Delivery Available</div>
            <div className="section-label">Order at Your Door</div>
            <h2 className="section-title">We Deliver to <span>Your Home</span></h2>
            <div className="section-divider" style={{ margin: '12px 0 20px' }}></div>
            <ul className="delivery-features">
              <li><span className="icon" style={{ display: 'inline-flex', alignItems: 'center' }}><Zap size={18} /></span> Lightning-fast home delivery</li>
              <li><span className="icon" style={{ display: 'inline-flex', alignItems: 'center' }}><Package size={18} /></span> Fresh & hygienic tamper-proof packaging</li>
              <li><span className="icon" style={{ display: 'inline-flex', alignItems: 'center' }}><MessageCircle size={18} /></span> Easy WhatsApp ordering</li>
              <li><span className="icon" style={{ display: 'inline-flex', alignItems: 'center' }}><Phone size={18} /></span> Phone orders accepted</li>
              <li><span className="icon" style={{ display: 'inline-flex', alignItems: 'center' }}><Clock size={18} /></span> Available 4:00 PM – 10:00 PM Daily</li>
            </ul>
            <div className="delivery-btns">
              <a
                href="https://wa.me/916380697419?text=Hello%20Break%20Time!%20%F0%9F%8D%94%E2%9C%A8%0A%0AI'd%20like%20to%20check%20if%20delivery%20is%20available%20in%20my%20area!%20%F0%9F%9B%B5"
                className="btn-gold"
                target="_blank"
                rel="noreferrer"
              >
                Order on WhatsApp
              </a>
              <a href="tel:6380697419" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Phone size={16} /> Call Now</a>
            </div>
          </div>

          <div className="delivery-visual">
            <div className="delivery-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bike size={48} /></div>
            <div className="delivery-time">
              Fast Delivery
              <span>Order now, enjoy fresh food soon</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--primary)' }}>4 PM</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Opens</span>
              </div>
              <div style={{ width: '1px', background: 'var(--border-light)' }}></div>
              <div>
                <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--primary)' }}>10 PM</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Closes</span>
              </div>
              <div style={{ width: '1px', background: 'var(--border-light)' }}></div>
              <div>
                <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--primary)' }}>7 Days</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>A Week</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
