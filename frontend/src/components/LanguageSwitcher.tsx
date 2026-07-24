import { useRef, useState } from 'react';
import { Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from '../hooks/useTranslation';

const LANGUAGES = [
  { code: 'en', labelKey: 'language.english' },
  { code: 'pt-PT', labelKey: 'language.portuguese' },
] as const;

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center justify-center h-10 w-10 rounded-full text-gray-600 hover:bg-white/60 hover:text-gray-900 transition-all duration-300"
        title={t('settings.language')}
        aria-label={t('settings.language')}
      >
        <Globe className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
            {LANGUAGES.map(({ code, labelKey }) => (
              <button
                key={code}
                type="button"
                onClick={() => handleLanguageChange(code)}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors',
                  i18n.language === code ? 'font-semibold text-lilac-700' : 'text-gray-700'
                )}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
