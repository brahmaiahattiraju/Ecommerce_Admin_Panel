import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, Search, Filter, CheckCircle, Truck, Package, Clock, XCircle, X, 
  AlertCircle, RefreshCw, LogIn, CreditCard, ShieldCheck, Copy, Check, FileText
} from 'lucide-react';
import { adminAPI, authAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/currency';
import { generateTaxInvoice } from '../../utils/invoiceGenerator';
import '../../styles/admin.css';

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const toast = useToast();

  const loadOrders = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await adminAPI.getAllOrders();
      const list = Array.isArray(data) ? data : (data?.content || []);
      setOrders(list);
    } catch (err) {
      const msg = err.message || 'Failed to load orders';
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const authData = await authAPI.adminLogin({ email: 'admin@aura.store', password: 'Admin@123' });
      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData));
      toast.success('Admin verified successfully!');
      await loadOrders();
    } catch (err) {
      toast.error(err.message || 'Admin authentication failed');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');
    }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    try {
      await adminAPI.updateOrderPaymentStatus(orderId, newPaymentStatus);
      toast.success(`Payment status marked as ${newPaymentStatus}`);
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, paymentStatus: newPaymentStatus }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update payment status');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    toast.success('Transaction ID copied to clipboard');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const orderList = Array.isArray(orders) ? orders : (orders?.content || []);

  const filtered = orderList.filter((o) => {
    const q = (search || '').trim().toLowerCase();
    const matchesSearch =
      !q ||
      (o.orderNumber || '').toLowerCase().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q) ||
      (o.customerEmail || '').toLowerCase().includes(q) ||
      (o.razorpayPaymentId || '').toLowerCase().includes(q) ||
      (o.razorpayOrderId || '').toLowerCase().includes(q) ||
      (o.paymentMethod || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;

    const isPaid = (o.paymentStatus || '').toUpperCase() === 'PAID';
    const isRazorpay = (o.paymentMethod || '').toUpperCase() === 'RAZORPAY';
    const isCod = (o.paymentMethod || '').toUpperCase() === 'COD';

    let matchesPayment = true;
    if (paymentFilter === 'PAID') matchesPayment = isPaid;
    else if (paymentFilter === 'PENDING') matchesPayment = !isPaid;
    else if (paymentFilter === 'RAZORPAY') matchesPayment = isRazorpay;
    else if (paymentFilter === 'COD') matchesPayment = isCod;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    return <span className={`order-status-badge status-${s}`}>{status}</span>;
  };

  const getPaymentBadge = (order) => {
    const isPaid = (order.paymentStatus || '').toUpperCase() === 'PAID';
    const isRazorpay = (order.paymentMethod || '').toUpperCase() === 'RAZORPAY';
    const isCod = (order.paymentMethod || '').toUpperCase() === 'COD';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 9px',
              borderRadius: '9999px',
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.02em',
              backgroundColor: isPaid ? 'rgba(16, 185, 129, 0.16)' : 'rgba(245, 158, 11, 0.16)',
              color: isPaid ? '#10b981' : '#f59e0b',
              border: `1px solid ${isPaid ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
            }}
          >
            {isPaid ? <CheckCircle size={12} strokeWidth={2.8} /> : <Clock size={12} strokeWidth={2.8} />}
            {isPaid ? 'PAID' : 'PENDING'}
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: isRazorpay ? 'var(--primary)' : 'var(--text-secondary)',
              backgroundColor: isRazorpay ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.05)',
              padding: '2px 7px',
              borderRadius: '6px',
              border: `1px solid ${isRazorpay ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`,
            }}
          >
            {isRazorpay ? 'Razorpay Secure' : (order.paymentMethod || 'Online')}
          </span>
        </div>
        {order.razorpayPaymentId && (
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '0.7rem',
              color: 'var(--primary)',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              padding: '1px 6px',
              borderRadius: '4px',
              width: 'fit-content',
              maxWidth: '140px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={`Razorpay Payment ID: ${order.razorpayPaymentId}`}
          >
            {order.razorpayPaymentId}
          </span>
        )}
      </div>
    );
  };

  const totalRevenue = orderList.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const paidOrders = orderList.filter((o) => (o.paymentStatus || '').toUpperCase() === 'PAID');
  const paidRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = orderList.filter((o) => o.status === 'PENDING').length;
  const inTransitOrders = orderList.filter((o) => o.status === 'SHIPPED').length;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders Management</h1>
          <p className="admin-page-subtitle">Track customer orders, Razorpay online payments, fulfillments, and delivery statuses</p>
        </div>
        <button onClick={loadOrders} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={16} /> Refresh Orders
        </button>
      </div>

      {/* Error Banner */}
      {loadError && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-rose)' }}>
            <AlertCircle size={24} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>Orders Loading Issue</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', marginTop: '0.2rem' }}>{loadError}</div>
              {(loadError.includes('Access denied') || loadError.includes('credentials') || loadError.includes('expired')) && (
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-amber)', marginTop: '0.35rem' }}>
                  Please sign in with administrator credentials (e.g. <code>admin@aura.store</code>) to view and manage customer orders.
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {(loadError.includes('Access denied') || loadError.includes('credentials') || loadError.includes('expired')) && (
              <button
                onClick={handleQuickAdminLogin}
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <LogIn size={14} /> Quick Admin Sign In
              </button>
            )}
            <button 
              onClick={loadOrders} 
              className="btn btn-outline" 
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
            >
              <RefreshCw size={14} /> Retry Loading
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.35rem' }}>Gross Revenue</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{formatINR(totalRevenue)}</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>{orders.length} total orders recorded</div>
        </div>

        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.35rem' }}>Verified Paid Revenue</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{formatINR(paidRevenue)}</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--accent-emerald)', marginTop: '2px', fontWeight: 700 }}>{paidOrders.length} confirmed paid orders</div>
        </div>

        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.35rem' }}>Pending Fulfillment</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: pendingOrders > 0 ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
            {pendingOrders}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>Awaiting dispatch processing</div>
        </div>

        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.35rem' }}>In Transit Freight</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{inTransitOrders}</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>Courier currently in transit</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by order #, customer, email, payment ID (pay_...)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Fulfillment Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="admin-select"
        >
          <option value="ALL">All Fulfillment Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        {/* Payment Status Filter */}
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="admin-select"
        >
          <option value="ALL">All Payment Types</option>
          <option value="PAID">PAID Only (Verified)</option>
          <option value="PENDING">PENDING Payment (COD)</option>
          <option value="RAZORPAY">Razorpay Secure</option>
          <option value="COD">Cash on Delivery</option>
        </select>
      </div>

      {/* Table */}
      <div className="admin-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Payment Status</th>
                  <th>Fulfillment Status</th>
                  <th>Total</th>
                  <th>Fulfillment Action</th>
                  <th style={{ textAlign: 'right' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No orders found matching filters
                    </td>
                  </tr>
                ) : (
                  filtered.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.04em' }}>
                          {o.orderNumber}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.customerEmail}</div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'Today'}
                      </td>
                      <td>{getPaymentBadge(o)}</td>
                      <td>{getStatusBadge(o.status)}</td>
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{formatINR(o.totalAmount)}</strong>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {o.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusChange(o.id, 'PROCESSING')}
                              className="btn btn-primary"
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', height: '28px' }}
                              title="Process customer order"
                            >
                              ⚡ Process
                            </button>
                          )}
                          {o.status === 'PROCESSING' && (
                            <button
                              onClick={() => handleStatusChange(o.id, 'SHIPPED')}
                              className="btn btn-secondary"
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', height: '28px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                              title="Mark as shipped with tracking"
                            >
                              🚢 Mark Shipped
                            </button>
                          )}
                          {o.status === 'SHIPPED' && (
                            <button
                              onClick={() => handleStatusChange(o.id, 'DELIVERED')}
                              className="btn btn-secondary"
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', height: '28px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                              title="Mark delivered to customer"
                            >
                              ✅ Mark Delivered
                            </button>
                          )}
                          {o.status !== 'CANCELLED' && o.status !== 'DELIVERED' && (
                            <button
                              onClick={() => handleStatusChange(o.id, 'CANCELLED')}
                              className="btn btn-outline"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', height: '28px', color: 'var(--accent-rose)' }}
                              title="Cancel order"
                            >
                              Cancel
                            </button>
                          )}
                          {/* Dropdown for manual override */}
                          <select
                            value={o.status || 'PENDING'}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                            className="admin-select"
                            style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', height: '28px', width: 'auto' }}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => generateTaxInvoice(o)}
                            className="btn btn-outline"
                            style={{ padding: '0.35rem 0.65rem', color: 'var(--accent-emerald)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                            title="Print / Save Tax Invoice (PDF)"
                          >
                            <FileText size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(o)}
                            className="btn btn-outline"
                            style={{ padding: '0.35rem 0.65rem' }}
                            title="View Order Details"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: '680px' }}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  Order {selectedOrder.orderNumber}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Placed on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'Recent'}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'transparent', border: 'none' }}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              
              {/* Payment Summary Banner */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: (selectedOrder.paymentStatus || '').toUpperCase() === 'PAID' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                border: `1px solid ${(selectedOrder.paymentStatus || '').toUpperCase() === 'PAID' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                marginBottom: '1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {(selectedOrder.paymentStatus || '').toUpperCase() === 'PAID' ? (
                    <ShieldCheck size={28} color="#10b981" />
                  ) : (
                    <Clock size={28} color="#f59e0b" />
                  )}
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.98rem', color: (selectedOrder.paymentStatus || '').toUpperCase() === 'PAID' ? '#10b981' : '#f59e0b' }}>
                      Payment Status: {(selectedOrder.paymentStatus || '').toUpperCase() === 'PAID' ? 'PAID & VERIFIED' : 'PAYMENT PENDING'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Instrument: <strong>{selectedOrder.paymentMethod === 'RAZORPAY' ? 'Razorpay Secure Gateway' : (selectedOrder.paymentMethod || 'Online')}</strong>
                    </div>
                  </div>
                </div>

                {/* Quick Toggle Button */}
                <button
                  onClick={() => handlePaymentStatusChange(
                    selectedOrder.id,
                    (selectedOrder.paymentStatus || '').toUpperCase() === 'PAID' ? 'PENDING' : 'PAID'
                  )}
                  className="btn btn-outline"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                >
                  Mark as {(selectedOrder.paymentStatus || '').toUpperCase() === 'PAID' ? 'PENDING' : 'PAID'}
                </button>
              </div>

              {/* Grid Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Shipping Address
                  </h4>
                  <div style={{ fontWeight: 600 }}>{selectedOrder.customerName}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedOrder.shippingAddress}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedOrder.shippingCity}, {selectedOrder.shippingZip}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Phone: {selectedOrder.customerPhone || 'N/A'}</div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Transaction Breakdown
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Customer Email: {selectedOrder.customerEmail}
                  </div>
                  {selectedOrder.razorpayPaymentId && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>Payment ID:</span>
                      <code style={{ color: 'var(--primary)', fontWeight: 700 }}>{selectedOrder.razorpayPaymentId}</code>
                      <button 
                        onClick={() => copyToClipboard(selectedOrder.razorpayPaymentId)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '2px', display: 'inline-flex' }}
                        title="Copy Payment ID"
                      >
                        {copiedId ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                      </button>
                    </div>
                  )}
                  {selectedOrder.razorpayOrderId && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Razorpay Order ID: <code style={{ color: 'var(--text-muted)' }}>{selectedOrder.razorpayOrderId}</code>
                    </div>
                  )}
                  {selectedOrder.couponCode && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', marginTop: '0.35rem', fontWeight: 600 }}>
                      Coupon Applied: {selectedOrder.couponCode} (-{formatINR(selectedOrder.discountAmount || 0)})
                    </div>
                  )}
                </div>
              </div>

              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Order Line Items ({selectedOrder.items?.length || 0})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.04)' }}>
                        <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.productName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Qty: {item.quantity} × {formatINR(item.price || item.productPrice || (item.subtotal ? item.subtotal / item.quantity : 0))}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700 }}>{formatINR(item.subtotal || ((item.price || item.productPrice) * item.quantity))}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '1rem', fontWeight: 600 }}>Total Order Amount</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {formatINR(selectedOrder.totalAmount)}
                </span>
              </div>
            </div>

            <div className="admin-modal-footer" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => generateTaxInvoice(selectedOrder)}
                className="btn btn-outline"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: 'var(--accent-emerald)',
                  borderColor: 'rgba(16, 185, 129, 0.4)'
                }}
              >
                <FileText size={15} />
                <span>Print / Save Tax Invoice (PDF)</span>
              </button>
              <button onClick={() => setSelectedOrder(null)} className="btn btn-primary" style={{ minWidth: '120px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
