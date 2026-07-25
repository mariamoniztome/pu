import { generateScale, SCALE_STEPS } from './palette';

const THEME_CACHE_KEY = 'orgTheme';
const THEME_OFF_KEY = 'theme:off';

export interface OrgThemeColors {
  primaryColor?: string;
  accentColor?: string;
}

/**
 * Escape hatch: `?theme=default` in the URL (persisted for the session) or
 * `localStorage['theme:off']` disables org theming entirely. Without this,
 * an owner who picks a catastrophic color could lock themselves out of the
 * very Settings page needed to fix it.
 */
export function isThemingDisabled(): boolean {
  try {
    if (new URLSearchParams(window.location.search).get('theme') === 'default') {
      sessionStorage.setItem(THEME_OFF_KEY, '1');
      return true;
    }
    return sessionStorage.getItem(THEME_OFF_KEY) === '1' || localStorage.getItem(THEME_OFF_KEY) === '1';
  } catch {
    return false;
  }
}

function setVars(prefix: 'brand' | 'accent', steps: Record<number, string>) {
  const root = document.documentElement;
  for (const step of SCALE_STEPS) {
    root.style.setProperty(`--${prefix}-${step}`, steps[step]);
  }
}

function clearVars() {
  const root = document.documentElement;
  for (const step of SCALE_STEPS) {
    root.style.removeProperty(`--brand-${step}`);
    root.style.removeProperty(`--accent-${step}`);
  }
}

/**
 * Applies org colors as inline overrides on :root. Returns whether either
 * color needed a legibility clamp (for a non-blocking UI notice).
 * Passing no colors (or disabled theming) resets to the stylesheet defaults.
 */
export function applyOrgTheme(colors: OrgThemeColors | null): { wasClamped: boolean } {
  if (!colors || isThemingDisabled() || (!colors.primaryColor && !colors.accentColor)) {
    clearVars();
    try {
      localStorage.removeItem(THEME_CACHE_KEY);
    } catch {
      /* ignore */
    }
    return { wasClamped: false };
  }

  let wasClamped = false;

  if (colors.primaryColor) {
    const scale = generateScale(colors.primaryColor);
    if (scale) {
      setVars('brand', scale.steps);
      wasClamped = wasClamped || scale.wasClamped;
    }
  }
  if (colors.accentColor) {
    const scale = generateScale(colors.accentColor);
    if (scale) {
      setVars('accent', scale.steps);
      wasClamped = wasClamped || scale.wasClamped;
    }
  }

  try {
    localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(colors));
  } catch {
    /* ignore */
  }

  return { wasClamped };
}

/**
 * FOUC prevention: org colors only arrive after /auth/me resolves, so on a
 * hard reload the app would flash default green/lilac for a beat. Call this
 * synchronously at module load (before first render) to re-apply the last
 * cached theme immediately.
 */
export function applyCachedThemeSync() {
  if (isThemingDisabled()) return;
  try {
    const raw = localStorage.getItem(THEME_CACHE_KEY);
    if (!raw) return;
    const colors = JSON.parse(raw) as OrgThemeColors;
    if (colors.primaryColor) {
      const scale = generateScale(colors.primaryColor);
      if (scale) setVars('brand', scale.steps);
    }
    if (colors.accentColor) {
      const scale = generateScale(colors.accentColor);
      if (scale) setVars('accent', scale.steps);
    }
  } catch {
    /* corrupted cache — defaults will show */
  }
}

/**
 * Visually resets to the stylesheet default palette without touching the
 * cached org theme in localStorage — for surfaces that must never show a
 * previously-logged-in org's colors (e.g. the public landing page), while
 * still letting the authenticated app's FOUC-prevention cache survive.
 */
export function resetToDefaultTheme() {
  clearVars();
}

/** Read a var's current computed value as a CSS color string (for JS-rendered charts). */
export function themeColor(varName: string, alpha?: number): string {
  const triplet = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return alpha !== undefined ? `hsl(${triplet} / ${alpha})` : `hsl(${triplet})`;
}
