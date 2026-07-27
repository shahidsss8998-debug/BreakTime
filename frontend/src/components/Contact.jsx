import { Phone, MessageCircle, Clock } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div className="section-label">Get in Touch</div>
          <h2 className="section-title">Contact <span>Us</span></h2>
          <div className="section-divider" style={{ margin: '12px auto 0' }}></div>
        </div>

        <div className="contact-cards">
          <div className="contact-card">
            <div className="big-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={48} /></div>
            <h3>Call Us</h3>
            <p>Call us directly to place an order or inquire</p>
            <span className="number">6380697419</span>
            <span className="number">7092170741</span>
          </div>

          <div className="contact-card">
            <div className="big-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageCircle size={48} /></div>
            <h3>WhatsApp Order</h3>
            <p>Quick and easy chat ordering on WhatsApp</p>
            <a
              href="https://wa.me/916380697419?text=Hello%20Break%20Time!%20%F0%9F%8D%94%E2%9C%A8"
              className="follow-btn"
              target="_blank"
              rel="noreferrer"
              style={{ marginTop: '8px' }}
            >
              Chat on WhatsApp
            </a>
          </div>

          <div className="contact-card">
            <div className="big-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={48} /></div>
            <h3>Opening Hours</h3>
            <p>We are open 7 days a week</p>
            <span className="hours-badge">4:00 PM – 10:00 PM</span>
          </div>
        </div>
      </div>
    </section>
  );
}
