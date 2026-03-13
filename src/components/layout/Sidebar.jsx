import React from 'react';
import { NavLink } from 'react-router-dom';
import { SquaresFour, ChatTeardrop, Lightning, Warning, ChartLineUp, GearSix, X, SignOut } from '@phosphor-icons/react';
import { useAppContext } from '../../context/useAppContext';
import { APP_ROUTES } from '../../lib/appRoutes';

export const Sidebar = ({ mobileOpen, onClose }) => {
  const { problems, profile, logout } = useAppContext();
  const problemCount = problems.length;

  const navItems = [
    { to: APP_ROUTES.dashboard, icon: <SquaresFour size={22} weight="regular" />, label: 'Dashboard' },
    { to: APP_ROUTES.assistant, icon: <ChatTeardrop size={22} weight="regular" />, label: 'AI Assistant' },
    { to: APP_ROUTES.problems, icon: <Warning size={22} weight="regular" />, label: 'Potential Problems', badge: problemCount },
    { to: APP_ROUTES.fixes, icon: <Lightning size={22} weight="regular" />, label: 'AI Fixes' },
    { to: APP_ROUTES.simulator, icon: <ChartLineUp size={22} weight="regular" />, label: 'Growth Simulator' },
    { to: APP_ROUTES.settings, icon: <GearSix size={22} weight="regular" />, label: 'Settings' },
  ];

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className={`
      w-[260px] h-full bg-zinc-950 flex flex-col border-r border-zinc-900 z-50 shrink-0
      fixed lg:relative top-0 left-0 transition-transform duration-300 ease-out
      ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="h-20 flex items-center justify-between px-8 border-b border-zinc-900/50">
        <span className="text-white font-semibold tracking-tight text-lg">TALKS AI</span>
        <button
          onClick={onClose}
          className="lg:hidden text-zinc-500 hover:text-white transition-colors"
        >
          <X size={20} weight="bold" />
        </button>
      </div>
      <nav className="flex-1 py-8 px-4 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink 
            key={item.to} 
            to={item.to}
            onClick={handleNavClick}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group
              ${isActive ? 'bg-zinc-900/80 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}
            `}
          >
            <span className="opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {item.icon}
            </span>
            <span className="flex-1">{item.label}</span>
            {item.badge > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>}
          </NavLink>
        ))}
        
        <div className="mt-auto border-t border-zinc-900/50 pt-4 pb-2">
          <button
            onClick={() => {
              logout();
              // Navigate to the root landing page after logging out
              window.location.href = APP_ROUTES.home;
              if (onClose) onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 transition-all duration-200 group"
          >
            <span className="opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <SignOut size={22} weight="regular" />
            </span>
            <span className="flex-1 text-left">Log out</span>
          </button>
        </div>
      </nav>
      <div className="p-4 pt-0">
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-zinc-900/50 transition-colors cursor-default">
          <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-xs font-semibold text-zinc-300">
            {profile.ownerName
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-white truncate">{profile.ownerName}</span>
            <span className="text-[13px] text-zinc-500 truncate">{profile.shopName}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
