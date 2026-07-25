import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LifeBuoy } from 'lucide-react';
import { buttonVariants } from '../../components/ui/button';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { ContactSection } from '../../components/marketing/ContactSection';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../hooks/useTranslation';
import { resetToDefaultTheme } from '../../lib/theme/applyTheme';

const HELP_KEYS = ['login', 'forgotPassword', 'invite', 'slowLoading', 'dataMissing'] as const;

function HelpItem({ helpKey }: { helpKey: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
      >
        <span className="font-medium text-gray-900">{t(`help.topics.${helpKey}.q`)}</span>
        <ChevronDown className={cn('h-4 w-4 text-gray-400 flex-shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <p className="text-sm text-gray-600 pb-4 -mt-1">{t(`help.topics.${helpKey}.a`)}</p>}
    </div>
  );
}

export function HelpPage() {
  const { t } = useTranslation();

  useEffect(() => {
    resetToDefaultTheme();
  }, []);

  return (
    <div className="auth-gradient-bg min-h-screen">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <Link to="/home" className="text-xl font-bold text-gray-900">{t('landing.brandName')}</Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link to="/login" className={buttonVariants({ size: 'sm', variant: 'outline' })}>
            {t('auth.login.signIn')}
          </Link>
        </div>
      </header>

      <section className="max-w-2xl mx-auto text-center px-6 pt-8 pb-12">
        <div className="h-14 w-14 rounded-2xl bg-lilac-100 flex items-center justify-center mx-auto mb-4">
          <LifeBuoy className="h-6 w-6 text-lilac-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{t('help.title')}</h1>
        <p className="text-gray-600 mt-3">{t('help.subtitle')}</p>
      </section>

      <section className="max-w-2xl mx-auto px-6 pb-24">
        <div className="bg-white rounded-3xl border border-gray-200 px-6">
          {HELP_KEYS.map((key) => (
            <HelpItem key={key} helpKey={key} />
          ))}
        </div>
      </section>

      <ContactSection titleKey="help.contactTitle" subtitleKey="help.contactSubtitle" />
    </div>
  );
}
