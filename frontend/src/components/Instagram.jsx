const INSTA_POSTS = [
  'https://t3.ftcdn.net/jpg/08/59/47/44/360_F_859474451_v0rlj2eDY7wUfbggHJ11AFqraHWWCduj.jpg',
  'https://i.pinimg.com/736x/e8/35/ed/e835ed89023c2a6d2d1933321d59efc4.jpg',
  'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&q=80',
  'https://tse1.mm.bing.net/th/id/OIP.u1FyLYzlivJdnwx_zgo-iAHaHa?r=0&w=770&h=770&rs=1&pid=ImgDetMain&o=7&rm=3',
  'https://www.thedailymeal.com/img/gallery/this-is-what-makes-kfcs-fried-chicken-so-good/l-intro-1699387963.jpg',
  'https://veggiefestchicago.org/wp-content/uploads/2023/08/Vada-Pav.jpg'
];

export default function Instagram() {
  return (
    <section id="instagram">
      <div className="container">
        <div className="insta-card">
          <div className="insta-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </div>
          <h3>Follow Us on Instagram</h3>
          <p>@break_time_008 • Tag us in your food photos!</p>
          <a
            href="https://www.instagram.com/break_time_008?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            className="follow-btn"
            target="_blank"
            rel="noreferrer"
          >
            Follow @break_time_008
          </a>
        </div>

        <div className="insta-grid">
          {INSTA_POSTS.map((src, index) => (
            <a
              key={index}
              href="https://www.instagram.com/break_time_008"
              target="_blank"
              rel="noreferrer"
              className="insta-post"
            >
              <img src={src} alt={`Instagram post ${index + 1}`} loading="lazy" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
