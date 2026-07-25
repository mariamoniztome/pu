import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useTranslation } from '../hooks/useTranslation';
import { loadGoogleAnalytics, isAnalyticsConfigured } from '../lib/analytics';

const CONSENT_KEY = 'cookieConsent';

type Consent = 'granted' | 'denied';

function getStoredConsent(): Consent | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

/** Renders nothing until a decision is needed; loads analytics only on explicit consent. */
export function ConsentBanner() {
  const { t } = useTranslation();
  const [consent, setConsent] = useState<Consent | null>(() => getStoredConsent());

  useEffect(() => {
    if (consent === 'granted') loadGoogleAnalytics();
  }, [consent]);

  if (!isAnalyticsConfigured() || consent !== null) return null;

  const decide = (value: Consent) => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* ignore */
    }
    setConsent(value);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-gray-200 bg-white shadow-lg p-4">
      <p className="text-sm text-gray-600">{t('consent.message')}</p>
      <div className="mt-3 flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => decide('denied')}>
          {t('consent.reject')}
        </Button>
        <Button type="button" size="sm" onClick={() => decide('granted')}>
          {t('consent.accept')}
        </Button>
      </div>
    </div>
  );
}
