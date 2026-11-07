import { useState, useEffect } from 'react';
import { 
  TicketPercent, Plus, Edit2, Trash2, CheckCircle2, XCircle, 
  Copy, Check, Clock, Calendar, Percent, IndianRupee, Search, 
  Filter, AlertCircle, RefreshCw, X 
} from 'lucide-react';
import { couponAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import '../../styles/admin.css';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedCode, setCopiedCode] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
    active: true,
  });

  const toast = useToast();

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await couponAPI.getAll();
      setCoupons(data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      usageLimit: '',
      startDate: '',
      endDate: '',
      active: true,
    });
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code || '',
      description: c.description || '',
      discountType: c.discountType || 'PERCENTAGE',
      discountValue: c.discountValue ?? '',
      minOrderAmount: c.minOrderAmount ?? '',
      maxDiscountAmount: c.maxDiscountAmount ?? '',
      usageLimit: c.usageLimit ?? '',
      startDate: c.startDate ? c.startDate.slice(0, 16) : '',
      endDate: c.endDate ? c.endDate.slice(0, 16) : '',
      active: c.active ?? true,
    });
    setModalOpen(true);
  };

  const handleToggle = async (id) => {
    try {
      const updated = await couponAPI.toggle(id);
      setCoupons((prev) => prev.map((c) => (c.id === id ? updated : c)));
      toast.success(`Coupon ${updated.code} is now ${updated.active ? 'Active' : 'Inactive'}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update coupon status');
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to permanently delete coupon "${code}"?`)) {
      return;
    }
    try {
      await couponAPI.delete(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success(`Coupon "${code}" deleted successfully`);
    } catch (err) {
      toast.error(err.message || 'Failed to delete coupon');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      toast.error('Please enter a valid discount value greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : 0,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : null,
        startDate: formData.startDate ? formData.startDate + ':00' : null,
        endDate: formData.endDate ? formData.endDate + ':00' : null,
        active: formData.active,
      };

      if (editingCoupon) {
        const res = await couponAPI.update(editingCoupon.id, payload);
        setCoupons((prev) => prev.map((c) => (c.id === editingCoupon.id ? res : c)));
        toast.success(`Coupon ${res.code} updated successfully`);
      } else {
        const res = await couponAPI.create(payload);
        setCoupons((prev) => [res, ...prev]);
        toast.success(`Coupon ${res.code} created successfully`);
      }

      setModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save coupon');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered list
  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'ACTIVE') return c.active && !c.expired;
    if (statusFilter === 'INACTIVE') return !c.active;
    if (statusFilter === 'EXPIRED') return c.expired;
    return true;
  });

  // KPI Metrics
  const totalCount = coupons.length;
  const activeCount = coupons.filter((c) => c.active && !c.expired).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  return (
    <div className="admin-page-container">
      {/* Top Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <TicketPercent size={28} color="var(--primary)" />
            Promotional Coupons & Vouchers
          </h1>
          <p className="admin-page-subtitle">
            Configure discount campaigns, percentage incentives, and flat vouchers for storefront customers.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadCoupons} className="btn btn-outline" title="Refresh">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={openCreate} className="btn btn-primary" id="create-coupon-btn">
            <Plus size={18} /> Create New Coupon
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '2rem' }}>
        <div className="admin-stat-card">
          <div className="stat-label">Total Coupons</div>
          <div className="stat-value">{totalCount}</div>
          <div className="stat-hint">Active and archived promos</div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-label">Active Campaigns</div>
          <div className="stat-value" style={{ color: 'var(--accent-emerald, #10b981)' }}>
            {activeCount}
          </div>
          <div className="stat-hint">Available for instant checkout redemption</div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-label">Total Redemptions</div>
          <div className="stat-value" style={{ color: 'var(--primary, #6366f1)' }}>
            {totalRedemptions}
          </div>
          <div className="stat-hint">Applied across completed customer orders</div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-label">System Gateway</div>
          <div className="stat-value" style={{ fontSize: '1.25rem', color: '#38bdf8' }}>
            Port 8080
          </div>
          <div className="stat-hint">Real-time discount engine active</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="admin-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search coupons by code or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} color="var(--text-muted)" />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Status:</span>
            {['ALL', 'ACTIVE', 'INACTIVE', 'EXPIRED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: statusFilter === status ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                  color: statusFilter === status ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease',
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Coupons Table / Grid */}
      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
            Loading promotional coupons...
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Coupons Found</h3>
            <p style={{ maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.88rem' }}>
              {searchTerm || statusFilter !== 'ALL'
                ? 'No promotional coupons match your search and filter criteria.'
                : 'No promotional coupons have been created yet. Launch your first campaign!'}
            </p>
            <button onClick={openCreate} className="btn btn-primary">
              <Plus size={16} /> Create Coupon
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Coupon Code</th>
                  <th>Discount Type</th>
                  <th>Discount Value</th>
                  <th>Min Order</th>
                  <th>Usage / Cap</th>
                  <th>Validity</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((c) => {
                  const isPct = c.discountType === 'PERCENTAGE';
                  return (
                    <tr key={c.id}>
                      {/* Code */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              fontSize: '0.95rem',
                              letterSpacing: '0.05em',
                              padding: '0.25rem 0.6rem',
                              background: 'rgba(99, 102, 241, 0.15)',
                              border: '1px dashed rgba(99, 102, 241, 0.4)',
                              borderRadius: '6px',
                              color: '#a5b4fc',
                            }}
                          >
                            {c.code}
                          </span>
                          <button
                            onClick={() => handleCopy(c.code)}
                            title="Copy code"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: copiedCode === c.code ? 'var(--accent-emerald)' : 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '2px',
                            }}
                          >
                            {copiedCode === c.code ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                        {c.description && (
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '240px' }}>
                            {c.description}
                          </div>
                        )}
                      </td>

                      {/* Type */}
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '9999px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            background: isPct ? 'rgba(168, 85, 247, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                            color: isPct ? '#c084fc' : '#7dd3fc',
                          }}
                        >
                          {isPct ? <Percent size={11} /> : <IndianRupee size={11} />}
                          {isPct ? 'Percentage' : 'Flat Amount'}
                        </span>
                      </td>

                      {/* Value */}
                      <td>
                        <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                          {isPct ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                        </div>
                        {isPct && c.maxDiscountAmount && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Max ₹{c.maxDiscountAmount}
                          </div>
                        )}
                      </td>

                      {/* Min Order */}
                      <td>
                        <span style={{ fontSize: '0.86rem', color: c.minOrderAmount > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {c.minOrderAmount > 0 ? `₹${c.minOrderAmount}` : 'No minimum'}
                        </span>
                      </td>

                      {/* Usage */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                            {c.usedCount} used {c.usageLimit ? `/ ${c.usageLimit} max` : '(Unlimited)'}
                          </span>
                          {c.usageLimit && (
                            <div style={{ width: '90px', height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${Math.min(100, Math.round((c.usedCount / c.usageLimit) * 100))}%`,
                                  height: '100%',
                                  background: c.usedCount >= c.usageLimit ? '#ef4444' : 'var(--primary)',
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Validity */}
                      <td>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {c.endDate ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: c.expired ? '#ef4444' : 'var(--text-secondary)' }}>
                              <Calendar size={13} />
                              <span>Until {new Date(c.endDate).toLocaleDateString()}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Never Expires</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <button
                          onClick={() => handleToggle(c.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '9999px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            background: c.expired
                              ? 'rgba(239, 68, 68, 0.15)'
                              : c.active
                              ? 'rgba(16, 185, 129, 0.15)'
                              : 'rgba(255, 255, 255, 0.08)',
                            color: c.expired
                              ? '#f87171'
                              : c.active
                              ? 'var(--accent-emerald)'
                              : 'var(--text-muted)',
                            transition: 'all 0.2s ease',
                          }}
                          title="Click to toggle active status"
                        >
                          {c.expired ? (
                            <>
                              <Clock size={12} /> Expired
                            </>
                          ) : c.active ? (
                            <>
                              <CheckCircle2 size={12} /> Active
                            </>
                          ) : (
                            <>
                              <XCircle size={12} /> Paused
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.45rem' }}>
                          <button
                            onClick={() => openEdit(c)}
                            className="btn btn-sm btn-outline"
                            title="Edit Coupon"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, c.code)}
                            className="btn btn-sm btn-outline"
                            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                            title="Delete Coupon"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Coupon */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '580px', width: '92%' }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TicketPercent size={20} color="var(--primary)" />
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promotional Coupon'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.25rem' }}>
              
              {/* Row 1: Code and Discount Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    Coupon Code <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUMMER25"
                    value={formData.code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Discount Type <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, discountType: e.target.value }))}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description / Customer Teaser</label>
                <input
                  type="text"
                  placeholder="e.g. 15% instant savings on orders above ₹1,999"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Row 2: Value, Min Order, Max Cap */}
              <div style={{ display: 'grid', gridTemplateColumns: formData.discountType === 'PERCENTAGE' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    Discount Value {formData.discountType === 'PERCENTAGE' ? '(%)' : '(₹)'} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder={formData.discountType === 'PERCENTAGE' ? '15' : '500'}
                    value={formData.discountValue}
                    onChange={(e) => setFormData((prev) => ({ ...prev, discountValue: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Min Order (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, minOrderAmount: e.target.value }))}
                  />
                </div>

                {formData.discountType === 'PERCENTAGE' && (
                  <div className="form-group">
                    <label className="form-label">Max Cap (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Optional limit"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, maxDiscountAmount: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              {/* Row 3: Usage Limit and Validity */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Total Redemptions Limit</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Leave empty for unlimited"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData((prev) => ({ ...prev, usageLimit: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expiration Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Status Switch */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-md)' }}>
                <input
                  type="checkbox"
                  id="coupon-active-check"
                  checked={formData.active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, active: e.target.checked }))}
                  style={{ accentColor: 'var(--primary)', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="coupon-active-check" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Publish coupon as Active immediately
                </label>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-outline"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving Coupon...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
