import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportsApi, fdrsApi, auditApi } from '../services/api';
import { DashboardSummary, FDRRecord, AuditLog } from '../types';
import { StatsCard } from '../components/common/StatsCard';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  ShieldAlert,
  Coins,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  Building,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isOfficialOrAdmin = user?.role === 'admin' || user?.role === 'official';

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentFdrs, setRecentFdrs] = useState<FDRRecord[]>([]);
  const [recentAudits, setRecentAudits] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sumRes, fdrRes, auditRes] = await Promise.all([
          reportsApi.getSummary(),
          fdrsApi.list({ ordering: '-created_at' }),
          auditApi.list(),
        ]);
        setSummary(sumRes);
        setRecentFdrs(fdrRes.results.slice(0, 5));
        setRecentAudits(auditRes.slice(0, 5));
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrencyCrores = (amount?: number) => {
    if (!amount) return '₹0.00';
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(17,24,39,0.85) 100%)',
          borderColor: 'var(--border-accent)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
            <h1 className="heading-xl" style={{ fontSize: '1.75rem' }}>
              Welcome back, {user?.first_name}
            </h1>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--primary-500)',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              {isOfficialOrAdmin ? 'Regulatory Oversight Dashboard' : 'Institutional Escrow Hub'}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Automated monitoring of mandatory security deposits, OCR discrepancy checks, and maturity obligations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/fdrs/new" className="btn btn-primary">
            <PlusCircle size={16} />
            Submit New Deposit
          </Link>
          <Link to="/reports" className="btn btn-secondary">
            <FileSpreadsheet size={16} />
            Export Audit
          </Link>
        </div>
      </div>

      {/* Critical Alert Banner if Overdue or Discrepancies exist */}
      {(summary?.overdue_fdrs || 0) > 0 || (summary?.discrepancies_count || 0) > 0 ? (
        <div
          style={{
            backgroundColor: 'rgba(244, 63, 94, 0.08)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={20} color="var(--accent-rose)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fb7185' }}>
                Urgent Attention Required: Compliance Exceptions Detected
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {summary?.overdue_fdrs || 0} deposit(s) past maturity date, and{' '}
                {summary?.discrepancies_count || 0} OCR discrepancies flagged for review.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isOfficialOrAdmin && (
              <Link to="/verifications" className="btn btn-danger" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}>
                Review Discrepancies &rarr;
              </Link>
            )}
            <Link to="/maturities" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}>
              View Maturing FDRs
            </Link>
          </div>
        </div>
      ) : null}

      {/* Primary KPI Stats */}
      <div className="grid-4">
        <StatsCard
          title="Total Escrow Capital"
          value={formatCurrencyCrores(summary?.total_amount)}
          subtitle={`${summary?.total_fdrs || 0} Registered Instruments`}
          icon={<Coins size={20} />}
          accentColor="#3b82f6"
        />
        <StatsCard
          title="Active & Verified"
          value={summary?.active_fdrs || 0}
          subtitle="Compliant in Force"
          icon={<CheckCircle2 size={20} />}
          accentColor="#10b981"
          trend={{ value: '100% Protected', isPositive: true }}
        />
        <StatsCard
          title="Maturing in 30 Days"
          value={summary?.upcoming_maturities_30d || 0}
          subtitle="Alerts Dispatched"
          icon={<Clock size={20} />}
          accentColor="#f59e0b"
          trend={{ value: `${summary?.upcoming_maturities_7d || 0} within 7 days`, isPositive: false }}
        />
        <StatsCard
          title="Verification Pending"
          value={summary?.pending_verification || 0}
          subtitle={`${summary?.discrepancies_count || 0} Discrepancies`}
          icon={<ShieldAlert size={20} />}
          accentColor="#ec4899"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid-2">
        {/* Bank-wise Distribution */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 className="heading-md" style={{ color: 'var(--text-primary)' }}>
                Bank-wise Escrow Concentration
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Capital distribution across scheduled commercial banks
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Amounts in ₹ Lakhs
            </span>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            {summary?.bank_distribution && summary.bank_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summary.bank_distribution.map((b) => ({
                    name: b.bank_name.replace('State Bank of India', 'SBI').replace('Punjab National Bank', 'PNB'),
                    amount: Math.round(b.total_amount / 100000),
                    count: b.count,
                  }))}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8125rem',
                    }}
                    formatter={(val: any) => [`₹${val} Lakhs`, 'Escrow Deposit']}
                  />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Loading visual distribution...
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 className="heading-md" style={{ color: 'var(--text-primary)' }}>
                FDR Lifecycle Status Breakdown
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Active vs Maturing vs Verification pipeline
              </p>
            </div>
            <Link to="/fdrs" style={{ fontSize: '0.75rem', color: 'var(--primary-500)', fontWeight: 600, textDecoration: 'none' }}>
              View All &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', height: 260 }}>
            {summary?.status_distribution ? (
              <>
                <div style={{ flex: 1, height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summary.status_distribution}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                      >
                        {summary.status_distribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--border-strong)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.8125rem',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ width: '160px', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {summary.status_distribution.map((item, idx) => (
                    <div key={item.status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: COLORS[idx % COLORS.length],
                          }}
                        />
                        <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Recent FDRs & Audit Activity Grid */}
      <div className="grid-2">
        {/* Recent FDRs */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 className="heading-md" style={{ color: 'var(--text-primary)' }}>
              Recent FDR Submissions
            </h2>
            <Link to="/fdrs" style={{ fontSize: '0.75rem', color: 'var(--primary-500)', fontWeight: 600, textDecoration: 'none' }}>
              View Repository &rarr;
            </Link>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>FDR Number</th>
                  <th>Bank</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentFdrs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No FDR records found.
                    </td>
                  </tr>
                ) : (
                  recentFdrs.map((fdr) => (
                    <tr key={fdr.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{fdr.fdr_number}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{fdr.institution_name}</div>
                      </td>
                      <td>{fdr.bank_name}</td>
                      <td style={{ fontWeight: 700 }}>₹{Number(fdr.amount).toLocaleString('en-IN')}</td>
                      <td>
                        <StatusBadge status={fdr.verification_status} />
                      </td>
                      <td>
                        <Link
                          to={`/fdrs/${fdr.id}`}
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          Details &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Immutable Audit Feed */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 className="heading-md" style={{ color: 'var(--text-primary)' }}>
              Live Audit & Governance Trail
            </h2>
            <Link to="/audit" style={{ fontSize: '0.75rem', color: 'var(--primary-500)', fontWeight: 600, textDecoration: 'none' }}>
              Full Log &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {recentAudits.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No audit entries recorded yet.
              </div>
            ) : (
              recentAudits.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: 'var(--primary-500)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <TrendingUp size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {log.summary}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      <span>{log.user_name || log.user_email || 'System Daemon'}</span>
                      <span>•</span>
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
