import en from './locales/en.js';
import ptPT from './locales/pt-PT.js';

export type Lang = 'en' | 'pt-PT';

// Portuguese is the product default — mirrors the frontend's fallbackLng in
// frontend/src/i18n/config.ts, so an unset/unrecognized Accept-Language still
// matches the UI's own default instead of silently falling back to English.
const DEFAULT_LANG: Lang = 'pt-PT';

const dictionaries: Record<Lang, Record<string, any>> = { en, 'pt-PT': ptPT };

function get(obj: Record<string, any>, path: string): string | undefined {
  return path.split('.').reduce<any>((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), obj);
}

export function translate(lang: Lang, key: string, params?: Record<string, string | number>): string {
  const dict = dictionaries[lang] || dictionaries[DEFAULT_LANG];
  let value = get(dict, key) ?? get(dictionaries[DEFAULT_LANG], key) ?? key;

  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      value = value.replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'), String(paramValue));
    }
  }

  return value;
}

// The frontend sends Accept-Language set to its active i18next language code
// (e.g. "pt-PT" or "en"), so this only needs to match the first tag — no need
// to parse quality values ("en;q=0.9") like a browser-facing negotiator would.
export function resolveLang(acceptLanguage?: string | null): Lang {
  if (!acceptLanguage) return DEFAULT_LANG;
  const primary = acceptLanguage.split(',')[0].trim().toLowerCase();
  if (primary.startsWith('en')) return 'en';
  if (primary.startsWith('pt')) return 'pt-PT';
  return DEFAULT_LANG;
}
