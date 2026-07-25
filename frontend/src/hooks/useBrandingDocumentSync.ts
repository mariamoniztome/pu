import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loadOrgBrandingSnapshot } from '../lib/orgBranding';
import { fileUrl } from '../lib/fileUrl';

const DEFAULT_TITLE = 'Clinicamente';

/**
 * Keeps the browser tab title and favicon in sync with the org's branding —
 * post-auth from AuthContext, pre-auth from the localStorage snapshot (see
 * lib/orgBranding.ts) so returning visitors on login/register still see it.
 */
export function useBrandingDocumentSync() {
  const { organization } = useAuth();
  const snapshot = loadOrgBrandingSnapshot();

  const clinicName = organization?.branding?.clinicName || organization?.name || snapshot?.clinicName;
  const logoMark = organization?.branding?.logoMark || snapshot?.logoMark;

  useEffect(() => {
    document.title = clinicName || DEFAULT_TITLE;
  }, [clinicName]);

  useEffect(() => {
    if (!logoMark) return;
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (link) {
      link.href = fileUrl(logoMark);
    }
  }, [logoMark]);
}
