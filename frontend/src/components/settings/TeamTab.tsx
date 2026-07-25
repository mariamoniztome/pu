import { useState, useEffect } from 'react';
import { Plus, Shield, UserX, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api/auth';
import type { Doctor, InviteDoctorData } from '../../types/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
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
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-primary-300 to-lilac-300 flex items-center justify-center flex-shrink-0`}>
      <span className="font-semibold text-white">
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
                  aria-label={t(`settings.team.permissionLabels.${key}`)}
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{t('settings.team.title')}</h3>
          <p className="text-sm text-gray-500">{t('settings.team.subtitle', { count: doctors.length })}</p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('doctors.inviteDoctor')}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3">{t('settings.team.columns.member')}</th>
              <th className="px-4 py-3">{t('doctors.role')}</th>
              <th className="px-4 py-3 hidden md:table-cell">{t('doctors.phoneLabel')}</th>
              <th className="px-4 py-3 hidden md:table-cell">{t('doctors.lastLogin')}</th>
              <th className="px-4 py-3">{t('common.status')}</th>
              <th className="px-4 py-3 text-right">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doc) => {
              const isSelf = doc._id === currentDoctor?._id;
              const editable = !isSelf && doc.role !== 'owner';
              return (
                <tr key={doc._id} className="border-t border-gray-100 menu-item">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <DoctorAvatar doctor={doc} size={8} />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {doc.firstName} {doc.lastName}
                          {isSelf && <span className="text-gray-400 font-normal"> ({t('settings.team.you')})</span>}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{doc.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(doc.role)}`}>
                      {t(`doctors.${doc.role}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">{doc.phone || '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                    {doc.lastLogin ? new Date(doc.lastLogin).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {doc.invitePending ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 whitespace-nowrap">
                        {t('doctors.invitePending')}
                      </span>
                    ) : doc.isActive ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {t('settings.team.active')}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {t('doctors.inactive')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editable && (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title={t('settings.team.permissions')}
                          aria-label={t('settings.team.permissions')}
                          onClick={() => setPermissionsDoctor(doc)}
                        >
                          <Shield className="h-4 w-4 text-gray-600" />
                        </Button>
                        {doc.isActive ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            title={t('doctors.deactivate')}
                            aria-label={t('doctors.deactivate')}
                            onClick={() => handleDeactivate(doc._id)}
                          >
                            <UserX className="h-4 w-4 text-red-500" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            title={t('doctors.activate')}
                            aria-label={t('doctors.activate')}
                            onClick={() => handleReactivate(doc._id)}
                          >
                            <UserCheck className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
