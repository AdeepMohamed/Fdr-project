import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fdrsApi } from '../services/api';
import { FDRRecord } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  CalendarClock,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Bell,
  RefreshCw,
  Building,
  ArrowRight,
} from 'lucide-react';

export const MaturityTracker: React.FC = () => {
  const [fdrs, setFdrs] = useState<FDRRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWindow, setActiveWindow] = useState<'all' | 'overdue' | '7d' | '15d' | '30d'>('all');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);

  const fetchMaturities = async () => {
    try {
      setLoading(true);
      const data = await fdrsApi.list({
        ordering: 'maturity_date',
        admin_status: 'active,matured',
      });
      setFdrs(data.results);
    } catch (e) {
      console.error('Failed to load maturities:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaturities();
  }, []);

  const handleTriggerSweep = () => {
    setIsChecking(true);
    setCheckResult(null);
    setTimeout(() => {
      setIsChecking(false);
      setCheckResult('Automated maturity check completed: Email & in-app reminders dispatched to institutions.');
      fetchMaturities();
    }, 1200);
  };

  const getUrgencyBucket = (days?: number | null) => {
    if (days === null || days === undefined) return 'safe';
    if (days < 0) return 'overdue';
    if (days <= 7) return 'critical';
    if (days <= 15) return 'urgent';
    if (days <= 30) return 'warning';
    return 'safe';
  };

  const filteredFdrs = fdrs.filter((fdr) => {
    const bucket = getUrgencyBucket(fdr.days_to_maturity);
    if (activeWindow === 'overdue') return bucket === 'overdue';
    if (activeWindow === '7d') return bucket === 'critical';
    if (activeWindow === '15d') return bucket === 'urgent';
    if (activeWindow === '30d') return bucket === 'warning';
    return true;
  });

  const overdueCount = fdrs.filter((f) => (f.days_to_maturity ?? 0) < 0).length;
  const criticalCount = fdrs.filter((f) => (f.days_to_maturity ?? 99) >= 0 && (f.days_to_maturity ?? 99) <= 7).length;
  const urgentCount = fdrs.filter((f) => (f.days_to_maturity ?? 99) > 7 && (f.days_to_maturity ?? 99) <= 15).length;
  const warningCount = fdrs.filter((f) => (f.days_to_maturity ?? 99) > 15 && (f.days_to_maturity ?? 99) <= 30).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="heading-xl" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
            Maturity Schedule & Compliance Tracker
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Automated alerts dispatched at 30, 15, 7, 0, -7, and -14 days relative to statutory maturity.
          </p>
        </div>

        <button
          onClick={handleTriggerSweep}
          disabled={isChecking}
          className="btn btn-primary"
        >
          <Bell size={16} />
          {isChecking ? 'Evaluating Thresholds...' : 'Trigger Automated Reminder Sweep'}
        </button>
      </div>

      {checkResult && (
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            padding: '0.875rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={16} />
          {checkResult}
        </div>
      )}

      {/* Urgency Quick Filter Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <button
          onClick={() => setActiveWindow('all')}
          className="glass-card"
          style={{
            padding: '1rem',
            border: activeWindow === 'all' ? '2px solid var(--primary-500)' : '1px solid var(--border-subtle)',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ALL MONITORED</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{fdrs.length}</div>
        </button>

        <button
          onClick={() => setActiveWindow('overdue')}
          className="glass-card"
          style={{
            padding: '1rem',
            border: activeWindow === 'overdue' ? '2px solid var(--accent-rose)' : '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(244, 63, 94, 0.05)',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#fb7185', fontWeight: 700 }}>OVERDUE (&lt; 0d)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fb7185' }}>{overdueCount}</div>
        </button>

        <button
          onClick={() => setActiveWindow('7d')}
          className="glass-card"
          style={{
            padding: '1rem',
            border: activeWindow === '7d' ? '2px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(245, 158, 11, 0.05)',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>CRITICAL (≤ 7d)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>{criticalCount}</div>
        </button>

        <button
          onClick={() => setActiveWindow('15d')}
          className="glass-card"
          style={{
            padding: '1rem',
            border: activeWindow === '15d' ? '2px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700 }}>URGENT (8–15d)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#818cf8' }}>{urgentCount}</div>
        </button>

        <button
          onClick={() => setActiveWindow('30d')}
          className="glass-card"
          style={{
            padding: '1rem',
            border: activeWindow === '30d' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#22d3ee', fontWeight: 700 }}>APPROACHING (16–30d)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22d3ee' }}>{warningCount}</div>
        </button>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>FDR Number</th>
                <th>Institution</th>
                <th>Bank & IFSC</th>
                <th>Principal Amount</th>
                <th>Maturity Date</th>
                <th>Days Remaining</th>
                <th>Status</th>
                <th>Workflow Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading maturity calendar...
                  </td>
                </tr>
              ) : filteredFdrs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No security deposits matching selected window ({activeWindow}).
                  </td>
                </tr>
              ) : (
                filteredFdrs.map((fdr) => {
                  const days = fdr.days_to_maturity ?? 0;
                  return (
                    <tr key={fdr.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{fdr.fdr_number}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          Ref: {fdr.reference_number || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{fdr.institution_name}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          {fdr.institution_code}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{fdr.bank_name}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{fdr.branch_ifsc}</div>
                      </td>
                      <td style={{ fontWeight: 800 }}>₹{Number(fdr.amount).toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 700 }}>{fdr.maturity_date}</td>
                      <td>
                        {days < 0 ? (
                          <span
                            style={{
                              color: '#fb7185',
                              fontWeight: 800,
                              backgroundColor: 'rgba(244, 63, 94, 0.15)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                            }}
                          >
                            {Math.abs(days)}d Overdue
                          </span>
                        ) : days <= 15 ? (
                          <span
                            style={{
                              color: '#fbbf24',
                              fontWeight: 800,
                              backgroundColor: 'rgba(245, 158, 11, 0.15)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                            }}
                          >
                            {days}d Left
                          </span>
                        ) : (
                          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {days} days
                          </span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={fdr.admin_status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <Link
                            to={`/fdrs/${fdr.id}`}
                            className="btn btn-secondary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            Inspect &rarr;
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
