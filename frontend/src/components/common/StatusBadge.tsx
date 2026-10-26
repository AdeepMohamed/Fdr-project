import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  RefreshCw,
  FileCheck,
  HelpCircle,
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type?: 'verification' | 'admin' | 'discrepancy' | 'release';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status?.toLowerCase() || '';

  const getBadgeConfig = () => {
    switch (normalized) {
      case 'verified':
      case 'active':
      case 'approved':
      case 'completed':
      case 'exact_match':
        return {
          icon: <CheckCircle2 size={13} />,
          className: 'badge-verified',
          label: normalized === 'exact_match' ? 'Matched' : normalized.replace('_', ' '),
        };
      case 'pending':
      case 'pending_verification':
      case 'under_review':
      case 'submitted':
      case 'draft':
        return {
          icon: <Clock size={13} />,
          className: 'badge-pending',
          label: normalized.replace('_', ' '),
        };
      case 'matured':
      case 'expired':
      case 'rejected':
      case 'mismatch':
        return {
          icon: <XCircle size={13} />,
          className: 'badge-matured',
          label: normalized === 'mismatch' ? 'Discrepancy' : normalized.replace('_', ' '),
        };
      case 'correction_requested':
      case 'additional_docs':
      case 'missing_extracted':
        return {
          icon: <AlertTriangle size={13} />,
          className: 'badge-correction_requested',
          label: normalized.replace('_', ' '),
        };
      case 'renewed':
      case 'released':
      case 'recommended':
        return {
          icon: <RefreshCw size={13} />,
          className: 'badge-renewed',
          label: normalized.replace('_', ' '),
        };
      default:
        return {
          icon: <HelpCircle size={13} />,
          className: 'badge-secondary',
          label: status,
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span className={`badge ${config.className}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
