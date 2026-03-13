import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { APP_ROUTES } from '../../lib/appRoutes';

export const TopNav = ({ showLogin = true, showSections = true }) => {
  return (
    <nav className="fixed top-0 left-0 w-full h-20 bg-white/80 backdrop-blur-md border-b border-zinc-200/50 z-50 flex items-center">
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-10">
          <Link to={APP_ROUTES.home} className="font-semibold text-lg tracking-tight text-zinc-950">
            TALKS AI
          </Link>
          {showSections ? (
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-zinc-500 hover:text-zinc-950 transition-colors tracking-tight">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-zinc-500 hover:text-zinc-950 transition-colors tracking-tight">How it works</a>
              <a href="#pricing" className="text-sm font-medium text-zinc-500 hover:text-zinc-950 transition-colors tracking-tight">Pricing</a>
            </div>
          ) : null}
        </div>
        
        {showLogin && (
          <div className="flex items-center gap-6">
            <Link to={APP_ROUTES.demo} className="text-sm font-medium text-zinc-900 transition-colors hidden sm:block">View Demo</Link>
            <Link to={APP_ROUTES.auth}>
              <Button variant="primary" className="shadow-[0_8px_16px_rgba(0,0,0,0.12)]">Start free trial</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
