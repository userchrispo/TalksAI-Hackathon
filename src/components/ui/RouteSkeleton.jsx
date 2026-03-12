import React from 'react';
import { cn } from '../../utils';

export const RouteSkeleton = ({ embedded = false }) => {
  return (
    <div
      className={cn(
        'w-full',
        embedded ? 'min-h-[420px]' : 'min-h-[100dvh] bg-white',
      )}
    >
      <div className={cn('mx-auto w-full max-w-6xl animate-pulse', embedded ? 'px-0 py-4' : 'px-6 py-12 md:px-10 md:py-16')}>
        <div className="mb-8 h-4 w-32 rounded-full bg-zinc-100" />
        <div className="mb-4 h-12 max-w-md rounded-[1.5rem] bg-zinc-200" />
        <div className="mb-10 h-5 max-w-2xl rounded-full bg-zinc-100" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-[2rem] border border-zinc-100 bg-zinc-50/70 p-6 lg:col-span-8">
            <div className="mb-6 h-5 w-40 rounded-full bg-zinc-200" />
            <div className="space-y-4">
              <div className="h-20 rounded-[1.5rem] bg-white" />
              <div className="h-20 rounded-[1.5rem] bg-white" />
              <div className="h-20 rounded-[1.5rem] bg-white" />
            </div>
          </div>
          <div className="rounded-[2rem] border border-zinc-100 bg-white p-6 lg:col-span-4">
            <div className="mb-6 h-5 w-28 rounded-full bg-zinc-200" />
            <div className="mb-4 h-16 w-40 rounded-[1.5rem] bg-zinc-200" />
            <div className="h-4 w-full rounded-full bg-zinc-100" />
          </div>
        </div>
      </div>
    </div>
  );
};
