import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAppContext } from '../../context/useAppContext';
import { X, CheckCircle } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { RouteSkeleton } from '../ui/RouteSkeleton';

void motion;

export const AppLayout = () => {
  const { toasts, removeToast } = useAppContext();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-8 py-10 lg:px-12 lg:py-14 relative flex justify-center">
        <div className="w-full max-w-[1200px] mx-auto z-10 relative">
          <Suspense fallback={<RouteSkeleton embedded />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div 
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="bg-zinc-950 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4 min-w-[300px]"
            >
              <CheckCircle size={20} weight="fill" className="text-emerald-400" />
              <p className="text-[15px] font-medium flex-1">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="text-zinc-400 hover:text-white transition-colors">
                <X size={16} weight="bold" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
