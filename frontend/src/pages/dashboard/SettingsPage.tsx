import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { organizationApi } from '../../api/organization';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../hooks/useTranslation';
import { toast } from 'sonner';
import { TeamTab } from '../../components/settings/TeamTab';
import { BrandingTab } from '../../components/settings/BrandingTab';
import { ProfileTab } from '../../components/settings/ProfileTab';

type Tab = 'profile' | 'team' | 'branding' | 'organization' | 'subscription' | 'access';

function OrganizationTab() {
  const { t } = useTranslation();
  const { organization, refreshUser } = useAuth();
  const [name, setName] = useState(organization?.name || '');
  const [phone, setPhone] = useState(organization?.phone || '');
  const [address, setAddress] = useState(organization?.address || '');
  const [timezone, setTimezone] = useState(organization?.settings.timezone || '');
  const [currency, setCurrency] = useState(organization?.settings.currency || '');
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
    <div className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="orgName">{t('settings.organizationName')}</Label>
        <Input id="orgName" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="orgPhone">{t('settings.organizationPhone')}</Label>
        <Input id="orgPhone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="orgAddress">{t('settings.address')}</Label>
        <Input id="orgAddress" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="timezone">{t('settings.timezone')}</Label>
          <Input id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">{t('settings.currency')}</Label>
          <Input id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
        </div>
      </div>
      <div className="flex items-center justify-between py-2">
        <div>
          <p className="text-sm font-medium text-gray-900">{t('settings.dataSharing')}</p>
          <p className="text-xs text-gray-500">
            {allowDataSharing ? t('settings.dataSharingEnabled') : t('settings.dataSharingDisabled')}
          </p>
        </div>
        <Switch checked={allowDataSharing} onCheckedChange={setAllowDataSharing} />
      </div>
      <Button type="button" onClick={handleSave} disabled={saving}>
        {saving ? t('common.saving') : t('common.save')}
      </Button>
    </div>
  );
}

function SubscriptionTab() {
  const { t } = useTranslation();
  const { organization } = useAuth();

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'past_due': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
      <div>
        <Label>{t('settings.plan')}</Label>
        <p className="mt-1">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanBadgeColor(organization?.subscription.plan || '')}`}>
            {(organization?.subscription.plan || '').charAt(0).toUpperCase() + (organization?.subscription.plan || '').slice(1)}
          </span>
        </p>
      </div>
      <div>
        <Label>{t('settings.status')}</Label>
        <p className="mt-1">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSubscriptionStatusColor(organization?.subscription.status || '')}`}>
            {(organization?.subscription.status || '').charAt(0).toUpperCase() + (organization?.subscription.status || '').slice(1)}
          </span>
        </p>
      </div>
      <div>
        <Label>{t('settings.maxDoctors')}</Label>
        <p className="mt-1 text-gray-900">
          {organization?.subscription.maxDoctors === 0 ? t('settings.unlimited') : organization?.subscription.maxDoctors}
        </p>
      </div>
      <div>
        <Label>{t('settings.maxPatients')}</Label>
        <p className="mt-1 text-gray-900">
          {organization?.subscription.maxPatients === 0 ? t('settings.unlimited') : organization?.subscription.maxPatients}
        </p>
      </div>
      <div>
        <Label>{t('settings.startDate')}</Label>
        <p className="mt-1 text-gray-900">
          {organization?.subscription.startDate && new Date(organization.subscription.startDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

function AccessTab() {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const keys = [
    'canManageOrganization', 'canManageDoctors', 'canViewAllPatients', 'canManageBilling',
    'canViewAllCalendars', 'canManageBranding', 'canManageTeamProfiles',
  ] as const;

  return (
    <div className="flex flex-wrap gap-2">
      {keys.filter((k) => can(k)).map((k) => (
        <span key={k} className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
          {t(`settings.team.permissionLabels.${k}`)}
        </span>
      ))}
    </div>
  );
}

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs: { key: Tab; label: string; visible: boolean }[] = [
    { key: 'profile', label: t('settings.tabs.profile'), visible: true },
    { key: 'team', label: t('settings.tabs.team'), visible: can('canManageDoctors') },
    { key: 'branding', label: t('settings.tabs.branding'), visible: can('canManageBranding') },
    { key: 'organization', label: t('settings.tabs.organization'), visible: can('canManageOrganization') },
    { key: 'subscription', label: t('settings.tabs.subscription'), visible: can('canManageBilling') },
    { key: 'access', label: t('settings.tabs.access'), visible: true },
  ];
  const visibleTabs = tabs.filter((tab) => tab.visible);
  const currentTab = visibleTabs.some((t) => t.key === activeTab) ? activeTab : 'profile';

  return (
    <div className="space-y-6">
      <div className="flex gap-6 border-b border-gray-200">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
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
        {currentTab === 'subscription' && <SubscriptionTab />}
        {currentTab === 'access' && <AccessTab />}
      </Card>
    </div>
  );
};
