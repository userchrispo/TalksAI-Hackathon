import React from 'react';
import { cn } from '../../utils';
import { MagneticWrapper } from './MagneticWrapper';

export const Button = ({ children, variant = 'primary', className = '', magnetic = false, ...props }) => {
  const baseClass = "inline-flex items-center justify-center font-medium text-sm px-6 py-3 rounded-full transition-all active:scale-[0.98] cursor-pointer";
  
  const variants = {
    primary: "bg-zinc-950 text-white hover:bg-zinc-800 shadow-[0_8px_16px_rgba(0,0,0,0.12)] border border-zinc-800",
    outline: "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 shadow-sm",
    ghost: "bg-transparent text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 border border-transparent",
  };
  
  const buttonContent = (
    <button className={cn(baseClass, variants[variant], className)} {...props}>
      {children}
    </button>
  );

  if (magnetic) {
    return (
      <MagneticWrapper intensity={0.4}>
        {buttonContent}
      </MagneticWrapper>
    );
  }

  return buttonContent;
};
