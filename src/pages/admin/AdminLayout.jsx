import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Tag, ShoppingCart, Users, TicketPercent,
  LogOut, ExternalLink, Zap, Bell, Database, Cloud, ShieldCheck, ChevronRight,
  Menu, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin.css';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-close drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const storeUrl = import.meta.env.VITE_STORE_URL || 'http://localhost:5173';

  const navItems = [
    { to: '/dashboard', end: true, icon: LayoutDashboard, label: 'Dashboard', shortLabel: 'Home' },
    { to: '/products', icon: Package, label: 'Product Catalog', shortLabel: 'Products' },
    { to: '/categories', icon: Tag, label: 'Categories', shortLabel: 'Categories' },
    { to: '/orders', icon: ShoppingCart, label: 'Order Dispatch', shortLabel: 'Orders' },
    { to: '/coupons', icon: TicketPercent, label: 'Coupons & Promos', shortLabel: 'Coupons' },
    { to: '/users', icon: Users, label: 'User Directory', shortLabel: 'Users' },
  ];

  const currentNav = navItems.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  ) || navItems[0];

  return (
    <div className="admin-layout">
      {/* 1. Mobile Topbar (Sticky on Mobile/Tablet) */}
      <header className="admin-mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            className="admin-mobile-menu-trigger"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Admin Menu"
          >
            <Menu size={22} color="#ffffff" />
          </button>
          <div className="admin-brand-compact">
            <div className="brand-logo-icon-sm">
              <Zap size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em', lineHeight: 1.1 }} className="gradient-text">
                AURA STUDIO
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {currentNav.shortLabel || currentNav.label}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-mobile-store-pill"
            title="Open storefront"
          >
            <ExternalLink size={13} />
            <span>Store</span>
          </a>
          <button
            type="button"
            className="admin-mobile-avatar-btn"
            onClick={() => setMobileMenuOpen(true)}
            title="Account & Settings"
          >
            {user?.fullName?.charAt(0) || 'A'}
          </button>
        </div>
      </header>

      {/* 2. Slide-out Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <>
          <div 
            className="admin-drawer-backdrop" 
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation backdrop"
          />
          <aside className="admin-mobile-drawer">
            <div className="admin-mobile-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div className="brand-logo-icon">
                  <Zap size={18} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }} className="gradient-text">
                    AURA STUDIO
                  </div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Management Console
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="admin-drawer-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} color="#cbd5e1" />
              </button>
            </div>

            <div className="admin-mobile-drawer-content">
              <div className="admin-nav-section-title" style={{ padding: '0 0.5rem 0.5rem' }}>
                Core Modules
              </div>
              <nav className="admin-nav" style={{ padding: '0 0.25rem' }}>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={18} className="nav-icon" />
                      <span style={{ flex: 1, fontWeight: 600 }}>{item.label}</span>
                      <ChevronRight size={14} className="nav-arrow" />
                    </NavLink>
                  );
                })}
              </nav>

              {/* Infrastructure Status */}
              <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                  Infrastructure Status
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.74rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#cbd5e1' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Database size={13} color="var(--accent-emerald)" /> Railway MySQL
                    </span>
                    <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>Online</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#cbd5e1' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Cloud size={13} color="var(--primary)" /> Cloudinary CDN
                    </span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Connected</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-mobile-drawer-footer">
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-storefront-btn"
                style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem' }}
              >
                <ExternalLink size={15} />
                <span>Visit Storefront</span>
              </a>

              <div className="admin-user-profile-bar" style={{ padding: '0.65rem' }}>
                <div className="admin-avatar">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div className="admin-user-name" style={{ fontSize: '0.84rem' }}>
                    {user?.fullName || 'Administrator'}
                  </div>
                  <div className="admin-user-role" style={{ fontSize: '0.7rem' }}>Super Admin</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="admin-logout-btn"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* 3. Desktop Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="brand-logo-icon">
            <Zap size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1.15rem' }} className="gradient-text">
              AURA STUDIO
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Management Console
            </div>
          </div>
        </div>

        <div className="admin-nav-section-title">Core Management</div>
        <nav className="admin-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} className="nav-icon" />
                <span style={{ flex: 1 }}>{item.label}</span>
                <ChevronRight size={14} className="nav-arrow" />
              </NavLink>
            );
          })}
        </nav>

        {/* System Health Indicators */}
        <div className="admin-sidebar-status">
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.06em' }}>
            System Infrastructure
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Database size={13} color="var(--accent-emerald)" /> MySQL DB
              </span>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Active</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Cloud size={13} color="var(--primary)" /> Cloudinary
              </span>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Online</span>
            </div>
          </div>
        </div>

        <div className="admin-sidebar-footer">
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-storefront-btn"
            title="Open customer website in new tab"
          >
            <ExternalLink size={16} />
            <span>Visit Storefront</span>
          </a>

          <div className="admin-user-profile-bar">
            <div className="admin-avatar">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div className="admin-user-name">
                {user?.fullName || 'Administrator'}
              </div>
              <div className="admin-user-role">Super Admin</div>
            </div>
            <button
              onClick={handleLogout}
              className="admin-logout-btn"
              title="Logout from console"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* 4. Main Content Area */}
      <div className="admin-main-wrapper">
        {/* Desktop Top Header Bar */}
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Admin</span>
            <span style={{ color: 'var(--text-dim)' }}>/</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              {currentNav.label}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="status-live-pill">
              <span className="pulsing-dot"></span>
              <span>API Gateway Live (Port 8080)</span>
            </div>
            <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">
              <ExternalLink size={14} /> Open Store
            </a>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>

      {/* 5. Mobile Bottom Navigation Bar (Persistent 1-Tap Control) */}
      <nav className="admin-mobile-bottombar">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) => `admin-bottom-tab ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) => `admin-bottom-tab ${isActive ? 'active' : ''}`}
        >
          <Package size={20} />
          <span>Catalog</span>
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) => `admin-bottom-tab ${isActive ? 'active' : ''}`}
        >
          <ShoppingCart size={20} />
          <span>Orders</span>
        </NavLink>

        <NavLink
          to="/categories"
          className={({ isActive }) => `admin-bottom-tab ${isActive ? 'active' : ''}`}
        >
          <Tag size={20} />
          <span>Categories</span>
        </NavLink>

        <button
          type="button"
          className={`admin-bottom-tab ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          <Menu size={20} />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
