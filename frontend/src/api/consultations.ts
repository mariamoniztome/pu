import api from './axios';
import { Consultation } from '../types/consultation';

export const consultationsApi = {
  getAll: async () => {
    const response = await api.get<Consultation[]>('/consultations');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<Consultation>(`/consultations/${id}`);
    return response.data;
  },
  getByPatient: async (patientId: string) => {
    const response = await api.get<Consultation[]>(`/consultations/patient/${patientId}`);
    return response.data;
  },
  create: async (formData: FormData) => {
    const response = await api.post<Consultation>('/consultations', formData);
    return response.data;
  },
  update: async (id: string, formData: FormData) => {
    const response = await api.put<Consultation>(`/consultations/${id}`, formData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/consultations/${id}`);
    return response.data;
  },
  deleteAttachment: async (id: string, filename: string) => {
    const response = await api.delete<{ message: string }>(`/consultations/${id}/attachments/${filename}`);
    return response.data;
  },
};
