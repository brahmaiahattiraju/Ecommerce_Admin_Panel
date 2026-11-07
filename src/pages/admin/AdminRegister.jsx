import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, Phone, KeyRound, ArrowRight, Zap, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authAPI } from '../../services/api';
import '../../styles/admin.css';

export default function AdminRegister() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    adminKey: 'AURA_ADMIN_2026',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error('Admin password must be at least 6 characters');
      return;
    }
    if (!formData.adminKey.trim()) {
      toast.error('Admin Security Authorization Key is required');
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.adminRegister(formData);
      login(data);
      toast.success(`Admin account created! Welcome, ${data.fullName}`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Administrator registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const prefillSample = () => {
    const randomId = Math.floor(100 + Math.random() * 900);
    setFormData({
      fullName: `Admin Manager ${randomId}`,
      email: `admin.${randomId}@aura.store`,
      password: 'Admin@123',
      phone: '+91 98450 ' + randomId + '0',
      adminKey: 'AURA_ADMIN_2026',
    });
  };

  const storeUrl = import.meta.env.VITE_STORE_URL || 'http://localhost:5173';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #090e17 0%, #111827 50%, #0d131f 100%)',
      padding: '2.5rem 1rem',
      position: 'relative',
    }}>
      {/* Subtle Glow Backdrop */}
      <div style={{
        position: 'absolute',
        top: '25%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '550px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(254, 189, 105, 0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: '520px',
        width: '100%',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '2.5rem 2.25rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(254, 189, 105, 0.08)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #febd69 0%, #f59e0b 100%)',
            color: '#0f1111',
            marginBottom: '1rem',
            boxShadow: '0 8px 20px rgba(254, 189, 105, 0.35)',
          }}>
            <ShieldCheck size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 0.4rem 0' }}>
            Aura Admin Studio
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
            Register New Administrator Account
          </p>
        </div>

        {/* Demo Auto-Fill Banner */}
        <div style={{
          background: 'rgba(254, 189, 105, 0.08)',
          border: '1px solid rgba(254, 189, 105, 0.25)',
          borderRadius: '8px',
          padding: '0.85rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#febd69', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
              ⚡ Quick Fill
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              Auto-generate administrator credentials
            </div>
          </div>
          <button
            type="button"
            onClick={prefillSample}
            style={{
              background: 'rgba(254, 189, 105, 0.18)',
              border: '1px solid rgba(254, 189, 105, 0.4)',
              color: '#febd69',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Zap size={13} />
            Fill Demo
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.4rem' }}>
              Full Legal Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Eleanor Vance"
                required
                style={{
                  width: '100%',
                  background: '#0b0f17',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '0.65rem 1rem 0.65rem 2.5rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.4rem' }}>
              Administrator Email *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@aura.store"
                required
                style={{
                  width: '100%',
                  background: '#0b0f17',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '0.65rem 1rem 0.65rem 2.5rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.4rem' }}>
                Password * (min 6)
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    background: '#0b0f17',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.4rem' }}>
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98450 00000"
                  style={{
                    width: '100%',
                    background: '#0b0f17',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#febd69', margin: 0 }}>
                Admin Authorization Key *
              </label>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Default: AURA_ADMIN_2026</span>
            </div>
            <div style={{ position: 'relative' }}>
              <KeyRound size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#febd69' }} />
              <input
                type="text"
                name="adminKey"
                value={formData.adminKey}
                onChange={handleChange}
                placeholder="AURA_ADMIN_2026"
                required
                style={{
                  width: '100%',
                  background: '#0b0f17',
                  border: '1px solid rgba(254, 189, 105, 0.4)',
                  borderRadius: '6px',
                  padding: '0.65rem 1rem 0.65rem 2.5rem',
                  color: '#febd69',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #ffd814 0%, #febd69 100%)',
              color: '#0f1111',
              border: 'none',
              borderRadius: '6px',
              padding: '0.85rem',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(254, 189, 105, 0.35)',
            }}
          >
            {loading ? 'Creating Administrator Account...' : 'Register as Administrator'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Existing Admin Login Link */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
          Already have an administrator account?{' '}
          <Link to="/login" style={{ color: '#febd69', fontWeight: 700, textDecoration: 'none' }}>
            Sign In here
          </Link>
        </div>

        {/* Security Notice & Store Link */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
            <ShieldCheck size={14} color="#10b981" /> 256-Bit SSL Encrypted Admin Portal
          </div>
          <div>
            <a
              href={storeUrl}
              style={{
                color: '#00a8e1',
                fontSize: '0.82rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: 600,
              }}
            >
              Return to Public Storefront <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
