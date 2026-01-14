import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';

export const SettingsPage: React.FC = () => {
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="grid gap-6">
        {/* Profile Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Profile Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <p className="mt-1 text-gray-900">
                {doctor?.firstName} {doctor?.lastName}
              </p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="mt-1 text-gray-900">{doctor?.email}</p>
            </div>
            <div>
              <Label>Role</Label>
              <p className="mt-1">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {doctor?.role ? doctor.role.charAt(0).toUpperCase() + doctor.role.slice(1) : ''}
                </span>
              </p>
            </div>
            {doctor?.phone && (
              <div>
                <Label>Phone</Label>
                <p className="mt-1 text-gray-900">{doctor.phone}</p>
              </div>
            )}
            {doctor?.specialization && (
              <div>
                <Label>Specialization</Label>
                <p className="mt-1 text-gray-900">{doctor.specialization}</p>
              </div>
            )}
            {doctor?.licenseNumber && (
              <div>
                <Label>License Number</Label>
                <p className="mt-1 text-gray-900">{doctor.licenseNumber}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Organization Information */}
        {canManageOrganization && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Organization Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Organization Name</Label>
                <p className="mt-1 text-gray-900">{organization?.name}</p>
              </div>
              <div>
                <Label>Type</Label>
                <p className="mt-1 text-gray-900 capitalize">
                  {organization?.type}
                </p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="mt-1 text-gray-900">{organization?.email}</p>
              </div>
              {organization?.phone && (
                <div>
                  <Label>Phone</Label>
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
              Subscription
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Plan</Label>
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
                <Label>Status</Label>
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
                <Label>Max Doctors</Label>
                <p className="mt-1 text-gray-900">
                  {organization?.subscription.maxDoctors === 0
                    ? 'Unlimited'
                    : organization?.subscription.maxDoctors}
                </p>
              </div>
              <div>
                <Label>Max Patients</Label>
                <p className="mt-1 text-gray-900">
                  {organization?.subscription.maxPatients === 0
                    ? 'Unlimited'
                    : organization?.subscription.maxPatients}
                </p>
              </div>
              <div>
                <Label>Start Date</Label>
                <p className="mt-1 text-gray-900">
                  {organization?.subscription.startDate &&
                    new Date(organization.subscription.startDate).toLocaleDateString()}
                </p>
              </div>
              {organization?.subscription.endDate && (
                <div>
                  <Label>End Date</Label>
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
              Organization Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Data Sharing</Label>
                <p className="mt-1 text-gray-900">
                  {organization?.settings.allowDataSharing
                    ? 'Enabled - All doctors can see all patients'
                    : 'Disabled - Doctors only see their own patients'}
                </p>
              </div>
              <div>
                <Label>Timezone</Label>
                <p className="mt-1 text-gray-900">
                  {organization?.settings.timezone}
                </p>
              </div>
              <div>
                <Label>Language</Label>
                <p className="mt-1 text-gray-900">
                  {organization?.settings.language}
                </p>
              </div>
              <div>
                <Label>Currency</Label>
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
            Your Permissions
          </h2>
          <div className="flex flex-wrap gap-2">
            {doctor?.permissions.canManageOrganization && (
              <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                ✓ Manage Organization
              </span>
            )}
            {doctor?.permissions.canManageDoctors && (
              <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                ✓ Manage Doctors
              </span>
            )}
            {doctor?.permissions.canViewAllPatients && (
              <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                ✓ View All Patients
              </span>
            )}
            {doctor?.permissions.canManageBilling && (
              <span className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                ✓ Manage Billing
              </span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
