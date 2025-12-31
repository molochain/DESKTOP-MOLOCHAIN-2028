import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  colorThresholds?: { warning: number; danger: number };
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  size = 'md',
  colorThresholds = { warning: 70, danger: 90 },
}: ProgressBarProps) {
  const percent = Math.min((value / max) * 100, 100);

  const getColor = () => {
    if (percent >= colorThresholds.danger) return 'bg-red-500';
    if (percent >= colorThresholds.warning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>}
          {showValue && (
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {percent.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', getColor())}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
