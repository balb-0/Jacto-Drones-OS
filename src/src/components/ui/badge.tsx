import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'sm',
  className 
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-900',
    success: 'bg-primary text-black',
    warning: 'bg-warning text-black',
    error: 'bg-error text-white',
    info: 'bg-info text-white',
    primary: 'bg-primary text-black',
    secondary: 'bg-secondary text-white',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-4 py-1.5',
  };

  return (
    <span className={cn(
      'brutal-badge inline-flex items-center font-black uppercase italic tracking-tighter',
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  );
}