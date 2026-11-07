import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, Zap, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authAPI } from '../../services/api';
import '../../styles/admin.css';

export default function AdminLogin() {
  const [formData, setFormData] = useState({ email: 'admin@aura.store', password: 'Admin@123' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authAPI.login(formData);
      if (data.role !== 'ROLE_ADMIN') {
        throw new Error('Access denied. Administrator privileges required.');
      }
      login(data);
      toast.success(`Welcome to Admin Studio, ${data.fullName}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const storeUrl = import.meta.env.VITE_STORE_URL || 'http://localhost:5173';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #090e17 0%, #111827 50%, #0d131f 100%)',
      padding: '2rem 1rem',
      position: 'relative',
    }}>
      {/* Subtle Glow Backdrop */}
      <div style={{
        position: 'absolute',
        top: '25%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(254, 189, 105, 0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#131921',
        border: '1px solid rgba(254, 189, 105, 0.3)',
        borderRadius: '12px',
        padding: '2.5rem',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #febd69 0%, #f59e0b 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(254, 189, 105, 0.4)',
            marginBottom: '1rem',
          }}>
            <Zap size={26} color="#0f1111" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            Aura Admin Studio
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            Enterprise Commerce Management Console
          </p>
        </div>

        {/* Demo Quick-Fill Pill */}
        <div style={{
          background: 'rgba(254, 189, 105, 0.08)',
          border: '1px dashed rgba(254, 189, 105, 0.35)',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#febd69', fontWeight: 700, textTransform: 'uppercase' }}>
              ⚡ Demo Administrator
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              admin@aura.store • Admin@123
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ email: 'admin@aura.store', password: 'Admin@123' })}
            style={{
              background: '#febd69',
              color: '#0f1111',
              border: 'none',
              padding: '0.3rem 0.65rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Auto Fill
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.4rem' }}>
              Administrator Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
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
                  padding: '0.7rem 1rem 0.7rem 2.5rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.4rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                required
                style={{
                  width: '100%',
                  background: '#0b0f17',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '0.7rem 1rem 0.7rem 2.5rem',
                  color: '#ffffff',
                  fontSize: '0.9rem',
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
            {loading ? 'Authenticating...' : 'Sign In to Management Console'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Admin Registration Link */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
          Need to register a new administrator?{' '}
          <Link to="/register" style={{ color: '#febd69', fontWeight: 700, textDecoration: 'none' }}>
            Register here
          </Link>
        </div>

        {/* Security Notice & Store Link */}
        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
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
