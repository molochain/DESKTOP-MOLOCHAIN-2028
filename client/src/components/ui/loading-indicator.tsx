import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { loadingAnimation } from '@/lib/animations';
import { Loader2, Loader, RefreshCw, RotateCw } from 'lucide-react';

interface LoadingIndicatorProps {
  children?: ReactNode;
  className?: string;
  type?: 'spinner' | 'pulse' | 'bounce' | 'ping' | 'shimmer' | 'progress' | 'dots' | 'none';
  duration?: 'fast' | 'normal' | 'slow' | 'none';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  icon?: 'circle' | 'circle-notch' | 'refresh' | 'rotate';
  fullPage?: boolean;
}

/**
 * LoadingIndicator Component
 * 
 * A versatile loading indicator with multiple animation types.
 * 
 * @param children - Optional content to display alongside the spinner
 * @param className - Additional CSS classes
 * @param type - Animation type (spinner, pulse, bounce, ping, shimmer, progress, dots, none)
 * @param duration - Animation speed (fast, normal, slow)
 * @param size - Size of the indicator (xs, sm, md, lg, xl)
 * @param label - Optional text label to display 
 * @param icon - Icon to use (circle, circle-notch, refresh, rotate)
 * @param fullPage - If true, displays the loader centered on a full-page overlay
 */
const LoadingIndicator = ({
  children,
  className,
  type = 'spinner',
  duration = 'normal',
  size = 'md',
  label,
  icon = 'circle-notch',
  fullPage = false,
}: LoadingIndicatorProps) => {
  // Icon sizes mapped to Tailwind classes
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  // Icon components
  const icons = {
    'circle': <Loader className={sizeClasses[size]} />,
    'circle-notch': <Loader2 className={sizeClasses[size]} />,
    'refresh': <RefreshCw className={sizeClasses[size]} />,
    'rotate': <RotateCw className={sizeClasses[size]} />
  };

  // Shimmer effect requires a custom background
  const shimmerBackground = type === 'shimmer' ? 'relative overflow-hidden bg-card' : '';
  
  const content = (
    <div 
      className={cn(
        'flex items-center justify-center',
        className
      )}
    >
      {type !== 'shimmer' && type !== 'progress' && type !== 'dots' && (
        <div className={cn('text-primary', loadingAnimation({ type, duration }))}>
          {icons[icon]}
        </div>
      )}
      
      {type === 'dots' && (
        <div className={cn('text-primary font-bold', loadingAnimation({ type, duration }))}>
          Loading
        </div>
      )}
      
      {type === 'shimmer' && (
        <div className={cn(
          'h-full w-full rounded-md',
          loadingAnimation({ type, duration }),
          shimmerBackground
        )}>
          {children}
        </div>
      )}
      
      {type === 'progress' && (
        <div className={cn(
          'h-1 w-full bg-primary/20 rounded-full overflow-hidden',
          loadingAnimation({ type, duration })
        )}></div>
      )}
      
      {label && (
        <span className="ml-2 text-sm font-medium">{label}</span>
      )}
      
      {!type.includes('shimmer') && !type.includes('progress') && children}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export { LoadingIndicator };