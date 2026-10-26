import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  Sun,
  Moon,
  LogOut,
  Shield,
  Building,
  UserCheck,
  CheckCircle,
  ExternalLink,
  Tv,
} from 'lucide-react';
import { notificationsApi } from '../../services/api';
import { Notification } from '../../types';
import { Link } from 'react-router-dom';
import { useTour } from '../../context/TourContext';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoRole, theme, toggleTheme } = useAuth();
  const { isTourActive, startLiveAppTour, stopTour } = useTour();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);

  const fetchNotifications = async () => {
    try {
      const data = await notificationsApi.list();
      setNotifications(data.slice(0, 6));
      const countRes = await notificationsApi.getCount();
      setUnreadCount(countRes.unread_count);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRoleChange = async (roleKey: 'admin' | 'official' | 'college1' | 'college2') => {
    setIsSwitching(true);
    try {
      await switchDemoRole(roleKey);
    } finally {
      setIsSwitching(false);
    }
  };

  const getRoleLabel = () => {
    if (user?.role === 'admin') return { label: 'Bureau Admin', icon: <Shield size={14} /> };
    if (user?.role === 'official') return { label: 'AICTE Officer', icon: <UserCheck size={14} /> };
    return { label: 'Institution Rep', icon: <Building size={14} /> };
  };

  const roleInfo = getRoleLabel();

  return (
    <header
      style={{
        height: '4rem',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Brand & Emblem */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <div
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.125rem',
            boxShadow: '0 0 15px rgba(37,99,235,0.4)',
          }}
        >
          ST
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              FDR SmartTrack
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                color: '#3b82f6',
                padding: '0.125rem 0.5rem',
                borderRadius: '9999px',
                border: '1px solid rgba(37, 99, 235, 0.3)',
              }}
            >
              AICTE Compliance
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Regulatory Security Deposit & Maturity Governance
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Play Live Application Tour Button */}
        <button
          onClick={() => {
            if (isTourActive) {
              stopTour();
            } else {
              startLiveAppTour(1);
            }
          }}
          className="live-demo-nav-btn"
          style={{
            background: isTourActive
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.35), rgba(244, 63, 94, 0.45))'
              : 'linear-gradient(135deg, #1d4ed8, #0284c7)',
            borderColor: isTourActive ? '#ef4444' : '#38bdf8',
            boxShadow: isTourActive ? '0 0 20px rgba(239, 68, 68, 0.5)' : '0 0 20px rgba(56, 189, 248, 0.4)',
          }}
          title={isTourActive ? 'Stop Live Application Tour' : 'Play Live 5-Minute Tour across Real App Pages'}
        >
          <span className="live-badge-dot" />
          <Tv size={15} />
          <span>{isTourActive ? 'Exit Live Tour' : 'Play Live App Tour (5m)'}</span>
        </button>

        {/* Video Presentation Studio Link */}
        <Link
          to="/live-demo"
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            padding: '0.35rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-elevated)',
            fontWeight: 600,
          }}
          title="Open Video Studio Presentation"
        >
          Video Studio
        </Link>

        {/* Quick Demo Role Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            backgroundColor: 'var(--bg-input)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0 0.5rem' }}>
            DEMO ROLE:
          </span>
          <button
            onClick={() => handleRoleChange('admin')}
            disabled={isSwitching}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: user?.email === 'admin@aicte.gov.in' ? 'var(--primary-600)' : 'transparent',
              color: user?.email === 'admin@aicte.gov.in' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            Admin
          </button>
          <button
            onClick={() => handleRoleChange('official')}
            disabled={isSwitching}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: user?.email === 'official@aicte.gov.in' ? 'var(--primary-600)' : 'transparent',
              color: user?.email === 'official@aicte.gov.in' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            Official
          </button>
          <button
            onClick={() => handleRoleChange('college1')}
            disabled={isSwitching}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: user?.email === 'director@delhitech.edu.in' ? 'var(--primary-600)' : 'transparent',
              color: user?.email === 'director@delhitech.edu.in' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            College 1
          </button>
          <button
            onClick={() => handleRoleChange('college2')}
            disabled={isSwitching}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: user?.email === 'principal@mitpune.edu.in' ? 'var(--primary-600)' : 'transparent',
              color: user?.email === 'principal@mitpune.edu.in' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            College 2
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Dark/Light Mode"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--accent-rose)',
                  color: '#ffffff',
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--bg-surface)',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                right: 0,
                width: '360px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 200,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '0.875rem 1rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Notifications</div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.75rem',
                      color: 'var(--primary-500)',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    No notifications right now
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '0.875rem 1rem',
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: n.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.25rem', color: n.is_read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.375rem', lineHeight: 1.4 }}>
                        {n.message}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                        {n.related_fdr && (
                          <Link
                            to={`/fdrs/${n.related_fdr}`}
                            onClick={() => setShowNotifications(false)}
                            style={{ fontSize: '0.6875rem', color: 'var(--primary-500)', textDecoration: 'none', fontWeight: 600 }}
                          >
                            View FDR &rarr;
                          </Link>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {user?.first_name} {user?.last_name}
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: 'var(--primary-500)',
              }}
            >
              {roleInfo.icon}
              {roleInfo.label}
            </div>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem',
              color: 'var(--accent-rose)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
