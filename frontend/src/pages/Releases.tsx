import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { releasesApi } from '../services/api';
import { ReleaseRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react';

export const Releases: React.FC = () => {
  const { user } = useAuth();
  const isOfficialOrAdmin = user?.role === 'admin' || user?.role === 'official';

  const [releases, setReleases] = useState<ReleaseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedRelease, setSelectedRelease] = useState<ReleaseRequest | null>(null);
  const [targetStatus, setTargetStatus] = useState<string | null>(null);
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReleases = async () => {
    try {
      setLoading(true);
      const data = await releasesApi.list();
      setReleases(data);
    } catch (e) {
      console.error('Failed to load release requests:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const handleDecision = async () => {
    if (!selectedRelease || !targetStatus) return;
    try {
      setIsSubmitting(true);
      await releasesApi.decision(selectedRelease.id, {
        status: targetStatus,
        observations: observations || `Release transitioned to ${targetStatus}.`,
      });
      setSelectedRelease(null);
      setTargetStatus(null);
      setObservations('');
      await fetchReleases();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'State transition failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 className="heading-xl" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
          Escrow Deposit Release & Refund Governance
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Multi-stage audit and approval workflow for institutional deposit discharge and course closures.
        </p>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>FDR Number</th>
                <th>Institution</th>
                <th>Closure / Exit Justification</th>
                <th>Stage Status</th>
                <th>Submitted</th>
                <th>Official Transition</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading release requests...
                  </td>
                </tr>
              ) : releases.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No deposit release requests on record.
                  </td>
                </tr>
              ) : (
                releases.map((rel) => (
                  <tr key={rel.id}>
                    <td>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)' }}>
                        REL-{String(rel.id).padStart(4, '0')}
                      </span>
                    </td>
                    <td>
                      <Link to={`/fdrs/${rel.fdr_record}`} style={{ fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>
                        {rel.fdr_number || `FDR #${rel.fdr_record}`}
                      </Link>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{rel.institution_name}</div>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                      {rel.reason}
                    </td>
                    <td>
                      <StatusBadge status={rel.status} />
                    </td>
                    <td style={{ fontSize: '0.75rem' }}>
                      {new Date(rel.submitted_at).toLocaleDateString()}
                    </td>
                    <td>
                      {isOfficialOrAdmin && rel.status !== 'completed' && rel.status !== 'rejected' ? (
                        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                          {rel.status === 'submitted' && (
                            <button
                              onClick={() => {
                                setSelectedRelease(rel);
                                setTargetStatus('under_review');
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Review &rarr;
                            </button>
                          )}
                          {rel.status === 'under_review' && (
                            <button
                              onClick={() => {
                                setSelectedRelease(rel);
                                setTargetStatus('recommended');
                              }}
                              className="btn btn-primary"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Recommend
                            </button>
                          )}
                          {rel.status === 'recommended' && (
                            <button
                              onClick={() => {
                                setSelectedRelease(rel);
                                setTargetStatus('approved');
                              }}
                              className="btn btn-success"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Approve Release
                            </button>
                          )}
                          {rel.status === 'approved' && (
                            <button
                              onClick={() => {
                                setSelectedRelease(rel);
                                setTargetStatus('completed');
                              }}
                              className="btn btn-success"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Discharge Completed
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedRelease(rel);
                              setTargetStatus('rejected');
                            }}
                            className="btn btn-danger"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {rel.status === 'completed' ? 'Discharged' : '—'}
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
        isOpen={!!targetStatus}
        onClose={() => {
          setSelectedRelease(null);
          setTargetStatus(null);
        }}
        title={`Advance Release Stage: ${targetStatus?.replace('_', ' ').toUpperCase()}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Transition deposit release for FDR <strong>{selectedRelease?.fdr_number}</strong> to{' '}
            <strong>{targetStatus}</strong>.
          </p>

          <div>
            <label className="form-label">Official Observations & NOC Verification</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Verified university graduation list and student clearance NOC. Authorized for deposit refund."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              onClick={() => {
                setSelectedRelease(null);
                setTargetStatus(null);
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleDecision}
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Recording...' : 'Confirm Stage Transition'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
