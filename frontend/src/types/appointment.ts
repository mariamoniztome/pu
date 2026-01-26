import { Patient } from "./patient";

export interface Appointment {
  _id: string;
  patient: Patient | string | null;
  dateTime: string;
  duration: number;
  type: 'initial' | 'follow-up' | 'assessment' | 'therapy' | 'other';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}