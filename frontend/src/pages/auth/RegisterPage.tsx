import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import { useTranslation } from '../../hooks/useTranslation';

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: 'individual' as 'individual' | 'clinic',
    organizationEmail: '',
    organizationPhone: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.register.passwordsDoNotMatch'));
      return;
    }

    if (formData.password.length < 8) {
      toast.error(t('auth.register.passwordTooShort'));
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      toast.success(t('auth.register.registrationSuccess'));
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || t('auth.register.registrationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="auth-gradient-bg min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('auth.register.createAccount')}
          </h1>
          <p className="text-gray-600">
            {t('auth.register.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Information */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('auth.register.organizationInfo')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="organizationName">
                  {t('auth.register.organizationName')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="organizationName"
                  name="organizationName"
                  required
                  value={formData.organizationName}
                  onChange={handleChange}
                  placeholder={t('auth.register.organizationNamePlaceholder')}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="organizationType">
                  {t('auth.register.organizationType')} <span className="text-red-500">*</span>
                </Label>
                <select
                  id="organizationType"
                  name="organizationType"
                  required
                  value={formData.organizationType}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="individual">{t('auth.register.individualPractice')}</option>
                  <option value="clinic">{t('auth.register.clinicMultipleDoctors')}</option>
                </select>
              </div>

              <div>
                <Label htmlFor="organizationEmail">{t('auth.register.organizationEmail')}</Label>
                <Input
                  id="organizationEmail"
                  name="organizationEmail"
                  type="email"
                  value={formData.organizationEmail}
                  onChange={handleChange}
                  placeholder={t('auth.register.organizationEmailPlaceholder')}
                  className="mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="organizationPhone">{t('auth.register.organizationPhone')}</Label>
                <Input
                  id="organizationPhone"
                  name="organizationPhone"
                  type="tel"
                  value={formData.organizationPhone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Doctor Information */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('auth.register.yourInfo')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">
                  {t('auth.register.firstName')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder={t('auth.register.firstNamePlaceholder')}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="lastName">
                  {t('auth.register.lastName')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder={t('auth.register.lastNamePlaceholder')}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">
                  {t('auth.register.email')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('auth.register.emailPlaceholder')}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">{t('auth.register.phone')}</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('auth.register.phonePlaceholder')}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="specialization">{t('auth.register.specialization')}</Label>
                <Input
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder={t('auth.register.specializationPlaceholder')}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="licenseNumber">{t('auth.register.licenseNumber')}</Label>
                <Input
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder={t('auth.register.licenseNumberPlaceholder')}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">
                  {t('auth.register.password')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('auth.register.passwordHelp')}
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">
                  {t('auth.register.confirmPassword')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t('auth.register.creatingAccount')}
              </span>
            ) : (
              t('auth.register.createAccountButton')
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">{t('auth.register.alreadyHaveAccount')}</span>
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {t('auth.register.signInHere')}
          </Link>
        </div>
      </Card>
    </div>
  );
};
