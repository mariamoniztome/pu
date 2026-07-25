import { useState, useEffect } from 'react';
import { Plus, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api/auth';
import type { Doctor, InviteDoctorData } from '../../types/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';
import { useTranslation } from '../../hooks/useTranslation';
import { fileUrl } from '../../lib/fileUrl';
import { ConfirmDialog } from '../ui/confirm-dialog';

const PERMISSION_KEYS = [
  'canManageOrganization',
  'canManageDoctors',
  'canViewAllPatients',
  'canManageBilling',
  'canViewAllCalendars',
  'canManageBranding',
  'canManageTeamProfiles',
] as const;

type PermissionKey = (typeof PERMISSION_KEYS)[number];

function roleBaseline(role: string): Partial<Record<PermissionKey, boolean>> {
  if (role === 'owner') {
    return PERMISSION_KEYS.reduce((acc, k) => ({ ...acc, [k]: true }), {});
  }
  if (role === 'admin') {
    return { canManageDoctors: true, canViewAllPatients: true };
  }
  return {};
}

function DoctorAvatar({ doctor, size = 12 }: { doctor: Doctor; size?: number }) {
  const sizeClass = size === 12 ? 'w-12 h-12 text-xl' : 'w-8 h-8 text-sm';
  if (doctor.avatar) {
    return (
      <img
        src={fileUrl(doctor.avatar)}
        alt=""
        className={`${sizeClass} rounded-full object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div className={`${sizeClass} rounded-full bg-lilac-100 flex items-center justify-center flex-shrink-0`}>
      <span className="font-semibold text-lilac-700">
        {doctor.firstName[0]}
        {doctor.lastName[0]}
      </span>
    </div>
  );
}

function PermissionMatrixDialog({
  doctor,
  onClose,
  onSaved,
}: {
  doctor: Doctor;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const baseline = roleBaseline(doctor.role);
  const [values, setValues] = useState<Record<PermissionKey, boolean>>(() => {
    const initial = {} as Record<PermissionKey, boolean>;
    for (const key of PERMISSION_KEYS) {
      initial[key] = Boolean(baseline[key] || doctor.permissions[key]);
    }
    return initial;
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const changed: Partial<Record<PermissionKey, boolean>> = {};
      for (const key of PERMISSION_KEYS) {
        if (!baseline[key]) changed[key] = values[key];
      }
      await authAPI.updateDoctorPermissions(doctor._id, changed);
      toast.success(t('settings.team.permissionsSaved'));
      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('settings.team.permissionsSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('settings.team.permissionsFor', { name: `${doctor.firstName} ${doctor.lastName}` })}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-1">
          {PERMISSION_KEYS.map((key) => {
            const isBaseline = Boolean(baseline[key]);
            return (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{t(`settings.team.permissionLabels.${key}`)}</p>
                  {isBaseline && (
                    <p className="text-xs text-gray-400">{t('settings.team.inheritedFromRole', { role: t(`doctors.${doctor.role}`) })}</p>
                  )}
                </div>
                <Switch
                  checked={isBaseline || values[key]}
                  disabled={isBaseline}
                  onCheckedChange={(checked) => setValues((v) => ({ ...v, [key]: checked }))}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TeamTab() {
  const { t } = useTranslation();
  const { doctor: currentDoctor } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [permissionsDoctor, setPermissionsDoctor] = useState<Doctor | null>(null);
  const [doctorToDeactivate, setDoctorToDeactivate] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<InviteDoctorData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
    role: 'member',
  });
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.getDoctors();
      setDoctors(response.doctors);
    } catch (error) {
      toast.error(t('doctors.failedToLoad'));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      const response = await authAPI.inviteDoctor(inviteData);
      if (response.emailSent) {
        toast.success(t('doctors.inviteEmailSent', { email: inviteData.email }));
      } else if (response.inviteUrl) {
        // No SMTP configured — hand the link to the inviter to share manually
        const inviteUrl = response.inviteUrl;
        toast.success(t('doctors.invitedSuccessfully'), {
          description: t('doctors.inviteLinkFallback'),
          duration: 15000,
          action: {
            label: t('doctors.copyInviteLink'),
            onClick: () => navigator.clipboard.writeText(inviteUrl),
          },
        });
      } else {
        toast.success(t('doctors.invitedSuccessfully'));
      }
      setShowInviteDialog(false);
      setInviteData({
        firstName: '', lastName: '', email: '',
        phone: '', specialization: '', licenseNumber: '', role: 'member',
      });
      fetchDoctors();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('doctors.failedToInvite'));
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeactivate = (doctorId: string) => {
    setDoctorToDeactivate(doctorId);
  };

  const confirmDeactivate = async () => {
    if (!doctorToDeactivate) return;
    try {
      await authAPI.deleteDoctor(doctorToDeactivate);
      toast.success(t('doctors.deactivatedSuccessfully'));
      fetchDoctors();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('doctors.failedToDeactivate'));
    } finally {
      setDoctorToDeactivate(null);
    }
  };

  const handleReactivate = async (doctorId: string) => {
    try {
      await authAPI.reactivateDoctor(doctorId);
      toast.success(t('doctors.reactivatedSuccessfully'));
      fetchDoctors();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('doctors.failedToReactivate'));
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowInviteDialog(true)}>
          <Plus className="h-5 w-5 mr-2" />
          {t('doctors.inviteDoctor')}
        </Button>
      </div>

      <div className="grid gap-4">
        {doctors.map((doc) => (
          <Card key={doc._id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <DoctorAvatar doctor={doc} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {doc.firstName} {doc.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{doc.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(doc.role)}`}>
                    {doc.role.charAt(0).toUpperCase() + doc.role.slice(1)}
                  </span>
                  {!doc.isActive && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {t('doctors.inactive')}
                    </span>
                  )}
                  {doc.invitePending && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      {t('doctors.invitePending')}
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {doc.phone && (
                    <div>
                      <span className="text-gray-500">{t('doctors.phone')}</span>
                      <p className="font-medium">{doc.phone}</p>
                    </div>
                  )}
                  {doc.lastLogin && (
                    <div>
                      <span className="text-gray-500">{t('doctors.lastLogin')}</span>
                      <p className="font-medium">{new Date(doc.lastLogin).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {doc._id !== currentDoctor?._id && doc.role !== 'owner' && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPermissionsDoctor(doc)}>
                    <Shield className="h-4 w-4 mr-1" />
                    {t('settings.team.permissions')}
                  </Button>
                  {doc.isActive ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeactivate(doc._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      {t('doctors.deactivate')}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReactivate(doc._id)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {t('doctors.activate')}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>{t('doctors.inviteNewDoctor')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-5">
            <p className="rounded-2xl bg-lilac-50/60 border border-lilac-100 px-4 py-3 text-sm text-gray-600">
              {t('doctors.inviteEmailNote')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">{t('doctors.firstName')} <span className="text-red-500">*</span></Label>
                <Input id="firstName" required value={inviteData.firstName}
                  onChange={(e) => setInviteData({ ...inviteData, firstName: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">{t('doctors.lastName')} <span className="text-red-500">*</span></Label>
                <Input id="lastName" required value={inviteData.lastName}
                  onChange={(e) => setInviteData({ ...inviteData, lastName: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">{t('doctors.email')} <span className="text-red-500">*</span></Label>
                <Input id="email" type="email" required value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">{t('doctors.phoneLabel')}</Label>
                <Input id="phone" value={inviteData.phone}
                  onChange={(e) => setInviteData({ ...inviteData, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="specialization">{t('doctors.specializationLabel')}</Label>
                <Input id="specialization" value={inviteData.specialization}
                  onChange={(e) => setInviteData({ ...inviteData, specialization: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="licenseNumber">{t('doctors.licenseNumber')}</Label>
                <Input id="licenseNumber" value={inviteData.licenseNumber}
                  onChange={(e) => setInviteData({ ...inviteData, licenseNumber: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('doctors.role')}</Label>
                <Select value={inviteData.role} onValueChange={(value) => setInviteData({ ...inviteData, role: value as 'admin' | 'member' })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('doctors.selectRole')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">{t('doctors.member')}</SelectItem>
                    <SelectItem value="admin">{t('doctors.admin')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isInviting}>
                {isInviting ? t('doctors.sendingInvite') : t('doctors.sendInvite')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {permissionsDoctor && (
        <PermissionMatrixDialog
          doctor={permissionsDoctor}
          onClose={() => setPermissionsDoctor(null)}
          onSaved={fetchDoctors}
        />
      )}

      <ConfirmDialog
        open={!!doctorToDeactivate}
        onOpenChange={(open) => !open && setDoctorToDeactivate(null)}
        title={t('doctors.confirmDeactivate')}
        confirmLabel={t('doctors.deactivate')}
        onConfirm={confirmDeactivate}
      />
    </div>
  );
}
