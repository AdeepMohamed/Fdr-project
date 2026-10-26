import axios from 'axios';
import {
  User,
  FDRRecord,
  FDRDocument,
  Discrepancy,
  VerificationRecord,
  RenewalRecord,
  ReleaseRequest,
  AuditLog,
  Notification,
  DashboardSummary,
  Institution,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('fdr_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('fdr_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = res.data;
          localStorage.setItem('fdr_access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('fdr_access_token');
          localStorage.removeItem('fdr_refresh_token');
          localStorage.removeItem('fdr_user');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('fdr_access_token');
        localStorage.removeItem('fdr_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/token/', credentials);
    return res.data; // { access, refresh, user }
  },
  refreshToken: async (refresh: string) => {
    const res = await apiClient.post('/auth/token/refresh/', { refresh });
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/auth/me/');
    return res.data;
  },
};

// Institutions Service
export const institutionsApi = {
  list: async (): Promise<{ results: Institution[] } | Institution[]> => {
    const res = await apiClient.get('/institutions/');
    return res.data;
  },
};

// FDR Records Service
export const fdrsApi = {
  list: async (params?: Record<string, any>): Promise<{ results: FDRRecord[]; count: number }> => {
    const res = await apiClient.get('/fdrs/', { params });
    if (Array.isArray(res.data)) {
      return { results: res.data, count: res.data.length };
    }
    return res.data;
  },
  getById: async (id: number | string): Promise<FDRRecord> => {
    const res = await apiClient.get(`/fdrs/${id}/`);
    return res.data;
  },
  create: async (data: Partial<FDRRecord>): Promise<FDRRecord> => {
    const res = await apiClient.post('/fdrs/', data);
    return res.data;
  },
  update: async (id: number | string, data: Partial<FDRRecord>): Promise<FDRRecord> => {
    const res = await apiClient.patch(`/fdrs/${id}/`, data);
    return res.data;
  },
  submit: async (id: number | string): Promise<FDRRecord> => {
    const res = await apiClient.post(`/fdrs/${id}/submit/`);
    return res.data;
  },
};

// Documents & OCR Service
export const documentsApi = {
  upload: async (fdrId: number | string, formData: FormData): Promise<FDRDocument> => {
    const res = await apiClient.post(`/documents/fdr/${fdrId}/upload/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  listByFdr: async (fdrId: number | string): Promise<FDRDocument[]> => {
    const res = await apiClient.get(`/documents/fdr/${fdrId}/`);
    return Array.isArray(res.data) ? res.data : res.data.results || [];
  },
  downloadUrl: (docId: number | string) => `${API_BASE_URL}/documents/${docId}/download/`,
};

// Verifications & Discrepancies Service
export const verificationsApi = {
  listDiscrepancies: async (fdrId?: number | string): Promise<Discrepancy[]> => {
    const res = await apiClient.get('/verifications/discrepancies/', {
      params: fdrId ? { fdr_id: fdrId } : undefined,
    });
    return Array.isArray(res.data) ? res.data : res.data.results || [];
  },
  submitDecision: async (
    fdrId: number | string,
    data: { outcome: string; observations: string; correction_fields?: string[] }
  ): Promise<VerificationRecord> => {
    const res = await apiClient.post(`/verifications/decision/${fdrId}/`, data);
    return res.data;
  },
  requestCorrection: async (
    fdrId: number | string,
    data: { observations: string; correction_fields: string[] }
  ): Promise<any> => {
    const res = await apiClient.post(`/verifications/correction/${fdrId}/`, data);
    return res.data;
  },
};

// Notifications Service
export const notificationsApi = {
  list: async (): Promise<Notification[]> => {
    const res = await apiClient.get('/notifications/');
    return Array.isArray(res.data) ? res.data : res.data.results || [];
  },
  getCount: async (): Promise<{ unread_count: number }> => {
    const res = await apiClient.get('/notifications/count/');
    return res.data;
  },
  markRead: async (id: number): Promise<void> => {
    await apiClient.post(`/notifications/${id}/read/`);
  },
  markAllRead: async (): Promise<void> => {
    await apiClient.post('/notifications/mark-all-read/');
  },
};

// Renewals Service
export const renewalsApi = {
  list: async (): Promise<RenewalRecord[]> => {
    const res = await apiClient.get('/renewals/');
    return Array.isArray(res.data) ? res.data : res.data.results || [];
  },
  create: async (data: { old_fdr: number; new_fdr?: number; reason?: string }): Promise<RenewalRecord> => {
    const res = await apiClient.post('/renewals/create/', data);
    return res.data;
  },
  decision: async (
    id: number,
    data: { status: string; observations?: string }
  ): Promise<RenewalRecord> => {
    const res = await apiClient.post(`/renewals/${id}/decision/`, data);
    return res.data;
  },
};

// Releases Service
export const releasesApi = {
  list: async (): Promise<ReleaseRequest[]> => {
    const res = await apiClient.get('/releases/');
    return Array.isArray(res.data) ? res.data : res.data.results || [];
  },
  create: async (data: { fdr_record: number; reason: string }): Promise<ReleaseRequest> => {
    const res = await apiClient.post('/releases/', data);
    return res.data;
  },
  getById: async (id: number): Promise<ReleaseRequest> => {
    const res = await apiClient.get(`/releases/${id}/`);
    return res.data;
  },
  decision: async (
    id: number,
    data: { status: string; observations?: string }
  ): Promise<ReleaseRequest> => {
    const res = await apiClient.post(`/releases/${id}/decision/`, data);
    return res.data;
  },
};

// Reports Service
export const reportsApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const res = await apiClient.get('/reports/summary/');
    return res.data;
  },
  getMaturityReport: async (): Promise<any> => {
    const res = await apiClient.get('/reports/maturity/');
    return res.data;
  },
  getStatusDistribution: async (): Promise<any> => {
    const res = await apiClient.get('/reports/status-distribution/');
    return res.data;
  },
  getMonthlyTrends: async (): Promise<any> => {
    const res = await apiClient.get('/reports/monthly-trends/');
    return res.data;
  },
  exportCsv: async (): Promise<Blob> => {
    const res = await apiClient.get('/reports/export-csv/', {
      responseType: 'blob',
    });
    return res.data;
  },
};

// Audit Logs Service
export const auditApi = {
  list: async (params?: Record<string, any>): Promise<AuditLog[]> => {
    const res = await apiClient.get('/audit-logs/', { params });
    return Array.isArray(res.data) ? res.data : res.data.results || [];
  },
};
