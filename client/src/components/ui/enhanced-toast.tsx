import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { AlertAnimationProps, alertAnimation } from '@/lib/animations';
import { Check, Info, X, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastVariant = 'default' | 'success' | 'info' | 'warning' | 'destructive';

interface EnhancedToastOptions extends AlertAnimationProps {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  action?: {
    label: string;
    onClick: () => void;
    className?: string;
  };
  duration?: number;
}

/**
 * Enhanced toast hook with animations and icons
 */
export function useEnhancedToast() {
  const { toast } = useToast();

  const showToast = ({
    title,
    description,
    variant = 'default',
    animation = 'slideRight',
    action,
    duration = 5000,
  }: EnhancedToastOptions) => {
    // Icon mapping based on variant
    const IconComponent = {
      default: undefined,
      success: Check,
      info: Info,
      warning: AlertTriangle,
      destructive: AlertCircle,
    }[variant];

    // Class mapping based on variant
    const variantClasses = {
      default: '',
      success: 'border-green-500 bg-green-50 text-green-900',
      info: 'border-blue-500 bg-blue-50 text-blue-900',
      warning: 'border-amber-500 bg-amber-50 text-amber-900',
      destructive: 'border-red-500 bg-red-50 text-red-900',
    }[variant];

    const iconColor = {
      default: 'text-foreground',
      success: 'text-green-500',
      info: 'text-blue-500',
      warning: 'text-amber-500',
      destructive: 'text-red-500',
    }[variant];

    toast({
      title: title,
      description: description,
      variant: variant === 'destructive' ? 'destructive' : (variant === 'default' ? 'default' : 'custom'),
      className: cn(
        'group',
        alertAnimation({ animation }),
        variantClasses
      ),
      action: action ? (
        <ToastAction 
          altText={action.label} 
          onClick={action.onClick}
          className={action.className}
        >
          {action.label}
        </ToastAction>
      ) : undefined,
      duration: duration,
      // Adding the icon if one is specified for the variant
      icon: IconComponent ? (
        <IconComponent className={cn('h-5 w-5', iconColor)} />
      ) : undefined,
    });
  };

  // Preset toast types
  const success = (options: Omit<EnhancedToastOptions, 'variant'>) => 
    showToast({ ...options, variant: 'success' });

  const info = (options: Omit<EnhancedToastOptions, 'variant'>) => 
    showToast({ ...options, variant: 'info' });

  const warning = (options: Omit<EnhancedToastOptions, 'variant'>) => 
    showToast({ ...options, variant: 'warning' });

  const error = (options: Omit<EnhancedToastOptions, 'variant'>) => 
    showToast({ ...options, variant: 'destructive' });

  return {
    toast: showToast,
    success,
    info,
    warning,
    error,
  };
}