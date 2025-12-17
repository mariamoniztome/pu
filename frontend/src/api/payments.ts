import api from './axios';
import { Payment } from '../types/payment';

export interface PaymentStats {
  unpaid: { count: number; totalAmount: number; totalPaid: number };
  partial: { count: number; totalAmount: number; totalPaid: number };
  paid: { count: number; totalAmount: number; totalPaid: number };
}

export const paymentsApi = {
  getAll: async () => {
    const response = await api.get<Payment[]>('/payments');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<Payment>(`/payments/${id}`);
    return response.data;
  },
  getByPatient: async (patientId: string) => {
    const response = await api.get<Payment[]>(`/payments/patient/${patientId}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get<PaymentStats>('/payments/stats');
    return response.data;
  },
  create: async (formData: FormData) => {
    const response = await api.post<Payment>('/payments', formData);
    return response.data;
  },
  update: async (id: string, formData: FormData) => {
    const response = await api.put<Payment>(`/payments/${id}`, formData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/payments/${id}`);
    return response.data;
  },
};
