import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import { useTranslation } from '../../hooks/useTranslation';
import { OrgLogo } from '../../components/branding/OrgLogo';
import { loadOrgBrandingSnapshot } from '../../lib/orgBranding';
import { authAPI } from '../../api/auth';

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const branding = loadOrgBrandingSnapshot();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authAPI.forgotPassword(email);
      toast.success(t('auth.forgotPassword.successToast'));
      setSubmitted(true);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || t('auth.forgotPassword.failedToast'));
    } finally {
      setIsLoading(false);
    }
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
            {t('auth.forgotPassword.title')}
          </h1>
          <p className="text-gray-600">
            {t('auth.forgotPassword.subtitle')}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">{t('auth.forgotPassword.email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.forgotPassword.emailPlaceholder')}
                className="mt-1"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('auth.forgotPassword.sending') : t('auth.forgotPassword.sendResetLink')}
            </Button>
          </form>
        ) : (
          <p className="text-center text-sm text-gray-600">
            {t('auth.forgotPassword.successToast')}
          </p>
        )}

        <div className="mt-6 text-center text-sm">
          <Link
            to="/login"
            className="font-medium text-lilac-600 hover:text-lilac-700"
          >
            {t('auth.forgotPassword.backToLogin')}
          </Link>
        </div>
      </Card>
    </div>
  );
};
