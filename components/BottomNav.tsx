import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, TrendingUp, CalendarDays } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: TrendingUp, label: 'Hot', path: '/animes/trending' },
    { icon: CalendarDays, label: 'Plan', path: '/schedule' },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="bg-zinc-900 border border-zinc-800 shadow-2xl rounded-full px-8 py-4 flex items-center gap-10 pointer-events-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center transition-all duration-200 ${
                isActive ? 'text-white scale-110' : 'text-zinc-600 active:text-zinc-400'
              }`
            }
          >
            {({ isActive }) => (
                <item.icon 
                    className={`w-6 h-6 ${isActive ? 'fill-white' : ''}`} 
                    strokeWidth={isActive ? 2.5 : 2} 
                />
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};