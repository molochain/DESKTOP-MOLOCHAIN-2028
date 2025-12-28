import { cn } from '@/lib/utils';

interface MoloChainLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

export const MoloChainSpinner: React.FC<MoloChainLoaderProps> = ({ 
  size = 'md', 
  className,
  text = 'Loading...',
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className="relative">
        <div className={cn(
          'animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700',
          'border-t-primary',
          sizeClasses[size]
        )} />
        <div className={cn(
          'absolute inset-0 animate-ping rounded-full border-2 border-primary opacity-20',
          sizeClasses[size]
        )} />
      </div>
      {text && (
        <div className="text-sm font-medium text-muted-foreground animate-pulse">
          {text}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export const MoloChainPulse: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-3 h-3 bg-primary rounded-full animate-pulse"
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  );
};

export const MoloChainProgress: React.FC<{ 
  value?: number; 
  className?: string;
  showPercentage?: boolean;
}> = ({ 
  value = 0, 
  className,
  showPercentage = true 
}) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-primary">MoloChain</span>
        {showPercentage && (
          <span className="text-sm text-muted-foreground">{Math.round(value)}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${value}%` }}
        >
          <div className="h-full bg-white/20 animate-shimmer" />
        </div>
      </div>
    </div>
  );
};

export const MoloChainLogo: React.FC<{ 
  animate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ 
  animate = true,
  size = 'md',
  className 
}) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };

  return (
    <div className={cn(
      'font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent',
      sizeClasses[size],
      animate && 'animate-pulse',
      className
    )}>
      MoloChain
    </div>
  );
};

export const MoloChainSkeleton: React.FC<{ 
  className?: string;
  variant?: 'text' | 'card' | 'image' | 'button';
  lines?: number;
}> = ({ 
  className,
  variant = 'text',
  lines = 1
}) => {
  const baseClass = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';
  
  const variants = {
    text: 'h-4 w-full',
    card: 'h-32 w-full',
    image: 'aspect-square w-full',
    button: 'h-10 w-24'
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClass,
              variants.text,
              i === lines - 1 && 'w-3/4'
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(baseClass, variants[variant], className)} />
  );
};

export const MoloChainLoadingCard: React.FC<{ 
  className?: string;
  showImage?: boolean;
}> = ({ 
  className,
  showImage = true
}) => {
  return (
    <div className={cn('p-4 border rounded-lg space-y-4', className)}>
      {showImage && <MoloChainSkeleton variant="image" />}
      <MoloChainSkeleton variant="text" lines={2} />
      <div className="flex gap-2">
        <MoloChainSkeleton variant="button" />
        <MoloChainSkeleton variant="button" />
      </div>
    </div>
  );
};

export const MoloChainTransition: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  loader?: React.ReactNode;
  className?: string;
}> = ({ 
  loading, 
  children, 
  loader,
  className 
}) => {
  if (loading) {
    return (
      <div className={cn('min-h-[200px] flex items-center justify-center', className)}>
        {loader || <MoloChainSpinner />}
      </div>
    );
  }

  return <>{children}</>;
};