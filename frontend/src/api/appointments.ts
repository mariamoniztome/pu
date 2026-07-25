import api from './axios';
import { Appointment } from '../types/appointment';

export const appointmentsApi = {
  getAll: async (params?: { doctorId?: string }) => {
    const response = await api.get<Appointment[]>('/appointments', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },
  getByPatient: async (patientId: string) => {
    const response = await api.get<Appointment[]>(`/appointments/patient/${patientId}`);
    return response.data;
  },
  getUpcoming: async () => {
    const response = await api.get<Appointment[]>('/appointments/upcoming');
    return response.data;
  },
  create: async (data: Partial<Appointment>) => {
    const response = await api.post<Appointment>('/appointments', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Appointment>) => {
    const response = await api.put<Appointment>(`/appointments/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/appointments/${id}`);
    return response.data;
  },
};
