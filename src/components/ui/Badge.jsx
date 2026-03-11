import { cn } from '../../utils';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: "bg-white border-zinc-200 text-zinc-600",
    neutral: "bg-zinc-100 border-zinc-200 text-zinc-900",
    outline: "bg-transparent border-zinc-300 text-zinc-600",
  };
  
  const mappedVariant = variants[variant] || variants.default;

  return (
    <span className={cn("inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border", mappedVariant, className)}>
      {children}
    </span>
  );
};
