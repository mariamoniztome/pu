import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Users,
  CalendarDays,
  CalendarClock,
  FileText,
  FileBarChart,
  DollarSign,
  Home,
  Settings,
  HelpCircle,
  Menu,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Chatbot } from './Chatbot';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';

const getNavItems = (t: any) => [
  { to: '/', label: t('navigation.dashboard'), icon: Home },
  { to: '/patients', label: t('navigation.patients'), icon: Users },
  { to: '/appointments', label: t('navigation.appointments'), icon: CalendarClock },
  { to: '/calendar', label: t('navigation.calendar'), icon: CalendarDays },
  { to: '/consultations', label: t('navigation.consultations'), icon: FileText },
  { to: '/reports', label: t('navigation.reports'), icon: FileBarChart },
  { to: '/payments', label: t('navigation.payments'), icon: DollarSign },
];

export function Layout() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const navItems = getNavItems(t);

  const isRouteActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lilac-50 via-white to-primary-50">
      <div className="flex">
        <aside
          className={cn(
            'fixed left-0 top-0 h-screen bg-white/40 backdrop-blur-xl border-r border-lilac-100/50 transition-all duration-300 flex flex-col z-40',
            isExpanded ? 'w-64' : 'w-20'
          )}
        >
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-300 to-lilac-300 rounded-3xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              {isExpanded && (
                <h1 className="text-xl font-bold text-gray-800">Mindcare</h1>
              )}
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
                    isActive
                      ? 'bg-gradient-to-r from-primary-200 to-lilac-200 text-gray-900 shadow-lg'
                      : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                  )}
                  title={!isExpanded ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isExpanded && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="px-3 pb-6 space-y-2">
            <button
              className="flex items-center gap-3 px-4 py-4 rounded-3xl text-sm font-medium transition-all duration-300 w-full text-gray-600 hover:bg-white/60 hover:text-gray-900"
              title={!isExpanded ? t('navigation.settings') : undefined}
            >
              <Settings className="h-5 w-5" />
              {isExpanded && <span>{t('navigation.settings')}</span>}
            </button>

            <button
              className="flex items-center gap-3 px-4 py-4 rounded-3xl text-sm font-medium transition-all duration-300 w-full text-gray-600 hover:bg-white/60 hover:text-gray-900"
              title={!isExpanded ? 'Help' : undefined}
            >
              <HelpCircle className="h-5 w-5" />
              {isExpanded && <span>Help</span>}
            </button>

            <button
              onClick={() => setIsExpanded((v) => !v)}
              className="flex items-center gap-3 px-4 py-4 rounded-3xl text-sm font-medium transition-all duration-300 w-full text-gray-600 hover:bg-white/60 hover:text-gray-900"
              title={isExpanded ? 'Collapse menu' : 'Expand menu'}
            >
              <Menu className="h-5 w-5" />
              {isExpanded && <span>Collapse</span>}
            </button>
          </div>
        </aside>

        <main
          className={cn(
            'flex-1 p-8 overflow-x-hidden transition-all duration-300',
            isExpanded ? 'ml-64' : 'ml-20'
          )}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-end mb-6">
              <LanguageSwitcher />
            </div>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Chatbot Widget */}
      <Chatbot />
    </div>
  );
}