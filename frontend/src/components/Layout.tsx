import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  LogOut,
  UserCircle,
  Building,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Chatbot } from './Chatbot';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';

const getNavItems = (t: any, canManageDoctors: boolean) => {
  const items = [
    { to: '/', label: t('navigation.dashboard'), icon: Home },
    { to: '/patients', label: t('navigation.patients'), icon: Users },
    { to: '/appointments', label: t('navigation.appointments'), icon: CalendarClock },
    { to: '/calendar', label: t('navigation.calendar'), icon: CalendarDays },
    { to: '/consultations', label: t('navigation.consultations'), icon: FileText },
    { to: '/reports', label: t('navigation.reports'), icon: FileBarChart },
    { to: '/payments', label: t('navigation.payments'), icon: DollarSign },
  ];
  
  // Add doctors page if user can manage doctors
  if (canManageDoctors) {
    items.push({ to: '/doctors', label: 'Doctors', icon: UserCircle });
  }
  
  return items;
};

export function Layout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { doctor, organization, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const canManageDoctors = 
    doctor?.role === 'owner' || doctor?.permissions.canManageDoctors || false;
  
  const navItems = getNavItems(t, canManageDoctors);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
            <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-4 rounded-3xl text-sm font-medium transition-all duration-300 w-full text-gray-600 hover:bg-white/60 hover:text-gray-900"
              title={!isExpanded ? t('navigation.settings') : undefined}
            >
              <Settings className="h-5 w-5" />
              {isExpanded && <span>{t('navigation.settings')}</span>}
            </Link>

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
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {organization?.name}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <LanguageSwitcher />
                
                {/* User Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/60 transition-colors"
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
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                        
                        {canManageDoctors && (
                          <Link
                            to="/doctors"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <UserCircle className="h-4 w-4" />
                            Manage Doctors
                          </Link>
                        )}
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
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