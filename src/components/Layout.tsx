import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Users, Calendar, FileText, FileBarChart, DollarSign, Home, Settings, HelpCircle, Menu } from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/appointments', label: 'Appointments', icon: Calendar },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/consultations', label: 'Sessions', icon: FileText },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/payments', label: 'Payments', icon: DollarSign },
];

export function Layout() {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className={cn(
          "min-h-screen bg-gradient-to-b from-gray-900 to-black transition-all duration-300 flex flex-col",
          isExpanded ? "w-64" : "w-20"
        )}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              {isExpanded && <h1 className="text-xl font-bold text-white">Mindcare</h1>}
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-white text-gray-900'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  )}
                  title={!isExpanded ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isExpanded && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="px-3 pb-6 space-y-1">
            <button className={cn(
              "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 w-full text-gray-400 hover:bg-gray-800 hover:text-white"
            )}
            title={!isExpanded ? "Settings" : undefined}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              {isExpanded && <span>Settings</span>}
            </button>
            <button className={cn(
              "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 w-full text-gray-400 hover:bg-gray-800 hover:text-white"
            )}
            title={!isExpanded ? "Help" : undefined}
            >
              <HelpCircle className="h-5 w-5 flex-shrink-0" />
              {isExpanded && <span>Help</span>}
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 w-full text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
              title={!isExpanded ? "Expand menu" : undefined}
            >
              <Menu className="h-5 w-5 flex-shrink-0" />
              {isExpanded && <span>Collapse</span>}
            </button>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
