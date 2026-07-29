import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { organizationApi } from '../../api/organization';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { PasswordInput } from '../../components/ui/password-input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { ColorField } from '../../components/ui/color-field';
import { LogoUploader } from '../../components/ui/logo-uploader';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../components/ui/select';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../hooks/useTranslation';
import { PasswordStrengthMeter, passwordScore } from '../../components/auth/PasswordStrengthMeter';
import { PLANS, type PlanId } from '../../lib/plans';

const DEFAULT_PRIMARY = '#84e01e';
const DEFAULT_ACCENT = '#8b68ff';

type Step = 1 | 2 | 3;

function StepIndicator({ step }: { step: Step }) {
  const { t } = useTranslation();
  const labels = [
    t('auth.register.stepData'),
    t('auth.register.stepOrganization'),
    t('auth.register.stepBranding'),
  ];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {labels.map((label, i) => {
        const n = (i + 1) as Step;
        const isDone = n < step;
        const isCurrent = n === step;
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0',
                  isDone ? 'bg-gray-900 text-white' : isCurrent ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : n}
              </div>
              <span className={cn('text-sm font-medium hidden sm:inline', isCurrent ? 'text-gray-900' : 'text-gray-400')}>
                {label}
              </span>
            </div>
            {n < 3 && <div className={cn('w-8 h-px', isDone ? 'bg-gray-900' : 'bg-gray-200')} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, refreshUser, organization } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  // Self-serve signup always starts on the free trial — there's no payment
  // collection yet, so paid tiers are shown but only reachable by contacting us.
  const [plan] = useState<PlanId>('free');
  const [step, setStep] = useState<Step>(1);
  const [useCustomBranding, setUseCustomBranding] = useState(false);
  const [clinicName, setClinicName] = useState('');
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY);
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.register.passwordsDoNotMatch'));
      return;
    }
    if (formData.password.length < 8) {
      toast.error(t('auth.register.passwordTooShort'));
      return;
    }
    if (passwordScore(formData.password) < 2) {
      toast.error(t('auth.passwordStrength.tooWeak'));
      return;
    }
    setStep(2);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register({ ...registerData, plan });
      setStep(3);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || t('auth.register.registrationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const finishToApp = async () => {
    setIsLoading(true);
    try {
      if (useCustomBranding) {
        await organizationApi.updateBranding({
          clinicName: clinicName || formData.organizationName,
          primaryColor,
          accentColor,
        });
        await refreshUser();
      }
      toast.success(t('auth.register.registrationSuccess'));
      navigate('/', { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('settings.branding.saveFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-gradient-bg min-h-screen flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-4xl p-8">
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('auth.register.createAccount')}
          </h1>
          <p className="text-gray-600">
            {t('auth.register.subtitle')}
          </p>
        </div>

        <StepIndicator step={step} />

        {step === 1 && (
          <form onSubmit={handleNextFromStep1} className="space-y-6 max-w-xl mx-auto">
            {/* <h2 className="text-lg font-semibold text-gray-900">
              {t('auth.register.yourInfo')} */}
            {/* </h2> */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <PasswordInput
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="mt-1"
                />
                <PasswordStrengthMeter password={formData.password} />
              </div>

              <div>
                <Label htmlFor="confirmPassword">
                  {t('auth.register.confirmPassword')} <span className="text-red-500">*</span>
                </Label>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>

              {/* <p className="sm:col-span-2 text-xs text-gray-500 -mt-2">
                {t('auth.register.passwordHelp')}
              </p> */}
            </div>

            <Button type="submit" className="w-full">
              {t('auth.register.continueButton')}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCreateAccount} className="space-y-6 max-w-xl mx-auto">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('auth.register.choosePlan')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PLANS.map((p) => {
                  const isFree = p.id === 'free';
                  const isSelected = plan === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => !isFree && toast.info(t('auth.register.paidPlanContact'))}
                      className={cn(
                        'relative rounded-2xl border p-3 text-left transition-colors',
                        isSelected
                          ? 'border-gray-900 ring-1 ring-gray-900 bg-gray-50/60'
                          : isFree
                          ? 'border-gray-200 bg-white hover:border-gray-300'
                          : 'border-gray-200 bg-gray-50/60 opacity-70'
                      )}
                    >
                      {isSelected && <Check className="h-4 w-4 absolute top-3 right-3 text-gray-900" />}
                      {!isFree && <Lock className="h-3.5 w-3.5 absolute top-3 right-3 text-gray-400" />}
                      <p className="font-semibold text-gray-900 text-sm">{t(`settings.subscriptionTab.plans.${p.id}`)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {p.maxDoctors === 0
                          ? t('settings.subscriptionTab.unlimitedDoctors')
                          : t('settings.subscriptionTab.doctorsLimit', { count: p.maxDoctors })}
                      </p>
                      {!isFree && (
                        <p className="text-[11px] font-medium text-lilac-600 mt-1">{t('auth.register.contactForPlan')}</p>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-3">{t('auth.register.startsOnFree')}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t('auth.register.organizationInfo')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
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
                  <Select
                    value={formData.organizationType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, organizationType: value as 'individual' | 'clinic' })
                    }
                  >
                    <SelectTrigger id="organizationType" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">{t('auth.register.individualPractice')}</SelectItem>
                      <SelectItem value="clinic">{t('auth.register.clinicMultipleDoctors')}</SelectItem>
                    </SelectContent>
                  </Select>
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

                <div className="sm:col-span-2">
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

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)} disabled={isLoading}>
                {t('auth.register.back')}
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? t('auth.register.creatingAccount') : t('auth.register.createAccountButton')}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="space-y-2">
              <Label htmlFor="clinicName">{t('settings.branding.clinicName')}</Label>
              <Input
                id="clinicName"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder={formData.organizationName}
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
              <div>
                <Label>{t('auth.register.customBranding')}</Label>
                <p className="text-xs text-gray-500 mt-0.5">{t('auth.register.customBrandingHelp')}</p>
              </div>
              <Switch checked={useCustomBranding} onCheckedChange={setUseCustomBranding} aria-label={t('auth.register.customBranding')} />
            </div>

            {useCustomBranding && (
              <div className="grid grid-cols-2 gap-4">
                <ColorField
                  id="regPrimaryColor"
                  label={t('settings.branding.primaryColor')}
                  value={primaryColor}
                  onChange={setPrimaryColor}
                />
                <ColorField
                  id="regAccentColor"
                  label={t('settings.branding.accentColor')}
                  value={accentColor}
                  onChange={setAccentColor}
                />
              </div>
            )}

            <div className="border-t border-gray-100 pt-6">
              <p className="text-sm font-medium text-gray-900 mb-1">{t('auth.register.addYourLogo')}</p>
              <p className="text-xs text-gray-500 mb-4">{t('auth.register.addYourLogoHelp')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <LogoUploader
                  label={t('settings.branding.logoMark')}
                  currentPath={organization?.branding?.logoMark}
                  variant="mark"
                  onUploaded={refreshUser}
                  shapeClass="w-16 h-16 rounded-2xl"
                />
                <LogoUploader
                  label={t('settings.branding.logoFull')}
                  currentPath={organization?.branding?.logoFull}
                  variant="full"
                  onUploaded={refreshUser}
                  shapeClass="w-40 h-16 rounded-xl"
                />
              </div>
            </div>

            <Button type="button" className="w-full" onClick={finishToApp} disabled={isLoading}>
              {isLoading ? t('common.saving') : t('auth.register.finish')}
            </Button>
          </div>
        )}

        {step !== 3 && (
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">{t('auth.register.alreadyHaveAccount')}</span>
            <Link
              to="/login"
              className="font-medium text-lilac-600 hover:text-lilac-700"
            >
              {t('auth.register.signInHere')}
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};
