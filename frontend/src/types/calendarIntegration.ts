export type CalendarProvider = 'google' | 'outlook' | 'icloud';

export interface CalendarConnection {
  _id: string;
  provider: CalendarProvider;
  accountLabel: string;
  status: 'connected' | 'error';
  lastSyncedAt?: string;
  lastSyncError?: string;
}

export interface ExternalCalendarEvent {
  _id: string;
  provider: CalendarProvider;
  title: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
}
