import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fdrsApi, reportsApi } from '../services/api';
import { FDRRecord } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Search,
  Filter,
  Download,
  PlusCircle,
  Clock,
  AlertTriangle,
  Building2,
  Calendar,
  RefreshCw,
} from 'lucide-react';

export const FDRList: React.FC = () => {
  const [fdrs, setFdrs] = useState<FDRRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  const [bankFilter, setBankFilter] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const fetchFDRs = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {};
      if (searchTerm) params.search = searchTerm;
      if (verificationFilter) params.verification_status = verificationFilter;
      if (adminFilter) params.admin_status = adminFilter;
      if (bankFilter) params.bank_name = bankFilter;

      const data = await fdrsApi.list(params);
      setFdrs(data.results);
    } catch (e) {
      console.error('Failed to load FDRs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchFDRs, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, verificationFilter, adminFilter, bankFilter]);

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const blob = await reportsApi.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FDR_SmartTrack_Export_${new Date().toISOString().slice(0, 10)}.csv`;
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

  const getMaturityCountdownBadge = (fdr: FDRRecord) => {
    if (!fdr.maturity_date) return null;
    const days = fdr.days_to_maturity ?? 0;

    if (days < 0) {
      return (
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: '#fb7185',
            backgroundColor: 'rgba(244, 63, 94, 0.12)',
            padding: '0.15rem 0.45rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <AlertTriangle size={11} /> {Math.abs(days)}d Overdue
        </span>
      );
    }
    if (days <= 15) {
      return (
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: '#fbbf24',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            padding: '0.15rem 0.45rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <Clock size={11} /> {days}d Left
        </span>
      );
    }
    return (
      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
        {days} days
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="heading-xl" style={{ fontSize: '1.75rem' }}>
            FDR Security Deposit Repository
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Comprehensive directory of approved, maturing, and renewed technical institution security deposits.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="btn btn-secondary"
          >
            <Download size={16} />
            {isExporting ? 'Exporting...' : 'Export to CSV'}
          </button>
          <Link to="/fdrs/new" className="btn btn-primary">
            <PlusCircle size={16} />
            Submit New Deposit
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search
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
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search FDR, bank, college..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Verification Status Filter */}
        <div>
          <select
            className="form-select"
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
          >
            <option value="">All Verification Statuses</option>
            <option value="verified">Verified</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="under_review">Under Review</option>
            <option value="correction_requested">Correction Requested</option>
            <option value="rejected">Rejected</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Admin Status Filter */}
        <div>
          <select
            className="form-select"
            value={adminFilter}
            onChange={(e) => setAdminFilter(e.target.value)}
          >
            <option value="">All Admin Lifecycle States</option>
            <option value="active">Active</option>
            <option value="matured">Matured / Overdue</option>
            <option value="renewed">Renewed</option>
            <option value="released">Released</option>
          </select>
        </div>

        {/* Bank Filter */}
        <div>
          <select
            className="form-select"
            value={bankFilter}
            onChange={(e) => setBankFilter(e.target.value)}
          >
            <option value="">All Scheduled Banks</option>
            <option value="State Bank of India">State Bank of India</option>
            <option value="HDFC Bank">HDFC Bank</option>
            <option value="Punjab National Bank">Punjab National Bank</option>
            <option value="Canara Bank">Canara Bank</option>
            <option value="Bank of Baroda">Bank of Baroda</option>
            <option value="Axis Bank">Axis Bank</option>
            <option value="ICICI Bank">ICICI Bank</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>FDR & Reference</th>
                <th>Institution</th>
                <th>Bank & IFSC</th>
                <th>Amount (INR)</th>
                <th>Maturity Window</th>
                <th>Verification</th>
                <th>Lifecycle</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading security deposit repository...
                  </td>
                </tr>
              ) : fdrs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No matching FDR records found matching active filters.
                  </td>
                </tr>
              ) : (
                fdrs.map((fdr) => (
                  <tr key={fdr.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {fdr.fdr_number}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        Ref: {fdr.reference_number || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {fdr.institution_name}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {fdr.institution_code} • {fdr.institution_state}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{fdr.bank_name}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {fdr.branch_ifsc}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                        ₹{Number(fdr.amount).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {fdr.interest_rate ? `${fdr.interest_rate}% p.a.` : 'Rate n/a'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                        {fdr.maturity_date}
                      </div>
                      <div>{getMaturityCountdownBadge(fdr)}</div>
                    </td>
                    <td>
                      <StatusBadge status={fdr.verification_status} />
                    </td>
                    <td>
                      <StatusBadge status={fdr.admin_status} />
                    </td>
                    <td>
                      <Link
                        to={`/fdrs/${fdr.id}`}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      >
                        Inspect &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
