import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HouseSimple, ArrowRight } from '@phosphor-icons/react';

void motion;

const spring = { type: "spring", stiffness: 100, damping: 20 };

export const NotFound = () => {
  return (
    <div className="min-h-[100dvh] bg-[#fafafa] flex items-center justify-center px-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="text-center max-w-md"
      >
        <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <HouseSimple size={28} weight="duotone" className="text-zinc-400" />
        </div>
        <h1 className="text-5xl font-medium tracking-tighter text-zinc-950 mb-4">404</h1>
        <p className="text-zinc-500 text-lg leading-relaxed mb-10">
          This page doesn't exist. It may have been moved, or the URL might be mistyped.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-zinc-950 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors shadow-[0_8px_16px_rgba(0,0,0,0.12)] active:scale-[0.98]"
          >
            Back to home <ArrowRight size={14} weight="bold" />
          </Link>
          <Link
            to="/app/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
