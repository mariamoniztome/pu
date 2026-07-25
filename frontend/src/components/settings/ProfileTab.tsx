import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { useTranslation } from '../../hooks/useTranslation';
import { fileUrl } from '../../lib/fileUrl';

export function ProfileTab() {
  const { t } = useTranslation();
  const { doctor, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState(doctor?.firstName || '');
  const [lastName, setLastName] = useState(doctor?.lastName || '');
  const [phone, setPhone] = useState(doctor?.phone || '');
  const [specialization, setSpecialization] = useState(doctor?.specialization || '');
  const [licenseNumber, setLicenseNumber] = useState(doctor?.licenseNumber || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  if (!doctor) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await authAPI.updateDoctor(doctor._id, { firstName, lastName, phone, specialization, licenseNumber });
      await refreshUser();
      toast.success(t('settings.profile.saved'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('settings.profile.saveFailed'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarFile = async (file: File) => {
    setUploadingAvatar(true);
    try {
      await authAPI.uploadAvatar(doctor._id, file);
      await refreshUser();
      toast.success(t('settings.profile.avatarSaved'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('settings.profile.avatarSaveFailed'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error(t('settings.profile.passwordTooShort'));
      return;
    }
    setChangingPassword(true);
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      toast.success(t('settings.profile.passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('settings.profile.passwordChangeFailed'));
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        {doctor.avatar ? (
          <img src={fileUrl(doctor.avatar)} alt="" className="w-20 h-20 rounded-full object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-300 to-lilac-300 flex items-center justify-center">
            <span className="text-white text-2xl font-medium">
              {doctor.firstName[0]}{doctor.lastName[0]}
            </span>
          </div>
        )}
        <div>
          <Button type="button" variant="outline" size="sm" disabled={uploadingAvatar} onClick={() => avatarInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" />
            {t('settings.profile.changePhoto')}
          </Button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAvatarFile(file);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t('doctors.firstName')}</Label>
            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{t('doctors.lastName')}</Label>
            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t('settings.phone')}</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialization">{t('settings.specialization')}</Label>
          <Input id="specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="licenseNumber">{t('settings.licenseNumber')}</Label>
          <Input id="licenseNumber" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
        </div>
        <Button type="submit" disabled={savingProfile}>
          {savingProfile ? t('common.saving') : t('common.save')}
        </Button>
      </form>

      <form onSubmit={handleChangePassword} className="space-y-4 max-w-md border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-900">{t('settings.profile.changePassword')}</h3>
        <div className="space-y-2">
          <Label htmlFor="currentPassword">{t('settings.profile.currentPassword')}</Label>
          <Input id="currentPassword" type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">{t('settings.profile.newPassword')}</Label>
          <Input id="newPassword" type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <Button type="submit" variant="outline" disabled={changingPassword}>
          {changingPassword ? t('common.saving') : t('settings.profile.changePassword')}
        </Button>
      </form>
    </div>
  );
}
