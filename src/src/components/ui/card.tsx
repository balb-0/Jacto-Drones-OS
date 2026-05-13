import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function Card({ children, className, title, description, action }: CardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, x: -2, boxShadow: '6px 6px 0px #000' }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        'brutal-card overflow-hidden h-full',
        className
      )}
    >
      {(title || description || action) && (
        <div className="px-6 py-5 border-b-[4px] border-black bg-white flex items-start justify-between">
          <div>
            {title && (
              <h3 className="text-xl font-black text-black leading-none">{title}</h3>
            )}
            {description && (
              <p className="mt-2 text-sm font-bold text-gray-700 uppercase tracking-tight">{description}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-6 bg-white">{children}</div>
    </motion.div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

export function MetricCard({ 
  title, 
  value, 
  unit, 
  trend, 
  trendLabel,
  status = 'info' 
}: MetricCardProps) {
  const statusColors = {
    success: 'bg-primary text-black',
    warning: 'bg-warning text-black',
    error: 'bg-error text-white',
    info: 'bg-secondary text-white',
  };

  const trendColor = trend && trend > 0 ? 'text-success' : trend && trend < 0 ? 'text-error' : 'text-black';
  const trendIcon = trend && trend > 0 ? '↑' : trend && trend < 0 ? '↓' : '→';

  return (
    <motion.div 
      whileHover={{ y: -2, x: -2, boxShadow: '6px 6px 0px #000' }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="brutal-card p-6 bg-white relative overflow-hidden"
    >
      <div className={cn("absolute top-0 right-0 px-3 py-1 border-l-[4px] border-b-[4px] border-black font-black text-[10px] uppercase", statusColors[status])}>
        {status}
      </div>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-2">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-5xl font-black text-black italic leading-none">{value}</span>
        {unit && <span className="text-lg font-black text-black uppercase italic">{unit}</span>}
      </div>
      {(trend !== undefined || trendLabel) && (
        <div className="mt-4 flex items-center gap-2">
          {trend !== undefined && (
            <span className={cn('font-black text-sm border-[2px] border-black px-2 py-0.5', trendColor)}>
              {trendIcon} {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          {trendLabel && (
            <span className="text-xs font-bold text-gray-600 uppercase italic">{trendLabel}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}