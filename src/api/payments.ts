import api from './axios';
import { Payment } from '../types/payment';

export interface PaymentStats {
  unpaid: { count: number; totalAmount: number; totalPaid: number };
  partial: { count: number; totalAmount: number; totalPaid: number };
  paid: { count: number; totalAmount: number; totalPaid: number };
}

export const paymentsApi = {
  getAll: () => api.get<Payment[]>('/payments'),
  getById: (id: string) => api.get<Payment>(`/payments/${id}`),
  getByPatient: (patientId: string) => api.get<Payment[]>(`/payments/patient/${patientId}`),
  getStats: () => api.get<PaymentStats>('/payments/stats'),
  create: (formData: FormData) => api.post<Payment>('/payments', formData),
  update: (id: string, formData: FormData) => api.put<Payment>(`/payments/${id}`, formData),
  delete: (id: string) => api.delete<{ message: string }>(`/payments/${id}`),
};
