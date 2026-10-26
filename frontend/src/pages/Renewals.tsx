import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { renewalsApi } from '../services/api';
import { RenewalRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Building,
  PlusCircle,
} from 'lucide-react';

export const Renewals: React.FC = () => {
  const { user } = useAuth();
  const isOfficialOrAdmin = user?.role === 'admin' || user?.role === 'official';

  const [renewals, setRenewals] = useState<RenewalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedRenewal, setSelectedRenewal] = useState<RenewalRecord | null>(null);
  const [actionType, setActionType] = useState<'approved' | 'rejected' | null>(null);
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRenewals = async () => {
    try {
      setLoading(true);
      const data = await renewalsApi.list();
      setRenewals(data);
    } catch (e) {
      console.error('Failed to load renewals:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenewals();
  }, []);

  const handleDecision = async () => {
    if (!selectedRenewal || !actionType) return;
    try {
      setIsSubmitting(true);
      await renewalsApi.decision(selectedRenewal.id, {
        status: actionType,
        observations: observations || `Renewal request marked as ${actionType} by official decision.`,
      });
      setSelectedRenewal(null);
      setActionType(null);
      setObservations('');
      await fetchRenewals();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Decision recording failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 className="heading-xl" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
          FDR Renewal & Rollover Lineage
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Traceable chain linking matured security receipts with newly issued replacement instruments.
        </p>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Lineage Link</th>
                <th>Old Matured FDR</th>
                <th>New Replacement FDR</th>
                <th>Requested By</th>
                <th>Status</th>
                <th>Submission Date</th>
                <th>Official Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading renewal lineage...
                  </td>
                </tr>
              ) : renewals.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No renewal records found.
                  </td>
                </tr>
              ) : (
                renewals.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--primary-500)', fontWeight: 700 }}>
                        <RefreshCw size={14} /> Chain #{r.id}
                      </div>
                    </td>
                    <td>
                      <Link to={`/fdrs/${r.old_fdr}`} style={{ fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>
                        {r.old_fdr_number || `FDR #${r.old_fdr}`}
                      </Link>
                    </td>
                    <td>
                      {r.new_fdr ? (
                        <Link to={`/fdrs/${r.new_fdr}`} style={{ fontWeight: 700, color: 'var(--status-verified-text)', textDecoration: 'none' }}>
                          {r.new_fdr_number || `FDR #${r.new_fdr}`}
                        </Link>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Awaiting new certificate</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.submitted_by_name || 'Institution Admin'}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{r.reason || 'Routine rollover'}</div>
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td style={{ fontSize: '0.75rem' }}>
                      {new Date(r.submitted_at).toLocaleDateString()}
                    </td>
                    <td>
                      {isOfficialOrAdmin && r.status === 'submitted' ? (
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <button
                            onClick={() => {
                              setSelectedRenewal(r);
                              setActionType('approved');
                            }}
                            className="btn btn-success"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRenewal(r);
                              setActionType('rejected');
                            }}
                            className="btn btn-danger"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {r.reviewed_at ? `Decided ${new Date(r.reviewed_at).toLocaleDateString()}` : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Modal */}
      <Modal
        isOpen={!!actionType}
        onClose={() => {
          setSelectedRenewal(null);
          setActionType(null);
        }}
        title={`Official Decision: ${actionType === 'approved' ? 'Approve' : 'Reject'} Renewal`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Record regulatory decision on renewal of FDR <strong>{selectedRenewal?.old_fdr_number}</strong>.
          </p>

          <div>
            <label className="form-label">Official Observations</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Approved continuation of security deposit under updated instrument."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              onClick={() => {
                setSelectedRenewal(null);
                setActionType(null);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleDecision}
              disabled={isSubmitting}
              className={`btn ${actionType === 'approved' ? 'btn-success' : 'btn-danger'}`}
            >
              {isSubmitting ? 'Recording...' : 'Confirm Decision'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
