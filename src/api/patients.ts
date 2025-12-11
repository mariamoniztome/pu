import api from './axios';
import { Patient } from '../types/patient';

export const patientsApi = {
  getAll: async () => {
    const response = await api.get<Patient[]>('/patients');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<Patient>(`/patients/${id}`);
    return response.data;
  },
  search: async (query: string) => {
    const response = await api.get<Patient[]>(`/patients/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  create: async (data: Partial<Patient>) => {
    const response = await api.post<Patient>('/patients', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Patient>) => {
    const response = await api.put<Patient>(`/patients/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/patients/${id}`);
    return response.data;
  },
};