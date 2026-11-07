import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, Search, User, LogOut, LayoutDashboard, 
  Menu, X, MapPin, ChevronDown, Sparkles, Package, ShieldCheck, Check
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { categoryAPI } from '../services/api';
import { formatINR } from '../utils/currency';
import '../styles/store.css';

export default function Navbar({ onCartOpen }) {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount, subtotal } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryAPI.list()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.content || []);
        setCategories(list);
      })
      .catch((err) => console.error('Failed to load nav categories', err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (selectedCategory && selectedCategory !== 'ALL') params.set('category', selectedCategory);
    navigate(`/shop?${params.toString()}`);
  };

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/');
  };

  return (
    <header className="navbar-wrapper">
      {/* 1. Amazon Top Announcement Bar */}
      <div className="announcement-bar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: '#febd69', fontWeight: 700 }}>⚡ PRIME SUPER VALUE SALE:</span>
            <span>Up to 60% off Mobiles, Electronics & Audio + Extra 10% Instant Bank Discount</span>
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', color: '#94a3b8' }}>
            <Link to="/shop?category=mobiles" style={{ color: '#febd69', fontWeight: 700 }}>📱 5G Mobiles Fest</Link>
            <Link to="/shop?sort=price_asc" style={{ color: '#febd69' }}>Today's Deals</Link>
            <span>Customer Service</span>
          </div>
        </div>
      </div>

      {/* 2. Main Amazon Navigation Bar (#131921) */}
      <nav className="navbar">
        <div className="container">
          <div className="navbar-inner">
            
            {/* Amazon-style Brand Logo */}
            <Link to="/" className="brand-logo" title="AURA - Amazon Style Store">
              <div className="brand-icon-box">
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#111827' }}>a</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                  <span className="brand-text">aura</span>
                  <span style={{ color: '#febd69', fontSize: '0.85rem', fontWeight: 700 }}>.in</span>
                </div>
                <span className="brand-subtext">PRIME SHOP</span>
              </div>
            </Link>

            {/* Deliver-To Location Pin */}
            <div className="nav-location-btn" title="Delivery location: Bengaluru 560001">
              <MapPin size={18} color="#febd69" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div className="nav-location-texts">
                <span className="nav-location-label">Deliver to {user?.fullName?.split(' ')[0] || 'Guest'}</span>
                <span className="nav-location-val">Bengaluru 560001</span>
              </div>
            </div>

            {/* Smart 3-Segment Amazon Search Bar */}
            <form onSubmit={handleSearch} className="nav-search-bar">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="nav-search-category-select"
                aria-label="Select Category"
              >
                <option value="ALL">All Departments</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug || c.id}>{c.name}</option>
                ))}
              </select>

              <div className="nav-search-input-wrap">
                <input
                  type="text"
                  placeholder="Search Amazon style catalog (100+ curated products across 5 categories)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <button type="submit" className="nav-search-btn" title="Search">
                <Search size={20} color="#0f1111" strokeWidth={2.4} />
              </button>
            </form>

            {/* Nav Actions: Language, Account, Orders, Cart */}
            <div className="nav-actions">
              {/* Region Pill */}
              <div className="nav-account-btn" style={{ padding: '0.35rem 0.5rem', cursor: 'default' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  🇮🇳 EN
                </span>
              </div>

              {/* Account & Lists */}
              {isAuthenticated ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Link to={isAdmin ? "/admin" : "/account"} className="nav-account-btn">
                    <span className="nav-account-sub">Hello, {user?.fullName?.split(' ')[0] || 'User'}</span>
                    <span className="nav-account-title">
                      {isAdmin ? 'Admin Studio' : 'Account & Lists'} <ChevronDown size={12} />
                    </span>
                  </Link>

                  <button 
                    onClick={handleLogout} 
                    className="nav-account-btn" 
                    title="Sign Out"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <span className="nav-account-sub">Exit</span>
                    <span className="nav-account-title"><LogOut size={14} /></span>
                  </button>
                </div>
              ) : (
                <Link to="/login" className="nav-account-btn">
                  <span className="nav-account-sub">Hello, sign in</span>
                  <span className="nav-account-title">Account & Lists <ChevronDown size={12} /></span>
                </Link>
              )}

              {/* Returns & Orders */}
              <Link to={isAuthenticated ? "/account" : "/login"} className="nav-account-btn">
                <span className="nav-account-sub">Returns</span>
                <span className="nav-account-title">& Orders</span>
              </Link>

              {/* Amazon Shopping Cart */}
              <button 
                className="nav-cart-trigger" 
                onClick={onCartOpen} 
                title="View Shopping Cart" 
                id="cart-toggle-btn"
              >
                <div className="cart-icon-wrapper">
                  <ShoppingCart size={30} color="#ffffff" strokeWidth={2} />
                  <span className="cart-badge">{itemCount}</span>
                </div>
                <div className="nav-cart-meta">
                  <span className="nav-cart-label">Cart</span>
                  <span className="nav-cart-subtotal">{formatINR(subtotal)}</span>
                </div>
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* 3. Amazon Sub-Navbar (#232f3e) */}
      <div className="sub-navbar">
        <div className="container">
          <div className="sub-nav-inner">
            <NavLink to="/shop" className={({ isActive }) => `sub-nav-item ${isActive && !location.search ? 'active' : ''}`}>
              <Menu size={16} /> <strong>All</strong>
            </NavLink>
            <NavLink to="/shop?sort=price_asc" className="sub-nav-item">
              Today's Deals
            </NavLink>
            <NavLink to="/shop?minRating=4" className="sub-nav-item">
              Customer Service
            </NavLink>
            {categories.map((cat) => {
              const active = location.pathname === '/shop' && location.search.includes(cat.slug || cat.id);
              return (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.slug || cat.id}`}
                  className={`sub-nav-item ${active ? 'active' : ''}`}
                >
                  {cat.name}
                </Link>
              );
            })}
            {isAdmin && (
              <Link to="/admin" className="sub-nav-item" style={{ color: '#febd69', marginLeft: 'auto', fontWeight: 700 }}>
                <LayoutDashboard size={14} /> Admin Studio
              </Link>
            )}
            <Link to="/shop?sort=rating,desc" className="sub-nav-item" style={{ color: '#febd69', marginLeft: isAdmin ? '0' : 'auto', fontWeight: 600 }}>
              <Sparkles size={14} /> Prime Day: Up to 50% Off
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
