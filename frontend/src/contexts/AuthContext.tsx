import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, setAuthToken, removeAuthToken, isAuthenticated } from '../api/auth';
import type { Doctor, Organization, LoginData, RegisterData } from '../types/auth';
import { saveOrgBrandingSnapshot } from '../lib/orgBranding';

function snapshotBranding(organization: Organization) {
  saveOrgBrandingSnapshot({
    clinicName: organization.branding?.clinicName || organization.name,
    logoFull: organization.branding?.logoFull,
    logoMark: organization.branding?.logoMark,
  });
}

interface AuthContextType {
  doctor: Doctor | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      if (!isAuthenticated()) {
        setDoctor(null);
        setOrganization(null);
        return;
      }

      const data = await authAPI.getMe();
      setDoctor(data.doctor);
      setOrganization(data.organization);
      snapshotBranding(data.organization);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      removeAuthToken();
      setDoctor(null);
      setOrganization(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    const response = await authAPI.login(data);
    setAuthToken(response.token);
    setDoctor(response.doctor);
    setOrganization(response.organization);
    snapshotBranding(response.organization);
  };

  const register = async (data: RegisterData) => {
    const response = await authAPI.register(data);
    setAuthToken(response.token);
    setDoctor(response.doctor);
    setOrganization(response.organization);
    snapshotBranding(response.organization);
  };

  const logout = () => {
    removeAuthToken();
    setDoctor(null);
    setOrganization(null);
  };

  const value: AuthContextType = {
    doctor,
    organization,
    isAuthenticated: !!doctor,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
