import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fdrsApi, documentsApi, verificationsApi, renewalsApi, releasesApi } from '../services/api';
import { FDRRecord, Discrepancy, FDRDocument } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Upload,
  Download,
  Building,
  Calendar,
  CreditCard,
  History,
  FileSpreadsheet,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export const FDRDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOfficialOrAdmin = user?.role === 'admin' || user?.role === 'official';

  const [fdr, setFdr] = useState<FDRRecord | null>(null);
  const [documents, setDocuments] = useState<FDRDocument[]>([]);
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'ocr' | 'discrepancies' | 'history'>('details');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form states
  const [observations, setObservations] = useState('');
  const [correctionFields, setCorrectionFields] = useState<string[]>(['amount']);
  const [renewalReason, setRenewalReason] = useState('');
  const [releaseReason, setReleaseReason] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('fdr_receipt');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [fdrData, docsData, discData] = await Promise.all([
        fdrsApi.getById(id),
        documentsApi.listByFdr(id),
        verificationsApi.listDiscrepancies(id),
      ]);
      setFdr(fdrData);
      setDocuments(docsData);
      setDiscrepancies(discData);
    } catch (e) {
      console.error('Failed to load FDR details:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Actions
  const handleSubmitForVerification = async () => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await fdrsApi.submit(id);
      await loadData();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Failed to submit record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOfficialDecision = async (outcome: 'verified' | 'rejected') => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await verificationsApi.submitDecision(id, {
        outcome,
        observations: observations || `FDR ${fdr?.fdr_number} marked as ${outcome} by official review.`,
      });
      setShowVerifyModal(false);
      setObservations('');
      await loadData();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Decision submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestCorrection = async () => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await verificationsApi.requestCorrection(id, {
        observations: observations || 'Please review highlighted discrepancies and resubmit revised documents.',
        correction_fields: correctionFields,
      });
      setShowCorrectionModal(false);
      setObservations('');
      await loadData();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Correction request failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRenewal = async () => {
    if (!fdr) return;
    try {
      setIsSubmitting(true);
      await renewalsApi.create({
        old_fdr: fdr.id,
        reason: renewalReason || 'Routine maturity rollover and security renewal.',
      });
      setShowRenewalModal(false);
      setRenewalReason('');
      navigate('/renewals');
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Renewal submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRelease = async () => {
    if (!fdr) return;
    try {
      setIsSubmitting(true);
      await releasesApi.create({
        fdr_record: fdr.id,
        reason: releaseReason || 'Formal request for return of escrow deposit upon course closure.',
      });
      setShowReleaseModal(false);
      setReleaseReason('');
      navigate('/releases');
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Release request failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedFile) return;
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('document_type', docType);
      await documentsApi.upload(id, formData);
      setShowUploadModal(false);
      setSelectedFile(null);
      await loadData();
      setActiveTab('ocr');
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Document upload and OCR extraction failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !fdr) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Loading FDR security deposit profile...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back button & Action Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <Link
          to="/fdrs"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} /> Back to Repository
        </Link>

        {/* Workflow Action Buttons */}
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn btn-secondary"
          >
            <Upload size={16} /> Upload Receipt / OCR Scan
          </button>

          {/* Institution Actions */}
          {fdr.verification_status === 'draft' || fdr.verification_status === 'correction_requested' ? (
            <button
              onClick={handleSubmitForVerification}
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              <CheckCircle2 size={16} /> Submit for Official Review
            </button>
          ) : null}

          {/* Official Verification Actions */}
          {isOfficialOrAdmin && fdr.verification_status !== 'verified' ? (
            <>
              <button
                onClick={() => setShowVerifyModal(true)}
                className="btn btn-success"
              >
                <CheckCircle size={16} /> Approve & Verify
              </button>
              <button
                onClick={() => setShowCorrectionModal(true)}
                className="btn btn-secondary"
                style={{ color: 'var(--accent-amber)', borderColor: 'rgba(245, 158, 11, 0.4)' }}
              >
                <AlertTriangle size={16} /> Request Correction
              </button>
            </>
          ) : null}

          {/* Post-Verification / Maturity Actions */}
          {fdr.verification_status === 'verified' && fdr.admin_status === 'active' ? (
            <button
              onClick={() => setShowRenewalModal(true)}
              className="btn btn-secondary"
            >
              <RefreshCw size={16} /> Initiate Renewal
            </button>
          ) : null}

          {fdr.admin_status === 'matured' || fdr.admin_status === 'active' ? (
            <button
              onClick={() => setShowReleaseModal(true)}
              className="btn btn-secondary"
              style={{ color: 'var(--accent-purple)' }}
            >
              <FileSpreadsheet size={16} /> Request Release / Refund
            </button>
          ) : null}
        </div>
      </div>

      {/* Hero Overview Panel */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.5rem',
          borderLeft: '4px solid var(--primary-500)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {fdr.fdr_number}
            </span>
            <StatusBadge status={fdr.verification_status} />
            <StatusBadge status={fdr.admin_status} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <Building size={16} color="var(--primary-500)" />
            <span style={{ fontWeight: 600 }}>{fdr.institution_name}</span>
            <span>({fdr.institution_code})</span>
            <span>•</span>
            <span>{fdr.institution_state}</span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
            Principal Deposit Amount
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            ₹{Number(fdr.amount).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Matures on: <strong style={{ color: 'var(--text-primary)' }}>{fdr.maturity_date}</strong>
            {fdr.days_to_maturity !== null && fdr.days_to_maturity !== undefined && (
              <span style={{ marginLeft: '0.375rem', color: fdr.days_to_maturity <= 15 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                ({fdr.days_to_maturity > 0 ? `${fdr.days_to_maturity} days remaining` : `${Math.abs(fdr.days_to_maturity)} days overdue`})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.25rem',
        }}
      >
        <button
          onClick={() => setActiveTab('details')}
          style={{
            padding: '0.625rem 1.125rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: activeTab === 'details' ? 'var(--primary-600)' : 'transparent',
            color: activeTab === 'details' ? '#ffffff' : 'var(--text-secondary)',
          }}
        >
          Deposit Specifications
        </button>
        <button
          onClick={() => setActiveTab('ocr')}
          style={{
            padding: '0.625rem 1.125rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: activeTab === 'ocr' ? 'var(--primary-600)' : 'transparent',
            color: activeTab === 'ocr' ? '#ffffff' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
          }}
        >
          <FileText size={15} />
          Documents & OCR Extraction ({documents.length})
        </button>
        <button
          onClick={() => setActiveTab('discrepancies')}
          style={{
            padding: '0.625rem 1.125rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: activeTab === 'discrepancies' ? 'var(--primary-600)' : 'transparent',
            color: activeTab === 'discrepancies' ? '#ffffff' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
          }}
        >
          <AlertTriangle size={15} />
          Discrepancy Inspector ({discrepancies.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '0.625rem 1.125rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: activeTab === 'history' ? 'var(--primary-600)' : 'transparent',
            color: activeTab === 'history' ? '#ffffff' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
          }}
        >
          <History size={15} />
          Verification & Lineage
        </button>
      </div>

      {/* TAB 1: Financial & Technical Details */}
      {activeTab === 'details' && (
        <div className="grid-2">
          {/* Banking Particulars */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 className="heading-md" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} color="var(--primary-500)" />
              Banking & Custodian Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Depository Bank</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fdr.bank_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Branch Name</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fdr.branch_name || 'Main Branch'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Branch IFSC Code</span>
                <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                  {fdr.branch_ifsc}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Instrument Category</span>
                <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{fdr.instrument_type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Contract Interest Rate</span>
                <span style={{ fontWeight: 700, color: 'var(--status-verified-text)' }}>
                  {fdr.interest_rate ? `${fdr.interest_rate}% per annum` : 'Not Specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Regulatory & Lifecycle Details */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 className="heading-md" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--primary-500)" />
              Approval & Maturity Schedule
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>AICTE File / Application Ref</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{fdr.reference_number || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Effective Issue Date</span>
                <span style={{ fontWeight: 600 }}>{fdr.issue_date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Statutory Maturity Date</span>
                <span style={{ fontWeight: 700, color: fdr.is_matured ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
                  {fdr.maturity_date}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Renewal Sequential Number</span>
                <span style={{ fontWeight: 600 }}>Cycle #{fdr.renewal_count}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Special Remarks</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'right', maxWidth: '60%' }}>
                  {fdr.remarks || 'No special remarks recorded.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Documents & OCR Extraction */}
      {activeTab === 'ocr' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {documents.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <FileText size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <h3 className="heading-md" style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                No Physical Scan Attached Yet
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Upload the scanned PDF or image copy of the bank receipt to run automated OCR text extraction.
              </p>
              <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
                <Upload size={16} /> Upload FDR Receipt
              </button>
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                      {doc.original_filename}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.75rem' }}>
                      ({(doc.file_size / 1024).toFixed(1)} KB • {doc.file_type.toUpperCase()})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <StatusBadge status={doc.processing_status} />
                    <a
                      href={documentsApi.downloadUrl(doc.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      <Download size={14} /> Download File
                    </a>
                  </div>
                </div>

                {doc.extracted_data ? (
                  <div style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginTop: '1rem' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-cyan)', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                      🤖 Automated OCR Extraction Fields ({doc.extracted_data.extraction_method || 'PyMuPDF Engine'})
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>EXTRACTED FDR NUMBER</div>
                        <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                          {doc.extracted_data.extracted_fdr_number || 'Not detected'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>EXTRACTED BANK</div>
                        <div style={{ fontWeight: 700 }}>
                          {doc.extracted_data.extracted_bank_name || 'Not detected'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>EXTRACTED AMOUNT</div>
                        <div style={{ fontWeight: 700, color: 'var(--status-verified-text)' }}>
                          {doc.extracted_data.extracted_amount ? `₹${Number(doc.extracted_data.extracted_amount).toLocaleString('en-IN')}` : 'Not detected'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>EXTRACTED MATURITY</div>
                        <div style={{ fontWeight: 700 }}>
                          {doc.extracted_data.extracted_maturity_date || 'Not detected'}
                        </div>
                      </div>
                    </div>

                    {doc.extracted_data.raw_text && (
                      <div style={{ marginTop: '1.25rem' }}>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                          RAW OCR STREAM
                        </div>
                        <pre
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.6875rem',
                            backgroundColor: 'var(--bg-input)',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            maxHeight: '140px',
                            overflowY: 'auto',
                            color: 'var(--text-secondary)',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {doc.extracted_data.raw_text}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    {doc.processing_error || 'OCR processing in queue...'}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Discrepancy Inspector */}
      {activeTab === 'discrepancies' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 className="heading-md" style={{ color: 'var(--text-primary)' }}>
              Discrepancy Cross-Check Engine
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Automated reconciliation comparing institution-entered data against machine-extracted certificate text.
            </p>
          </div>

          {discrepancies.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={36} color="var(--status-verified-text)" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Zero Discrepancies Flagged</div>
              <div style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                All extracted attributes perfectly conform with the entered deposit data.
              </div>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Field Analyzed</th>
                    <th>Entered / Submitted Value</th>
                    <th>OCR Extracted Value</th>
                    <th>Match Evaluation</th>
                    <th>Review Status</th>
                    <th>Reviewer Observation</th>
                  </tr>
                </thead>
                <tbody>
                  {discrepancies.map((disc) => (
                    <tr key={disc.id}>
                      <td style={{ fontWeight: 700, textTransform: 'capitalize' }}>
                        {disc.field_name.replace('_', ' ')}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {disc.submitted_value}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                        {disc.extracted_value || '<Not Found in OCR>'}
                      </td>
                      <td>
                        <StatusBadge status={disc.discrepancy_type} />
                      </td>
                      <td>
                        <StatusBadge status={disc.review_status} />
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '250px' }}>
                        {disc.reviewer_observations || 'Awaiting official review.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: History & Lineage */}
      {activeTab === 'history' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="heading-md" style={{ marginBottom: '1.25rem' }}>
            Official Verification Logs & Lineage
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {fdr.verification_records && fdr.verification_records.length > 0 ? (
              fdr.verification_records.map((rec) => (
                <div
                  key={rec.id}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <StatusBadge status={rec.outcome} />
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Reviewed by Official</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(rec.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {rec.observations}
                  </div>
                  {rec.correction_fields && rec.correction_fields.length > 0 && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Fields flagged:</span>
                      {rec.correction_fields.map((f: string) => (
                        <span
                          key={f}
                          style={{
                            fontSize: '0.6875rem',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(244, 63, 94, 0.15)',
                            color: '#fb7185',
                            fontWeight: 600,
                          }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', textAlign: 'center', padding: '2rem' }}>
                No formal verification decisions logged yet for this record.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 1: Approve & Verify */}
      <Modal isOpen={showVerifyModal} onClose={() => setShowVerifyModal(false)} title="Official Verification Decision">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            You are verifying FDR <strong>{fdr.fdr_number}</strong> of <strong>₹{Number(fdr.amount).toLocaleString('en-IN')}</strong> for <strong>{fdr.institution_name}</strong>.
          </p>
          <div>
            <label className="form-label">Official Observations</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g., Verified against physical certificate scan and confirmed with depository bank."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button onClick={() => setShowVerifyModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button
              onClick={() => handleOfficialDecision('verified')}
              disabled={isSubmitting}
              className="btn btn-success"
            >
              Confirm Official Approval
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal 2: Request Correction */}
      <Modal isOpen={showCorrectionModal} onClose={() => setShowCorrectionModal(false)} title="Issue Official Correction Request">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Flag items for the institution to revise. This will notify the authorized signatory.
          </p>
          <div>
            <label className="form-label">Correction Instructions</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Specify required corrections (e.g., Amount mismatch between scan and submission)."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button onClick={() => setShowCorrectionModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleRequestCorrection}
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              Dispatch Correction Request
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal 3: Initiate Renewal */}
      <Modal isOpen={showRenewalModal} onClose={() => setShowRenewalModal(false)} title="Initiate Security Renewal">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Initiating renewal will create a linked lineage for FDR <strong>{fdr.fdr_number}</strong> and track replacement documentation.
          </p>
          <div>
            <label className="form-label">Renewal Justification / Note</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g., Maturing on schedule; replacement FDR issued by bank for 3-year term."
              value={renewalReason}
              onChange={(e) => setRenewalReason(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button onClick={() => setShowRenewalModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleCreateRenewal} disabled={isSubmitting} className="btn btn-primary">
              Proceed to Renewal Workflow
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal 4: Request Release */}
      <Modal isOpen={showReleaseModal} onClose={() => setShowReleaseModal(false)} title="Request Deposit Release / Refund">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Submit an application for official release of escrow security deposit <strong>{fdr.fdr_number}</strong>.
          </p>
          <div>
            <label className="form-label">Justification & Regulatory Closure Grounds</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g., AICTE approved closure of diploma course. All NOCs obtained from affiliating university."
              value={releaseReason}
              onChange={(e) => setReleaseReason(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button onClick={() => setShowReleaseModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleCreateRelease} disabled={isSubmitting} className="btn btn-primary">
              Submit Release Application
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal 5: Document Upload */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload FDR Scanned Certificate">
        <form onSubmit={handleUploadDocument} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">Document Type</label>
            <select
              className="form-select"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              <option value="fdr_receipt">FDR Original Receipt / Certificate</option>
              <option value="bank_confirmation">Bank Confirmation Letter</option>
              <option value="renewal_letter">Renewal Acknowledgement</option>
              <option value="noc">Closure NOC / Release Order</option>
            </select>
          </div>
          <div>
            <label className="form-label">PDF or Image Scan</label>
            <input
              type="file"
              className="form-input"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setShowUploadModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting || !selectedFile} className="btn btn-primary">
              {isSubmitting ? 'Uploading & Extracting OCR...' : 'Upload & Process OCR'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
