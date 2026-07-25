import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { organizationApi } from '../../api/organization';
import { Button } from './button';
import { Label } from './label';
import { toast } from 'sonner';
import { useTranslation } from '../../hooks/useTranslation';
import { fileUrl } from '../../lib/fileUrl';

export function LogoUploader({
  label,
  currentPath,
  variant,
  onUploaded,
  shapeClass,
}: {
  label: string;
  currentPath?: string;
  variant: 'full' | 'mark';
  onUploaded: () => void;
  shapeClass: string;
}) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      await organizationApi.uploadLogo(file, variant);
      toast.success(t('settings.branding.logoSaved'));
      onUploaded();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('settings.branding.logoSaveFailed'));
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setUploading(true);
    try {
      await organizationApi.deleteLogo(variant);
      onUploaded();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('settings.branding.logoSaveFailed'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <div className={`${shapeClass} border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0`}>
          {currentPath ? (
            <img src={fileUrl(currentPath)} alt="" className="max-w-full max-h-full object-contain" />
          ) : (
            <span className="text-xs text-gray-400">{t('settings.branding.noLogo')}</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" />
            {t('settings.branding.uploadLogo')}
          </Button>
          {currentPath && (
            <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={handleRemove}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
