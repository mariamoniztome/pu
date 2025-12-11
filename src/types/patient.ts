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