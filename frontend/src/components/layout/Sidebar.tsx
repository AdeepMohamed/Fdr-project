import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Database,
  PlusCircle,
  ShieldCheck,
  CalendarClock,
  RefreshCw,
  LogOut,
  FileSpreadsheet,
  History,
  BarChart3,
  Building2,
  FileCheck2,
  Tv,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isOfficialOrAdmin = user?.role === 'admin' || user?.role === 'official';

  const navItems = [
    { label: 'Overview', path: '/', icon: <LayoutDashboard size={18} /> },
    { label: 'Live Demo (5m Tour)', path: '/live-demo', icon: <Tv size={18} />, highlight: true },
    { label: 'FDR Repository', path: '/fdrs', icon: <Database size={18} /> },
    { label: 'Submit Deposit', path: '/fdrs/new', icon: <PlusCircle size={18} /> },
    ...(isOfficialOrAdmin
      ? [{ label: 'Verification Queue', path: '/verifications', icon: <ShieldCheck size={18} />, highlight: true }]
      : []),
    { label: 'Maturity Alerts', path: '/maturities', icon: <CalendarClock size={18} /> },
    { label: 'Renewal Lineage', path: '/renewals', icon: <RefreshCw size={18} /> },
    { label: 'Release Requests', path: '/releases', icon: <FileCheck2 size={18} /> },
    { label: 'Audit Trail', path: '/audit', icon: <History size={18} /> },
    { label: 'Reports & Export', path: '/reports', icon: <BarChart3 size={18} /> },
  ];

  return (
    <aside
      style={{
        width: '260px',
        borderRight: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem 0.875rem',
        minHeight: 'calc(100vh - 4rem)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <div
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '0.5rem 0.75rem',
            marginBottom: '0.25rem',
          }}
        >
          Management Console
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive
                ? '#ffffff'
                : item.highlight
                ? 'var(--accent-amber)'
                : 'var(--text-secondary)',
              backgroundColor: isActive
                ? 'var(--primary-600)'
                : item.highlight
                ? 'rgba(245, 158, 11, 0.08)'
                : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Institution / Regulatory Information Badge */}
      <div
        style={{
          marginTop: 'auto',
          padding: '0.875rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
          <Building2 size={16} color="var(--primary-500)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {isOfficialOrAdmin ? 'AICTE Central HQ' : 'Affiliated Institute'}
          </span>
        </div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {isOfficialOrAdmin
            ? 'Statutory Regulatory Authority for Technical Education'
            : user?.email.includes('delhi')
            ? 'Delhi Inst of Tech (AICTE-1-10294821)'
            : 'MIT Pune (AICTE-1-39482012)'}
        </div>
        <div
          style={{
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.6875rem',
            color: 'var(--status-verified-text)',
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '9999px',
              backgroundColor: 'var(--status-verified-text)',
              display: 'inline-block',
            }}
          />
          System Active (v2.4 SEC-TRACK)
        </div>
      </div>
    </aside>
  );
};
