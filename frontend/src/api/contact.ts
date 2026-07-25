import api from './axios';

export const contactApi = {
  submit: async (data: { name: string; email: string; message: string }) => {
    const response = await api.post<{ message: string }>('/contact', data);
    return response.data;
  },
};
