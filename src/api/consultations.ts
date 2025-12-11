import api from './axios';
import { Consultation } from '../types/consultation';

export const consultationsApi = {
  getAll: () => api.get<Consultation[]>('/consultations'),
  getById: (id: string) => api.get<Consultation>(`/consultations/${id}`),
  getByPatient: (patientId: string) => api.get<Consultation[]>(`/consultations/patient/${patientId}`),
  create: (formData: FormData) => api.post<Consultation>('/consultations', formData),
  update: (id: string, formData: FormData) => api.put<Consultation>(`/consultations/${id}`, formData),
  delete: (id: string) => api.delete<{ message: string }>(`/consultations/${id}`),
  deleteAttachment: (id: string, filename: string) =>
    api.delete<{ message: string }>(`/consultations/${id}/attachments/${filename}`),
};
