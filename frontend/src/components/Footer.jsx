import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="logo" style={{ marginBottom: '12px' }}><img src="/logo.png" alt="Break Time Logo" style={{ height: '48px', width: 'auto' }} /></div>
          <div className="tagline">Good Food • Great Taste • Good Time</div>
          <p>We serve delicious, premium quality food that's fast, hygienic, and affordable. Join us for a great meal!</p>
          <div className="footer-social">
            <a href="https://www.instagram.com/break_time_008?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="social-btn" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://wa.me/916380697419?text=Hello%20Break%20Time!%20%F0%9F%8D%94%E2%9C%A8" className="social-btn" target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 0C5.383 0 0 5.383 0 12.031c0 2.115.552 4.103 1.528 5.867L.203 23.084l5.362-1.406A11.96 11.96 0 0012.031 24c6.648 0 12.031-5.383 12.031-12.031S18.679 0 12.031 0zm3.433 17.297c-.152.427-.885.836-1.258.877-.354.041-.836.124-2.859-.714-2.427-1.008-3.984-3.517-4.103-3.676-.119-.159-.979-1.303-.979-2.483s.614-1.745.836-1.986c.222-.24.484-.301.644-.301.159 0 .317.002.457.009.151.007.354-.059.544.4.198.477.675 1.648.734 1.767.059.119.099.258.02.417-.08.159-.119.258-.238.397-.119.14-.249.3-.356.406-.119.119-.244.25-.109.484.135.234.601 1.006 1.301 1.631.905.808 1.666 1.056 1.895 1.175.23.119.363.099.498-.059.135-.159.582-.676.741-.908.159-.232.317-.192.525-.113.208.079 1.317.621 1.545.741.228.119.379.179.435.278.056.099.056.577-.096 1.004z"/></svg>
            </a>
          </div>
        </div>
        
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/menu">Menu</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        
        <div className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Refund Policy</a></li>
          </ul>
        </div>
        
        <div className="footer-col">
          <h4>Contact Info</h4>
          <div className="info-line">
            <span className="icon"><MapPin size={16} /></span> Lal Mosque Street, Near Raiyan Store
          </div>
          <div className="info-line">
            <span className="icon"><Phone size={16} /></span> 6380697419
          </div>
          <div className="info-line">
            <span className="icon"><Clock size={16} /></span> 4:00 PM – 10:00 PM Daily
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Break Time Restaurant. All Rights Reserved.</p>
        <p>Made with <Heart size={14} fill="currentColor" color="var(--error)" style={{ display: 'inline', verticalAlign: 'middle', margin: '0 2px' }} /> for great food.</p>
      </div>
    </footer>
  );
}
