import { Link, Outlet, useLocation } from 'react-router-dom';
import { Users, Calendar, FileText, FileBarChart, DollarSign, Home } from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/', label: 'MyNest', icon: Home },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/appointments', label: 'Appointments', icon: Calendar },
  { to: '/consultations', label: 'Sessions', icon: FileText },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/payments', label: 'Payments', icon: DollarSign },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-sand-50 to-peach-50">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-gradient-to-b from-slate-800 to-slate-900 p-6 flex flex-col">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-peach-400 to-peach-500 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Mindcare</h1>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-white text-slate-900 shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-700">
            <div className="bg-gradient-to-br from-primary-500/20 to-lavender-500/20 rounded-2xl p-4 text-center">
              <p className="text-sm text-slate-300 mb-2">Need help?</p>
              <button className="text-xs text-white hover:text-primary-200 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
