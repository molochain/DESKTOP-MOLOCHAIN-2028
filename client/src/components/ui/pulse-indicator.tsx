import { cn } from "@/lib/utils";

interface PulseIndicatorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'primary';
  active?: boolean;
}

export function PulseIndicator({ 
  className, 
  size = 'md', 
  color = 'blue',
  active = true
}: PulseIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    primary: 'bg-primary'
  };

  const colorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  if (!active) {
    return (
      <div className={cn("relative", className)}>
        <div className={cn(
          "rounded-full opacity-50",
          sizeClasses[size],
          colorClass
        )} />
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "rounded-full animate-pulse",
        sizeClasses[size],
        colorClass
      )} />
      <div className={cn(
        "absolute inset-0 rounded-full animate-ping opacity-75",
        sizeClasses[size],
        colorClass
      )} />
    </div>
  );
}

export default PulseIndicator;