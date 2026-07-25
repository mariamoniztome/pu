import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  CalendarClock,
  FileBarChart,
  Euro,
  Home,
  Settings,
  Pin,
  PinOff,
  LogOut,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { PageHeaderSlotContext } from '../contexts/PageHeaderContext';
import { OrgLogo } from './branding/OrgLogo';

const SIDEBAR_PINNED_KEY = 'sidebar-pinned';

const getNavItems = (t: any) => [
  { to: '/', label: t('navigation.dashboard'), icon: Home },
  { to: '/patients', label: t('navigation.patients'), icon: Users },
  { to: '/consultations', label: t('navigation.consultations'), icon: CalendarClock },
  { to: '/reports', label: t('navigation.reports'), icon: FileBarChart },
  { to: '/payments', label: t('navigation.payments'), icon: Euro },
];

export function Layout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { doctor, organization, logout } = useAuth();
  const [pinned, setPinned] = useState(() => localStorage.getItem(SIDEBAR_PINNED_KEY) === 'true');
  const [open, setOpen] = useState(pinned);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [headerSlot, setHeaderSlot] = useState<HTMLDivElement | null>(null);
  const asideRef = useRef<HTMLElement>(null);

  const isExpanded = pinned || open;

  useEffect(() => {
    localStorage.setItem(SIDEBAR_PINNED_KEY, String(pinned));
  }, [pinned]);

  useEffect(() => {
    if (!open || pinned) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (asideRef.current && !asideRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open, pinned]);

  const navItems = getNavItems(t);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isRouteActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  const { sectionTitle, sectionSubtitle } = useMemo(() => {
    const path = location.pathname;
    if (path === '/') {
      return {
        sectionTitle: doctor?.firstName
          ? t('dashboard.greeting', { name: `${doctor.firstName}!` })
          : t('navigation.dashboard'),
        sectionSubtitle: t('dashboard.subtitle'),
      };
    }
    if (path.startsWith('/patients')) {
      return { sectionTitle: t('patients.title'), sectionSubtitle: t('patients.subtitle') };
    }
    if (path.startsWith('/consultations')) {
      return { sectionTitle: t('navigation.consultations'), sectionSubtitle: t('calendar.subtitle') };
    }
    if (path.startsWith('/reports')) {
      return { sectionTitle: t('reports.title'), sectionSubtitle: t('reports.subtitle') };
    }
    if (path.startsWith('/payments')) {
      return { sectionTitle: t('payments.title'), sectionSubtitle: t('payments.subtitle') };
    }
    if (path.startsWith('/settings')) {
      return { sectionTitle: t('settings.title'), sectionSubtitle: undefined };
    }
    return { sectionTitle: organization?.name, sectionSubtitle: undefined };
  }, [location.pathname, doctor?.firstName, organization?.name, t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-lilac-50 via-white to-primary-50">
      <div className="flex">
        <aside
          ref={asideRef}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => !pinned && setOpen(false)}
          onClick={() => !isExpanded && setOpen(true)}
          className={cn(
            'fixed left-0 top-0 h-screen bg-white/40 backdrop-blur-xl border-r border-lilac-100/50 transition-all duration-300 flex flex-col z-40',
            isExpanded ? 'w-64' : 'w-20'
          )}
        >
          <div className="pt-6 pb-4">
            <div className={cn('flex items-center gap-3 px-3', !isExpanded && 'justify-center')}>
              <OrgLogo
                variant={isExpanded ? 'full' : 'mark'}
                clinicName={organization?.branding?.clinicName || organization?.name}
                logoMark={organization?.branding?.logoMark}
                logoFull={organization?.branding?.logoFull}
              />
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isRouteActive(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 px-4 py-4 rounded-3xl text-sm font-medium transition-all duration-300',
                    !isExpanded && 'justify-center',
                    isActive
                      ? 'bg-gradient-to-r from-primary-200 to-lilac-200 text-gray-900 shadow-lg'
                      : 'text-gray-600 row-hover hover:text-gray-900'
                  )}
                  title={!isExpanded ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isExpanded && <span className="whitespace-nowrap">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="px-3 pb-6 space-y-2">
            <Link
              to="/settings"
              className={cn(
                'flex items-center gap-3 px-4 py-4 rounded-3xl text-sm font-medium transition-all duration-300 w-full text-gray-600 row-hover hover:text-gray-900',
                !isExpanded && 'justify-center'
              )}
              title={!isExpanded ? t('navigation.settings') : undefined}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              {isExpanded && <span className="whitespace-nowrap">{t('navigation.settings')}</span>}
            </Link>

            {/* Help button disabled for now */}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setPinned((v) => !v);
              }}
              className={cn(
                'flex items-center gap-3 px-4 py-4 rounded-3xl text-sm font-medium transition-all duration-300 w-full text-gray-600 row-hover hover:text-gray-900',
                !isExpanded && 'justify-center'
              )}
              title={pinned ? t('navigation.unpinSidebar') : t('navigation.pinSidebar')}
            >
              {pinned ? <PinOff className="h-5 w-5 flex-shrink-0" /> : <Pin className="h-5 w-5 flex-shrink-0" />}
              {isExpanded && (
                <span className="whitespace-nowrap">
                  {pinned ? t('navigation.unpinSidebar') : t('navigation.pinSidebar')}
                </span>
              )}
            </button>
          </div>
        </aside>

        <main
          className={cn(
            'flex-1 py-4 sm:py-6 lg:py-8 overflow-x-hidden transition-all duration-300',
            isExpanded ? 'ml-64' : 'ml-20'
          )}
        >
          <div className="max-w-[81rem] mx-auto">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 truncate leading-tight">
                  {sectionTitle}
                </h2>
                {sectionSubtitle && (
                  <p className="text-sm text-gray-500 truncate">{sectionSubtitle}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div ref={setHeaderSlot} className="contents" />
                <LanguageSwitcher />

                {/* User Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl row-hover"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-300 to-lilac-300 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {doctor?.firstName?.[0]}{doctor?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-medium text-gray-900">
                        {doctor?.firstName} {doctor?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{doctor?.role}</p>
                    </div>
                  </button>

                  {showProfileMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowProfileMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {doctor?.firstName} {doctor?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{doctor?.email}</p>
                        </div>

                        <Link
                          to="/settings"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 menu-item"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Settings className="h-4 w-4" />
                          {t('navigation.settings')}
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                        >
                          <LogOut className="h-4 w-4" />
                          {t('navigation.logout')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <PageHeaderSlotContext.Provider value={headerSlot}>
              <Outlet />
            </PageHeaderSlotContext.Provider>
          </div>
        </main>
      </div>

    </div>
  );
}
