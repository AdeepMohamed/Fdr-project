export type Role = 'admin' | 'official' | 'institution';

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: Role;
  designation?: string;
  phone?: string;
  is_active: boolean;
}

export interface Institution {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  establishment_year?: number;
  institution_type: string;
  status: 'active' | 'inactive' | 'suspended';
}

export type VerificationStatus =
  | 'draft'
  | 'pending_verification'
  | 'under_review'
  | 'correction_requested'
  | 'verified'
  | 'rejected';

export type AdminStatus =
  | 'active'
  | 'matured'
  | 'renewed'
  | 'released'
  | 'expired';

export interface FDRRecord {
  id: number;
  record_id: string;
  institution: number;
  institution_name?: string;
  institution_code?: string;
  institution_state?: string;
  created_by?: number;
  fdr_number: string;
  bank_name: string;
  branch_name: string;
  branch_address?: string;
  branch_ifsc: string;
  amount: string | number;
  currency: string;
  issue_date: string;
  maturity_date: string;
  interest_rate?: string | number | null;
  instrument_type: 'fdr' | 'bg' | 'tdr';
  reference_number?: string;
  remarks?: string;
  verification_status: VerificationStatus;
  admin_status: AdminStatus;
  previous_fdr?: number | null;
  renewal_count: number;
  submitted_at?: string | null;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
  days_to_maturity?: number | null;
  is_matured?: boolean;
  formatted_amount?: string;
  documents?: FDRDocument[];
  discrepancies?: Discrepancy[];
  verification_records?: VerificationRecord[];
}

export interface FDRDocument {
  id: number;
  fdr_record: number;
  file: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  document_type: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual_required';
  processing_error?: string;
  extracted_data?: ExtractedDocumentData;
  created_at: string;
}

export interface ExtractedDocumentData {
  id: number;
  document: number;
  raw_text: string;
  extracted_fdr_number?: string;
  extracted_bank_name?: string;
  extracted_amount?: string | number | null;
  extracted_issue_date?: string | null;
  extracted_maturity_date?: string | null;
  extraction_confidence?: Record<string, string>;
  extraction_method?: string;
  created_at: string;
}

export interface Discrepancy {
  id: number;
  fdr_record: number;
  field_name: string;
  submitted_value: string;
  extracted_value: string;
  discrepancy_type: 'exact_match' | 'mismatch' | 'missing_extracted' | 'ambiguous_ocr' | 'requires_verification';
  review_status: 'pending' | 'reviewed' | 'resolved' | 'accepted';
  reviewer_observations?: string;
  reviewed_by?: number;
  reviewed_by_name?: string;
  created_at: string;
}

export interface VerificationRecord {
  id: number;
  fdr_record: number;
  reviewer: number;
  reviewer_name?: string;
  outcome: 'verified' | 'correction_requested' | 'rejected' | 'additional_docs';
  observations: string;
  correction_fields: string[];
  created_at: string;
}

export interface RenewalRecord {
  id: number;
  old_fdr: number;
  old_fdr_number?: string;
  new_fdr?: number | null;
  new_fdr_number?: string;
  submitted_by: number;
  submitted_by_name?: string;
  status: 'submitted' | 'under_review' | 'correction_requested' | 'approved' | 'rejected';
  reason?: string;
  observations?: string;
  submitted_at: string;
  reviewed_at?: string | null;
}

export interface ReleaseRequest {
  id: number;
  fdr_record: number;
  fdr_number?: string;
  institution_name?: string;
  requested_by: number;
  requested_by_name?: string;
  reason: string;
  status: 'submitted' | 'under_review' | 'additional_docs' | 'recommended' | 'approved' | 'rejected' | 'completed';
  observations?: string;
  submitted_at: string;
  reviewed_at?: string | null;
  completed_at?: string | null;
}

export interface AuditLog {
  id: number;
  user?: number | null;
  user_email?: string;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  summary: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface Notification {
  id: number;
  recipient: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string | null;
  related_fdr?: number | null;
  fdr_number?: string;
  created_at: string;
}

export interface DashboardSummary {
  total_fdrs: number;
  total_amount: number;
  active_fdrs: number;
  matured_fdrs: number;
  pending_verification: number;
  correction_requested: number;
  discrepancies_count: number;
  upcoming_maturities_30d: number;
  upcoming_maturities_15d: number;
  upcoming_maturities_7d: number;
  overdue_fdrs: number;
  bank_distribution: { bank_name: string; count: number; total_amount: number }[];
  status_distribution: { status: string; count: number }[];
}
