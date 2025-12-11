import { Patient } from "./patient";

export interface Attachment {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedAt: string;
}

export interface ExternalReport {
  _id: string;
  patient: Patient | string;
  reportType: 'court' | 'school' | 'employer' | 'insurance' | 'medical' | 'other';
  recipientName: string;
  recipientOrganization?: string;
  requestDate: string;
  completionDate?: string;
  purpose: string;
  summary: string;
  findings?: string;
  recommendations?: string;
  status: 'requested' | 'in-progress' | 'completed' | 'delivered';
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}