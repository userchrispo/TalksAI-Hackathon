import React from 'react';
import { cn } from '../../utils';

export const Card = ({ children, className = '', hover = false, diffusion = false }) => {
  return (
    <div className={cn(
      "bg-white border rounded-[2.5rem] p-8", 
      "border-slate-200/50",
      diffusion ? "shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]" : "shadow-sm",
      hover && "transition-transform transition-shadow hover:shadow-md hover:-translate-y-0.5",
      className
    )}>
      {children}
    </div>
  );
};
