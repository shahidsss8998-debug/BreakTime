import { MapPin, Clock, Phone } from 'lucide-react';

export default function Location() {
  return (
    <section id="location">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div className="section-label">Find Us</div>
          <h2 className="section-title">Our <span>Location</span></h2>
          <div className="section-divider" style={{ margin: '12px auto 0' }}></div>
        </div>

        <div className="map-grid">
          <div>
            <div className="address-card">
              <div className="address-line">
                <span className="icon"><MapPin size={24} /></span>
                <div>
                  <strong>Address</strong>
                  Lal Mosque Street, Down First Right, Near Raiyan Store
                </div>
              </div>
              <div className="address-line">
                <span className="icon"><Clock size={24} /></span>
                <div>
                  <strong>Business Hours</strong>
                  Every Day: 4:00 PM – 10:00 PM
                </div>
              </div>
              <div className="address-line">
                <span className="icon"><Phone size={24} /></span>
                <div>
                  <strong>Phone Numbers</strong>
                  6380697419 / 7092170741
                </div>
              </div>
            </div>

            <div className="map-btns">
              <a
                href="https://www.google.com/maps/place/12%C2%B056'09.5%22N+78%C2%B043'26.2%22E/@12.9359085,78.7237796,20.5z"
                className="btn-gold"
                target="_blank"
                rel="noreferrer"
              >
                Get Directions
              </a>
              <a
                href="https://www.google.com/maps/place/12%C2%B056'09.5%22N+78%C2%B043'26.2%22E/@12.9359085,78.7237796,20.5z"
                className="btn-outline"
                target="_blank"
                rel="noreferrer"
              >
                Open in Maps
              </a>
            </div>
          </div>

          <div className="map-embed">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.752!2d78.7239433!3d12.93597!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU2JzA5LjUiTiA3OMKwNDMnMjYuMiJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin"
              width="100%"
              height="340"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Restaurant Location Map"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
