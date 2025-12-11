import api from './axios';
import { ExternalReport } from '../types/reports';

export const externalReportsApi = {
  getAll: async () => {
    const response = await api.get<ExternalReport[]>('/external-reports');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<ExternalReport>(`/external-reports/${id}`);
    return response.data;
  },
  getByPatient: async (patientId: string) => {
    const response = await api.get<ExternalReport[]>(`/external-reports/patient/${patientId}`);
    return response.data;
  },
  create: async (formData: FormData) => {
    const response = await api.post<ExternalReport>('/external-reports', formData);
    return response.data;
  },
  update: async (id: string, formData: FormData) => {
    const response = await api.put<ExternalReport>(`/external-reports/${id}`, formData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/external-reports/${id}`);
    return response.data;
  },
  deleteAttachment: async (id: string, filename: string) => {
    const response = await api.delete<{ message: string }>(`/external-reports/${id}/attachments/${filename}`);
    return response.data;
  },
};
