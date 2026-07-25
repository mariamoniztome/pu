export interface Organization {
  _id: string;
  name: string;
  type: 'individual' | 'clinic';
  email: string;
  phone?: string;
  address?: string;
  subscription: {
    plan: 'free' | 'basic' | 'professional' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled' | 'past_due';
    startDate: string;
    endDate?: string;
    maxDoctors: number;
    maxPatients: number;
  };
  settings: {
    timezone: string;
    language: string;
    dateFormat: string;
    currency: string;
    allowDataSharing: boolean;
  };
  branding?: {
    logo?: string;
    primaryColor?: string;
    clinicName?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  _id: string;
  organization: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
  role: 'owner' | 'admin' | 'member';
  permissions: {
    canManageOrganization: boolean;
    canManageDoctors: boolean;
    canViewAllPatients: boolean;
    canManageBilling: boolean;
    canViewAllCalendars: boolean;
    canManageBranding: boolean;
    canManageTeamProfiles: boolean;
  };
  effectivePermissions?: Doctor['permissions'];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  organizationName: string;
  organizationType: 'individual' | 'clinic';
  organizationEmail?: string;
  organizationPhone?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  doctor: Doctor;
  organization: Organization;
}

export interface InviteDoctorData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
  role?: 'admin' | 'member';
  permissions?: Partial<Doctor['permissions']>;
}
