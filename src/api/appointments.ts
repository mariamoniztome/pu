import api from './axios';
import { Appointment } from '../types/appointment';

export const appointmentsApi = {
  getAll: () => api.get<Appointment[]>('/appointments'),
  getById: (id: string) => api.get<Appointment>(`/appointments/${id}`),
  getByPatient: (patientId: string) => api.get<Appointment[]>(`/appointments/patient/${patientId}`),
  getUpcoming: () => api.get<Appointment[]>('/appointments/upcoming'),
  create: (data: Partial<Appointment>) => api.post<Appointment>('/appointments', data),
  update: (id: string, data: Partial<Appointment>) => api.put<Appointment>(`/appointments/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/appointments/${id}`),
};
