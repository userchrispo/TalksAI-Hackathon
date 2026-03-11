import React from 'react';
import { NavLink } from 'react-router-dom';
import { SquaresFour, ChatTeardrop, Warning, ChartLineUp, GearSix } from '@phosphor-icons/react';
import { useAppContext } from '../../context/useAppContext';

export const Sidebar = () => {
  const { problems, profile } = useAppContext();
  const problemCount = problems.length;

  const navItems = [
    { to: '/app/dashboard', icon: <SquaresFour size={22} weight="regular" />, label: 'Dashboard' },
    { to: '/app/assistant', icon: <ChatTeardrop size={22} weight="regular" />, label: 'AI Assistant' },
    { to: '/app/problems', icon: <Warning size={22} weight="regular" />, label: 'Potential Problems', badge: problemCount },
    { to: '/app/simulator', icon: <ChartLineUp size={22} weight="regular" />, label: 'Growth Simulator' },
    { to: '/app/settings', icon: <GearSix size={22} weight="regular" />, label: 'Settings' },
  ];

  return (
    <aside className="w-[260px] h-full bg-zinc-950 flex flex-col border-r border-zinc-900 z-10">
      <div className="h-20 flex items-center px-8 border-b border-zinc-900/50">
        <span className="text-white font-semibold tracking-tight text-lg">TALKS AI</span>
      </div>
      <nav className="flex-1 py-8 px-4 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink 
            key={item.to} 
            to={item.to}
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
      </nav>
      <div className="p-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-xs font-semibold text-white">
            {profile.ownerName
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-white truncate">{profile.ownerName}</span>
            <span className="text-xs text-zinc-500 truncate">{profile.shopName}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
