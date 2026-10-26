import React, { useState, useEffect } from 'react';
import { auditApi } from '../services/api';
import { AuditLog } from '../types';
import { History, Search, ShieldCheck, User, Terminal, Calendar } from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const AuditTrail: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await auditApi.list({ search: searchTerm || undefined });
      setLogs(data);
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchLogs, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="heading-xl" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
            Immutable Governance & Audit Trail
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Append-only security log tracking all uploads, status changes, OCR reconciliations, and official actions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '0.75rem', fontWeight: 700 }}>
          <ShieldCheck size={16} /> Tamper-Proof Cryptographic Trace
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search by action, user email, entity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Logs Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp (IST)</th>
                <th>Operator / Signatory</th>
                <th>Action Code</th>
                <th>Target Entity</th>
                <th>Summary of Event</th>
                <th>Payload</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No audit log records found matching query.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                        {log.user_name || log.user_email || 'System Daemon'}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        {log.ip_address || 'Internal Server'}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          backgroundColor: 'var(--bg-elevated)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          color: 'var(--accent-cyan)',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        {log.entity_type} #{log.entity_id}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', maxWidth: '320px' }}>
                      {log.summary}
                    </td>
                    <td>
                      {log.details ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="btn btn-secondary"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.6875rem' }}
                        >
                          View JSON
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>None</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Payload Inspector Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Event Cryptographic Payload"
      >
        {selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.8125rem' }}>
              <strong>Event:</strong> {selectedLog.summary} ({selectedLog.action})
            </div>
            <pre
              style={{
                backgroundColor: 'var(--bg-input)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--accent-cyan)',
                maxHeight: '300px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
              }}
            >
              {JSON.stringify(selectedLog.details, null, 2)}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
};
