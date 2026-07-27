import { Utensils, Zap } from 'lucide-react';

export default function About() {
  return (
    <section id="about">
      <div className="container">
        <div className="about-grid">
          <div className="about-text">
            <div className="section-label">Our Story</div>
            <h2 className="section-title">Welcome to <span>Break Time</span></h2>
            <div className="section-divider" style={{ margin: '12px 0 20px' }}></div>
            <p>
              Founded with a passion for great food and quick service, Break Time is your go-to spot for mouth-watering burgers, fresh momos, crispy fries, and refreshing beverages.
            </p>
            <p>
              We prioritize fresh ingredients, hygienic preparation, and fast delivery to make every meal special for you and your family.
            </p>
            <div className="features-grid">
              <span className="feature-chip"><span className="icon" style={{ display: 'inline-flex', alignItems: 'center' }}><Utensils size={16} /></span> Fresh Burgers</span>
              <span className="feature-chip"><span className="icon" style={{ display: 'inline-flex', alignItems: 'center' }}><Utensils size={16} /></span> Hot Momos</span>
              <span className="feature-chip"><span className="icon" style={{ display: 'inline-flex', alignItems: 'center' }}><Utensils size={16} /></span> Crispy Fries</span>
              <span className="feature-chip"><span className="icon" style={{ display: 'inline-flex', alignItems: 'center' }}><Zap size={16} /></span> Fast Delivery</span>
            </div>
          </div>

          <div className="about-visual">
            <div className="stat-card">
              <div className="num">100%</div>
              <div className="lbl">Fresh Ingredients</div>
            </div>
            <div className="stat-card">
              <div className="num">30 Mins</div>
              <div className="lbl">Average Delivery</div>
            </div>
            <div className="stat-card">
              <div className="num">4 PM – 10 PM</div>
              <div className="lbl">Open Hours</div>
            </div>
            <div className="stat-card">
              <div className="num">4.8★</div>
              <div className="lbl">Customer Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
