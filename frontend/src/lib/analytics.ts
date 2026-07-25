const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

let loaded = false;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Injects gtag.js. Only call this after the visitor has granted consent. */
export function loadGoogleAnalytics() {
  if (loaded || !MEASUREMENT_ID) return;
  loaded = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID, { send_page_view: false });
}

/** Records a virtual pageview for the SPA's client-side routing. No-ops until analytics is loaded. */
export function trackPageview(path: string) {
  if (!loaded || !window.gtag) return;
  window.gtag('event', 'page_view', { page_path: path });
}

export function isAnalyticsConfigured(): boolean {
  return Boolean(MEASUREMENT_ID);
}
