import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Tag, ShoppingCart, Users, TicketPercent,
  LogOut, ExternalLink, Zap, Bell, Database, Cloud, ShieldCheck, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin.css';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const storeUrl = import.meta.env.VITE_STORE_URL || 'http://localhost:5173';

  const navItems = [
    { to: '/dashboard', end: true, icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/products', icon: Package, label: 'Product Catalog' },
    { to: '/categories', icon: Tag, label: 'Categories' },
    { to: '/orders', icon: ShoppingCart, label: 'Order Dispatch' },
    { to: '/coupons', icon: TicketPercent, label: 'Coupons & Promos' },
    { to: '/users', icon: Users, label: 'User Directory' },
  ];

  const currentNav = navItems.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  ) || navItems[0];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
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

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        {/* Admin Top Header Bar */}
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
    </div>
  );
}
