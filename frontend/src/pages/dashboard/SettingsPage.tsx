import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { useTranslation } from '../../hooks/useTranslation';

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { doctor, organization } = useAuth();

  const canManageOrganization =
    doctor?.role === 'owner' || doctor?.permissions.canManageOrganization;

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      case 'professional':
        return 'bg-blue-100 text-blue-800';
      case 'basic':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('settings.title')}</h1>

      <div className="grid gap-6">
        {/* Profile Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('settings.profileInformation')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{t('settings.name')}</Label>
              <p className="mt-1 text-gray-900">
                {doctor?.firstName} {doctor?.lastName}
              </p>
            </div>
            <div>
              <Label>{t('settings.email')}</Label>
              <p className="mt-1 text-gray-900">{doctor?.email}</p>
            </div>
            <div>
              <Label>{t('settings.role')}</Label>
              <p className="mt-1">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {doctor?.role ? doctor.role.charAt(0).toUpperCase() + doctor.role.slice(1) : ''}
                </span>
              </p>
            </div>
            {doctor?.phone && (
              <div>
                <Label>{t('settings.phone')}</Label>
                <p className="mt-1 text-gray-900">{doctor.phone}</p>
              </div>
            )}
            {doctor?.specialization && (
              <div>
                <Label>{t('settings.specialization')}</Label>
                <p className="mt-1 text-gray-900">{doctor.specialization}</p>
              </div>
            )}
            {doctor?.licenseNumber && (
              <div>
                <Label>{t('settings.licenseNumber')}</Label>
                <p className="mt-1 text-gray-900">{doctor.licenseNumber}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Organization Information */}
        {canManageOrganization && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('settings.organizationInformation')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t('settings.organizationName')}</Label>
                <p className="mt-1 text-gray-900">{organization?.name}</p>
              </div>
              <div>
                <Label>{t('settings.type')}</Label>
                <p className="mt-1 text-gray-900 capitalize">
                  {organization?.type}
                </p>
              </div>
              <div>
                <Label>{t('settings.email')}</Label>
                <p className="mt-1 text-gray-900">{organization?.email}</p>
              </div>
              {organization?.phone && (
                <div>
                  <Label>{t('settings.organizationPhone')}</Label>
                  <p className="mt-1 text-gray-900">{organization.phone}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Subscription Information */}
        {canManageOrganization && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('settings.subscription')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t('settings.plan')}</Label>
                <p className="mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanBadgeColor(
                      organization?.subscription.plan || ''
                    )}`}
                  >
                    {(organization?.subscription.plan || '').charAt(0).toUpperCase() +
                      (organization?.subscription.plan || '').slice(1)}
                  </span>
                </p>
              </div>
              <div>
                <Label>{t('settings.status')}</Label>
                <p className="mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getSubscriptionStatusColor(
                      organization?.subscription.status || ''
                    )}`}
                  >
                    {(organization?.subscription.status || '').charAt(0).toUpperCase() +
                      (organization?.subscription.status || '').slice(1)}
                  </span>
                </p>
              </div>
              <div>
                <Label>{t('settings.maxDoctors')}</Label>
                <p className="mt-1 text-gray-900">
                  {organization?.subscription.maxDoctors === 0
                    ? t('settings.unlimited')
                    : organization?.subscription.maxDoctors}
                </p>
              </div>
              <div>
                <Label>{t('settings.maxPatients')}</Label>
                <p className="mt-1 text-gray-900">
                  {organization?.subscription.maxPatients === 0
                    ? t('settings.unlimited')
                    : organization?.subscription.maxPatients}
                </p>
              </div>
              <div>
                <Label>{t('settings.startDate')}</Label>
                <p className="mt-1 text-gray-900">
                  {organization?.subscription.startDate &&
                    new Date(organization.subscription.startDate).toLocaleDateString()}
                </p>
              </div>
              {organization?.subscription.endDate && (
                <div>
                  <Label>{t('settings.endDate')}</Label>
                  <p className="mt-1 text-gray-900">
                    {new Date(organization.subscription.endDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Organization Settings */}
        {canManageOrganization && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('settings.organizationSettings')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t('settings.dataSharing')}</Label>
                <p className="mt-1 text-gray-900">
                  {organization?.settings.allowDataSharing
                    ? t('settings.dataSharingEnabled')
                    : t('settings.dataSharingDisabled')}
                </p>
              </div>
              <div>
                <Label>{t('settings.timezone')}</Label>
                <p className="mt-1 text-gray-900">
                  {organization?.settings.timezone}
                </p>
              </div>
              <div>
                <Label>{t('settings.language')}</Label>
                <p className="mt-1 text-gray-900">
                  {organization?.settings.language}
                </p>
              </div>
              <div>
                <Label>{t('settings.currency')}</Label>
                <p className="mt-1 text-gray-900">
                  {organization?.settings.currency}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Permissions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('settings.yourPermissions')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {doctor?.permissions.canManageOrganization && (
              <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                {t('settings.manageOrganization')}
              </span>
            )}
            {doctor?.permissions.canManageDoctors && (
              <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                {t('settings.manageDoctors')}
              </span>
            )}
            {doctor?.permissions.canViewAllPatients && (
              <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                {t('settings.viewAllPatients')}
              </span>
            )}
            {doctor?.permissions.canManageBilling && (
              <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                {t('settings.manageBilling')}
              </span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
