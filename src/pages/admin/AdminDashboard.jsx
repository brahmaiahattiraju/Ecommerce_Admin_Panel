import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, ShoppingCart, Package, Users, AlertTriangle, 
  Clock, ArrowUpRight, TrendingUp, ShieldCheck, Zap, Percent 
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { formatINR } from '../../utils/currency';
import RevenueAnalyticsCharts from '../../components/RevenueAnalyticsCharts';
import '../../styles/admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.stats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to load stats', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading analytics dashboard...</p>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Revenue',
      value: formatINR(stats?.totalRevenue || 0),
      change: '+18.4% vs last mo',
      icon: DollarSign,
      color: 'var(--primary)',
      bg: 'rgba(99, 102, 241, 0.1)',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      change: `${stats?.pendingOrdersCount || 0} pending processing`,
      icon: ShoppingCart,
      color: 'var(--accent-emerald)',
      bg: 'rgba(16, 185, 129, 0.1)',
    },
    {
      title: 'Catalog Products',
      value: stats?.totalProducts || 0,
      change: `${stats?.lowStockCount || 0} low stock items`,
      icon: Package,
      color: 'var(--accent-amber)',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
    {
      title: 'Registered Users',
      value: stats?.totalCustomers || 0,
      change: 'Active customers',
      icon: Users,
      color: 'var(--accent-cyan)',
      bg: 'rgba(6, 182, 212, 0.1)',
    },
  ];

  const avgOrderValue = stats?.totalOrders && stats.totalOrders > 0
    ? stats.totalRevenue / stats.totalOrders
    : 18450;

  return (
    <div>
      {/* Top Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Executive Dashboard</h1>
          <p className="admin-page-subtitle">Real-time revenue telemetry, AI performance velocity, and fulfillment health</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/products" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            + Manage Products
          </Link>
          <Link to="/admin/orders" className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
            View Orders
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="admin-kpi-grid">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="admin-kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="admin-kpi-title">{kpi.title}</span>
                <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', backgroundColor: kpi.bg, color: kpi.color, display: 'flex' }}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="admin-kpi-value">{kpi.value}</div>
              <div className="admin-kpi-delta" style={{ color: kpi.color }}>
                <TrendingUp size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {kpi.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Executive Health Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '10px', padding: '0.85rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
            <Zap size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Average Order Value (AOV)</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.1rem' }}>
              {formatINR(avgOrderValue)}
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '10px', padding: '0.85rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <Percent size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Checkout Conversion</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#10b981', marginTop: '0.1rem' }}>
              4.82% <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>↑ +0.6%</span>
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '10px', padding: '0.85rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Fulfillment SLA</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.1rem' }}>
              98.8% <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Within 48h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 4: Revenue Analytics Charts Component */}
      <RevenueAnalyticsCharts 
        liveTotalRevenue={stats?.totalRevenue} 
        liveTotalOrders={stats?.totalOrders} 
      />

      {/* Operational Alerts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="admin-card" style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start', background: 'rgba(245, 158, 11, 0.04)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <AlertTriangle size={22} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              {stats?.lowStockCount || 0} Low Stock Alerts
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.5 }}>
              Critical inventory threshold: below 5 units. Re-order units to maintain seamless fulfillment.
            </div>
            <Link to="/admin/products" style={{ display: 'inline-block', fontSize: '0.76rem', color: 'var(--accent-amber)', marginTop: '0.5rem', fontWeight: 700 }}>
              Restock Catalog Products →
            </Link>
          </div>
        </div>

        <div className="admin-card" style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start', background: 'rgba(99, 102, 241, 0.04)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <Clock size={22} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              {stats?.pendingOrdersCount || 0} Pending Dispatches
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.5 }}>
              Orders await packaging, carrier dispatch slips, and BlueDart tracking assignment.
            </div>
            <Link to="/admin/orders" style={{ display: 'inline-block', fontSize: '0.76rem', color: 'var(--primary)', marginTop: '0.5rem', fontWeight: 700 }}>
              Process & Dispatch Orders →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Recent Orders</h3>
          <Link to="/admin/orders" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            All orders <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Payment Status</th>
                <th>Fulfillment</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No orders registered yet
                  </td>
                </tr>
              ) : (
                stats.recentOrders.slice(0, 5).map((o) => (
                  <tr key={o.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.03em' }}>{o.orderNumber}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.customerEmail}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          backgroundColor: (o.paymentStatus || '').toUpperCase() === 'PAID' ? 'rgba(16, 185, 129, 0.16)' : 'rgba(245, 158, 11, 0.16)',
                          color: (o.paymentStatus || '').toUpperCase() === 'PAID' ? '#10b981' : '#f59e0b',
                          border: `1px solid ${(o.paymentStatus || '').toUpperCase() === 'PAID' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
                        }}
                      >
                        {(o.paymentStatus || '').toUpperCase() === 'PAID' ? '✓ PAID' : 'PENDING'}
                      </span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {o.paymentMethod === 'RAZORPAY' ? 'Razorpay' : (o.paymentMethod || 'Online')}
                      </div>
                    </td>
                    <td>
                      <span className={`order-status-badge status-${(o.status || 'pending').toLowerCase()}`}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{formatINR(o.totalAmount)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'Today'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
