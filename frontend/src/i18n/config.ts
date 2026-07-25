import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './locales/en.json';
import ptPtTranslations from './locales/pt-PT.json';
import { initReactI18next } from 'react-i18next';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      'pt-PT': { translation: ptPtTranslations }
    },
    // Portuguese is the product default. A bare "pt" (or "pt-BR") from
    // navigator detection doesn't exact-match the "pt-PT" resource key, so
    // without this mapping those visitors silently fell through all the way
    // to English — most noticeable on first visit (e.g. registration),
    // before a LanguageSwitcher choice gets cached in localStorage.
    fallbackLng: {
      pt: ['pt-PT'],
      'pt-BR': ['pt-PT'],
      default: ['pt-PT'],
    },
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
