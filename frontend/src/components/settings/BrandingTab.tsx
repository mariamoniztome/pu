import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { organizationApi } from '../../api/organization';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ColorField } from '../ui/color-field';
import { LogoUploader } from '../ui/logo-uploader';
import { toast } from 'sonner';
import { useTranslation } from '../../hooks/useTranslation';

const DEFAULT_PRIMARY = '#84e01e';
const DEFAULT_ACCENT = '#8b68ff';

export function BrandingTab() {
  const { t } = useTranslation();
  const { organization, refreshUser } = useAuth();
  const [clinicName, setClinicName] = useState(organization?.branding?.clinicName || organization?.name || '');
  const [primaryColor, setPrimaryColor] = useState(organization?.branding?.primaryColor || '#84e01e');
  const [accentColor, setAccentColor] = useState(organization?.branding?.accentColor || '#8b68ff');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await organizationApi.updateBranding({ clinicName, primaryColor, accentColor });
      await refreshUser();
      toast.success(t('settings.branding.saved'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('settings.branding.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* <p className="text-sm text-gray-500">{t('settings.branding.effectNote')}</p> */}

      <div className="space-y-2 max-w-md">
        <Label htmlFor="clinicName">{t('settings.branding.clinicName')}</Label>
        <Input id="clinicName" value={clinicName} onChange={(e) => setClinicName(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md">
        <ColorField
          id="primaryColor"
          label={t('settings.branding.primaryColor')}
          value={primaryColor}
          onChange={setPrimaryColor}
        />
        <ColorField
          id="accentColor"
          label={t('settings.branding.accentColor')}
          value={accentColor}
          onChange={setAccentColor}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? t('common.saving') : t('common.save')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setPrimaryColor(DEFAULT_PRIMARY);
            setAccentColor(DEFAULT_ACCENT);
          }}
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          {t('settings.branding.restoreDefaults')}
        </Button>
      </div>

      <div className="border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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
  );
}
