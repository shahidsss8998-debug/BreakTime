/**
 * Menu — Food card grid with category filters, search, and add-to-cart.
 * Displays official Break Time menu items with fallback to Firestore real-time list.
 */
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { listenToMenuItems } from '../services/menuService';
import { Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OFFICIAL_MENU_ITEMS = [
  {
    id: 'm1',
    name: 'Wada Pav',
    price: 30,
    category: 'Snacks',
    img: 'https://veggiefestchicago.org/wp-content/uploads/2023/08/Vada-Pav.jpg',
    description: 'Authentic Mumbai style spiced potato vada served in a soft pav bun with fried green chili.'
  },
  {
    id: 'm2',
    name: 'Pav Bhaji',
    price: 60,
    category: 'Snacks',
    img: 'https://heatandtoast.com/wp-content/uploads/2025/06/Pav-Bhaji-Recipe.jpg',
    description: 'Rich & spicy mashed vegetable curry served with toasted buttered pav buns and lemon.'
  },
  {
    id: 'm3',
    name: 'Veg Momos (6 Pcs)',
    price: 50,
    category: 'Momos',
    img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&q=80',
    description: '6 pieces of soft steamed dumplings stuffed with finely chopped seasoned fresh vegetables.'
  },
  {
    id: 'm4',
    name: 'Chicken Momos (6 Pcs)',
    price: 70,
    category: 'Momos',
    img: 'https://i.pinimg.com/736x/e8/35/ed/e835ed89023c2a6d2d1933321d59efc4.jpg',
    description: '6 pieces of steamed dumplings packed with juicy minced chicken & herbs, served with spicy dip.'
  },
  {
    id: 'm5',
    name: 'French Fries',
    price: 50,
    category: 'Sides',
    img: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&q=80',
    description: 'Golden crispy potato fries lightly seasoned with salt, served with tomato ketchup.'
  },
  {
    id: 'm6',
    name: 'Chicken Sandwich',
    price: 60,
    category: 'Sandwiches',
    img: 'https://tse3.mm.bing.net/th/id/OIP._Le9Tj-pFXLkhLRLcUWCxAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    description: 'Grilled sandwich stuffed with tender shredded chicken, melted cheese & house mayo.'
  },
  {
    id: 'm7',
    name: 'Veg Burger',
    price: 50,
    category: 'Burgers',
    img: 'https://wallpaperbat.com/img/379785-burger-hd-wallpaper-and-background-image.jpg',
    description: 'Crispy veggie patty burger topped with fresh lettuce, tomatoes, and creamy house mayo.'
  },
  {
    id: 'm8',
    name: 'Chicken Burger',
    price: 70,
    category: 'Burgers',
    img: 'https://t3.ftcdn.net/jpg/08/59/47/44/360_F_859474451_v0rlj2eDY7wUfbggHJ11AFqraHWWCduj.jpg',
    description: 'Golden fried crispy chicken patty burger layered with crisp lettuce and creamy mayo sauce.'
  },
  {
    id: 'm9',
    name: 'KFC Chicken 200 Grams',
    price: 160,
    category: 'Fried Chicken',
    img: 'https://www.thedailymeal.com/img/gallery/this-is-what-makes-kfcs-fried-chicken-so-good/l-intro-1699387963.jpg',
    description: '200 grams of super crunchy, hot & juicy fried chicken popcorn bites cooked to perfection.'
  },
  {
    id: 'm10',
    name: 'KFC Burger',
    price: 90,
    category: 'Burgers',
    img: 'https://manofmany.com/wp-content/uploads/2023/06/KFC-Tower-Burger.jpg',
    description: 'Signature extra crispy chicken fillet burger loaded with zesty sauce and crisp lettuce.'
  },
  {
    id: 'm11',
    name: 'Mojito Blue Berry',
    price: 60,
    category: 'Drinks',
    img: 'https://tse1.mm.bing.net/th/id/OIP.u1FyLYzlivJdnwx_zgo-iAHaHa?r=0&w=770&h=770&rs=1&pid=ImgDetMain&o=7&rm=3',
    description: 'Refreshing blueberry mojito mocktail infused with fresh mint leaves, lime juice & sparkling soda.'
  }
];

export default function Menu({ isHome = false, limit }) {
  const [items, setItems] = useState(OFFICIAL_MENU_ITEMS);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    const unsubscribe = listenToMenuItems(
      (firestoreItems) => {
        if (firestoreItems && firestoreItems.length > 0) {
          setItems(firestoreItems);
        } else {
          setItems(OFFICIAL_MENU_ITEMS);
        }
      },
      (err) => {
        console.error('Error fetching Firestore menu, using official defaults:', err);
        setItems(OFFICIAL_MENU_ITEMS);
      }
    );
    return () => unsubscribe();
  }, []);

  const categories = ['All', ...new Set(items.map(item => item.category))];

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const displayItems = limit ? filteredItems.slice(0, limit) : filteredItems;

  return (
    <section id="menu">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="section-label">Our Menu</div>
          <h2 className="section-title">Explore Our <span>Dishes</span></h2>
          <div className="section-divider" style={{ margin: '12px auto 0' }}></div>
        </div>

        {/* Search */}
        {!isHome && (
          <div className="menu-search">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search for a dish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Category Tabs */}
        {!isHome && (
          <div className="menu-tabs">
            {categories.map(cat => (
              <button
                key={cat}
                className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Food Cards Grid */}
        <div className="menu-cat">
          {displayItems.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: 'var(--text-muted)' }}>
                <Utensils size={40} />
              </div>
              <p>No dishes found. Try a different search.</p>
            </div>
          ) : (
            displayItems.map(item => (
              <div key={item.id} className="food-card">
                <div className="food-img-wrap">
                  <img src={item.img || item.imageUrl} alt={item.name} loading="lazy" />
                  <span className="food-badge">{item.category}</span>
                </div>
                <div className="food-info">
                  <div className="food-name">{item.name}</div>
                  <div className="food-desc">{item.description}</div>
                  <div className="food-footer">
                    <div className="food-price">₹{item.price}</div>
                    <button
                      className="order-btn"
                      onClick={() => addToCart(item)}
                    >
                      ADD
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {isHome && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/menu" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--primary)',
              color: 'white',
              padding: '12px 28px',
              borderRadius: 'var(--radius-full)',
              fontWeight: '600',
              textDecoration: 'none',
              boxShadow: 'var(--shadow-md)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            >
              Explore Full Menu
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
