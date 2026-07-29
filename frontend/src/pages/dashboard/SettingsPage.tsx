import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Minus, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { organizationApi } from '../../api/organization';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../components/ui/select';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../hooks/useTranslation';
import { toast } from 'sonner';
import { TeamTab } from '../../components/settings/TeamTab';
import { BrandingTab } from '../../components/settings/BrandingTab';
import { ProfileTab } from '../../components/settings/ProfileTab';
import { CalendarIntegrationsTab } from '../../components/settings/CalendarIntegrationsTab';
import { PLANS } from '../../lib/plans';

type Tab = 'profile' | 'team' | 'branding' | 'organization' | 'integrations' | 'subscription' | 'access';

const TIMEZONES = [
  'UTC',
  'Europe/Lisbon',
  'Atlantic/Azores',
  'Atlantic/Madeira',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Paris',
  'Europe/Berlin',
  'America/Sao_Paulo',
  'America/New_York',
  'America/Los_Angeles',
];

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'BRL'];

function OrganizationTab() {
  const { t } = useTranslation();
  const { organization, refreshUser } = useAuth();
  const [name, setName] = useState(organization?.name || '');
  const [phone, setPhone] = useState(organization?.phone || '');
  const [address, setAddress] = useState(organization?.address || '');
  const [timezone, setTimezone] = useState(organization?.settings.timezone || 'UTC');
  const [currency, setCurrency] = useState(organization?.settings.currency || 'EUR');
  const [allowDataSharing, setAllowDataSharing] = useState(organization?.settings.allowDataSharing || false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await organizationApi.update({ name, phone, address, settings: { timezone, currency, allowDataSharing } });
      await refreshUser();
      toast.success(t('settings.profile.saved'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('settings.profile.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-x-10 gap-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">{t('settings.organizationName')}</Label>
            <Input id="orgName" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgPhone">{t('settings.organizationPhone')}</Label>
            <Input id="orgPhone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="orgAddress">{t('settings.address')}</Label>
            <Input id="orgAddress" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t('settings.timezone')}</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('settings.currency')}</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? t('common.saving') : t('common.save')}
        </Button>
      </div>

      <div className="lg:border-l lg:border-gray-100 lg:pl-10">
        <div className="rounded-2xl border border-gray-100 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">{t('settings.dataSharing')}</p>
            <Switch checked={allowDataSharing} onCheckedChange={setAllowDataSharing} aria-label={t('settings.dataSharing')} />
          </div>
          <p className="text-xs text-gray-500">
            {allowDataSharing ? t('settings.dataSharingEnabled') : t('settings.dataSharingDisabled')}
          </p>
        </div>
      </div>
    </div>
  );
}

function SubscriptionTab() {
  const { t } = useTranslation();
  const { organization } = useAuth();
  const currentPlan = organization?.subscription.plan || 'free';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{t('settings.subscriptionTab.title')}</h3>
          <p className="text-sm text-gray-500">
            {t('settings.subscriptionTab.currentSince', {
              date: organization?.subscription.startDate
                ? new Date(organization.subscription.startDate).toLocaleDateString()
                : '—',
            })}
          </p>
        </div>
        <span className={cn(
          'px-3 py-1 rounded-full text-sm font-medium',
          organization?.subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        )}>
          {organization?.subscription.status
            ? t(`settings.subscriptionTab.status.${organization.subscription.status}`)
            : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              className={cn(
                'rounded-2xl border p-5 flex flex-col gap-3 transition-colors',
                isCurrent
                  ? 'border-gray-900 bg-gray-50/60 ring-1 ring-gray-900'
                  : 'border-gray-200 bg-white'
              )}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">{t(`settings.subscriptionTab.plans.${plan.id}`)}</h4>
                {plan.id === 'professional' && !isCurrent && (
                  <Sparkles className="h-4 w-4 text-lilac-500" />
                )}
              </div>
              <ul className="text-sm text-gray-600 space-y-1.5 flex-1">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                  {plan.maxDoctors === 0
                    ? t('settings.subscriptionTab.unlimitedDoctors')
                    : t('settings.subscriptionTab.doctorsLimit', { count: plan.maxDoctors })}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                  {plan.maxPatients === 0
                    ? t('settings.subscriptionTab.unlimitedPatients')
                    : t('settings.subscriptionTab.patientsLimit', { count: plan.maxPatients })}
                </li>
              </ul>
              {isCurrent ? (
                <div className="text-center text-xs font-semibold text-gray-900 bg-gray-100 rounded-full py-2">
                  {t('settings.subscriptionTab.currentPlan')}
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => toast.info(t('settings.subscriptionTab.billingSoon'))}
                >
                  {t('settings.subscriptionTab.switchPlan')}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400">{t('settings.subscriptionTab.billingNote')}</p>
    </div>
  );
}

const ALL_PERMISSION_KEYS = [
  'canManageOrganization',
  'canManageDoctors',
  'canViewAllPatients',
  'canManageBilling',
  'canViewAllCalendars',
  'canManageBranding',
  'canManageTeamProfiles',
] as const;

function AccessTab() {
  const { t } = useTranslation();
  const { doctor } = useAuth();
  const { can } = usePermissions();

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex items-center gap-3">
        <p className="text-sm text-gray-600">{t('settings.access.yourRole')}</p>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
          {doctor?.role ? t(`doctors.${doctor.role}`) : ''}
        </span>
      </div>
      <div className="rounded-2xl border border-gray-100 divide-y divide-gray-100 bg-white">
        {ALL_PERMISSION_KEYS.map((key) => {
          const granted = can(key);
          return (
            <div key={key} className="flex items-center justify-between px-4 py-3">
              <span className={cn('text-sm', granted ? 'text-gray-900' : 'text-gray-400')}>
                {t(`settings.team.permissionLabels.${key}`)}
              </span>
              {granted ? (
                <span className="flex items-center gap-1.5 text-xs font-medium text-green-700">
                  <Check className="h-4 w-4" />
                  {t('settings.access.granted')}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                  <Minus className="h-4 w-4" />
                  {t('settings.access.notGranted')}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam || 'profile');

  const tabs: { key: Tab; label: string; visible: boolean }[] = [
    { key: 'profile', label: t('settings.tabs.profile'), visible: true },
    { key: 'team', label: t('settings.tabs.team'), visible: can('canManageDoctors') },
    { key: 'branding', label: t('settings.tabs.branding'), visible: can('canManageBranding') },
    { key: 'organization', label: t('settings.tabs.organization'), visible: can('canManageOrganization') },
    { key: 'integrations', label: t('settings.tabs.integrations'), visible: true },
    { key: 'subscription', label: t('settings.tabs.subscription'), visible: can('canManageBilling') },
    { key: 'access', label: t('settings.tabs.access'), visible: true },
  ];
  const visibleTabs = tabs.filter((tab) => tab.visible);
  const currentTab = visibleTabs.some((t) => t.key === activeTab) ? activeTab : 'profile';

  const selectTab = (key: Tab) => {
    setActiveTab(key);
    const next = new URLSearchParams(searchParams);
    next.set('tab', key);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-6 border-b border-gray-200">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => selectTab(tab.key)}
            className={cn(
              'pb-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              currentTab === tab.key
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="p-6">
        {currentTab === 'profile' && <ProfileTab />}
        {currentTab === 'team' && <TeamTab />}
        {currentTab === 'branding' && <BrandingTab />}
        {currentTab === 'organization' && <OrganizationTab />}
        {currentTab === 'integrations' && <CalendarIntegrationsTab />}
        {currentTab === 'subscription' && <SubscriptionTab />}
        {currentTab === 'access' && <AccessTab />}
      </Card>
    </div>
  );
};
