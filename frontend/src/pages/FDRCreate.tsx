import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fdrsApi, institutionsApi, documentsApi } from '../services/api';
import { Institution } from '../types';
import { useAuth } from '../context/AuthContext';
import { Building, CreditCard, Calendar, Upload, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FDRCreate: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [institutionId, setInstitutionId] = useState<number | string>('');
  const [fdrNumber, setFdrNumber] = useState('');
  const [bankName, setBankName] = useState('State Bank of India');
  const [branchName, setBranchName] = useState('');
  const [branchIfsc, setBranchIfsc] = useState('');
  const [amount, setAmount] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [maturityDate, setMaturityDate] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [instrumentType, setInstrumentType] = useState<'fdr' | 'bg' | 'tdr'>('fdr');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const data = await institutionsApi.list();
        const list = Array.isArray(data) ? data : data.results || [];
        setInstitutions(list);
        if (list.length > 0) {
          setInstitutionId(list[0].id);
        }
      } catch (e) {
        console.error('Failed to load institutions:', e);
      }
    };
    fetchInstitutions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (new Date(maturityDate) <= new Date(issueDate)) {
      setError('Statutory maturity date must be after the issue date.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newFdr = await fdrsApi.create({
        institution: Number(institutionId),
        fdr_number: fdrNumber,
        bank_name: bankName,
        branch_name: branchName,
        branch_ifsc: branchIfsc,
        amount: amount,
        issue_date: issueDate,
        maturity_date: maturityDate,
        interest_rate: interestRate ? Number(interestRate) : undefined,
        instrument_type: instrumentType,
        reference_number: referenceNumber,
        remarks: remarks,
      });

      // If file uploaded, attach document & trigger OCR
      if (file && newFdr.id) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('document_type', 'fdr_receipt');
        await documentsApi.upload(newFdr.id, formData);
      }

      navigate(`/fdrs/${newFdr.id}`);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          JSON.stringify(err.response?.data) ||
          'Failed to create FDR deposit record.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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

      <div>
        <h1 className="heading-xl" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
          Submit Security Deposit Instrument
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Register an official Fixed Deposit Receipt or Bank Guarantee in the regulatory repository.
        </p>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            padding: '0.875rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Section 1: Institution & Category */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={16} color="var(--primary-500)" />
            Institution & Instrument Classification
          </h2>

          <div className="grid-2">
            <div>
              <label className="form-label">Affiliated Institution</label>
              <select
                className="form-select"
                value={institutionId}
                onChange={(e) => setInstitutionId(e.target.value)}
                required
              >
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Instrument Type</label>
              <select
                className="form-select"
                value={instrumentType}
                onChange={(e) => setInstrumentType(e.target.value as any)}
                required
              >
                <option value="fdr">Fixed Deposit Receipt (FDR)</option>
                <option value="bg">Bank Guarantee (BG)</option>
                <option value="tdr">Term Deposit Receipt (TDR)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Banking & Identifier */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={16} color="var(--primary-500)" />
            Banking & Instrument Identity
          </h2>

          <div className="grid-2" style={{ marginBottom: '1rem' }}>
            <div>
              <label className="form-label">FDR / Certificate Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. FDR-2024-SBI-9842"
                value={fdrNumber}
                onChange={(e) => setFdrNumber(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Depository Bank</label>
              <select
                className="form-select"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required
              >
                <option value="State Bank of India">State Bank of India</option>
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="Punjab National Bank">Punjab National Bank</option>
                <option value="Canara Bank">Canara Bank</option>
                <option value="Bank of Baroda">Bank of Baroda</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="Union Bank of India">Union Bank of India</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label className="form-label">Branch Name & City</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Rohini Sector 22, New Delhi"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Branch IFSC Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. SBIN0011562"
                value={branchIfsc}
                onChange={(e) => setBranchIfsc(e.target.value.toUpperCase())}
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Financial & Dates */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} color="var(--primary-500)" />
            Financial Terms & Validity
          </h2>

          <div className="grid-2" style={{ marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Principal Amount (INR)</label>
              <input
                type="number"
                step="0.01"
                min="1000"
                className="form-input"
                placeholder="e.g. 5000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Interest Rate (% p.a.)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="e.g. 7.10"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Date of Issue</label>
              <input
                type="date"
                className="form-input"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Date of Maturity</label>
              <input
                type="date"
                className="form-input"
                value={maturityDate}
                onChange={(e) => setMaturityDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">AICTE Approval / Application File Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. AICTE/DL/2024/INTAKE/09"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
          </div>
        </div>

        {/* Section 4: Document Attachment & Auto-OCR */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload size={16} color="var(--primary-500)" />
            Scanned Certificate Attachment (Triggers OCR Discrepancy Detection)
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Upload PDF or image scan. The system will extract values and verify against your submission in real-time.
          </p>

          <input
            type="file"
            className="form-input"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          />
        </div>

        {/* Remarks */}
        <div>
          <label className="form-label">Purpose / Notes</label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="e.g. Mandatory security deposit for establishment of new technical program."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          <Link to="/fdrs" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
            {isSubmitting ? 'Registering & Processing OCR...' : 'Register Deposit Instrument'}
          </button>
        </div>
      </form>
    </div>
  );
};
