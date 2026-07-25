import api from './axios';
import { Organization } from '../types/auth';

export const organizationApi = {
  update: async (data: {
    name?: string;
    phone?: string;
    address?: string;
    settings?: Partial<Organization['settings']>;
  }) => {
    const response = await api.patch<{ organization: Organization }>('/organizations/me', data);
    return response.data.organization;
  },
  updateBranding: async (data: { clinicName?: string; primaryColor?: string; accentColor?: string }) => {
    const response = await api.put<{ organization: Organization }>('/organizations/me/branding', data);
    return response.data.organization;
  },
  uploadLogo: async (file: File, variant: 'full' | 'mark') => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await api.post<{ organization: Organization }>(
      `/organizations/me/branding/logo?variant=${variant}`,
      formData
    );
    return response.data.organization;
  },
  deleteLogo: async (variant: 'full' | 'mark') => {
    const response = await api.delete<{ organization: Organization }>(`/organizations/me/branding/logo/${variant}`);
    return response.data.organization;
  },
};
