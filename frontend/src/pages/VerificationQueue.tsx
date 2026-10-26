import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fdrsApi, verificationsApi } from '../services/api';
import { FDRRecord, Discrepancy } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  Building,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';

export const VerificationQueue: React.FC = () => {
  const [fdrs, setFdrs] = useState<FDRRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected FDR for action
  const [selectedFdr, setSelectedFdr] = useState<FDRRecord | null>(null);
  const [actionType, setActionType] = useState<'verify' | 'correct' | 'reject' | null>(null);
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await fdrsApi.list({
        verification_status: 'pending_verification,under_review,correction_requested',
      });
      setFdrs(data.results);
    } catch (e) {
      console.error('Failed to load queue:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleExecuteAction = async () => {
    if (!selectedFdr || !actionType) return;
    try {
      setIsSubmitting(true);
      if (actionType === 'verify') {
        await verificationsApi.submitDecision(selectedFdr.id, {
          outcome: 'verified',
          observations: observations || 'Record verified against bank documentation by regional official.',
        });
      } else if (actionType === 'reject') {
        await verificationsApi.submitDecision(selectedFdr.id, {
          outcome: 'rejected',
          observations: observations || 'Submission rejected due to regulatory non-conformance.',
        });
      } else if (actionType === 'correct') {
        await verificationsApi.requestCorrection(selectedFdr.id, {
          observations: observations || 'Discrepancy detected in submitted deposit parameters.',
          correction_fields: ['amount'],
        });
      }
      setSelectedFdr(null);
      setActionType(null);
      setObservations('');
      await fetchQueue();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Action failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
          <h1 className="heading-xl" style={{ fontSize: '1.75rem' }}>
            Official Verification & Discrepancy Queue
          </h1>
          <span
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            {fdrs.length} Items Pending Review
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Side-by-side OCR discrepancy reconciliation and statutory approval workbench for regulatory officers.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading pending verification queue...
        </div>
      ) : fdrs.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <CheckCircle2 size={42} color="var(--status-verified-text)" style={{ margin: '0 auto 1rem' }} />
          <h2 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Queue Clean & Compliant!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            All institutional security deposit submissions have been processed and reconciled.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {fdrs.map((fdr) => (
            <div
              key={fdr.id}
              className="glass-panel"
              style={{
                padding: '1.5rem',
                borderLeft:
                  fdr.verification_status === 'correction_requested'
                    ? '4px solid var(--accent-purple)'
                    : '4px solid var(--accent-amber)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {fdr.fdr_number}
                    </span>
                    <StatusBadge status={fdr.verification_status} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Submitted {fdr.submitted_at ? new Date(fdr.submitted_at).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Building size={15} color="var(--primary-500)" />
                    <strong>{fdr.institution_name}</strong>
                    <span>({fdr.institution_code} • {fdr.institution_state})</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ₹{Number(fdr.amount).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {fdr.bank_name} • IFSC {fdr.branch_ifsc}
                  </div>
                </div>
              </div>

              {/* Quick Details Box */}
              <div
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>MATURITY DATE</div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{fdr.maturity_date}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>INSTRUMENT TYPE</div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase' }}>{fdr.instrument_type}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>AICTE REF NO</div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{fdr.reference_number || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>DOCUMENTS ATTACHED</div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary-500)' }}>
                    {fdr.documents?.length || 1} Scans
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <Link
                  to={`/fdrs/${fdr.id}`}
                  style={{
                    color: 'var(--primary-500)',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  Full Inspection & Side-by-Side OCR <ArrowRight size={14} />
                </Link>

                <div style={{ display: 'flex', gap: '0.625rem' }}>
                  <button
                    onClick={() => {
                      setSelectedFdr(fdr);
                      setActionType('verify');
                    }}
                    className="btn btn-success"
                    style={{ fontSize: '0.8125rem', padding: '0.4rem 0.875rem' }}
                  >
                    <CheckCircle size={15} /> Approve & Verify
                  </button>

                  <button
                    onClick={() => {
                      setSelectedFdr(fdr);
                      setActionType('correct');
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8125rem', padding: '0.4rem 0.875rem', color: 'var(--accent-amber)' }}
                  >
                    <AlertTriangle size={15} /> Request Correction
                  </button>

                  <button
                    onClick={() => {
                      setSelectedFdr(fdr);
                      setActionType('reject');
                    }}
                    className="btn btn-danger"
                    style={{ fontSize: '0.8125rem', padding: '0.4rem 0.875rem' }}
                  >
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Dialog Modal */}
      <Modal
        isOpen={!!actionType}
        onClose={() => {
          setActionType(null);
          setSelectedFdr(null);
        }}
        title={
          actionType === 'verify'
            ? 'Approve & Verify FDR Deposit'
            : actionType === 'correct'
            ? 'Request Correction on Submission'
            : 'Reject FDR Deposit'
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Confirm decision for FDR <strong>{selectedFdr?.fdr_number}</strong> (
            <strong>{selectedFdr?.institution_name}</strong> - ₹
            {Number(selectedFdr?.amount || 0).toLocaleString('en-IN')}).
          </p>

          <div>
            <label className="form-label">Review Observations</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Enter official remarks or note for the institution..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              onClick={() => {
                setActionType(null);
                setSelectedFdr(null);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteAction}
              disabled={isSubmitting}
              className={`btn ${
                actionType === 'verify'
                  ? 'btn-success'
                  : actionType === 'reject'
                  ? 'btn-danger'
                  : 'btn-primary'
              }`}
            >
              {isSubmitting ? 'Recording...' : 'Confirm Official Action'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
