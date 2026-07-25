import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loadOrgBrandingSnapshot } from '../lib/orgBranding';
import { fileUrl } from '../lib/fileUrl';

const DEFAULT_TITLE = 'Clinicamente';
const DEFAULT_FAVICON = '/vite.svg';

// Pure marketing pages must always show the product's own title/favicon,
// never an org's branding — even if the visitor happens to be signed in
// (e.g. clicking the in-app footer back to /home).
const ALWAYS_DEFAULT_PATHS = ['/home', '/help'];

/**
 * Keeps the browser tab title and favicon in sync with the org's branding —
 * post-auth from AuthContext, pre-auth from the localStorage snapshot (see
 * lib/orgBranding.ts) so returning visitors on login/register still see it.
 */
export function useBrandingDocumentSync() {
  const { organization, isAuthenticated } = useAuth();
  const location = useLocation();
  const snapshot = loadOrgBrandingSnapshot();

  const isMarketingOnly =
    ALWAYS_DEFAULT_PATHS.includes(location.pathname) || (!isAuthenticated && location.pathname === '/');

  const clinicName = isMarketingOnly
    ? undefined
    : organization?.branding?.clinicName || organization?.name || snapshot?.clinicName;
  const logoMark = isMarketingOnly ? undefined : organization?.branding?.logoMark || snapshot?.logoMark;

  useEffect(() => {
    document.title = clinicName || DEFAULT_TITLE;
  }, [clinicName]);

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) return;
    link.href = logoMark ? fileUrl(logoMark) : DEFAULT_FAVICON;
  }, [logoMark]);
}
