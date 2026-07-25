import { useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { applyOrgTheme } from '../lib/theme/applyTheme';

/**
 * Subscribes to the authenticated organization's branding colors and writes
 * them to :root as CSS custom properties. Not a real context (no consumer
 * API needed yet) — pages get the colors for free through Tailwind classes.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { organization } = useAuth();

  useEffect(() => {
    // Only act once we know the org. When unauthenticated (login page), the
    // cached theme from applyCachedThemeSync() stays — same device-local
    // policy as the pre-auth logo snapshot.
    if (!organization) return;
    applyOrgTheme({
      primaryColor: organization.branding?.primaryColor,
      accentColor: organization.branding?.accentColor,
    });
  }, [organization]);

  return <>{children}</>;
}
