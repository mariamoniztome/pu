import api from './axios';
import { CalendarConnection, ExternalCalendarEvent } from '../types/calendarIntegration';

export const calendarIntegrationsApi = {
  list: async () => {
    const response = await api.get<{
      connections: CalendarConnection[];
      googleConfigured: boolean;
      outlookConfigured: boolean;
    }>('/calendar-integrations');
    return response.data;
  },
  getGoogleAuthUrl: async () => {
    const response = await api.get<{ url: string }>('/calendar-integrations/google/connect');
    return response.data.url;
  },
  getOutlookAuthUrl: async () => {
    const response = await api.get<{ url: string }>('/calendar-integrations/outlook/connect');
    return response.data.url;
  },
  connectIcloud: async (data: { email: string; appSpecificPassword: string }) => {
    const response = await api.post<{ message: string }>('/calendar-integrations/icloud/connect', data);
    return response.data;
  },
  sync: async (id: string) => {
    const response = await api.post<{ message: string; lastSyncedAt?: string }>(`/calendar-integrations/${id}/sync`);
    return response.data;
  },
  disconnect: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/calendar-integrations/${id}`);
    return response.data;
  },
  getEvents: async (params?: { start?: string; end?: string }) => {
    const response = await api.get<{ events: ExternalCalendarEvent[] }>('/calendar-integrations/events', { params });
    return response.data.events;
  },
};
