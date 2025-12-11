import api from './axios';
import { ExternalReport } from '../types/reports';

export const externalReportsApi = {
  getAll: () => api.get<ExternalReport[]>('/external-reports'),
  getById: (id: string) => api.get<ExternalReport>(`/external-reports/${id}`),
  getByPatient: (patientId: string) => api.get<ExternalReport[]>(`/external-reports/patient/${patientId}`),
  create: (formData: FormData) => api.post<ExternalReport>('/external-reports', formData),
  update: (id: string, formData: FormData) => api.put<ExternalReport>(`/external-reports/${id}`, formData),
  delete: (id: string) => api.delete<{ message: string }>(`/external-reports/${id}`),
  deleteAttachment: (id: string, filename: string) =>
    api.delete<{ message: string }>(`/external-reports/${id}/attachments/${filename}`),
};
