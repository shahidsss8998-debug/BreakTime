import { useState } from 'react';

const GALLERY_IMAGES = [
  { id: 1, src: 'https://t3.ftcdn.net/jpg/08/59/47/44/360_F_859474451_v0rlj2eDY7wUfbggHJ11AFqraHWWCduj.jpg', title: 'Chicken Burger' },
  { id: 2, src: 'https://i.pinimg.com/736x/e8/35/ed/e835ed89023c2a6d2d1933321d59efc4.jpg', title: 'Chicken Momos' },
  { id: 3, src: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&q=80', title: 'French Fries' },
  { id: 4, src: 'https://tse1.mm.bing.net/th/id/OIP.u1FyLYzlivJdnwx_zgo-iAHaHa?r=0&w=770&h=770&rs=1&pid=ImgDetMain&o=7&rm=3', title: 'Mojito Blue Berry' },
  { id: 5, src: 'https://www.thedailymeal.com/img/gallery/this-is-what-makes-kfcs-fried-chicken-so-good/l-intro-1699387963.jpg', title: 'KFC Chicken 200 Grams' },
  { id: 6, src: 'https://veggiefestchicago.org/wp-content/uploads/2023/08/Vada-Pav.jpg', title: 'Wada Pav' }
];

export default function Gallery() {
  const [activeImage, setActiveImage] = useState(null);

  return (
    <section id="gallery">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="section-label">Food Gallery</div>
          <h2 className="section-title">Freshly <span>Prepared</span></h2>
          <div className="section-divider" style={{ margin: '12px auto 0' }}></div>
        </div>

        <div className="gallery-grid">
          {GALLERY_IMAGES.map((img) => (
            <div
              key={img.id}
              className="gallery-item"
              onClick={() => setActiveImage(img.src)}
            >
              <img src={img.src} alt={img.title} loading="lazy" />
              <div className="gallery-overlay">
                <span>{img.title}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        <div
          className={`lightbox ${activeImage ? 'open' : ''}`}
          onClick={() => setActiveImage(null)}
        >
          <button className="lb-close" onClick={() => setActiveImage(null)}>✕</button>
          {activeImage && (
            <img src={activeImage} alt="Enlarged dish" onClick={(e) => e.stopPropagation()} />
          )}
        </div>
      </div>
    </section>
  );
}
