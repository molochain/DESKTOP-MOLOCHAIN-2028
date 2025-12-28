import { cn } from '@/lib/utils';

interface CustomProgressProps {
  value: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
}

export const CustomProgress: React.FC<CustomProgressProps> = ({
  value,
  max = 100,
  className,
  indicatorClassName
}) => {
  const percentage = Math.min(Math.max(0, value), max) / max * 100;
  
  return (
    <div className={cn("w-full h-2 bg-gray-200 rounded-full overflow-hidden", className)}>
      <div 
        className={cn("h-full", indicatorClassName)} 
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default CustomProgress;