export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  email?: string;
  phone: string;
  address?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  familyNotes?: string;
  contextNotes?: string;
  medicalHistory?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  _id: string;
  patient: Patient | string;
  dateTime: string;
  duration: number;
  type: 'initial' | 'follow-up' | 'assessment' | 'therapy' | 'other';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedAt: string;
}

export interface Consultation {
  _id: string;
  patient: Patient | string;
  appointment?: Appointment | string;
  date: string;
  sessionNumber: number;
  chiefComplaint?: string;
  sessionNotes: string;
  clinicalObservations?: string;
  interventions?: string;
  homework?: string;
  progressAssessment?: string;
  nextSessionPlan?: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
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

export interface Payment {
  _id: string;
  patient: Patient | string;
  consultation?: Consultation | string;
  appointment?: Appointment | string;
  amount: number;
  currency: string;
  paymentDate?: string;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'check' | 'insurance' | 'other';
  status: 'unpaid' | 'partial' | 'paid';
  amountPaid: number;
  invoiceNumber?: string;
  notes?: string;
  receiptAttachment?: Attachment;
  createdAt: string;
  updatedAt: string;
}
