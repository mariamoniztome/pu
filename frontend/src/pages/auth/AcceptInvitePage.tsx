import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { PasswordInput } from '../../components/ui/password-input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI, setAuthToken } from '../../api/auth';
import type { InviteInfo } from '../../types/auth';
import { PasswordStrengthMeter, passwordScore } from '../../components/auth/PasswordStrengthMeter';

export const AcceptInvitePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { token } = useParams<{ token: string }>();
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });

  useEffect(() => {
    if (!token) {
      setLoadError(true);
      setIsLoading(false);
      return;
    }
    authAPI
      .getInvite(token)
      .then(({ invite }) => setInvite(invite))
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.acceptInvite.passwordsDoNotMatch'));
      return;
    }
    if (formData.password.length < 8) {
      toast.error(t('auth.acceptInvite.passwordTooShort'));
      return;
    }
    if (passwordScore(formData.password) < 2) {
      toast.error(t('auth.passwordStrength.tooWeak'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authAPI.acceptInvite(token, formData.password);
      setAuthToken(response.token);
      await refreshUser();
      toast.success(t('auth.acceptInvite.successToast'));
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('Accept invite error:', error);
      toast.error(error.response?.data?.message || t('auth.acceptInvite.failedToast'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="auth-gradient-bg min-h-screen flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (loadError || !invite) {
    return (
      <div className="auth-gradient-bg min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('auth.acceptInvite.invalidTitle')}
          </h1>
          <p className="text-gray-600 mb-6">{t('auth.acceptInvite.invalidSubtitle')}</p>
          <Link to="/login" className="font-medium text-lilac-600 hover:text-lilac-700">
            {t('auth.acceptInvite.backToLogin')}
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-gradient-bg min-h-screen flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('auth.acceptInvite.title')}
          </h1>
          <p className="text-gray-600">
            {invite.organizationName
              ? t('auth.acceptInvite.subtitleWithOrg', { org: invite.organizationName })
              : t('auth.acceptInvite.subtitle')}
          </p>
        </div>

        <div className="mb-6 rounded-2xl bg-lilac-50/60 border border-lilac-100 p-4 space-y-1">
          <p className="text-sm text-gray-900 font-semibold">
            {invite.firstName} {invite.lastName}
          </p>
          <p className="text-sm text-gray-600">{invite.email}</p>
          <p className="text-sm text-gray-600">
            {t('auth.acceptInvite.roleLabel')}: {t(`doctors.${invite.role}`)}
          </p>
          {invite.specialization && (
            <p className="text-sm text-gray-600">{invite.specialization}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="password">{t('auth.acceptInvite.choosePassword')}</Label>
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
            <Label htmlFor="confirmPassword">{t('auth.acceptInvite.confirmPassword')}</Label>
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t('auth.acceptInvite.accepting') : t('auth.acceptInvite.acceptButton')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link to="/login" className="font-medium text-lilac-600 hover:text-lilac-700">
            {t('auth.acceptInvite.backToLogin')}
          </Link>
        </div>
      </Card>
    </div>
  );
};
