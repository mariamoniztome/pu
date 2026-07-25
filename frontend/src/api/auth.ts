import axios from './axios';
import type { RegisterData, LoginData, AuthResponse, InviteDoctorData, InviteInfo, Doctor } from '../types/auth';

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

  // Invite a new doctor to the organization. The invitee sets their own
  // password via the emailed link; inviteUrl is only returned when the
  // server couldn't send the email (SMTP not configured).
  inviteDoctor: async (
    data: InviteDoctorData
  ): Promise<{ message: string; doctor: Doctor; emailSent: boolean; inviteUrl?: string }> => {
    const response = await axios.post('/auth/doctors/invite', data);
    return response.data;
  },

  // Look up a pending invitation (public)
  getInvite: async (token: string): Promise<{ invite: InviteInfo }> => {
    const response = await axios.get(`/auth/invite/${token}`);
    return response.data;
  },

  // Accept an invitation by choosing a password; logs the invitee in
  acceptInvite: async (token: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post('/auth/invite/accept', { token, password });
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

  // Grant/revoke individual permission flags (merges, doesn't replace)
  updateDoctorPermissions: async (
    doctorId: string,
    permissions: Partial<Doctor['permissions']>
  ): Promise<{ doctor: Doctor }> => {
    const response = await axios.put(`/auth/doctors/${doctorId}/permissions`, { permissions });
    return response.data;
  },

  uploadAvatar: async (doctorId: string, file: File): Promise<{ doctor: Doctor }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await axios.post(`/auth/doctors/${doctorId}/avatar`, formData);
    return response.data;
  },

  deleteAvatar: async (doctorId: string): Promise<{ message: string }> => {
    const response = await axios.delete(`/auth/doctors/${doctorId}/avatar`);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await axios.put('/auth/me/password', { currentPassword, newPassword });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await axios.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await axios.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  // Delete/deactivate doctor
  deleteDoctor: async (doctorId: string): Promise<{ message: string }> => {
    const response = await axios.delete(`/auth/doctors/${doctorId}`);
    return response.data;
  },

  // Reactivate a previously deactivated doctor
  reactivateDoctor: async (doctorId: string): Promise<{ doctor: Doctor }> => {
    const response = await axios.put(`/auth/doctors/${doctorId}`, { isActive: true });
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
