import { Link } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { buttonVariants } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../hooks/useTranslation';
import { PLANS } from '../../lib/plans';

export function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="auth-gradient-bg min-h-screen">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <span className="text-xl font-bold text-gray-900">{t('landing.brandName')}</span>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
            {t('auth.login.signIn')}
          </Link>
          <Link to="/register" className={buttonVariants({ size: 'sm' })}>
            {t('landing.getStarted')}
          </Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto text-center px-6 pt-12 pb-20">
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
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
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
    </div>
  );
}
