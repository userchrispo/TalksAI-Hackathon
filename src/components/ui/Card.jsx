import React from 'react';
import { cn } from '../../utils';

export const Card = ({ children, className = '', hover = false, diffusion = false }) => {
  return (
    <div className={cn(
      "bg-white border rounded-[2rem] p-8", 
      "border-zinc-200",
      diffusion ? "shadow-[0_20px_40px_-18px_rgba(0,0,0,0.08)]" : "shadow-sm",
      hover && "transition-shadow hover:shadow-md",
      className
    )}>
      {children}
    </div>
  );
};
