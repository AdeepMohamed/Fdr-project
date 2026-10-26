import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Building, UserCheck, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Invalid login credentials. Please check your email and password.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (roleKey: 'admin' | 'official' | 'college1' | 'college2') => {
    setIsSubmitting(true);
    setError('');
    try {
      await switchDemoRole(roleKey);
      navigate('/');
    } catch (err: any) {
      setError('Failed to switch demo role. Ensure seed data is initialized.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: 'var(--bg-primary)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '480px', width: '100%', zIndex: 10 }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '4rem',
              height: '4rem',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 35px rgba(37,99,235,0.4)',
              marginBottom: '1rem',
            }}
          >
            <Shield size={32} />
          </div>
          <h1 className="heading-xl" style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>
            FDR SmartTrack
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
            Automated Fixed Deposit Receipt Repository, OCR Discrepancy Detection & Maturity Governance Portal
          </p>
        </div>

        {/* Login Box */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fb7185',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                marginBottom: '1.25rem',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="form-label">Official / Institutional Email</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="name@aicte.gov.in or institute.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Security Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick 1-Click Evaluation Logins */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.875rem',
                textAlign: 'center',
              }}
            >
              ⚡ Instant 1-Click Demo Evaluation Profiles
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem' }}>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.5rem', justifyContent: 'flex-start' }}
              >
                <Shield size={14} color="#3b82f6" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>AICTE Admin</div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Bureau Chief</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('official')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.5rem', justifyContent: 'flex-start' }}
              >
                <UserCheck size={14} color="#10b981" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>AICTE Official</div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Regional Officer</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('college1')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.5rem', justifyContent: 'flex-start' }}
              >
                <Building size={14} color="#f59e0b" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>Delhi Tech Inst</div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Institution User</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('college2')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.5rem', justifyContent: 'flex-start' }}
              >
                <Building size={14} color="#a855f7" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>MIT Pune</div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Institution User</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Security watermark footer */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Statutory Compliance Protected by 256-bit SSL & SHA-256 Audit Verification
        </div>
      </div>
    </div>
  );
};
