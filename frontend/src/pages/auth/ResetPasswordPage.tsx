import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { PasswordInput } from '../../components/ui/password-input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import { useTranslation } from '../../hooks/useTranslation';
import { OrgLogo } from '../../components/branding/OrgLogo';
import { loadOrgBrandingSnapshot } from '../../lib/orgBranding';
import { authAPI } from '../../api/auth';
import { PasswordStrengthMeter } from '../../components/auth/PasswordStrengthMeter';

export const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const branding = loadOrgBrandingSnapshot();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.resetPassword.passwordsDoNotMatch'));
      return;
    }
    if (formData.password.length < 8) {
      toast.error(t('auth.resetPassword.passwordTooShort'));
      return;
    }
    if (!token) return;

    setIsLoading(true);
    try {
      await authAPI.resetPassword(token, formData.password);
      toast.success(t('auth.resetPassword.successToast'));
      navigate('/login', { replace: true });
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.response?.data?.message || t('auth.resetPassword.failedToast'));
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
            {t('auth.resetPassword.title')}
          </h1>
          <p className="text-gray-600">
            {t('auth.resetPassword.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="password">{t('auth.resetPassword.newPassword')}</Label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="mt-1"
            />
            <PasswordStrengthMeter password={formData.password} />
          </div>

          <div>
            <Label htmlFor="confirmPassword">{t('auth.resetPassword.confirmPassword')}</Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              className="mt-1"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('auth.resetPassword.resetting') : t('auth.resetPassword.resetButton')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link
            to="/login"
            className="font-medium text-lilac-600 hover:text-lilac-700"
          >
            {t('auth.resetPassword.backToLogin')}
          </Link>
        </div>
      </Card>
    </div>
  );
};
