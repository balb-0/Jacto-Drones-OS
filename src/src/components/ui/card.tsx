import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function Card({ children, className, title, description, action }: CardProps) {
  return (
    <div className={cn(
      'bg-white rounded-lg border border-gray-200 shadow-sm',
      className
    )}>
      {(title || description || action) && (
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
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
    success: 'text-emerald-600 bg-emerald-50',
    warning: 'text-amber-600 bg-amber-50',
    error: 'text-red-600 bg-red-50',
    info: 'text-blue-600 bg-blue-50',
  };

  const trendColor = trend && trend > 0 ? 'text-emerald-600' : trend && trend < 0 ? 'text-red-600' : 'text-gray-600';
  const trendIcon = trend && trend > 0 ? '↑' : trend && trend < 0 ? '↓' : '→';

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <div className="mt-2 flex items-baseline">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {unit && <span className="ml-1 text-sm text-gray-500">{unit}</span>}
      </div>
      {(trend !== undefined || trendLabel) && (
        <div className="mt-2 flex items-center text-sm">
          {trend !== undefined && (
            <span className={cn('font-medium', trendColor)}>
              {trendIcon} {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          {trendLabel && (
            <span className="ml-2 text-gray-500">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}