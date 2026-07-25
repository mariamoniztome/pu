import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, ChevronDown, ShieldCheck, CreditCard, Clock } from 'lucide-react';
import { Button, buttonVariants } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../hooks/useTranslation';
import { PLANS } from '../../lib/plans';
import { resetToDefaultTheme } from '../../lib/theme/applyTheme';
import { contactApi } from '../../api/contact';
import { toast } from 'sonner';

const FAQ_KEYS = ['trial', 'invite', 'security', 'changePlan'] as const;

function ContactSection() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await contactApi.submit({ name, email, message });
      toast.success(t('landing.contact.success'));
      setName('');
      setEmail('');
      setMessage('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('landing.contact.error'));
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="max-w-xl mx-auto px-6 pb-24">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">{t('landing.contact.title')}</h2>
      <p className="text-gray-600 text-center mb-8">{t('landing.contact.subtitle')}</p>
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="contactName">{t('landing.contact.name')}</Label>
            <Input id="contactName" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactEmail">{t('landing.contact.email')}</Label>
            <Input id="contactEmail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contactMessage">{t('landing.contact.message')}</Label>
          <Textarea id="contactMessage" required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={sending}>
          {sending ? t('landing.contact.sending') : t('landing.contact.send')}
        </Button>
      </form>
    </section>
  );
}

function LandingFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 bg-white/60">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="font-semibold text-gray-900">{t('landing.brandName')}</p>
          <p className="text-sm text-gray-500">{t('landing.footerTagline')}</p>
        </div>
        <nav className="flex items-center gap-6 text-sm text-gray-600">
          <a href="#pricing" className="hover:text-gray-900">{t('landing.pricingTitle')}</a>
          <a href="#faq" className="hover:text-gray-900">{t('landing.faqTitle')}</a>
          <a href="#contact" className="hover:text-gray-900">{t('landing.contact.title')}</a>
        </nav>
      </div>
      <div className="max-w-6xl mx-auto px-6 pb-8 text-center sm:text-left text-xs text-gray-400">
        © {year} {t('landing.brandName')}. {t('landing.footerRights')}
      </div>
    </footer>
  );
}

function FaqItem({ questionKey }: { questionKey: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
      >
        <span className="font-medium text-gray-900">{t(`landing.faq.${questionKey}.q`)}</span>
        <ChevronDown className={cn('h-4 w-4 text-gray-400 flex-shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <p className="text-sm text-gray-600 pb-4 -mt-1">{t(`landing.faq.${questionKey}.a`)}</p>}
    </div>
  );
}

export function LandingPage() {
  const { t } = useTranslation();

  // The public landing page must never inherit a previously-logged-in org's
  // cached brand colors on this browser — always show the default palette.
  useEffect(() => {
    resetToDefaultTheme();
  }, []);

  return (
    <div className="auth-gradient-bg min-h-screen">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <span className="text-xl font-bold text-gray-900">{t('landing.brandName')}</span>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
            {t('auth.login.signIn')}
          </Link>
          <Link to="/register" className={buttonVariants({ size: 'sm' })}>
            {t('landing.getStarted')}
          </Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto text-center px-6 pt-12 pb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
          {t('landing.heroTitle')}
        </h1>
        <p className="mt-5 text-lg text-gray-600">
          {t('landing.heroSubtitle')}
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/register" className={buttonVariants({ size: 'lg' })}>
            {t('landing.getStarted')}
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-lilac-500" />
            {t('landing.badgeTrial')}
          </span>
          <span className="flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-lilac-500" />
            {t('landing.badgeNoCard')}
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-lilac-500" />
            {t('landing.badgeCancelAnytime')}
          </span>
        </div>
      </section>

      <section id="pricing" className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">{t('landing.pricingTitle')}</h2>
          <p className="text-gray-600 mt-2">{t('landing.pricingSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {PLANS.map((plan) => {
            const isFeatured = plan.id === 'professional';
            return (
              <div
                key={plan.id}
                className={cn(
                  'rounded-3xl border bg-white p-6 flex flex-col gap-4 shadow-sm',
                  isFeatured ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200'
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{t(`settings.subscriptionTab.plans.${plan.id}`)}</h3>
                  {isFeatured && <Sparkles className="h-4 w-4 text-lilac-500" />}
                </div>
                <div>
                  {plan.priceEUR === null ? (
                    <span className="text-2xl font-bold text-gray-900">{t('landing.customPricing')}</span>
                  ) : plan.priceEUR === 0 ? (
                    <span className="text-2xl font-bold text-gray-900">{t('landing.free')}</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-gray-900">{plan.priceEUR}€</span>
                      <span className="text-gray-500 text-sm">{t('landing.perMonth')}</span>
                    </>
                  )}
                </div>
                <ul className="text-sm text-gray-600 space-y-1.5 flex-1">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    {plan.maxDoctors === 0
                      ? t('settings.subscriptionTab.unlimitedDoctors')
                      : t('settings.subscriptionTab.doctorsLimit', { count: plan.maxDoctors })}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    {plan.maxPatients === 0
                      ? t('settings.subscriptionTab.unlimitedPatients')
                      : t('settings.subscriptionTab.patientsLimit', { count: plan.maxPatients })}
                  </li>
                </ul>
                <Link
                  to={`/register?plan=${plan.id}`}
                  className={buttonVariants({ variant: isFeatured ? 'default' : 'outline' })}
                >
                  {t('landing.choosePlan')}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">{t('landing.pricingNote')}</p>
      </section>

      <section id="faq" className="max-w-2xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">{t('landing.faqTitle')}</h2>
        <div className="bg-white rounded-3xl border border-gray-200 px-6">
          {FAQ_KEYS.map((key) => (
            <FaqItem key={key} questionKey={key} />
          ))}
        </div>
      </section>

      <ContactSection />

      <LandingFooter />
    </div>
  );
}
