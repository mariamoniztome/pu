const STORAGE_KEY = 'orgBranding';

export interface OrgBrandingSnapshot {
  clinicName?: string;
  logoFull?: string;
  logoMark?: string;
}

/**
 * Login/Register happen before we're authenticated, so the server can't tell
 * us which org a visitor belongs to. We snapshot the last successfully
 * logged-in org's branding to localStorage and reuse it pre-auth on this
 * device — returning users see their clinic's branding, strangers see the
 * generic look. No public branding endpoint needed for this (see plan notes
 * on org-name enumeration).
 */
export function saveOrgBrandingSnapshot(snapshot: OrgBrandingSnapshot) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // localStorage unavailable (private mode etc.) — branding just won't persist pre-auth
  }
}

export function loadOrgBrandingSnapshot(): OrgBrandingSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
