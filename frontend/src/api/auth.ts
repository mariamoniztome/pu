import axios from './axios';
import type { RegisterData, LoginData, AuthResponse, InviteDoctorData, Doctor } from '../types/auth';

export const authAPI = {
  // Register new organization and doctor
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Login
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  // Get current user info
  getMe: async (): Promise<{ doctor: Doctor; organization: any }> => {
    const response = await axios.get('/auth/me');
    return response.data;
  },

  // Invite a new doctor to the organization
  inviteDoctor: async (data: InviteDoctorData): Promise<{ message: string; doctor: Doctor }> => {
    const response = await axios.post('/auth/doctors/invite', data);
    return response.data;
  },

  // Get all doctors in the organization
  getDoctors: async (): Promise<{ doctors: Doctor[] }> => {
    const response = await axios.get('/auth/doctors');
    return response.data;
  },

  // Update doctor
  updateDoctor: async (doctorId: string, data: Partial<Doctor>): Promise<{ doctor: Doctor }> => {
    const response = await axios.put(`/auth/doctors/${doctorId}`, data);
    return response.data;
  },

  // Delete/deactivate doctor
  deleteDoctor: async (doctorId: string): Promise<{ message: string }> => {
    const response = await axios.delete(`/auth/doctors/${doctorId}`);
    return response.data;
  },
};

// Helper functions for token management
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
  delete axios.defaults.headers.common['Authorization'];
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Initialize axios with token from localStorage
const token = getAuthToken();
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
