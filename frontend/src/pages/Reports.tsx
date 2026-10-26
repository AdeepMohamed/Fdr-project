import React, { useState, useEffect } from 'react';
import { reportsApi } from '../services/api';
import { DashboardSummary } from '../types';
import { StatsCard } from '../components/common/StatsCard';
import {
  FileSpreadsheet,
  Download,
  Coins,
  Building,
  CheckCircle2,
  Calendar,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const Reports: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await reportsApi.getSummary();
        setSummary(data);
      } catch (e) {
        console.error('Failed to load reports:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const blob = await reportsApi.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AICTE_FDR_Governance_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export CSV:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const formatAmount = (amt?: number) => {
    if (!amt) return '₹0.00';
    return `₹${amt.toLocaleString('en-IN')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="heading-xl" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
            Regulatory Analytics & Compliance Reports
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Comprehensive institutional escrow totals, depository bank concentration, and maturity projections.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={isExporting}
          className="btn btn-primary"
          style={{ padding: '0.625rem 1.25rem' }}
        >
          <Download size={16} />
          {isExporting ? 'Generating CSV...' : 'Download Full CSV Export'}
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid-3">
        <StatsCard
          title="Aggregated Deposit Value"
          value={formatAmount(summary?.total_amount)}
          subtitle={`${summary?.total_fdrs || 0} Registered Instruments`}
          icon={<Coins size={20} />}
          accentColor="#3b82f6"
        />
        <StatsCard
          title="Total Active & In Force"
          value={summary?.active_fdrs || 0}
          subtitle="Compliant Institutional Security"
          icon={<CheckCircle2 size={20} />}
          accentColor="#10b981"
        />
        <StatsCard
          title="Critical / Maturing in 30d"
          value={summary?.upcoming_maturities_30d || 0}
          subtitle={`${summary?.overdue_fdrs || 0} already past maturity`}
          icon={<Calendar size={20} />}
          accentColor="#f59e0b"
        />
      </div>

      {/* Depository Bank Concentration Breakdown */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h2 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Depository Bank Concentration Analysis
        </h2>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Scheduled Commercial Bank</th>
                <th>Active Instruments</th>
                <th>Aggregated Deposit (INR)</th>
                <th>Portfolio Share (%)</th>
              </tr>
            </thead>
            <tbody>
              {!summary?.bank_distribution || summary.bank_distribution.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No bank distribution data available.
                  </td>
                </tr>
              ) : (
                summary.bank_distribution.map((bank) => {
                  const share = summary.total_amount
                    ? ((bank.total_amount / summary.total_amount) * 100).toFixed(1)
                    : '0';
                  return (
                    <tr key={bank.bank_name}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {bank.bank_name}
                      </td>
                      <td style={{ fontWeight: 600 }}>{bank.count} deposits</td>
                      <td style={{ fontWeight: 800 }}>₹{Number(bank.total_amount).toLocaleString('en-IN')}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div
                            style={{
                              flex: 1,
                              maxWidth: '120px',
                              height: '6px',
                              borderRadius: '3px',
                              backgroundColor: 'var(--bg-elevated)',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${share}%`,
                                height: '100%',
                                backgroundColor: 'var(--primary-500)',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{share}%</span>
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
