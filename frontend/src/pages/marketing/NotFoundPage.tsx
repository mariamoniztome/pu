import { Link } from 'react-router-dom';
import { buttonVariants } from '../../components/ui/button';
import { useTranslation } from '../../hooks/useTranslation';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="auth-gradient-bg min-h-screen flex items-center justify-center px-4 text-center">
      <div>
        <p className="text-7xl font-bold text-gray-900">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">{t('notFound.title')}</h1>
        <p className="text-gray-600 mt-2">{t('notFound.subtitle')}</p>
        <Link to="/" className={buttonVariants({ className: 'mt-8 inline-flex' })}>
          {t('notFound.backHome')}
        </Link>
      </div>
    </div>
  );
}
