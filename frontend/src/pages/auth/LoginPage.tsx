import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import { useTranslation } from '../../hooks/useTranslation';
import { OrgLogo } from '../../components/branding/OrgLogo';
import { loadOrgBrandingSnapshot } from '../../lib/orgBranding';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const branding = loadOrgBrandingSnapshot();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || t('auth.login.failedToast'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="auth-gradient-bg min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          {branding && (
            <div className="flex justify-center mb-4">
              <OrgLogo
                variant="mark"
                clinicName={branding.clinicName}
                logoMark={branding.logoMark}
                logoFull={branding.logoFull}
              />
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {branding?.clinicName || t('auth.login.welcomeBack')}
          </h1>
          <p className="text-gray-600">
            {t('auth.login.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">{t('auth.login.email')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder={t('auth.login.emailPlaceholder')}
              className="mt-1"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t('auth.login.password')}</Label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-lilac-600 hover:text-lilac-700"
              >
                {t('auth.login.forgotPassword')}
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="mt-1"
            />
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
                {t('auth.login.signingIn')}
              </span>
            ) : (
              t('auth.login.signIn')
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">{t('auth.login.noAccount')}</span>
          <Link
            to="/register"
            className="font-medium text-lilac-600 hover:text-lilac-700"
          >
            {t('auth.login.registerHere')}
          </Link>
        </div>
      </Card>
    </div>
  );
};
